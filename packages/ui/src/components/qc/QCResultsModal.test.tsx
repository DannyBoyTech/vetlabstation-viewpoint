import { render } from "../../../test-utils/test-utils";
import { beforeEach, describe, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { QCResultsModal, TestId as QCModalTestId } from "./QCResultsModal";
import { getI18n } from "react-i18next";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { InstrumentType, QualityControlDto } from "@viewpoint/api";
import { rest } from "msw";
import { server } from "../../../test-utils/mock-server";

describe("QC results modal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const dateFormat = getI18n().t("dateTime.dateTime12h", { ns: "formats" });

  const qcRuns = [
    {
      instrumentRunId: 1162,
      labRequestId: 1082,
      testDate: 1677518038549,
      qualityControl: {
        id: 2,
        instrumentType: InstrumentType.CatalystOne,
        lotNumber: "G2506",
        dateEntered: 1674662318183,
        dateExpires: 1679976000000,
        enabled: true,
        canRun: true,
        isExpired: false,
        mostRecentRunDate: null,
        calibrationVersion: "10.16",
        controlType: "VetTrol",
      },
      instrumentId: 23,
      instrumentType: InstrumentType.CatalystOne,
      instrumentSerialNumber: "catone0",
    },
    {
      instrumentRunId: 1164,
      labRequestId: 1083,
      testDate: 1674662320240,
      qualityControl: {
        id: 2,
        instrumentType: InstrumentType.CatalystOne,
        lotNumber: "F1619",
        dateEntered: 1674662318183,
        dateExpires: 1679976000000,
        enabled: true,
        canRun: true,
        isExpired: false,
        mostRecentRunDate: null,
        calibrationVersion: "10.16",
        controlType: "UPRO-Control",
      },
      instrumentId: 23,
      instrumentType: InstrumentType.CatalystOne,
      instrumentSerialNumber: "catone0",
    },
  ];

  it("shows all QC results if no QC ID is provided", async () => {
    const instrumentIdCapture = vi.fn();
    const qcIdCapture = vi.fn();
    server.use(
      rest.get("*/api/device/:instrumentId/runs", (req, res, ctx) => {
        instrumentIdCapture(req.params["instrumentId"]);
        qcIdCapture(req.url.searchParams.get("qualityControlId"));
        return res(ctx.json(qcRuns));
      })
    );

    render(
      <QCResultsModal
        visible={true}
        onClose={vi.fn()}
        instrumentId={1}
        instrumentSerialNumber={"catone0"}
        instrumentType={InstrumentType.CatalystOne}
        onViewResults={vi.fn()}
      />
    );

    expect(await screen.findByTestId(QCModalTestId.Modal)).toBeVisible();

    expect(
      await screen.findByTestId(QCModalTestId.AnalyzerName)
    ).toHaveTextContent("Catalyst One (catone0)");

    expect(
      await screen.findByTestId(QCModalTestId.ControlType)
    ).toHaveTextContent("--");
    expect(await screen.findByTestId(QCModalTestId.Lot)).toHaveTextContent(
      "--"
    );

    await userEvent.click(
      await screen.findByText(dayjs(qcRuns[0].testDate).format(dateFormat))
    );
    expect(
      await screen.findByTestId(QCModalTestId.ControlType)
    ).toHaveTextContent("VetTrol");
    expect(await screen.findByTestId(QCModalTestId.Lot)).toHaveTextContent(
      "G2506"
    );

    await userEvent.click(
      await screen.findByText(dayjs(qcRuns[1].testDate).format(dateFormat))
    );
    expect(
      await screen.findByTestId(QCModalTestId.ControlType)
    ).toHaveTextContent("UPRO-Control");
    expect(await screen.findByTestId(QCModalTestId.Lot)).toHaveTextContent(
      "F1619"
    );

    expect(instrumentIdCapture).toHaveBeenCalledWith("1");
    expect(qcIdCapture).toHaveBeenCalledWith(null);
  });

  it("shows QC results for specific QC if specified", async () => {
    const instrumentIdCapture = vi.fn();
    const qcIdCapture = vi.fn();
    server.use(
      rest.get("*/api/device/:instrumentId/runs", (req, res, ctx) => {
        instrumentIdCapture(req.params["instrumentId"]);
        qcIdCapture(req.url.searchParams.get("qualityControlId"));
        return res(ctx.json([qcRuns[0]]));
      })
    );

    render(
      <QCResultsModal
        visible={true}
        onClose={vi.fn()}
        instrumentId={1}
        instrumentSerialNumber={"catone0"}
        instrumentType={InstrumentType.CatalystOne}
        onViewResults={vi.fn()}
        qualityControl={
          qcRuns[0].qualityControl as unknown as QualityControlDto
        }
      />
    );

    // Don't need to select anything in the list for the details to be displayed
    expect(
      await screen.findByTestId(QCModalTestId.ControlType)
    ).toHaveTextContent("VetTrol");
    expect(await screen.findByTestId(QCModalTestId.Lot)).toHaveTextContent(
      "G2506"
    );

    expect(instrumentIdCapture).toHaveBeenCalledWith("1");
    expect(qcIdCapture).toHaveBeenCalledWith(
      qcRuns[0].qualityControl.id.toString()
    );
  });

  it("disables view results button until an item is clicked", async () => {
    server.use(
      rest.get("*/api/device/:instrumentId/runs", (req, res, ctx) =>
        res(ctx.json(qcRuns))
      )
    );
    const onViewResults = vi.fn();

    render(
      <QCResultsModal
        visible={true}
        onClose={vi.fn()}
        instrumentId={1}
        instrumentSerialNumber={"catone0"}
        instrumentType={InstrumentType.CatalystOne}
        onViewResults={onViewResults}
      />
    );
    expect(
      await screen.findByTestId(QCModalTestId.ViewResultsButton)
    ).toBeDisabled();

    await userEvent.click(
      await screen.findByText(dayjs(qcRuns[0].testDate).format(dateFormat))
    );
    expect(
      await screen.findByTestId(QCModalTestId.ViewResultsButton)
    ).toBeEnabled();
    await userEvent.click(
      await screen.findByTestId(QCModalTestId.ViewResultsButton)
    );
    expect(onViewResults).toHaveBeenCalledWith(qcRuns[0]);
  });
});
