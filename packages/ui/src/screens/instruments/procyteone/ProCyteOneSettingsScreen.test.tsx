import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import {
  EventIds,
  InstrumentSettingKey,
  InstrumentSettingResponseDto,
  InstrumentStatusDto,
  InstrumentType,
  SettingTypeEnum,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../../test-utils/test-utils";
import {
  ProCyteOneSettingsScreen,
  ProCyteOneSettingsScreenProps,
  TestId,
} from "./ProCyteOneSettingsScreen";
import { TestId as TwelveHourTestId } from "../../../components/input/TwelveHourTimeSelect";
import { screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { viewpointApi } from "../../../api/ApiSlice";
import userEvent from "@testing-library/user-event";
import { EventSourceProvider } from "../../../context/EventSourceContext";
import EventEmitter from "events";
import dayjs from "dayjs";
import {
  getEventSource,
  QueuingEventSource,
} from "../../../utils/events/QueuingEventSource";

describe("ProCyte One settings screen", () => {
  let instrumentStatus: InstrumentStatusDto;
  beforeEach(() => {
    instrumentStatus = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
    });

    server.use(
      rest.get("*/api/settings", async (req, res, ctx) => res(ctx.json({})))
    );
    server.use(
      rest.post("*/api/settings/instrument/*/*", (req, res, ctx) =>
        res(ctx.json({}))
      )
    );
    mockInvertSampleValue(false);

    vi.mocked(getEventSource).mockReturnValue(mockEventSource().eventSource);
  });

  it("submits a request for updated instrument QC auto run setting on mount", async () => {
    const reqMock = vi.fn();
    server.use(
      rest.post(
        "*/api/settings/instrument/:instrumentId/:settingName",
        (req, res, ctx) => {
          reqMock(req.params);
          return res(ctx.json({}));
        }
      )
    );
    render(
      <WrappedProCyteOnSettingsScreen instrumentStatus={instrumentStatus} />
    );

    await waitFor(() =>
      expect(reqMock).toHaveBeenCalledWith({
        0: expect.anything(),
        instrumentId: `${instrumentStatus.instrument.id}`,
        settingName: InstrumentSettingKey.QC_AUTORUN_DATETIME,
      })
    );
  });

  it("sets sample invert reminder toggle based on setting from IVLS", async () => {
    mockInvertSampleValue(false);
    const { rerender, store } = render(
      <WrappedProCyteOnSettingsScreen instrumentStatus={instrumentStatus} />
    );

    expect(
      await screen.findByTestId(TestId.InvertReminderToggle)
    ).not.toBeChecked();

    // Change value and re-render
    mockInvertSampleValue(true);
    // Reset RTK query cache
    await act(() => {
      store?.dispatch(viewpointApi.util.resetApiState());
    });
    rerender(
      <WrappedProCyteOnSettingsScreen instrumentStatus={instrumentStatus} />
    );
    expect(
      await screen.findByTestId(TestId.InvertReminderToggle)
    ).toBeChecked();
  });

  it("updates sample invert reminder when toggle is changed", async () => {
    // Capture the POST to update the setting value
    const mockUpdate = vi.fn();
    server.use(
      rest.post("*/api/settings", async (req, res, ctx) => {
        mockUpdate(await req.json());
        return res(ctx.json({}));
      })
    );
    mockInvertSampleValue(true);

    render(
      <WrappedProCyteOnSettingsScreen instrumentStatus={instrumentStatus} />
    );

    const toggle = await screen.findByTestId(TestId.InvertReminderToggle);
    // Make sure toggle is checked
    await waitFor(async () => expect(toggle).toBeChecked());

    // Toggle it off
    await userEvent.click(toggle);
    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith([
        {
          "@class": "com.idexx.labstation.core.dto.SettingDto",
          settingType: SettingTypeEnum.PROCYTE_ONE_INVERT_SAMPLE_REMINDER,
          settingValue: "false",
        },
      ])
    );
  });
  describe("auto smart QC", () => {
    const DT_FORMAT = "YYYYMMDDTHHmmss";

    const createSettingMessage = (hour: number) => {
      const data: InstrumentSettingResponseDto = {
        setting: {
          settingKey: InstrumentSettingKey.QC_AUTORUN_DATETIME,
          value: dayjs().hour(hour).utc().format(DT_FORMAT),
        },
        instrumentId: instrumentStatus.instrument.id,
        success: true,
      };
      return {
        data: JSON.stringify(data),
      };
    };

    const AutoQCTimeCases = [
      { hour: 0, dropDownHour: "12", amPm: "AM" },
      { hour: 1, dropDownHour: "1", amPm: "AM" },
      { hour: 2, dropDownHour: "2", amPm: "AM" },
      { hour: 3, dropDownHour: "3", amPm: "AM" },
      { hour: 4, dropDownHour: "4", amPm: "AM" },
      { hour: 5, dropDownHour: "5", amPm: "AM" },
      { hour: 6, dropDownHour: "6", amPm: "AM" },
      { hour: 7, dropDownHour: "7", amPm: "AM" },
      { hour: 8, dropDownHour: "8", amPm: "AM" },
      { hour: 9, dropDownHour: "9", amPm: "AM" },
      { hour: 10, dropDownHour: "10", amPm: "AM" },
      { hour: 11, dropDownHour: "11", amPm: "AM" },
      { hour: 12, dropDownHour: "12", amPm: "PM" },
      { hour: 13, dropDownHour: "1", amPm: "PM" },
      { hour: 14, dropDownHour: "2", amPm: "PM" },
      { hour: 15, dropDownHour: "3", amPm: "PM" },
      { hour: 16, dropDownHour: "4", amPm: "PM" },
      { hour: 17, dropDownHour: "5", amPm: "PM" },
      { hour: 18, dropDownHour: "6", amPm: "PM" },
      { hour: 19, dropDownHour: "7", amPm: "PM" },
      { hour: 20, dropDownHour: "8", amPm: "PM" },
      { hour: 21, dropDownHour: "9", amPm: "PM" },
      { hour: 22, dropDownHour: "10", amPm: "PM" },
      { hour: 23, dropDownHour: "11", amPm: "PM" },
    ];

    it.each(AutoQCTimeCases)(
      "updates the auto QC time to hour $hour when drop downs $dropDownHour and $amPm are selected",
      async ({ hour, dropDownHour, amPm }) => {
        const mockRequest = vi.fn();
        server.use(
          rest.put(
            "*/api/settings/instrument/:instrumentId/:settingName",
            async (req, res, context) => {
              mockRequest({ params: req.params, body: await req.text() });
              return res(context.json({}));
            }
          )
        );
        const { eventSource, emitter } = mockEventSource();
        vi.mocked(getEventSource).mockReturnValue(eventSource);
        render(
          <WrappedProCyteOnSettingsScreen instrumentStatus={instrumentStatus} />
        );
        // Wait for event source to be instantiated -- it now is not created until the backend is ready
        await waitFor(() => expect(getEventSource).toHaveBeenCalled());
        // Push an initial value for it to enable the select
        await act(() => {
          emitter.emit(
            EventIds.InstrumentSettingsUpdated,
            createSettingMessage(hour)
          );
        });

        await userEvent.selectOptions(
          await screen.findByTestId(TwelveHourTestId.HourSelect),
          [dropDownHour]
        );
        await userEvent.selectOptions(
          await screen.findByTestId(TwelveHourTestId.AmPmSelect),
          [amPm]
        );

        // Get the request data
        expect(mockRequest).toHaveBeenCalledWith({
          params: {
            "0": expect.anything(),
            instrumentId: `${instrumentStatus.instrument.id}`,
            settingName: InstrumentSettingKey.QC_AUTORUN_DATETIME,
          },
          body: expect.anything(),
        });
        // Verify the timestamp sent to IVLS has the expected hour value (the hour is the only thing that matters)
        const dateValue = mockRequest.mock.calls[1][0].body;
        const parsed = dayjs(dateValue, DT_FORMAT).utc(true).local();
        expect(parsed.hour()).toEqual(hour);
      }
    );

    it.each(AutoQCTimeCases)(
      "reflects QC auto run time of $dropDownHour $amPm based on incoming event for date with hour $hour",
      async ({ hour, dropDownHour, amPm }) => {
        const { eventSource, emitter } = mockEventSource();
        vi.mocked(getEventSource).mockReturnValue(eventSource);
        render(
          <WrappedProCyteOnSettingsScreen instrumentStatus={instrumentStatus} />
        );

        // Wait for event source to be instantiated -- it now is not created until the backend is ready
        await waitFor(() => expect(getEventSource).toHaveBeenCalled());

        expect(
          await screen.findByTestId(TwelveHourTestId.HourSelect)
        ).toHaveValue("default");
        expect(
          await screen.findByTestId(TwelveHourTestId.AmPmSelect)
        ).toHaveValue("AM");

        const msg = createSettingMessage(hour);

        await act(() => {
          emitter.emit(EventIds.InstrumentSettingsUpdated, msg);
        });

        expect(
          await screen.findByTestId(TwelveHourTestId.HourSelect)
        ).toHaveValue(dropDownHour);
        expect(
          await screen.findByTestId(TwelveHourTestId.AmPmSelect)
        ).toHaveValue(amPm);
      }
    );
  });
});

function WrappedProCyteOnSettingsScreen(props: ProCyteOneSettingsScreenProps) {
  return (
    <EventSourceProvider>
      <ProCyteOneSettingsScreen {...props} />
    </EventSourceProvider>
  );
}

function mockInvertSampleValue(value: boolean) {
  server.use(
    rest.get("*/api/settings", (req, res, ctx) =>
      res(
        ctx.json({
          [SettingTypeEnum.PROCYTE_ONE_INVERT_SAMPLE_REMINDER]: `${value}`,
        })
      )
    )
  );
}

const mockEventSource = () => {
  const emitter = new EventEmitter();
  return {
    eventSource: {
      addEventListener: (type: string, listener: any) =>
        emitter.addListener(type, listener),
      removeEventListener: (type: string, listener: any) =>
        emitter.removeListener(type, listener),
      connect: vi.fn(),
    } as unknown as QueuingEventSource,
    emitter,
  };
};
