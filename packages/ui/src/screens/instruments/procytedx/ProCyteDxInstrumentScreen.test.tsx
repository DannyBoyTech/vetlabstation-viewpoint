import { beforeEach, describe, expect, vi } from "vitest";
import {
  CrimsonInstalledReagentDto,
  DetailedInstrumentStatusDto,
  EventIds,
  HealthCode,
  InstrumentDto,
  InstrumentStatus,
  InstrumentType,
  ProCyteDxFluidType,
  ProCyteDxProcedure,
  ReagentStatusChangedDto,
} from "@viewpoint/api";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../../test-utils/test-utils";
import { ProCyteDxInstrumentScreen, TestId } from "./ProCyteDxInstrumentScreen";
import { TestId as ProceduresTestId } from "./ProCyteDxProcedures";
import {
  act,
  findByTestId,
  getByTestId,
  queryByTestId,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  useEnterStandbyMutation,
  useExitStandbyMutation,
  useStartupInstrumentMutation,
} from "../../../api/InstrumentApi";
import { useNavigate } from "react-router-dom";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { useEventListener } from "../../../context/EventSourceContext";
import { TestId as GaugesTestId } from "./ProCyteDxFluidGauges";
import { TestId as LogModalTestId } from "./ProCyteDxReagentLogModal";
import dayjs from "dayjs";
import { useRequestProCyteDxProcedureMutation } from "../../../api/ProCyteDxApi";

vi.mock(
  "../../../components/global-modals/components/GlobalConfirmModal",
  async (actualImport) => {
    const origMod = (await actualImport()) as any;

    return {
      ...origMod,
      useConfirmModal: vi.fn(origMod.useConfirmModal),
    };
  }
);

vi.mock("../../../api/InstrumentApi", async (actualImport) => {
  const orig = (await actualImport()) as any;

  return {
    ...orig,
    useStartupInstrumentMutation: vi.fn(orig.useStartupInstrumentMutation),
    useEnterStandbyMutation: vi.fn(orig.useEnterStandbyMutation),
    useExitStandbyMutation: vi.fn(orig.useExitStandbyMutation),
  };
});

vi.mock("../../../api/ProCyteDxApi", async (actualImport) => {
  const orig = (await actualImport()) as any;

  return {
    ...orig,
    useRequestProCyteDxProcedureMutation: vi.fn(
      orig.useRequestProCyteDxProcedureMutation
    ),
  };
});

vi.mock("react-router-dom", async (actualImport) => {
  const orig = (await actualImport()) as any;

  return {
    ...orig,
    useNavigate: vi.fn(orig.useNavigate),
  };
});

vi.mock("../../../context/EventSourceContext", async (orig) => ({
  ...((await orig()) as any),
  useEventListener: vi.fn(),
}));

