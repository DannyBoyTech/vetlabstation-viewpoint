import { describe, expect } from "vitest";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  CrimsonPropertiesDto,
  InstrumentStatus,
  InstrumentTimePropertyDto,
  InstrumentType,
  SampleDrawerPositionEnum,
  SettingTypeEnum,
} from "@viewpoint/api";
import { rest } from "msw";
import { server } from "../../../../test-utils/mock-server";
import { render } from "../../../../test-utils/test-utils";
import { ProCyteDxSettingsScreen, TestId } from "./ProCyteDxSettingsScreen";
import { screen, waitFor } from "@testing-library/react";
import { TestId as TimeSelectTestId } from "../../../components/input/TwelveHourTimeSelect";
import userEvent from "@testing-library/user-event";

const DEFAULT_SETTINGS = {
  aspirationSensorEnable: true,
  sampleDrawerPosition: SampleDrawerPositionEnum.OPENED,
  standByTime: {
    hours: 10,
    isPm: false,
    minutes: 0,
  },
};

describe("procyte dx settings screen", () => {
  it("disables controls for instrument settings while instrument update requests are in progress", async () => {
    const procyte = randomProcyte();
    mockIvlsSettings();
    mockProCyteSettings();

    render(<ProCyteDxSettingsScreen instrumentStatus={procyte} />);

    // Don't resolve the request until we're ready
    let signal = false;
    server.use(
      rest.put(
        "**/api/instrument/crimson/:instrumentId/properties",
        async (req, res, context) => {
          await waitFor(() => expect(signal).toBe(true), { timeout: 3000 });
          return res(context.json({}));
        }
      )
    );

    await waitFor(() => expectEnabled(TestId.AspirationSensorToggle));
    // Update one of the instrument settings
    await userEvent.click(
      await screen.findByTestId(TestId.AspirationSensorToggle)
    );
    // The other instrument controls should now be disabled
    await expectDisabled(TestId.AspirationSensorToggle);
    await expectDisabled(TimeSelectTestId.HourSelect);
    await expectDisabled(TimeSelectTestId.AmPmSelect);
    await expectDisabled(TestId.SampleDrawerOpenRadio);
    await expectDisabled(TestId.SampleDrawerClosedRadio);

    // IVLS settings should still be enabled
    await expectEnabled(TestId.SampleInvertReminderToggle);
    await expectEnabled(TestId.ReagentLowReminderToggle);
    await expectEnabled(TestId.SynovialFluidReminderToggle);

    // Flip the signal
    signal = true;

    // Instrument setting controls are now re-enabled
    await expectEnabled(TestId.AspirationSensorToggle);
    await expectEnabled(TimeSelectTestId.HourSelect);
    await expectEnabled(TimeSelectTestId.AmPmSelect);
    await expectEnabled(TestId.SampleDrawerOpenRadio);
    await expectEnabled(TestId.SampleDrawerClosedRadio);
  });

  it("disables controls for IVLS settings while IVLS setting update requests are in progress", async () => {
    const procyte = randomProcyte();
    mockIvlsSettings();
    mockProCyteSettings();

    render(<ProCyteDxSettingsScreen instrumentStatus={procyte} />);

    // Don't resolve the request until we're ready
    let signal = false;
    server.use(
      rest.post("**/api/settings", async (req, res, context) => {
        console.log("!!! waiting: " + signal);
        await waitFor(() => expect(signal).toBe(true), { timeout: 4000 });
        console.log("!!! done waiting: " + signal);
        return res(context.json({}));
      })
    );
    await waitFor(() => expectEnabled(TestId.SampleInvertReminderToggle));
    await userEvent.click(
      await screen.findByTestId(TestId.SampleInvertReminderToggle)
    );
    // IVLS settings should be disabled
    await expectDisabled(TestId.SampleInvertReminderToggle);
    await expectDisabled(TestId.ReagentLowReminderToggle);
    await expectDisabled(TestId.SynovialFluidReminderToggle);

    // Instrument controls should be enabled
    await expectEnabled(TestId.AspirationSensorToggle);
    await expectEnabled(TimeSelectTestId.HourSelect);
    await expectEnabled(TimeSelectTestId.AmPmSelect);
    await expectEnabled(TestId.SampleDrawerOpenRadio);
    await expectEnabled(TestId.SampleDrawerClosedRadio);

    // Flip the signal
    signal = true;

    // IVLS Setting controls enabled
    await expectEnabled(TestId.SampleInvertReminderToggle);
    await expectEnabled(TestId.ReagentLowReminderToggle);
    await expectEnabled(TestId.SynovialFluidReminderToggle);
  });

  it("disables IVLS setting controls while request is loading", async () => {
    mockProCyteSettings();
    let signal = false;
    server.use(
      rest.get("**/api/settings", async (req, res, context) => {
        await waitFor(() => expect(signal).toBe(true), { timeout: 3000 });
        return res(context.json({}));
      })
    );
    render(<ProCyteDxSettingsScreen instrumentStatus={randomProcyte()} />);

    // Still loading - IVLS setting controls disabled
    await expectDisabled(TestId.SampleInvertReminderToggle);
    await expectDisabled(TestId.ReagentLowReminderToggle);
    await expectDisabled(TestId.SynovialFluidReminderToggle);

    // Flip the signal
    signal = true;

    // IVLS setting controls enabled
    await expectEnabled(TestId.SampleInvertReminderToggle);
    await expectEnabled(TestId.ReagentLowReminderToggle);
    await expectEnabled(TestId.SynovialFluidReminderToggle);
  });

  it("disables instrument setting controls while request is loading", async () => {
    mockProCyteSettings();
    let signal = false;
    server.use(
      rest.get(
        "**/api/instrument/crimson/*/properties",
        async (req, res, context) => {
          await waitFor(() => expect(signal).toBe(true), { timeout: 3000 });
          return res(context.json({}));
        }
      )
    );
    render(<ProCyteDxSettingsScreen instrumentStatus={randomProcyte()} />);
    // The other instrument controls should now be disabled
    await expectDisabled(TestId.AspirationSensorToggle);
    await expectDisabled(TimeSelectTestId.HourSelect);
    await expectDisabled(TimeSelectTestId.AmPmSelect);
    await expectDisabled(TestId.SampleDrawerOpenRadio);
    await expectDisabled(TestId.SampleDrawerClosedRadio);

    // Flip the signal
    signal = true;

    // Instrument setting controls are now re-enabled
    await expectEnabled(TestId.AspirationSensorToggle);
    await expectEnabled(TimeSelectTestId.HourSelect);
    await expectEnabled(TimeSelectTestId.AmPmSelect);
    await expectEnabled(TestId.SampleDrawerOpenRadio);
    await expectEnabled(TestId.SampleDrawerClosedRadio);
  });
});

