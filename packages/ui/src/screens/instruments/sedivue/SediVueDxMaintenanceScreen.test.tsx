import { beforeEach, describe, vi } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  EventIds,
  InstrumentStatus,
  InstrumentType,
  MaintenanceProcedureAcceptedEvent,
} from "@viewpoint/api";
import {
  SediVueDxMaintenanceScreen,
  TestId,
} from "./SediVueDxMaintenanceScreen";
import { findByTestId } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { useEventListener } from "../../../context/EventSourceContext";

vi.mock("../../../context/EventSourceContext", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useEventListener: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useNavigate: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("SediVue Dx Maintenance screen", () => {
  const cases = [
    { status: InstrumentStatus.Ready, disabled: false },
    { status: InstrumentStatus.Busy, disabled: true },
    { status: InstrumentStatus.Offline, disabled: true },
    { status: InstrumentStatus.Alert, disabled: true },
    { status: InstrumentStatus.Standby, disabled: true },
  ];

  it.each(cases)(
    "sets clean button disabled = $disabled when instrument has status $status",
    async ({ status, disabled }) => {
      const instrumentStatus = randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.SediVueDx,
        }),
        instrumentStatus: status,
      });
      const { container } = render(
        <SediVueDxMaintenanceScreen instrument={instrumentStatus} />
      );
      if (disabled) {
        expect(
          await findByTestId(container, TestId.CleanButton)
        ).toBeDisabled();
      } else {
        expect(await findByTestId(container, TestId.CleanButton)).toBeEnabled();
      }
    }
  );

  it("navigates to the home screen when initialize maintenance procedure is accepted", async () => {
    const mockNav = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNav);
    const instrumentStatus = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      }),
    });
    render(<SediVueDxMaintenanceScreen instrument={instrumentStatus} />);

    expect(vi.mocked(useEventListener)).toHaveBeenCalled();
    expect(mockNav).not.toHaveBeenCalled();

    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
    const payload: MaintenanceProcedureAcceptedEvent = {
      id: EventIds.MaintenanceProcedureAccepted,
      instrumentId: instrumentStatus.instrument.id,
      procedure: "Initialize",
    };

    eventCallback({ data: JSON.stringify(payload) } as MessageEvent);

    expect(mockNav).toHaveBeenCalledWith("/");
  });
});