describe("ProCyte Dx Instrument Screen", () => {
  const addConfirmModal = vi.fn();
  const removeConfirmModal = vi.fn();
  const enterStandby = vi.fn();
  const exitStandby = vi.fn();
  const startup = vi.fn();
  const requestProcedure = vi.fn();
  const nav = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useConfirmModal).mockImplementation(
      () =>
        ({
          addConfirmModal,
          removeConfirmModal,
        } as any)
    );
    vi.mocked(useRequestProCyteDxProcedureMutation).mockImplementation(
      () => [requestProcedure] as any
    );
    vi.mocked(useEnterStandbyMutation).mockImplementation(
      () => [enterStandby] as any
    );
    vi.mocked(useExitStandbyMutation).mockImplementation(
      () => [exitStandby] as any
    );
    vi.mocked(useStartupInstrumentMutation).mockImplementation(
      () => [startup] as any
    );
    vi.mocked(useNavigate).mockImplementation(() => nav);
  });

  describe("diagnostics button", () => {
    const ValidHealthCodes = [HealthCode.READY, HealthCode.NOT_READY];

    const TestCases = Object.values(HealthCode).map((hc) => ({
      healthCode: hc,
      enabled: ValidHealthCodes.includes(hc),
    }));

    it.each(TestCases)(
      "is enabled: $enabled when health code is $healthCode",
      async ({ healthCode, enabled }) => {
        await testButtonEnabledness(
          TestId.DiagnosticsButton,
          enabled,
          healthCode,
          InstrumentStatus.Ready,
          true
        );
      }
    );
  });

  describe("settings button", () => {
    const ValidHealthCodes = [HealthCode.READY, HealthCode.NOT_READY];

    const TestCases = Object.values(HealthCode).map((hc) => ({
      healthCode: hc,
      enabled: ValidHealthCodes.includes(hc),
    }));

    it.each(TestCases)(
      "is enabled: $enabled when health code is $healthCode",
      async ({ healthCode, enabled }) => {
        await testButtonEnabledness(
          TestId.SettingsButton,
          enabled,
          healthCode,
          InstrumentStatus.Ready,
          true
        );
      }
    );
  });

  describe("enter standby button", () => {
    const ValidHealthCodes = [HealthCode.READY];

    const TestCases = Object.values(HealthCode).map((hc) => ({
      healthCode: hc,

      enabled: ValidHealthCodes.includes(hc),
    }));

    it.each(TestCases)(
      "is enabled: $enabled when health code is $healthCode",
      async ({ healthCode, enabled }) => {
        await testButtonEnabledness(
          TestId.EnterStandbyButton,
          enabled,
          healthCode,
          InstrumentStatus.Ready,
          true
        );
        // No exit standby button
        expect(
          await screen.queryByTestId(TestId.ExitStandbyButton)
        ).not.toBeInTheDocument();
      }
    );

    it("should display a 'Set to Standby' modal when clicked --- which triggers standby on confirm", async () => {
      const { addConfirmModal } = useConfirmModal();
      const mockAddConfirmModal = vi.mocked(addConfirmModal);

      mockHealthCode(HealthCode.READY);

      const instrumentStatusResponse = randomInstrumentStatus({
        instrumentStatus: InstrumentStatus.Ready,
        connected: true,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      render(
        <ProCyteDxInstrumentScreen
          instrumentStatus={instrumentStatusResponse}
        />
      );

      const enterStandbyButton = await screen.findByTestId(
        TestId.EnterStandbyButton
      );

      await waitFor(() => expect(enterStandbyButton).toBeEnabled());

      await userEvent.click(enterStandbyButton);

      expect(addConfirmModal).toHaveBeenCalledTimes(1);
      expect(addConfirmModal).toHaveBeenCalledWith(
        expect.objectContaining({
          headerContent: "Set to Standby",
        })
      );

      const { onConfirm } = mockAddConfirmModal.mock.calls[0][0];

      onConfirm();

      expect(enterStandby).toBeCalledTimes(1);

      const mockStandby = vi.mocked(enterStandby);
      const standbyArgs: any = mockStandby.mock.lastCall?.[0];
      expect(standbyArgs).toEqual(instrumentStatusResponse.instrument.id);

      expect(nav).toHaveBeenCalledTimes(1);
      expect(nav).toHaveBeenCalledWith("/");
    });
  });

  describe("exit standby button", () => {
    const TestCases = [
      {
        healthCode: HealthCode.READY,
        instrumentStatus: InstrumentStatus.Standby,
      },
      {
        healthCode: HealthCode.READY,
        instrumentStatus: InstrumentStatus.Sleep,
      },
    ];

    // Standby button is only available when status is STANDBY or SLEEP
    it.each(TestCases)(
      "is enabled: $enabled when health code is $healthCode",
      async ({ healthCode, instrumentStatus }) => {
        await testButtonEnabledness(
          TestId.ExitStandbyButton,
          true,
          healthCode,
          instrumentStatus,
          true
        );
        // No enter standby button
        expect(
          await screen.queryByTestId(TestId.EnterStandbyButton)
        ).not.toBeInTheDocument();
      }
    );

    it("should show an 'Exit Standby' modal when clicked --- which exits standby on confirm", async () => {
      const { addConfirmModal } = useConfirmModal();
      const mockAddConfirmModal = vi.mocked(addConfirmModal);

      mockHealthCode(HealthCode.STANDBY);

      const instrumentStatusResponse = randomInstrumentStatus({
        instrumentStatus: InstrumentStatus.Standby,
        connected: true,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      render(
        <ProCyteDxInstrumentScreen
          instrumentStatus={instrumentStatusResponse}
        />
      );

      const exitStandbyButton = await screen.findByTestId(
        TestId.ExitStandbyButton
      );

      await waitFor(() => expect(exitStandbyButton).toBeEnabled());

      await userEvent.click(exitStandbyButton);

      expect(addConfirmModal).toHaveBeenCalledTimes(1);
      expect(addConfirmModal).toHaveBeenCalledWith(
        expect.objectContaining({
          headerContent: "Exit Standby",
        })
      );

      const { onConfirm } = mockAddConfirmModal.mock.calls[0][0];

      onConfirm();

      expect(exitStandby).toBeCalledTimes(1);

      const mockStandby = vi.mocked(exitStandby);
      const standbyArgs: any = mockStandby.mock.lastCall?.[0];
      expect(standbyArgs).toEqual(instrumentStatusResponse.instrument.id);

      expect(nav).toHaveBeenCalledTimes(1);
      expect(nav).toHaveBeenCalledWith("/");
    });
  });

  describe("power down button", () => {
    const ValidHealthCodes = [HealthCode.READY];
    const TestCases = Object.values(HealthCode).map((hc) => ({
      healthCode: hc,
      enabled: ValidHealthCodes.includes(hc),
    }));

    it.each(TestCases)(
      "is enabled: $enabled when health code is $healthCode",
      async ({ healthCode, enabled }) => {
        await testButtonEnabledness(
          TestId.PowerDownButton,
          enabled,
          healthCode,
          InstrumentStatus.Ready,
          true
        );
      }
    );

    const InvalidHealthCodes = Object.values(HealthCode).filter(
      (hc) => !ValidHealthCodes.includes(hc)
    );
    const StatusTestCases = InvalidHealthCodes.map((healthCode) => ({
      healthCode,
      instrumentStatus: InstrumentStatus.Standby,
    })).concat(
      InvalidHealthCodes.map((healthCode) => ({
        healthCode,
        instrumentStatus: InstrumentStatus.Sleep,
      }))
    );

    it.each(StatusTestCases)(
      "is enabled regardless of health code $healthCode when status is $instrumentStatus",
      async ({ healthCode, instrumentStatus }) => {
        await testButtonEnabledness(
          TestId.PowerDownButton,
          true,
          healthCode,
          instrumentStatus,
          true
        );
      }
    );

    it("should show an 'Power Down' modal when clicked --- which powers down on confirm", async () => {
      const { addConfirmModal } = useConfirmModal();
      const mockAddConfirmModal = vi.mocked(addConfirmModal);

      mockHealthCode(HealthCode.READY);

      const instrumentStatusResponse = randomInstrumentStatus({
        instrumentStatus: InstrumentStatus.Ready,
        connected: true,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      render(
        <ProCyteDxInstrumentScreen
          instrumentStatus={instrumentStatusResponse}
        />
      );

      const powerDownButton = await screen.findByTestId(TestId.PowerDownButton);

      await waitFor(() => expect(powerDownButton).toBeEnabled());

      await userEvent.click(powerDownButton);

      expect(addConfirmModal).toHaveBeenCalledTimes(1);
      expect(addConfirmModal).toHaveBeenCalledWith(
        expect.objectContaining({
          headerContent: "Power Down ProCyte Dx",
        })
      );

      const { onConfirm } = mockAddConfirmModal.mock.calls[0][0];

      onConfirm();

      expect(requestProcedure).toHaveBeenCalledWith({
        instrumentId: instrumentStatusResponse.instrument.id,
        procedure: ProCyteDxProcedure.SHUTDOWN,
      });

      expect(nav).toHaveBeenCalledTimes(1);
      expect(nav).toHaveBeenCalledWith("/");
    });
  });

  describe("power on button", () => {
    it("is enabled when instrument is not connected", async () => {
      await testButtonEnabledness(
        TestId.PowerOnButton,
        true,
        HealthCode.NO_STATUS,
        InstrumentStatus.Offline,
        false
      );
    });

    it("should show an 'Power On' modal when clicked --- which powers on following confirm", async () => {
      const { addConfirmModal } = useConfirmModal();
      const mockAddConfirmModal = vi.mocked(addConfirmModal);

      mockHealthCode(HealthCode.NO_STATUS);

      const instrumentStatusResponse = randomInstrumentStatus({
        instrumentStatus: InstrumentStatus.Offline,
        connected: false,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      render(
        <ProCyteDxInstrumentScreen
          instrumentStatus={instrumentStatusResponse}
        />
      );

      const powerOnButton = await screen.findByTestId(TestId.PowerOnButton);

      await waitFor(() => expect(powerOnButton).toBeEnabled());

      await userEvent.click(powerOnButton);

      expect(addConfirmModal).toHaveBeenCalledTimes(1);
      expect(addConfirmModal).toHaveBeenCalledWith(
        expect.objectContaining({
          headerContent: "Power On ProCyte Dx",
        })
      );

      const { onConfirm } = mockAddConfirmModal.mock.calls[0][0];

      onConfirm();

      expect(startup).toBeCalledTimes(1);

      const mockedPower = vi.mocked(startup);
      const powerArgs = mockedPower.mock.lastCall?.[0];
      expect(powerArgs).toEqual(instrumentStatusResponse.instrument.id);

      expect(nav).toHaveBeenCalledTimes(1);
      expect(nav).toHaveBeenCalledWith("/");
    });
  });

  describe("procedures", () => {
    it("shows procedures as up to date when receiving a reagent status response with no reminder keys", async () => {
      mockHealthCode(HealthCode.READY);
      const instrumentStatus = randomInstrumentStatus({
        connected: true,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      const { container } = render(
        <ProCyteDxInstrumentScreen instrumentStatus={instrumentStatus} />
      );
      // Box is present but loading since no reagent status has been received yet
      expect(
        await queryByTestId(container, ProceduresTestId.LoadingSpinner)
      ).toBeInTheDocument();

      // Get the event listener callback and invoke it with no reminder keys
      expect(useEventListener).toHaveBeenCalledWith(
        EventIds.ReagentStatusChanged,
        expect.anything()
      );
      const callback = vi.mocked(useEventListener).mock.calls[0][1];
      const message = { data: JSON.stringify({}) };

      act(() => callback(message as MessageEvent));

      const proceduresRoot = await findByTestId(
        container,
        ProceduresTestId.ProceduresRoot
      );
      expect(proceduresRoot).toBeInTheDocument();
      expect(proceduresRoot).toHaveTextContent("Up to Date");
    });
  });

  it("shows procedures based on available reminder keys", async () => {
    mockHealthCode(HealthCode.READY);
    const instrumentStatus = randomInstrumentStatus({
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteDx,
      }),
    });

    const { container } = render(
      <ProCyteDxInstrumentScreen instrumentStatus={instrumentStatus} />
    );
    const callback = vi.mocked(useEventListener).mock.calls[0][1];
    const reagentResponse: ReagentStatusChangedDto = {
      instrumentId: instrumentStatus.instrument.id,
      reminderKeys: ["key1", "key2"],
    } as unknown as ReagentStatusChangedDto;
    const message = { data: JSON.stringify(reagentResponse) };

    act(() => callback(message as MessageEvent));

    const proceduresRoot = await findByTestId(
      container,
      ProceduresTestId.ProceduresRoot
    );
    expect(proceduresRoot).toBeInTheDocument();
    expect(
      await getByTestId(container, ProceduresTestId.Procedure("key1"))
    ).toBeVisible();
    expect(
      await getByTestId(container, ProceduresTestId.Procedure("key2"))
    ).toBeVisible();

    expect(
      await queryByTestId(container, ProceduresTestId.ViewAllLink)
    ).not.toBeInTheDocument();
  });

  describe("fluid gauges", () => {
    it("only shows fluid gauge levels when instrument is connected", async () => {
      mockHealthCode(HealthCode.NOT_READY);
      const instrumentStatus = randomInstrumentStatus({
        connected: false,
        instrumentStatus: InstrumentStatus.Offline,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      const { container, rerender } = render(
        <ProCyteDxInstrumentScreen instrumentStatus={instrumentStatus} />
      );

      expect(
        await queryByTestId(container, GaugesTestId.GaugesRoot)
      ).not.toBeInTheDocument();

      mockHealthCode(HealthCode.READY);
      rerender(
        <ProCyteDxInstrumentScreen
          instrumentStatus={{
            ...instrumentStatus,
            connected: true,
            instrumentStatus: InstrumentStatus.Ready,
          }}
        />
      );

      expect(
        await findByTestId(container, GaugesTestId.GaugesRoot)
      ).toBeVisible();
    });

    it("reflects fluid gauge levels", async () => {
      mockHealthCode(HealthCode.READY);
      const instrumentStatus = randomInstrumentStatus({
        connected: true,
        instrumentStatus: InstrumentStatus.Ready,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      const { container } = render(
        <ProCyteDxInstrumentScreen instrumentStatus={instrumentStatus} />
      );

      const callback = vi.mocked(useEventListener).mock.calls[0][1];
      const reagentResponse: ReagentStatusChangedDto = {
        id: "reagent_status_changed",
        instrumentId: instrumentStatus.instrument.id,
        reagentKitDaysLeft: 20,
        stainPackDaysLeft: 15,
        reagentKitPercentage: 0.78,
        stainPackPercentage: 0.54,
        reminderKeys: [],
      };

      act(() =>
        callback({ data: JSON.stringify(reagentResponse) } as MessageEvent)
      );

      // Verify no loading spinner
      expect(
        await within(
          await findByTestId(
            container,
            GaugesTestId.FluidGauge(ProCyteDxFluidType.REAGENT)
          )
        ).queryByTestId(GaugesTestId.LoadingSpinner)
      ).not.toBeInTheDocument();

      // Verify gauge levels match
      expect(
        await within(
          await findByTestId(
            container,
            GaugesTestId.FluidGauge(ProCyteDxFluidType.REAGENT)
          )
        ).findByTestId(GaugesTestId.GaugeLevel)
      ).toHaveStyle("height: 78%");
      expect(
        await within(
          await findByTestId(
            container,
            GaugesTestId.FluidGauge(ProCyteDxFluidType.STAIN)
          )
        ).findByTestId(GaugesTestId.GaugeLevel)
      ).toHaveStyle("height: 54%");

      // Verify info matches
      expect(
        await findByTestId(
          container,
          GaugesTestId.FluidInfo(ProCyteDxFluidType.REAGENT)
        )
      ).toHaveTextContent("Expires in 20 days");
      expect(
        await findByTestId(
          container,
          GaugesTestId.FluidInfo(ProCyteDxFluidType.STAIN)
        )
      ).toHaveTextContent("Expires in 15 days");
    });

    it("ignores reagent message for different instrument ID", async () => {
      mockHealthCode(HealthCode.READY);
      const instrumentStatus = randomInstrumentStatus({
        connected: true,
        instrumentStatus: InstrumentStatus.Ready,
        instrument: randomInstrumentDto({
          id: 10,
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      const { container } = render(
        <ProCyteDxInstrumentScreen instrumentStatus={instrumentStatus} />
      );

      const callback = vi.mocked(useEventListener).mock.calls[0][1];
      const reagentResponse: ReagentStatusChangedDto = {
        id: "reagent_status_changed",
        instrumentId: 11,
        reagentKitDaysLeft: 20,
        stainPackDaysLeft: 15,
        reagentKitPercentage: 0.78,
        stainPackPercentage: 0.54,
        reminderKeys: [],
      };

      act(() =>
        callback({ data: JSON.stringify(reagentResponse) } as MessageEvent)
      );

      // Loading spinner still there
      expect(
        await within(
          await findByTestId(
            container,
            GaugesTestId.FluidGauge(ProCyteDxFluidType.REAGENT)
          )
        ).findByTestId(GaugesTestId.LoadingSpinner)
      ).toBeVisible();

      expect(
        await within(
          await findByTestId(
            container,
            GaugesTestId.FluidGauge(ProCyteDxFluidType.STAIN)
          )
        ).findByTestId(GaugesTestId.LoadingSpinner)
      ).toBeVisible();

      expect(
        await findByTestId(container, ProceduresTestId.LoadingSpinner)
      ).toBeVisible();
    });

    it("displays reagent log with list of installed reagents", async () => {
      mockHealthCode(HealthCode.READY);
      const instrumentStatus = randomInstrumentStatus({
        connected: true,
        instrumentStatus: InstrumentStatus.Ready,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ProCyteDx,
        }),
      });

      const { container } = render(
        <ProCyteDxInstrumentScreen instrumentStatus={instrumentStatus} />
      );
      const reagents: CrimsonInstalledReagentDto[] = [
        {
          name: "DYE",
          lotNumber: "12345",
          changedDate: dayjs("2023-01-01T12:00:00Z").valueOf(),
          daysInUse: 10,
          isInUse: true,
        },
        {
          name: "DYE",
          lotNumber: "23456",
          changedDate: dayjs("2022-03-04T12:00:00Z").valueOf(),
          daysInUse: 18,
          isInUse: true,
        },
        {
          name: "REA",
          lotNumber: "54321",
          changedDate: dayjs("20203-01-01T12:00:00Z").valueOf(),
          daysInUse: 31,
          isInUse: true,
        },
      ];

      server.use(
        rest.get("**/api/proCyte/**/reagents", (req, res, context) =>
          res(context.json(reagents))
        )
      );
      await userEvent.click(
        await findByTestId(container, GaugesTestId.ViewLogsButton)
      );

      const modal = await findByTestId(container, LogModalTestId.Modal);
      expect(modal).toBeVisible();

      // Find all the table rows
      const rows = await within(modal).findAllByRole("row");

      // Skip the header row
      for (let i = 1; i < rows.length; i++) {
        const reagent = reagents[i - 1];
        const row = rows[i];
        // Verify cell values
        const cells = await within(row).findAllByRole("cell");
        expect(cells[0]).toHaveTextContent(
          reagent.name === "DYE" ? "Stain" : "Kit"
        );
        expect(cells[1]).toHaveTextContent(reagent.lotNumber);
        expect(cells[2]).toHaveTextContent(
          dayjs(reagent.changedDate).format("M/DD/YY h:mm A")
        );
        expect(cells[3]).toHaveTextContent(`${reagent.daysInUse}`);
      }
    });
  });
});

async function testButtonEnabledness(
  buttonTestId: string,
  enabled: boolean,
  healthCode: HealthCode,
  instrumentStatus: InstrumentStatus,
  connected: boolean
) {
  mockHealthCode(healthCode);
  const instrumentStatusResponse = randomInstrumentStatus({
    instrumentStatus,
    connected,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.ProCyteDx,
    }),
  });
  const { container } = render(
    <ProCyteDxInstrumentScreen instrumentStatus={instrumentStatusResponse} />
  );
  const button = await findByTestId(container, buttonTestId);
  if (enabled) {
    await waitFor(() => expect(button).toBeEnabled());
  } else {
    await waitFor(() => expect(button).toBeDisabled());
  }
}

function mockHealthCode(healthCode: HealthCode) {
  server.use(
    rest.get("*/api/instruments/:instrumentId/status", (req, res, context) =>
      res(
        context.json({
          status: healthCode,
          instrument: {} as InstrumentDto,
        } as DetailedInstrumentStatusDto)
      )
    )
  );
}
