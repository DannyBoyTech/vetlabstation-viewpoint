import { describe, expect } from "vitest";
import {
  InstrumentType,
  LabRequestDto,
  QualityControlRunDto,
  QualityControlRunRecordDto,
  QualityControlTrendDto,
} from "@viewpoint/api";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import {
  randomQualityControlRunRecordDto,
  randomInstrumentDto,
  randomInstrumentRun,
  randomInstrumentStatus,
  randomLabRequest,
  randomQcLotDto,
} from "@viewpoint/test-utils";
import dayjs from "dayjs";
import { findByTestId, waitFor, within } from "@testing-library/react";
import { render } from "../../../../../test-utils/test-utils";
import { QcResultsScreen, TestId } from "./QcResultsScreen";
import userEvent from "@testing-library/user-event";

describe("ProCyteDx QC Results screen", () => {
  describe("exclude from trend", () => {
    it("allows user to toggle excluding run from QC trend", async () => {
      const runRecords = mockQcRunRecords();
      setupMockStore([
        randomLabRequest({
          id: runRecords[0].labRequestId,
          instrumentRunDtos: [randomInstrumentRun()],
        }),
      ]);

      const { container } = render(
        <QcResultsScreen
          instrumentStatus={randomInstrumentStatus({
            instrument: randomInstrumentDto({
              instrumentType: InstrumentType.ProCyteDx,
            }),
          })}
          qcLotInfo={randomQcLotDto()}
        />
      );

      // Select a record
      const runRecord = runRecords[0];
      const recordElement = await within(
        await findByTestId(container, TestId.QcResultsTable)
      ).findByText(formatDateTime(runRecord.testDate));

      // Not visible at first
      expect(
        await findByTestId(container, TestId.ExclusionAndComments)
      ).not.toBeVisible();

      await userEvent.click(recordElement);

      // Now visible after loading
      expect(
        await findByTestId(container, TestId.ExclusionAndComments)
      ).toBeVisible();

      // Check the box
      const checkbox = await findByTestId(container, TestId.ExcludeCheckbox);
      expect(checkbox).not.toBeChecked();
      await userEvent.click(checkbox);
      await waitFor(() => expect(checkbox).toBeChecked());
    });

    it("allows user to enter comments", async () => {
      const runRecords = mockQcRunRecords();
      setupMockStore([
        randomLabRequest({
          id: runRecords[0].labRequestId,
          instrumentRunDtos: [randomInstrumentRun()],
        }),
      ]);

      const { container } = render(
        <QcResultsScreen
          instrumentStatus={randomInstrumentStatus({
            instrument: randomInstrumentDto({
              instrumentType: InstrumentType.ProCyteDx,
            }),
          })}
          qcLotInfo={randomQcLotDto()}
        />
      );

      // Select a record
      const runRecord = runRecords[0];
      const recordElement = await within(
        await findByTestId(container, TestId.QcResultsTable)
      ).findByText(formatDateTime(runRecord.testDate));

      await userEvent.click(recordElement);

      // Check the box
      const checkbox = await findByTestId(container, TestId.ExcludeCheckbox);
      await waitFor(() => expect(checkbox).not.toBeDisabled());
      await userEvent.click(checkbox);
      const textArea = await findByTestId(
        container,
        TestId.ExcludeCommentsTextArea
      );
      // Enter a comment
      await userEvent.type(textArea, "This is a comment");
      // Save it
      await userEvent.click(
        await findByTestId(container, TestId.ExcludeCommentsSaveButton)
      );

      // Select a different item, then back to the first -- it should still have the comment entered
      const otherRunElement = await within(
        await findByTestId(container, TestId.QcResultsTable)
      ).findByText(formatDateTime(runRecords[1].testDate));
      await userEvent.click(otherRunElement);
      await waitFor(() => expect(checkbox).not.toBeChecked());
      await userEvent.click(recordElement);
      await waitFor(() => expect(textArea).toHaveValue("This is a comment"));
    });
  });
});

function mockQcRunRecords(
  provided?: Partial<QualityControlRunRecordDto>[]
): QualityControlRunRecordDto[] {
  const runRecords = (provided ?? new Array(5).fill(1)).map((val) =>
    randomQualityControlRunRecordDto(val === 1 ? undefined : val)
  );
  server.use(
    rest.get("**/api/device/*/runs", (req, res, context) =>
      res(context.json(runRecords))
    )
  );
  return runRecords;
}

function setupMockStore(
  labRequests: LabRequestDto[] = [
    randomLabRequest({ instrumentRunDtos: [randomInstrumentRun()] }),
  ]
) {
  server.use(
    rest.get("**/api/labRequest/:labRequestId", (req, res, context) =>
      res(
        context.json(
          labRequests.find(
            (lr) => `${lr.id}` === (req.params["labRequestId"] as string)
          )
        )
      )
    )
  );

  server.use(
    rest.put("**/qualityControl/:runId/trends", async (req, res, context) => {
      const body = await req.json<QualityControlTrendDto>();
      const run = labRequests
        .flatMap((lr) => lr.instrumentRunDtos)
        .find((ir) => ir?.id === body.qualityControlRunId);
      if (body.excludeFromTrend) {
        (run as QualityControlRunDto).excludeTrendingReason =
          body.comments ?? "";
      } else {
        delete (run as QualityControlRunDto).excludeTrendingReason;
      }
      return res(context.json({}));
    })
  );
}

function formatDateTime(date: number) {
  return dayjs(date).format("M/DD/YY h:mm A");
}
