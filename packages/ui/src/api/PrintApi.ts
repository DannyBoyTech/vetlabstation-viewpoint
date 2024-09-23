import { PrintJob, Printer } from "@viewpoint/api";
import { viewpointApi } from "./ApiSlice";

const printApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrinters: builder.query<Printer[], void>({
      query: () => `/printers`,
    }),

    printPdf: builder.mutation<void, PrintJob>({
      query: ({ data, job, printer, paper, copies }) => ({
        method: "POST",
        url: "/print/job",
        headers: { "content-type": "application/pdf" },
        body: data,
        params: {
          job,
          printer,
          paper,
          copies,
        },
      }),
    }),

    purgeJobs: builder.mutation<void, string>({
      query: (printer: string) => ({
        method: "POST",
        url: "/print/purge/jobs",
        body: { printer },
      }),
    }),

    shutdownPrintService: builder.mutation<void, void>({
      query: () => ({
        method: "POST",
        url: "/print-service/shutdown",
      }),
    }),
  }),
});

export const {
  useGetPrintersQuery,
  useLazyGetPrintersQuery,
  usePrintPdfMutation,
  usePurgeJobsMutation,
  useShutdownPrintServiceMutation,
} = printApi;
