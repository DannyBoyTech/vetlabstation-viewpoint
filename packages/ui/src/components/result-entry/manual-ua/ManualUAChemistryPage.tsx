import styled from "styled-components";
import {
  ChemistryResult,
  ChemistryTypes,
  ManualUAAssays,
  ManualUAResults,
} from "@viewpoint/api";
import { Button, SpotText } from "@viewpoint/spot-react";
import { TFunction, useTranslation } from "react-i18next";
import {
  BloodImages,
  ChemistryResultDisplayConfigs,
} from "./MUAStyleConstants";
import { SelectableBox, TestId as ParentTestId } from "./common-components";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Theme } from "../../../utils/StyleConstants";

const ChemistryPageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChemistryPageContent = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(7, auto 1fr);
  height: 100%;
  flex: 1;
  align-items: center;
  column-gap: 10px;
`;

const Cell = styled.div<{ row: number; centerText?: boolean }>`
  grid-row: ${(p) => p.row};
  display: flex;
  flex-direction: column;
  justify-content: ${(p) => (p.centerText ? "flex-start" : "center")};
  ${(p) => (p.centerText ? "align-items: center;" : "")}
`;

export const TestId = {
  ChemistryResultBox: (chemType: ChemistryTypes, result: ChemistryResult) =>
    `mua-chemistry-${chemType}-${result}`,
  ChemistryAssay: (chemType: ChemistryTypes) => `mua-chemistry-${chemType}`,
  SetAllNegativeNormal: `mua-chemistry-set-all-neg-norm`,
};

const AllChemistries = Object.values(ChemistryTypes);

const NonBloodChemistryTypes: ChemistryTypes[] = AllChemistries.filter(
  (type) => type !== ChemistryTypes.BLD && type !== ChemistryTypes.HGB
);

export interface ManualUAChemistryPageProps {
  results: ManualUAResults;
  onResultsChanged: (results: ManualUAResults) => void;
  onComplete: () => void;
  availableAssays: ManualUAAssays[];
}

export function ManualUAChemistryPage(props: ManualUAChemistryPageProps) {
  const { t } = useTranslation();
  const [userHasInteracted, setUserhasInteracted] = useState(false);

  const availableChemistries = useMemo(
    () => AllChemistries.filter((chem) => props.availableAssays.includes(chem)),
    [props.availableAssays]
  );

  function handleChemistryResult(
    assayType: ChemistryTypes,
    result: ChemistryResult
  ) {
    setUserhasInteracted(true);
    const updatedResults = {
      ...props.results,
      chemistries: {
        ...props.results.chemistries,
        [assayType]:
          props.results.chemistries?.[assayType] === result
            ? undefined
            : result,
      },
    };
    //Delete all undefined values
    for (const chem of Object.keys(updatedResults.chemistries)) {
      if (
        typeof updatedResults.chemistries[chem as ChemistryTypes] ===
        "undefined"
      ) {
        delete updatedResults.chemistries[chem as ChemistryTypes];
      }
    }
    // mBLD and mHGB are technically different assays but only one can be selected at a time
    if (
      assayType === ChemistryTypes.HGB &&
      typeof updatedResults.chemistries?.mBLD !== "undefined"
    ) {
      delete updatedResults.chemistries?.mBLD;
    }
    if (
      assayType === ChemistryTypes.BLD &&
      typeof updatedResults.chemistries?.mHGB !== "undefined"
    ) {
      delete updatedResults.chemistries?.mHGB;
    }
    props.onResultsChanged(updatedResults);
  }

  function setAllToNegativeNormal() {
    setUserhasInteracted(true);
    // First result is negative/normal for the assay
    const chemistries = availableChemistries.reduce((prev, curr) => {
      prev[curr] = (
        Object.keys(ChemistryResultDisplayConfigs[curr]) as ChemistryResult[]
      )[0];
      return prev;
    }, {} as { [key in ChemistryTypes]?: ChemistryResult });

    // Remove HGB
    delete chemistries.mHGB;
    props.onResultsChanged({ ...props.results, chemistries });
  }

  useEffect(() => {
    if (userHasInteracted) {
      // Every non-blood/HGB chemistry is defined
      if (
        availableChemistries.every(
          (type) =>
            type === ChemistryTypes.BLD ||
            type == ChemistryTypes.HGB ||
            props.results.chemistries?.[type] != null
        )
      ) {
        // Either blood or HGB must be defined
        if (
          props.results.chemistries?.mHGB != null ||
          props.results.chemistries?.mBLD != null
        ) {
          props.onComplete();
        }
      }
    }
  }, [availableChemistries, props, props.results, userHasInteracted]);

  return (
    <ChemistryPageRoot data-testid={ParentTestId.ChemistriesPage}>
      <Button
        buttonType="link"
        onClick={() => setAllToNegativeNormal()}
        data-testid={TestId.SetAllNegativeNormal}
      >
        {t("resultsEntry.manualUA.buttons.setAllNegativeNormal")}
      </Button>
      <ChemistryPageContent>
        {props.availableAssays.includes(ChemistryTypes.HGB) && (
          <HGBHeader t={t} />
        )}
        {props.availableAssays.includes(ChemistryTypes.BLD) && (
          <ResultRow
            row={2}
            assayName={t("assays.mua.short.mBLD")}
            assayType={ChemistryTypes.BLD}
            resultValues={
              Object.keys(
                ChemistryResultDisplayConfigs.mBLD
              ) as ChemistryResult[]
            }
            images={BloodImages}
            selectedResult={props.results.chemistries?.mBLD}
            onResultSelected={(result) =>
              handleChemistryResult(ChemistryTypes.BLD, result)
            }
          />
        )}

        {props.availableAssays.includes(ChemistryTypes.HGB) && (
          <ResultRow
            row={2}
            assayType={ChemistryTypes.HGB}
            resultValues={
              Object.keys(
                ChemistryResultDisplayConfigs.mHGB
              ) as ChemistryResult[]
            }
            selectedResult={props.results.chemistries?.mHGB}
            onResultSelected={(result) =>
              handleChemistryResult(ChemistryTypes.HGB, result)
            }
          />
        )}

        {NonBloodChemistryTypes.filter((type) =>
          props.availableAssays.includes(type)
        ).map((type, index) => (
          <ResultRow
            key={index}
            row={2 + (index + 1) * 2}
            assayType={type as ChemistryTypes}
            assayName={t(`assays.mua.short.${type}`)}
            resultValues={
              Object.keys(
                ChemistryResultDisplayConfigs[type]
              ) as ChemistryResult[]
            }
            selectedResult={props.results.chemistries?.[type]}
            onResultSelected={(result) => handleChemistryResult(type, result)}
          />
        ))}
      </ChemistryPageContent>
    </ChemistryPageRoot>
  );
}

interface ResultRowProps {
  row: number;
  assayName?: string;
  assayType: ChemistryTypes;
  resultValues: ChemistryResult[];
  images?: { [key in ChemistryResult]?: string };
  onResultSelected?: (result: ChemistryResult) => void;
  selectedResult?: ChemistryResult;
}

function ResultRow(props: ResultRowProps) {
  const { t } = useTranslation();
  return (
    <>
      {props.assayName && (
        <>
          <Cell
            row={props.row}
            data-testid={TestId.ChemistryAssay(props.assayType)}
          >
            <SpotText level="tertiary">{props.assayName}</SpotText>
          </Cell>
          <Cell row={props.row + 1} />
        </>
      )}
      {props.resultValues.map((result) => (
        <Fragment key={result}>
          <Cell
            row={props.row}
            style={{ alignItems: "center" }}
            onClick={() => props.onResultSelected?.(result)}
          >
            <SelectableBox
              selected={props.selectedResult === result}
              boxSize={"2.5em"}
              backgroundColor={
                ChemistryResultDisplayConfigs[props.assayType]?.[result]?.color
              }
              backgroundImageUrl={props.images?.[result]}
              data-testid={TestId.ChemistryResultBox(props.assayType, result)}
            />
          </Cell>

          <Cell row={props.row + 1} centerText>
            <SpotText level="tertiary">
              {t(`resultsEntry.manualUA.chemistryResults.short.${result}`)}
            </SpotText>
          </Cell>
        </Fragment>
      ))}
    </>
  );
}

const HGBHeaderRoot = styled.div`
  grid-column: 7/11;
  grid-row: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  margin-bottom: -10px;
`;
const HGBHeaderCell = styled.div<{
  left?: boolean;
  right?: boolean;
  theme?: Theme;
}>`
  height: 0.25em;
  border-top: ${(p) => p.theme.borders?.heavyPrimary};
  ${(p) => (p.left ? `border-left: ${p.theme.borders?.heavyPrimary};` : "")}
  ${(p) => (p.right ? `border-right: ${p.theme.borders?.heavyPrimary};` : "")}
`;
const HGBHeader = (props: { t: TFunction }) => (
  <HGBHeaderRoot data-testid={TestId.ChemistryAssay(ChemistryTypes.HGB)}>
    <HGBHeaderCell left />
    <HGBHeaderCell />
    <SpotText level="secondary">{props.t(`assays.mua.short.mHGB`)}</SpotText>
    <HGBHeaderCell />
    <HGBHeaderCell right />
  </HGBHeaderRoot>
);
