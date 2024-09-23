import { describe, expect, vi } from "vitest";
import { render } from "../../../../../test-utils/test-utils";
import { SediVueDxCleaningWizard } from "./SediVueDxCleaningWizard";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  InstrumentStatusDto,
  InstrumentType,
  MaintenanceProcedure,
  MaintenanceProcedureCode,
} from "@viewpoint/api";
import userEvent from "@testing-library/user-event";
import { TestId } from "../../../../components/wizard/wizard-components";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import { waitFor } from "@testing-library/react";

describe("half door cleaning wizard", () => {
  it("requires user to power down the instrument when instrument is connected", async () => {
    const instrumentStatus = randomInstrumentStatus({
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      }),
    });
    mockInstrumentStatus(instrumentStatus);
    const { findByRole } = render(
      <SediVueDxCleaningWizard
        instrumentId={instrumentStatus.instrument.id}
        onCancel={vi.fn()}
        onDone={vi.fn()}
      />
    );
    const nextButton = await findByRole("button", {
      name: "Next",
    });
    await userEvent.click(nextButton);

    const powerButton = await findByRole("button", {
      name: "Power Down SediVue Dx",
    });
    expect(powerButton).toBeEnabled();
    expect(nextButton).toBeDisabled();
    await userEvent.click(powerButton);
    // Once request is made to power off instrument, power button is disabled even while instrument is still connected
    expect(powerButton).toBeDisabled();
  });

  it("allows user to proceed when instrument is not connected", async () => {
    const instrumentStatus = randomInstrumentStatus({
      connected: false,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      }),
    });
    mockInstrumentStatus(instrumentStatus);
    const { findByRole } = render(
      <SediVueDxCleaningWizard
        instrumentId={instrumentStatus.instrument.id}
        onCancel={vi.fn()}
        onDone={vi.fn()}
      />
    );
    const nextButton = await findByRole("button", {
      name: "Next",
    });
    await userEvent.click(nextButton);
    const powerButton = await findByRole("button", {
      name: "Power Down SediVue Dx",
    });
    expect(powerButton).toBeDisabled();
    expect(nextButton).toBeEnabled();
  });

  it("skips cartridge track and centrifuge arm steps, but includes pusher arm step when not a new model", async () => {
    const instrumentStatus = randomInstrumentStatus({
      connected: false,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
        instrumentBooleanProperties: {
          "svdx.hardware.new": false,
        },
      }),
    });
    mockInstrumentStatus(instrumentStatus);
    const { findByRole, findByTestId } = render(
      <SediVueDxCleaningWizard
        instrumentId={instrumentStatus.instrument.id}
        onCancel={vi.fn()}
        onDone={vi.fn()}
      />
    );

    const nextButton = await findByRole("button", {
      name: "Next",
    });
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Pipetting window"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Cartridge holder"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Pusher arm"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Optical window"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Shield and waste bin"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Move arm"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Replace components"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Clean fan filter"
    );
  });

  it("skips pusher arm but includes cartridge track and centrifuge arm steps for new models", async () => {
    const instrumentStatus = randomInstrumentStatus({
      connected: false,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
        instrumentBooleanProperties: {
          "svdx.hardware.new": true,
        },
      }),
    });
    mockInstrumentStatus(instrumentStatus);
    const { findByRole, findByTestId } = render(
      <SediVueDxCleaningWizard
        instrumentId={instrumentStatus.instrument.id}
        onCancel={vi.fn()}
        onDone={vi.fn()}
      />
    );

    const nextButton = await findByRole("button", {
      name: "Next",
    });
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Pipetting window"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Cartridge holder"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Cartridge track"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Optical window"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Shield and waste bin"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Centrifuge arm"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Move arm"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Replace components"
    );
    await userEvent.click(nextButton);
    expect(await findByTestId(TestId.PrimaryTitle)).toHaveTextContent(
      "Clean fan filter"
    );
  });

  it("requests cleaning maintenance procedure on mount", async () => {
    const instrumentStatus = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      }),
    });
    mockInstrumentStatus(instrumentStatus);
    const capture = captureMaintenanceRequest();
    render(
      <SediVueDxCleaningWizard
        instrumentId={instrumentStatus.instrument.id}
        onCancel={vi.fn()}
        onDone={vi.fn()}
      />
    );
    await waitFor(() =>
      expect(capture).toHaveBeenCalledWith({
        instrumentId: `${instrumentStatus.instrument.id}`,
        maintenanceProcedure: MaintenanceProcedure.GENERAL_CLEAN,
      })
    );
  });

  it("cancels cleaning maintenance procedure on close", async () => {
    const instrumentStatus = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      }),
    });
    mockInstrumentStatus(instrumentStatus);
    const capture = captureCancelProcedure();
    const { findByRole } = render(
      <SediVueDxCleaningWizard
        instrumentId={instrumentStatus.instrument.id}
        onCancel={vi.fn()}
        onDone={vi.fn()}
      />
    );
    await userEvent.click(await findByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(capture).toHaveBeenCalledWith({
        instrumentId: `${instrumentStatus.instrument.id}`,
        maintenanceProcedure: MaintenanceProcedureCode.GENERAL_CLEAN,
      })
    );
  });
});

function captureCancelProcedure() {
  const cap = vi.fn();
  server.use(
    rest.post("**/api/procedures/:procedure/cancel", (req, res, context) => {
      const maintenanceProcedure = req.params["procedure"];
      const instrumentId = req.url.searchParams.get("instrumentId");
      cap({ instrumentId, maintenanceProcedure });
      return res(context.json({}));
    })
  );
  return cap;
}

function captureMaintenanceRequest() {
  const cap = vi.fn();
  server.use(
    rest.post(
      "**/api/sediVue/:instrumentId/procedure/execute",
      (req, res, context) => {
        const instrumentId = req.params["instrumentId"];
        const maintenanceProcedure = req.url.searchParams.get(
          "instrumentMaintenanceProcedure"
        );
        cap({ instrumentId, maintenanceProcedure });
        return res(context.json({}));
      }
    )
  );
  return cap;
}

function mockInstrumentStatus(status: InstrumentStatusDto) {
  server.use(
    rest.get("**/api/device/*/status", (req, res, context) =>
      res(context.json(status))
    )
  );
}
