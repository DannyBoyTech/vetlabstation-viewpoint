import { beforeEach, describe, it, vi } from "vitest";
import { CatalystQualityControlLotDto, InstrumentType } from "@viewpoint/api";
import { render } from "../../../../test-utils/test-utils";
import { CatalystQcScreen, TestId } from "./CatalystQcScreen";
import { TestId as QCModalTestId } from "../../../components/qc/QCResultsModal";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  randomInstrumentStatus,
  randomInstrumentDto,
} from "@viewpoint/test-utils";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import { useNavigate } from "react-router-dom";

describe("catalyst QC screen", () => {
  vi.mock("react-router-dom", async (origImport) => {
    const reactRouterDom = (await origImport()) as any;

    return {
      ...reactRouterDom,
      useNavigate: vi.fn(),
    };
  });

  beforeEach(() => {
    vi.resetAllMocks();

    server.use(
      rest.get("*/api/device/:instrumentId/runs", (req, res, ctx) =>
        res(ctx.json([]))
      )
    );
  });

  const qualityControlLots: CatalystQualityControlLotDto[] = [
    {
      id: 1,
      instrumentType: InstrumentType.CatalystOne,
      lotNumber: "G2506",
      enabled: true,
      canRun: true,
      qcReferenceRangeDtos: [],
      calibrationVersion: "10.16",
      controlType: "VetTrol",
    },
    {
      id: 2,
      instrumentType: InstrumentType.CatalystOne,
      lotNumber: "F1619",
      enabled: true,
      canRun: true,
      qcReferenceRangeDtos: [],
      calibrationVersion: "10.16",
      controlType: "VetTrol",
    },
    {
      instrumentType: InstrumentType.CatalystOne,
      lotNumber: "H3378",
      enabled: true,
      canRun: true,
      qcReferenceRangeDtos: [],
      calibrationVersion: "10.16",
      controlType: "VetTrol",
    },
    {
      id: 4,
      instrumentType: InstrumentType.CatalystOne,
      lotNumber: "M4083",
      enabled: true,
      canRun: true,
      qcReferenceRangeDtos: [],
      calibrationVersion: "10.16",
      controlType: "VetTrol",
    },
    {
      id: 5,
      instrumentType: InstrumentType.CatalystOne,
      lotNumber: "M3393",
      enabled: true,
      canRun: false,
      qcReferenceRangeDtos: [],
      calibrationVersion: "10.16",
      controlType: "VetTrol",
    },
  ];

  it("only enables view lot results button when a valid lot is selected", async () => {
    server.use(
      rest.get("*/api/qualityControl/catalyst/lots", (req, res, ctx) =>
        res(ctx.json(qualityControlLots))
      )
    );

    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
      }),
    });

    render(<CatalystQcScreen instrument={instrument} />);

    // Disabled by default
    expect(
      await screen.findByTestId(TestId.ViewLotResultsButton)
    ).toBeDisabled();

    // Select the first lot, view lot results should be enabled
    await userEvent.click(await screen.findByText("G2506"));
    expect(
      await screen.findByTestId(TestId.ViewLotResultsButton)
    ).toBeEnabled();

    // Select the lot without an ID, button should be enabled
    await userEvent.click(await screen.findByText("H3378"));
    expect(
      await screen.findByTestId(TestId.ViewLotResultsButton)
    ).toBeEnabled();
  });

  it("shows all results modal", async () => {
    server.use(
      rest.get("*/api/qualityControl/catalyst/lots", (req, res, ctx) =>
        res(ctx.json(qualityControlLots))
      )
    );

    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
        instrumentSerialNumber: "catone0",
      }),
    });
    render(<CatalystQcScreen instrument={instrument} />);

    await userEvent.click(
      await screen.findByTestId(TestId.ViewAllResultsButton)
    );
    expect(await screen.findByTestId(QCModalTestId.Modal)).toBeVisible();
  });

  it("should enable 'run qc' button exclusively when selected lot 'canRun'", async () => {
    server.use(
      rest.get("*/api/qualityControl/catalyst/lots", (_req, res, ctx) =>
        res(ctx.json(qualityControlLots))
      )
    );

    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystDx,
        instrumentSerialNumber: "catdx0",
      }),
    });

    render(<CatalystQcScreen instrument={instrument} />);

    const lotsTable = await screen.findByTestId(TestId.LotsTable);
    expect(lotsTable).toBeDefined();

    //run-qc should be disabled when nothing is (initially) selected
    expect(await screen.findByTestId(TestId.RunQCButton)).toBeDisabled();

    //run-qc should be enabled when selected lot is marked canRun

    await userEvent.click(await within(lotsTable).findByText("G2506"));

    expect(await screen.findByTestId(TestId.RunQCButton)).toBeEnabled();

    //run-qc should be disabled when row is unselected
    await userEvent.click(await within(lotsTable).findByText("G2506"));

    expect(await screen.findByTestId(TestId.RunQCButton)).toBeDisabled();

    //run-qc should be disabled when selected lot is not marked 'canRun'
    await userEvent.click(await within(lotsTable).findByText("M3393"));

    expect(await screen.findByTestId(TestId.RunQCButton)).toBeDisabled();

    //run-qc should be enabled when lot canRun but has no id
    await userEvent.click(await within(lotsTable).findByText("H3378"));
    expect(await screen.findByTestId(TestId.RunQCButton)).toBeEnabled();
  });

  it("should run qc and navigate home when 'run qc' is enabled and clicked", async () => {
    server.use(
      rest.get("*/api/qualityControl/catalyst/lots", (_req, res, ctx) =>
        res(ctx.json(qualityControlLots))
      )
    );

    const postCall = vi.fn();

    server.use(
      rest.post("*/api/qualityControl", async (req, res, ctx) => {
        const body = await req.json();
        postCall(body.instrumentId, body.qualityControl);
        return res(ctx.status(204));
      })
    );

    const nav = vi.fn();

    vi.mocked(useNavigate).mockImplementation(() => nav);

    const instrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({
        id: 42,
        instrumentType: InstrumentType.CatalystDx,
        instrumentSerialNumber: "catdx0",
      }),
    });

    render(<CatalystQcScreen instrument={instrument} />);

    //run-qc should be enabled when selected lot is marked canRun
    await userEvent.click(await screen.findByText("G2506"));

    expect(await screen.findByTestId(TestId.RunQCButton)).toBeEnabled();

    await userEvent.click(await screen.findByTestId(TestId.RunQCButton));

    expect(postCall).toHaveBeenCalledTimes(1);
    expect(postCall).toHaveBeenCalledWith(42, qualityControlLots[0]);

    expect(nav).toHaveBeenCalledTimes(1);
    expect(nav).toHaveBeenCalledWith("/");
  });
});
