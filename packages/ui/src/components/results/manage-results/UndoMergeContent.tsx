import {
  InstrumentResultDto,
  InstrumentRunDto,
  LabRequestDto,
  UndoMergeRunsDto,
} from "@viewpoint/api";
import styled from "styled-components";
import { SpotIcon } from "@viewpoint/spot-icons";
import { RadioGroup, Radio, SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { useFormatDateTime12h } from "../../../utils/hooks/datetime";
import { Fragment, useMemo } from "react";
import { SpotTokens } from "../../../utils/StyleConstants";
import { getLocalizedAssayName } from "../result-utils";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";

const TestId = {
  UsePreviousResults: "undo-merge-use-previous-results-radio",
  UseMergeResults: "undo-merge-use-merge-results-radio",
};

const ContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 800px;
  height: 475px;
  overflow-y: hidden;
  gap: 12px;
  padding: 0 8px;

  .spot-form__radio-group {
    padding: unset;
    margin: unset;
  }
`;

const InfoTitle = styled.div`
  display: inline-flex;
  gap: 12px;

  .spot-icon {
    fill: ${(p) => p.theme.colors?.feedback?.error};
  }
`;

const ScrollSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors?.background?.secondary};
  border-radius: ${SpotTokens.border.radius.container};
  margin-top: 8px;
`;

const RunCompareTable = styled.div`
  padding: 16px 24px;
  display: grid;
  grid-template-columns: [prev-assay-name] 2fr [prev-result-value] 2fr [spacer-left] 1fr [spacer-right] 1fr [merged-assay-name] 2fr [merged-result-value] 2fr;
`;

const TableHeader = styled.div`
  grid-column: auto/span 2;
`;

const RunHeader = styled(TableHeader)`
  padding: 32px 0 16px 0;
`;

const SpacerLeft = styled.div`
  grid-column: spacer-left;
  border-right: ${(p) => p.theme.borders?.lightSecondary};
`;

const SpacerRight = styled.div`
  grid-column: spacer-right;
`;

const Cell = styled.div`
  padding: 8px 4px;
`;

const PrevAssayCell = styled(Cell)`
  grid-column: prev-assay-name;
  border-bottom: ${(p) => p.theme.borders?.extraLightSecondary};
`;
const PrevResultCell = styled(Cell)`
  grid-column: prev-result-value;
  border-bottom: ${(p) => p.theme.borders?.extraLightSecondary};
`;
const MergedAssayCell = styled(Cell)`
  grid-column: merged-assay-name;
  border-bottom: ${(p) => p.theme.borders?.extraLightSecondary};
`;
const MergedResultCell = styled(Cell)`
  grid-column: merged-result-value;
  border-bottom: ${(p) => p.theme.borders?.extraLightSecondary};
`;

export interface UndoMergeContentProps {
  labRequest: LabRequestDto;
  undoMergeRuns: UndoMergeRunsDto;
  undoingMerge: boolean;
  onUndoingMergeChanged: (undoMerge: boolean) => void;
  loading: boolean;
}

export function UndoMergeContent(props: UndoMergeContentProps) {
  const { t } = useTranslation();
  return (
    <ContentRoot>
      {props.loading && <SpinnerOverlay />}
      <InfoTitle>
        <SpotIcon name="alert-notification" />
        <SpotText level="paragraph">
          <Trans
            i18nKey="resultsPage.manageResults.undoMerge.warning"
            components={CommonTransComponents}
          />
        </SpotText>
      </InfoTitle>
      <RadioGroup>
        <Radio
          label={t("resultsPage.manageResults.undoMerge.usePreviousResults")}
          data-testid={TestId.UsePreviousResults}
          checked={props.undoingMerge}
          onChange={(ev) => props.onUndoingMergeChanged(ev.target.checked)}
        />
        <Radio
          label={t("resultsPage.manageResults.undoMerge.useMergeResults")}
          data-testid={TestId.UseMergeResults}
          checked={!props.undoingMerge}
          onChange={(ev) => props.onUndoingMergeChanged(!ev.target.checked)}
        />
      </RadioGroup>
      <ScrollSection>
        <RunCompareTable>
          <TableHeader>
            <SpotText level="h5">
              {t("resultsPage.manageResults.undoMerge.previousResults")}
            </SpotText>
          </TableHeader>
          <SpacerLeft />
          <SpacerRight />
          <TableHeader>
            <SpotText level="h5">
              {t("resultsPage.manageResults.undoMerge.mergeResults")}
            </SpotText>
          </TableHeader>

          {Object.entries(props.undoMergeRuns.previousRunsByCurrentRunId).map(
            ([runId, previousRun]) => {
              const mergedRun = props.labRequest.instrumentRunDtos?.find(
                (ir) => `${ir.id}` === runId
              );
              if (mergedRun != null) {
                return (
                  <RunCompareTableContent
                    key={runId}
                    previousRun={previousRun}
                    mergedRun={mergedRun}
                  />
                );
              }
            }
          )}
        </RunCompareTable>
      </ScrollSection>
    </ContentRoot>
  );
}

interface RunCompareTableProps {
  previousRun: InstrumentRunDto;
  mergedRun: InstrumentRunDto;
}

function getResultDisplayForAssay(
  instrumentResultDtos: InstrumentResultDto[] | undefined,
  assayIdentityName: string
): string | undefined {
  return instrumentResultDtos?.find(
    (ir) => ir.assayIdentityName === assayIdentityName
  )?.resultValueForDisplay;
}

function RunCompareTableContent(props: RunCompareTableProps) {
  const formatDate = useFormatDateTime12h();
  const { t } = useTranslation();

  const { previousRun, mergedRun } = props;

  const mappedResults = useMemo(() => {
    // Get all the assays from both runs
    const allAssays = [
      // Throw them into a set to remove duplicates
      ...new Set(
        [
          ...previousRun.instrumentResultDtos,
          ...mergedRun.instrumentResultDtos,
          // Include the "assay" field since we have to use that as a fallback
          // for assays that we don't have localized entries for
        ].map((result) => result.assayIdentityName + "|" + result.assay)
      ),
    ];
    // Build a map of assayIdentity -> previous run value, merged run value, and fallback assay name
    return allAssays.reduce(
      (prev, curr) => {
        const [assayIdentityName, fallbackAssayName] = curr.split("|");
        return {
          ...prev,
          [assayIdentityName]: {
            assayFallbackName: fallbackAssayName,
            previousResultValue: getResultDisplayForAssay(
              previousRun.instrumentResultDtos,
              assayIdentityName
            ),
            mergedResultValue: getResultDisplayForAssay(
              mergedRun.instrumentResultDtos,
              assayIdentityName
            ),
          },
        };
      },
      {} as {
        [key: string]: {
          assayFallbackName: string;
          previousResultValue?: string;
          mergedResultValue?: string;
        };
      }
    );
  }, [mergedRun.instrumentResultDtos, previousRun.instrumentResultDtos]);

  return (
    <>
      <RunHeader>
        <SpotText level="paragraph" bold>
          {t(`instruments.names.${props.previousRun.instrumentType}`)}{" "}
          {formatDate(props.previousRun.testDate)}
        </SpotText>
      </RunHeader>
      <SpacerLeft />
      <SpacerRight />
      <RunHeader>
        <SpotText level="paragraph" bold>
          {t(`instruments.names.${props.mergedRun.instrumentType}`)}{" "}
          {formatDate(props.mergedRun.testDate)}
        </SpotText>
      </RunHeader>

      {Object.keys(mappedResults).map((assayIdentityName) => {
        const previous = mappedResults[assayIdentityName].previousResultValue;
        const merged = mappedResults[assayIdentityName].mergedResultValue;
        const fallbackAssay =
          mappedResults[assayIdentityName].assayFallbackName;
        const bolded = previous !== merged;
        return (
          <Fragment key={assayIdentityName}>
            <PrevAssayCell>
              <SpotText level="paragraph" bold={bolded}>
                {getLocalizedAssayName(t, assayIdentityName, fallbackAssay)}
              </SpotText>
            </PrevAssayCell>
            <PrevResultCell>
              <SpotText level="paragraph" bold={bolded}>
                {previous}
              </SpotText>
            </PrevResultCell>
            <SpacerLeft />
            <SpacerRight />
            <MergedAssayCell>
              <SpotText level="paragraph" bold={bolded}>
                {getLocalizedAssayName(t, assayIdentityName, fallbackAssay)}
              </SpotText>
            </MergedAssayCell>
            <MergedResultCell>
              <SpotText level="paragraph" bold={bolded}>
                {merged}
              </SpotText>
            </MergedResultCell>
          </Fragment>
        );
      })}
    </>
  );
}
