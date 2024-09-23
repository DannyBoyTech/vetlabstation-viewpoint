import dayjs from "dayjs";
import { BASE_URL, CacheTags, viewpointApi } from "./ApiSlice";

const reportApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    shareReportWithImage: builder.mutation<
      void,
      { labRequestId: number; runId: number; imageData: ArrayBuffer }
    >({
      query: ({ labRequestId, runId, imageData }) => ({
        method: "POST",
        url: `/report/sendReportWithImageToPims`,
        params: { labRequestId },
        body: {
          [runId]: Array.from(new Uint8Array(imageData)),
        },
      }),
      invalidatesTags: [CacheTags.Reports],
    }),
  }),
});

/**
 * Fetches a lab report from the IVLS server
 *
 * This sidesteps RTK Query to prevent caching as these are fairly large and are fetched infrequently.
 *
 * @returns randomly generated string
 */
async function fetchLabReport(labRequestId: number): Promise<Blob> {
  const res = await fetch(
    `${BASE_URL}/report/labReport?labRequestId=${labRequestId}`
  );

  if (!res.ok) {
    throw Error(
      `fetchLabRequest (labRequestId: ${labRequestId}) failed: '${res.text()}'`
    );
  }
  return await res.blob();
}

const SnapReportUrls = {
  LOG: "/report/snapLogReport",
  SUMMARY: "/report/snapSummaryReport",
} as const;

type SnapReportUrl = (typeof SnapReportUrls)[keyof typeof SnapReportUrls];

const DATE_PARAM_FORMAT = "YYYY-MM-DD";

async function fetchSnapReport(
  reportUrl: SnapReportUrl,
  startDate: Date,
  endDate: Date
): Promise<Blob> {
  const startDateStr = dayjs(startDate).format(DATE_PARAM_FORMAT);
  const endDateStr = dayjs(endDate).format(DATE_PARAM_FORMAT);

  const res = await fetch(
    `${BASE_URL}${reportUrl}?startDate=${startDateStr}&endDate=${endDateStr}`
  );

  if (!res.ok) {
    throw Error(
      `fetchSnapReport (reportUrl: ${reportUrl}, startDate: ${startDate}, endDate: ${endDate}) failed: '${res.text()}'`
    );
  }

  return await res.blob();
}

const fetchSnapLogReport = (startDate: Date, endDate: Date) =>
  fetchSnapReport(SnapReportUrls.LOG, startDate, endDate);

const fetchSnapSummaryReport = (startDate: Date, endDate: Date) =>
  fetchSnapReport(SnapReportUrls.SUMMARY, startDate, endDate);

export type { SnapReportUrl as SnapReportType };
export {
  reportApi,
  fetchLabReport,
  fetchSnapLogReport,
  fetchSnapSummaryReport,
};

export const { useShareReportWithImageMutation } = reportApi;
