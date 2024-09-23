import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LabRequestDto,
  LabRequestRecordDto,
  ResultColor,
  SampleTypesMapping,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useGetSettingsQuery } from "../api/SettingsApi";
import {
  DarkModeResultColors,
  getGraphKey,
  getGraphKeyParts,
  LightModeResultColors,
} from "../components/results/result-utils";
import { usePrevious } from "../utils/hooks/hooks";
import { GetGraphDataParams } from "../api/GraphApi";
import { ViewpointThemeContext } from "./ThemeContext";
import { Theme } from "../utils/StyleConstants";

export interface ResultColorSelections {
  low: string;
  high: string;
  abnormal: string;
  normal: string;
}

export const DEFAULT_RESULT_COLORS: ResultColorSelections = {
  low: LightModeResultColors.Red,
  high: LightModeResultColors.Red,
  abnormal: LightModeResultColors.Red,
  normal: LightModeResultColors.Black,
} as const;

export interface ResultsPageContext {
  record: LabRequestRecordDto;
  labRequest?: LabRequestDto;
  resultColorSettings: ResultColorSelections;
  currentGraphingParams: GraphParams[];
  resultsBeingGraphed: number[];
  toggleGraphingForResult: (resultId: number) => void;
  clearGraphs: () => void;
}

export interface ResultsPageContextProps {
  record: LabRequestRecordDto;
  labRequest?: LabRequestDto;
  children?: ReactNode;
}

export type GraphParams = Pick<
  GetGraphDataParams,
  "patientId" | "instrumentType" | "assayIdentityName" | "sampleTypeId"
> & { graphKey: string };

export const ViewpointResultsPageContext =
  React.createContext<ResultsPageContext>(
    undefined as unknown as ResultsPageContext
  );

/**
 * Results Page provider.
 */
const ViewpointResultsPageProvider = (props: ResultsPageContextProps) => {
  const [selectedGraphKeys, setSelectedGraphKeys] = useState<string[]>([]);
  const { theme } = useContext(ViewpointThemeContext);

  const resultsBeingGraphed = useMemo<number[]>(
    () =>
      props.labRequest?.instrumentRunDtos
        ?.flatMap((run) => run.instrumentResultDtos)
        .filter((res) => selectedGraphKeys.includes(getGraphKey(res)))
        .map((res) => res.id) ?? [],
    [props.labRequest, selectedGraphKeys]
  );

  const currentGraphingParams = useMemo<GraphParams[]>(
    () =>
      props.labRequest == null
        ? []
        : selectedGraphKeys.map((graphKey) => {
            const [instrumentType, assayIdentityName, sampleType] =
              getGraphKeyParts(graphKey);
            return {
              graphKey,
              patientId: props.labRequest!.patientDto.id,
              instrumentType,
              assayIdentityName,
              sampleTypeId:
                sampleType == null ? undefined : SampleTypesMapping[sampleType],
            };
          }),
    [props.labRequest, selectedGraphKeys]
  );

  const toggleGraphingForResult = useCallback(
    (resultId: number) => {
      const selectedResult = props.labRequest?.instrumentRunDtos
        ?.flatMap((ir) => ir.instrumentResultDtos)
        .find((ir) => ir.id === resultId);
      if (selectedResult != null) {
        const graphKey = getGraphKey(selectedResult);

        setSelectedGraphKeys((curr) => {
          if (curr.includes(graphKey)) {
            return curr.filter((c) => c !== graphKey);
          } else if (curr.length < 6) {
            return [...curr, graphKey];
          } else {
            return curr;
          }
        });
      }
    },
    [props.labRequest?.instrumentRunDtos]
  );

  const clearGraphs = useCallback(() => setSelectedGraphKeys([]), []);
  const resultColorSettings = useResultColorsForTheme(theme.name);
  // Clear out assays if user navigates to a different lab request
  const prevLabRequestId = usePrevious(props.labRequest?.id);
  useEffect(() => {
    if (
      props.labRequest?.id != null &&
      prevLabRequestId !== props.labRequest.id
    ) {
      clearGraphs();
    }
  }, [clearGraphs, prevLabRequestId, props.labRequest?.id]);

  return (
    <ViewpointResultsPageContext.Provider
      value={{
        record: props.record,
        labRequest: props.labRequest,
        resultColorSettings,
        toggleGraphingForResult,
        resultsBeingGraphed,
        clearGraphs,
        currentGraphingParams,
      }}
    >
      {props.children}
    </ViewpointResultsPageContext.Provider>
  );
};

export default ViewpointResultsPageProvider;

export function useResultColors() {
  const { resultColorSettings } = useContext(ViewpointResultsPageContext);
  return resultColorSettings;
}

export function useResultColorsForTheme(
  themeName: Theme["name"]
): ResultColorSelections {
  const resultColorMappings = useMemo(
    () => (themeName === "Dark" ? DarkModeResultColors : LightModeResultColors),
    [themeName]
  );
  const { data: resultColorSettings } = useGetSettingsQuery(
    [
      SettingTypeEnum.OUT_OF_RANGE_RESULTS_LOW,
      SettingTypeEnum.OUT_OF_RANGE_RESULTS_HIGH,
      SettingTypeEnum.ABNORMAL_RESULT_COLOR,
    ],
    {
      selectFromResult: (res) => ({
        ...res,
        data:
          res.data == null
            ? { ...DEFAULT_RESULT_COLORS }
            : {
                low: resultColorMappings[
                  res.data?.[
                    SettingTypeEnum.OUT_OF_RANGE_RESULTS_LOW
                  ] as ResultColor
                ],
                high: resultColorMappings[
                  res.data?.[
                    SettingTypeEnum.OUT_OF_RANGE_RESULTS_HIGH
                  ] as ResultColor
                ],
                abnormal:
                  resultColorMappings[
                    res.data?.[
                      SettingTypeEnum.ABNORMAL_RESULT_COLOR
                    ] as ResultColor
                  ],
                normal: resultColorMappings.Black,
              },
      }),
    }
  );
  return resultColorSettings;
}