const randomProcyte = () =>
  randomInstrumentStatus({
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.ProCyteDx,
    }),
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
  });

const expectEnabled = async (testId: string) => {
  await waitFor(async () =>
    expect(await screen.findByTestId(testId)).toBeEnabled()
  );
};

const expectDisabled = async (testId: string) => {
  await waitFor(async () =>
    expect(await screen.findByTestId(testId)).toBeDisabled()
  );
};

function mockIvlsSettings(ivlsSettings?: {
  [key in SettingTypeEnum]?: string;
}) {
  server.use(
    rest.get("**/api/settings", (req, res, context) =>
      res(
        context.json({
          [SettingTypeEnum.INVERT_SAMPLE_REMINDER]: "true",
          [SettingTypeEnum.REAGENT_LOW_REMINDER]: "true",
          [SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER]: "true",
          ...ivlsSettings,
        })
      )
    )
  );
}

type PartialCrimsonPropertiesDto = Partial<
  Omit<CrimsonPropertiesDto, "standByTime"> & {
    standByTime?: Partial<InstrumentTimePropertyDto>;
  }
>;

function mockProCyteSettings(proCyteSettings?: PartialCrimsonPropertiesDto) {
  server.use(
    rest.get("**/api/instrument/crimson/*/properties", (req, res, context) =>
      res(
        context.json({
          ...DEFAULT_SETTINGS,
          standByTime: {
            ...DEFAULT_SETTINGS.standByTime,
            ...proCyteSettings?.standByTime,
          },
          ...proCyteSettings,
        } as CrimsonPropertiesDto)
      )
    )
  );
}
