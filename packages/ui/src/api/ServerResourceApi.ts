import { viewpointApi } from "./ApiSlice";
import { SmartServiceEulaDto, WindowsEulaTypeEnum } from "@viewpoint/api";

export type FirstBootEulaType = Extract<
  WindowsEulaTypeEnum,
  | WindowsEulaTypeEnum.WINDOWS7
  | WindowsEulaTypeEnum.WINDOWS10
  | WindowsEulaTypeEnum.WINDOWSXP
  | WindowsEulaTypeEnum.WINDOWS11
>;

const FirstBootEulaPathMappings: Record<FirstBootEulaType, string> = {
  [WindowsEulaTypeEnum.WINDOWSXP]: "resources/en/licenses/Windows_XPSP2.txt",
  [WindowsEulaTypeEnum.WINDOWS7]: "resources/en/licenses/Windows_7SP1.txt",
  [WindowsEulaTypeEnum.WINDOWS10]: "resources/en/licenses/Windows_10.txt",
  [WindowsEulaTypeEnum.WINDOWS11]: "resources/en/licenses/Windows_11.txt",
};

export const serverResourceApi = viewpointApi.injectEndpoints({
  endpoints: (builder) => ({
    getEula: builder.query<string, WindowsEulaTypeEnum | null>({
      query: (eulaType) => ({
        url: `/serverResource/eula/${eulaType}`,
        responseHandler: (response: { text: () => any }) => response.text(),
      }),
    }),
    getSmartServiceEula: builder.query<SmartServiceEulaDto, void>({
      query: () => "/serverResource/eula/smartservice",
    }),
    getFirstBootEula: builder.query<string, FirstBootEulaType>({
      query: (eulaType) => ({
        url: `../${FirstBootEulaPathMappings[eulaType]}`,
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
});

export const {
  useGetEulaQuery,
  useGetFirstBootEulaQuery,
  useGetSmartServiceEulaQuery,
} = serverResourceApi;
