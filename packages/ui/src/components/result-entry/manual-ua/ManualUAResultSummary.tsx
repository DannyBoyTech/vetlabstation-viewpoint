import {
  BloodImages,
  ChemistryResultDisplayConfigs,
  ConstantColors,
  getClarityImagePath,
  getCollectionMethodImagePath,
  getColorImagePath,
  PHColors,
} from "./MUAStyleConstants";
import {
  AdditionalAssays,
  ChemistryTypes,
  ManualUAResults,
} from "@viewpoint/api";
import { Button, SpotText, TextArea } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { InputAware } from "../../InputAware";
import {
  Box,
  ManualUAPages,
  TestId as ParentTestId,
} from "./common-components";
import { Theme } from "../../../utils/StyleConstants";

const Root = styled.div`
  flex: 1;
`;

const SummaryPageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 10px;
`;

const SummaryCell = styled.div`
  display: flex;
  align-items: center;
`;

const ResultSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
`;

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

const PHLabelContainer = styled.div`
  margin-left: 8px;
`;

export interface SummaryPageProps {
  results: ManualUAResults;
  onResultsChanged: (results: ManualUAResults) => void;
  goToPage: (page: ManualUAPages) => void;
  skipChemistries: boolean;
}

export const TestId = {
  CommentBox: "mua-result-summary-comments",
  ResultSummaryBox: (assay: string) => `mua-result-summary-box-${assay}`,
};

const SortedChemistryTypes = Object.values(ChemistryTypes);

export function SummaryPage(props: SummaryPageProps) {
  const commentRef = useRef<HTMLTextAreaElement | null>(null);
  const { t } = useTranslation();

  return (
    <Root>
      <SummaryPageContent data-testid={ParentTestId.SummaryPage}>
        <SpotText level="h5">
          {t("resultsEntry.manualUA.labels.comments")}
        </SpotText>
        <InputAware>
          <TextArea
            style={{ resize: "none" }}
            innerRef={commentRef}
            value={props.results.comment}
            onChange={(ev) =>
              props.onResultsChanged({
                ...props.results,
                comment:
                  ev.target.value?.length > 0 ? ev.target.value : undefined,
              })
            }
            data-testid={TestId.CommentBox}
          />
        </InputAware>

        <SectionHeader>
          <SpotText level="h5">
            {t("resultsEntry.manualUA.labels.physical")}
          </SpotText>
        </SectionHeader>

        <Divider />
        <ResultSection>
          {props.results.collectionMethod && (
            <SummaryCell>
              <Box
                data-testid={TestId.ResultSummaryBox(
                  AdditionalAssays.CollectionMethod
                )}
                backgroundColor={ConstantColors.CollectionMethod}
                backgroundImageUrl={getCollectionMethodImagePath(
                  props.results.collectionMethod
                )}
              />
              <SpotText level="paragraph">
                {t(
                  `resultsEntry.manualUA.collectionMethod.${props.results.collectionMethod}`
                )}
              </SpotText>
            </SummaryCell>
          )}
          {props.results.color && (
            <SummaryCell>
              <Box
                backgroundImageUrl={getColorImagePath(props.results.color)}
              />
              <SpotText level="paragraph">
                {t(`resultsEntry.manualUA.color.${props.results.color}`)}
              </SpotText>
            </SummaryCell>
          )}
          {props.results.clarity && (
            <SummaryCell>
              <Box
                data-testid={TestId.ResultSummaryBox(AdditionalAssays.Clarity)}
                backgroundImageUrl={getClarityImagePath(props.results.clarity)}
              />
              <SpotText level="paragraph">
                {t(`resultsEntry.manualUA.clarity.${props.results.clarity}`)}
              </SpotText>
            </SummaryCell>
          )}
          {typeof props.results.specificGravity !== "undefined" && (
            <SummaryCell>
              <PHLabelContainer>
                <SpotText level="paragraph">
                  {t(`resultsEntry.manualUA.labels.specificGravity`)}
                </SpotText>
                <SpotText level="paragraph" bold>
                  {props.results.sgGreaterThan ? "> " : ""}
                  {props.results.specificGravity}
                </SpotText>
              </PHLabelContainer>
            </SummaryCell>
          )}
        </ResultSection>

        {(!props.skipChemistries || props.results.ph) && (
          <>
            <SectionHeader>
              <SpotText level="h5">
                {t("resultsEntry.manualUA.labels.chemistries")}
              </SpotText>
            </SectionHeader>

            <Divider />
            <ResultSection>
              {props.results.ph && (
                <ResultSummary
                  resultLabel={props.results.ph.toString()}
                  assayLabel={t("assays.mua.short.mPH")}
                  backgroundColor={PHColors[props.results.ph]}
                  assayType={AdditionalAssays.PH}
                />
              )}
              {!props.skipChemistries &&
                SortedChemistryTypes.map(
                  (chem) =>
                    props.results.chemistries?.[chem] != null && (
                      <ResultSummary
                        key={chem}
                        resultLabel={t(
                          `resultsEntry.manualUA.chemistryResults.${props
                            .results.chemistries[chem]!}`
                        )}
                        assayLabel={t(`assays.mua.${chem}`)}
                        assayType={chem}
                        backgroundColor={
                          ChemistryResultDisplayConfigs[chem][
                            props.results.chemistries[chem]!
                          ]?.color ?? "white"
                        }
                        backgroundImageUrl={
                          chem === ChemistryTypes.BLD
                            ? BloodImages[props.results.chemistries[chem]!]
                            : undefined
                        }
                      />
                    )
                )}
            </ResultSection>
          </>
        )}
      </SummaryPageContent>
    </Root>
  );
}

interface ResultSummaryProps {
  backgroundColor: string;
  assayLabel: string;
  assayType: ChemistryTypes | AdditionalAssays;
  resultLabel: string;
  backgroundImageUrl?: string;
}

const ResultSummaryLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

function ResultSummary(props: ResultSummaryProps) {
  return (
    <SummaryCell>
      <Box
        data-testid={TestId.ResultSummaryBox(props.assayType)}
        backgroundColor={props.backgroundColor}
        backgroundImageUrl={props.backgroundImageUrl}
      />
      <ResultSummaryLabelContainer>
        <SpotText level="paragraph">{props.assayLabel}</SpotText>
        <SpotText level="paragraph" style={{ fontWeight: "bold" }}>
          {props.resultLabel}
        </SpotText>
      </ResultSummaryLabelContainer>
    </SummaryCell>
  );
}
