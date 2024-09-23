import { BASE_URL, CacheTags, viewpointApi } from "./ApiSlice";
import { SystemDto } from "@viewpoint/api";

export const systemInfoApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemInfo: builder.query<SystemDto, void>({
      query: () => "system/system",
      providesTags: [CacheTags.SystemInfo],
    }),
    getSystemSoftwareVersion: builder.query<string, void>({
      query: () => ({
        url: "upgrade/system_software_version",
        responseHandler: (response: { text: () => any }) => response.text(),
        headers: { accept: "*/*" },
      }),
      providesTags: [CacheTags.SystemInfo],
    }),
    ping: builder.query<boolean, string>({
      query: (ipAddr) => ({
        method: "POST",
        url: "system/ping",
        headers: {
          "Content-Type": "text/plain",
          Accept: "text/plain",
        },
        body: ipAddr,
      }),
      transformResponse: Boolean,
    }),
    requestSystemShutdown: builder.mutation<void, void>({
      query: () => {
        return {
          method: "POST",
          url: `system/shutdown`,
        };
      },
    }),
    requestSystemRestart: builder.mutation<void, void>({
      query: () => {
        return {
          method: "POST",
          url: `system/restart`,
        };
      },
    }),
    systemReady: builder.query<boolean, void>({
      query: () => "system/running",
      providesTags: [CacheTags.SystemStatus],
    }),

    rescheduleWeeklyRebootReminder: builder.mutation<void, void>({
      query: () => {
        return {
          method: "POST",
          url: `system/rescheduleWeeklyRebootReminder`,
        };
      },
    }),
  }),
});

/**
 * Fetches a random password from the IVLS backend. This intentionally
 * sidesteps RTK Query to prevent caching of any sort.
 *
 * @returns randomly generated string
 */
async function generatePassword(): Promise<string> {
  const res = await fetch(`${BASE_URL}/system/randomPassword`);
  if (!res.ok) {
    throw new Error(`generatePassword failed: '${res.text()}'`);
  }
  return await res.text();
}

export const {
  useGetSystemInfoQuery,
  useGetSystemSoftwareVersionQuery,
  useLazyPingQuery,
  useRequestSystemRestartMutation,
  useRequestSystemShutdownMutation,
  useSystemReadyQuery,
  useLazySystemReadyQuery,
  useRescheduleWeeklyRebootReminderMutation,
} = systemInfoApi;

export { generatePassword };
