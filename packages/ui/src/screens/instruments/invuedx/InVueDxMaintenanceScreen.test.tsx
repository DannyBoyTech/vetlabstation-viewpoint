import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  MaintenanceProcedure,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { render } from "../../../../test-utils/test-utils";
import { InVueDxMaintenanceScreen, TestId } from "./InVueDxMaintenanceScreen";
import { useNavigate } from "react-router-dom";
import { useExecuteMaintenanceProcedureMutation } from "../../../api/TheiaApi";
import userEvent from "@testing-library/user-event";

vi.mock("react-router-dom", async (origImport) => ({
  ...((await origImport()) as any),
  useNavigate: vi.fn(),
}));

vi.mock("../../../api/TheiaApi", async (actualImport) => {
  const orig = (await actualImport()) as any;
  return {
    ...orig,
    useExecuteMaintenanceProcedureMutation: vi.fn(
      orig.useExecuteMaintenanceProcedureMutation
    ),
  };
});

function getInstrumentMaintenanceScreen(
  instrumentStatusDto: InstrumentStatusDto
) {
  return render(<InVueDxMaintenanceScreen instrument={instrumentStatusDto} />);
}

describe("Test InVueDx instrument maintenance screen", () => {
  const useNavigateMock = vi.fn();
  const useExecuteMaintenanceProcedureMock = vi.fn();

  let instrumentStatusDto = randomInstrumentStatus();

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => useNavigateMock);
    vi.mocked(useExecuteMaintenanceProcedureMutation).mockImplementation(
      () => [useExecuteMaintenanceProcedureMock] as any
    );

    instrumentStatusDto = {
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.Theia,
      }),
      connected: true,
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    [TestId.InstrumentMaintenance1Button, MaintenanceProcedure.MAINTENANCE_1],
    [TestId.InstrumentMaintenance2Button, MaintenanceProcedure.MAINTENANCE_2],
    [TestId.InstrumentMaintenance3Button, MaintenanceProcedure.MAINTENANCE_3],
    [TestId.InstrumentMaintenance4Button, MaintenanceProcedure.MAINTENANCE_4],
    [TestId.InstrumentMaintenance5Button, MaintenanceProcedure.MAINTENANCE_5],
    [TestId.InstrumentMaintenance6Button, MaintenanceProcedure.MAINTENANCE_6],
  ])(
    "After sending maintenance command, I remain on the inVue Dx Maintenance screen.",
    async (maintenanceButtonSelector, maintenance) => {
      const instrumentMaintenanceScreen =
        getInstrumentMaintenanceScreen(instrumentStatusDto);

      const maintenanceButton = instrumentMaintenanceScreen.getByTestId(
        maintenanceButtonSelector
      );
      expect(maintenanceButton).toBeVisible();
      await userEvent.click(maintenanceButton);

      expect(useExecuteMaintenanceProcedureMock).toHaveBeenCalledTimes(1);
      expect(useExecuteMaintenanceProcedureMock).toHaveBeenCalledWith({
        instrumentId: instrumentStatusDto.instrument.id,
        maintenanceProcedure: maintenance,
      });

      expect(useNavigateMock).toHaveBeenCalledTimes(0);
    }
  );

  it("I can tap Back to return to the inVue Dx instrument screen.", async () => {
    const instrumentMaintenanceScreen =
      getInstrumentMaintenanceScreen(instrumentStatusDto);

    const backButton = instrumentMaintenanceScreen.getByTestId(
      TestId.BackButton
    );
    expect(backButton).toBeVisible();
    await userEvent.click(backButton);

    expect(useNavigateMock).toHaveBeenCalledTimes(1);
    expect(useNavigateMock).toHaveBeenCalledWith(-1);
  });
});
