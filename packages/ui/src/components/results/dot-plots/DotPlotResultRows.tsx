import { useGetDotPlotDataQuery } from "../../../api/InstrumentRunApi";
import { FullSizeSpinner } from "../../spinner/FullSizeSpinner";
import styled from "styled-components";
import {
  CellEvent,
  DotPlotApiLegendItem,
  DotPlotNodeDataResponse,
  InstrumentType,
  RedOrder,
  ScattergramType,
  SpeciesType,
  WhiteOrder,
} from "@viewpoint/api";
import { SpotText } from "@viewpoint/spot-react";
import { DotPlotDisplay } from "./DotPlotDisplay";
import { useTranslation } from "react-i18next";
import { DotPlotModal } from "./DotPlotModal";
import { useContext, useMemo, useState } from "react";
import { ViewpointResultsPageContext } from "../../../context/ResultsPageContext";
import { Cell } from "../common-components/result-table-components";
import { RunTableRow } from "../common-components/RunTableRow";

const EventOrderings: Record<ScattergramType, CellEvent[]> = {
  RBC: RedOrder,
  WBC: WhiteOrder,
};

const PlaceholderCell = styled(Cell)`
  grid-column: 1 / -1;
  justify-content: center;
  padding: 50px;
`;

export interface DotPlotResultRowsProps {
  runUuid: string;
  omitBorder: boolean;
  additionalColumnCount: number;
}

function sortLegendEntries(
  l1: DotPlotApiLegendItem,
  l2: DotPlotApiLegendItem,
  scattergramType: ScattergramType
): number {
  const l1Index = EventOrderings[scattergramType]?.indexOf(l1.type);
  const l2Index = EventOrderings[scattergramType]?.indexOf(l2.type);
  return (
    (l1Index < 0 ? Number.MAX_SAFE_INTEGER : l1Index) -
    (l2Index < 0 ? Number.MAX_SAFE_INTEGER : l2Index)
  );
}

export function DotPlotResultRows(props: DotPlotResultRowsProps) {
  const [selectedImage, setSelectedImage] = useState<DotPlotNodeDataResponse>();

  const { labRequest } = useContext(ViewpointResultsPageContext);

  const { data: dotPlotMetadata, isLoading } = useGetDotPlotDataQuery(
    { runUuid: props.runUuid },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.reduce(
          (prev, curr: DotPlotNodeDataResponse) => ({
            ...prev,
            [curr.scattergramType]: {
              ...curr,
              legend: [...curr.legend].sort((l1, l2) =>
                sortLegendEntries(l1, l2, curr.scattergramType)
              ),
            } as DotPlotNodeDataResponse,
          }),
          {} as Record<string, DotPlotNodeDataResponse>
        ),
      }),
    }
  );

  const instrumentType = useMemo(
    () =>
      labRequest?.instrumentRunDtos?.find((ir) => ir.uuid === props.runUuid)
        ?.instrumentType,
    [labRequest?.instrumentRunDtos, props.runUuid]
  );

  return (
    <>
      {isLoading || !dotPlotMetadata || !instrumentType || !labRequest ? (
        <RunTableRow
          includePlaceholders
          additionalColumnCount={props.additionalColumnCount}
        >
          <PlaceholderCell>
            <FullSizeSpinner />
          </PlaceholderCell>
        </RunTableRow>
      ) : (
        <>
          {dotPlotMetadata["RBC"] && (
            <DotPlotRow
              metadata={dotPlotMetadata["RBC"]}
              omitBorder={!dotPlotMetadata["WBC"] && props.omitBorder}
              onClickImage={() => setSelectedImage(dotPlotMetadata["RBC"])}
              speciesType={labRequest.patientDto.speciesDto.speciesName}
              instrumentType={instrumentType}
              additionalColumnCount={props.additionalColumnCount}
            />
          )}
          {dotPlotMetadata["WBC"] && (
            <DotPlotRow
              metadata={dotPlotMetadata["WBC"]}
              omitBorder={props.omitBorder}
              onClickImage={() => setSelectedImage(dotPlotMetadata["WBC"])}
              speciesType={labRequest.patientDto.speciesDto.speciesName}
              instrumentType={instrumentType}
              additionalColumnCount={props.additionalColumnCount}
            />
          )}
          {labRequest && (
            <DotPlotModal
              visible={!!selectedImage}
              onClose={() => setSelectedImage(undefined)}
              metadata={selectedImage}
              patient={labRequest.patientDto}
              speciesType={labRequest.patientDto.speciesDto.speciesName}
              instrumentType={instrumentType}
            />
          )}
        </>
      )}
    </>
  );
}

interface DotPlotRowProps {
  metadata: DotPlotNodeDataResponse;
  omitBorder: boolean;
  onClickImage: () => void;
  instrumentType: InstrumentType;
  speciesType: SpeciesType;
  additionalColumnCount: number;
}

function DotPlotRow(props: DotPlotRowProps) {
  const { t } = useTranslation();

  return (
    <RunTableRow
      includePlaceholders
      additionalColumnCount={props.additionalColumnCount}
      omitBorder={props.omitBorder}
    >
      <Cell>
        <SpotText level="secondary">
          {t(`dotPlots.labels.runType.${props.metadata.scattergramType}`)}
        </SpotText>
      </Cell>

      <Cell style={{ gridColumn: "2 / 5", paddingRight: 10 }}>
        <DotPlotDisplay
          metadata={props.metadata}
          onClickImage={props.onClickImage}
          instrumentType={props.instrumentType}
          speciesType={props.speciesType}
        />
      </Cell>
    </RunTableRow>
  );
}
