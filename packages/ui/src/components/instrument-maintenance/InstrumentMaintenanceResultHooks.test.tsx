import { act } from "@testing-library/react";

vi.mock("../../context/EventSourceContext", () => ({
  useEventListener: vi.fn(),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EventIds,
  InstrumentMaintenanceResultDto,
  InstrumentType,
  MaintenanceProcedure,
  MaintenanceResult,
} from "@viewpoint/api";
import { render } from "../../../test-utils/test-utils";
import { useInstrumentMaintenanceResultActions } from "./InstrumentMaintenanceResultHooks";
import { randomInstrumentDto } from "@viewpoint/test-utils";
import { getI18n } from "react-i18next";
import { GlobalModalProvider } from "../global-modals/GlobalModals";
import { useEventListener } from "../../context/EventSourceContext";

beforeEach(() => {
  vi.resetAllMocks();
});
describe("InstrumentProcedureContainer", () => {
  const cases = [
    {
      procedure: MaintenanceProcedure.REPLACE_REAGENT,
      result: MaintenanceResult.SUCCESS,
      instrumentType: InstrumentType.ProCyteOne,
    },
    {
      procedure: MaintenanceProcedure.REPLACE_OBC,
      result: MaintenanceResult.SUCCESS,
      instrumentType: InstrumentType.ProCyteOne,
    },
    {
      procedure: MaintenanceProcedure.REPLACE_SHEATH,
      result: MaintenanceResult.SUCCESS,
      instrumentType: InstrumentType.ProCyteOne,
    },
    {
      procedure: MaintenanceProcedure.GENERAL_CLEAN,
      result: MaintenanceResult.SUCCESS,
      instrumentType: InstrumentType.CatalystOne,
    },
    {
      procedure: MaintenanceProcedure.OPTICS_CALIBRATION,
      result: MaintenanceResult.SUCCESS,
      instrumentType: InstrumentType.CatalystOne,
    },
  ];
  it.each(cases)(
    "shows toast message for maintenance procedure $procedure with result $result",
    async ({ procedure, result, instrumentType }) => {
      const { container } = render(<TestBed />);
      expect(vi.mocked(useEventListener)).toHaveBeenCalledWith(
        EventIds.InstrumentMaintenanceResult,
        expect.anything()
      );

      const t = getI18n().t;

      expect(container.querySelector(".spot-message")).not.toBeInTheDocument();

      const callback = vi.mocked(useEventListener).mock.calls[0][1];
      const resultMessage: InstrumentMaintenanceResultDto = {
        result,
        maintenanceType: procedure,
        instrument: randomInstrumentDto({ instrumentType }),
      };

      await act(() =>
        callback({ data: JSON.stringify(resultMessage) } as MessageEvent)
      );

      const toastMessage = container.querySelector(".spot-message");
      expect(toastMessage).toBeVisible();
      expect(toastMessage).toContainHTML(
        t(
          `instrumentMaintenanceResult.${instrumentType}.${procedure}.${result}`
        )
      );
    }
  );
});

function TestBed() {
  return (
    <GlobalModalProvider>
      <InnerTestBed />
    </GlobalModalProvider>
  );
}

function InnerTestBed() {
  useInstrumentMaintenanceResultActions();
  return <div />;
}
