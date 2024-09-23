import { Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { useCallback, useEffect, useState } from "react";
import {
  ChemistryTypes,
  ManualUAAssays,
  ManualUAResults,
} from "@viewpoint/api";
import { SummaryPage } from "./ManualUAResultSummary";
import { useTranslation } from "react-i18next";
import {
  useEditManualUaResultsMutation,
  useSaveManualUaResultsMutation,
} from "../../../api/ResultsApi";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";
import { ManualUAPhysicalPage } from "./ManualUAPhysicalPage";
import { ManualUAChemistryPage } from "./ManualUAChemistryPage";
import {
  CancelRunContainer,
  Divider,
  Header,
  HeaderButton,
  PageContainer,
  Root,
} from "../common-slideout-components";
import { ManualUAPages, TestId } from "./common-components";

export interface ManualUAResultEntryProps {
  // For companion merges (a manual UA and UA analyzer on the same request) there is a parent run (the UA analyzer run)
  // that needs to be targeted for editing, but the actual results for the manual portion are in a different run (editableRunId)
  editableRunId: number;
  targetRunId?: number;
  onDone: () => void;
  onClose?: () => void;
  onCancelRun?: () => void;
  onResultsUpdated?: (results: ManualUAResults, canSubmit: boolean) => void;
  initialResults?: ManualUAResults;
  skipChemistries: boolean;
  availableAssays: ManualUAAssays[];
}

function resultsMatch(
  resultSetOne?: ManualUAResults,
  resultSetTwo?: ManualUAResults
): boolean {
  return (
    resultSetOne?.collectionMethod === resultSetTwo?.collectionMethod &&
    resultSetOne?.color === resultSetTwo?.color &&
    resultSetOne?.clarity === resultSetTwo?.clarity &&
    resultSetOne?.specificGravity === resultSetTwo?.specificGravity &&
    resultSetOne?.sgGreaterThan === resultSetTwo?.sgGreaterThan &&
    resultSetOne?.ph === resultSetTwo?.ph &&
    (resultSetOne?.comment === resultSetTwo?.comment ||
      (!resultSetOne?.comment && !resultSetTwo?.comment)) &&
    (Object.values(ChemistryTypes) as ChemistryTypes[]).every(
      (chemType) =>
        resultSetOne?.chemistries?.[chemType] ===
        resultSetTwo?.chemistries?.[chemType]
    )
  );
}

export interface ManualUAEntryPageResults extends ManualUAResults {
  sgValid?: boolean;
}

export function ManualUAResultEntry(props: ManualUAResultEntryProps) {
  const editing = !!props.initialResults;

  const availablePages = props.skipChemistries
    ? [ManualUAPages.Physical, ManualUAPages.Summary]
    : [
        ManualUAPages.Physical,
        ManualUAPages.Chemistries,
        ManualUAPages.Summary,
      ];

  const [results, setResults] = useState<ManualUAEntryPageResults>({
    ...props.initialResults,
    sgValid: props.initialResults?.specificGravity != null,
  });
  const [pageIndex, setPageIndex] = useState(
    editing ? availablePages.length - 1 : 0
  );
  const [canSubmit, setCanSubmit] = useState(false);
  const [completedPages, setCompletedPages] = useState<Record<number, boolean>>(
    {}
  );

  const [saveResults, saveResultsStatus] = useSaveManualUaResultsMutation();
  const [editResults, editResultsStatus] = useEditManualUaResultsMutation();

  const page = availablePages[pageIndex];

  const { t } = useTranslation();

  useEffect(() => {
    const { chemistries, sgGreaterThan, ...otherResults } = results; //TODO: how can removing sgGreaterThan fail test?
    const canSubmitResults =
      ((results.specificGravity == null || !!results.sgValid) &&
        Object.values(otherResults).some(
          (value) => typeof value !== "undefined"
        )) ||
      Object.values(chemistries ?? {}).length > 0;

    setCanSubmit(
      canSubmitResults &&
        (!editing || !resultsMatch(props.initialResults, results))
    );
    props.onResultsUpdated?.(results, canSubmitResults);
  }, [results]);

  const autoAdvance = () => {
    // Don't auto-advance when editing
    if (!editing && !completedPages[pageIndex]) {
      setCompletedPages({ ...completedPages, [pageIndex]: true });
      setPageIndex(Math.min(pageIndex + 1, availablePages.length - 1));
    }
  };

  return (
    <Root>
      {(saveResultsStatus.isLoading || editResultsStatus.isLoading) && (
        <SpinnerOverlay />
      )}
      <PaginatingHeader
        pages={availablePages.length}
        currentPage={pageIndex}
        editing={editing}
        onNext={() => {
          setCompletedPages({ ...completedPages, [pageIndex]: true });
          setPageIndex(pageIndex + 1);
        }}
        onBack={() => {
          if (pageIndex === 0) {
            props.onClose?.();
          } else {
            setPageIndex(pageIndex - 1);
          }
        }}
        doneDisabled={!canSubmit}
        nextDisabled={
          page === ManualUAPages.Physical &&
          results.specificGravity != null &&
          !results.sgValid
        }
        onDone={() => {
          const doSave = editing ? editResults : saveResults;
          const cleanedResults = { ...results };
          delete cleanedResults.sgValid;
          doSave({
            results: cleanedResults,
            instrumentRunId: props.editableRunId,
          })
            .then(() => {
              setPageIndex(0);
              props.onDone();
            })
            .catch((err) => console.error(err));
        }}
      />
      <Divider />
      <PageContainer>
        {page === ManualUAPages.Physical && (
          <ManualUAPhysicalPage
            results={results}
            onResultsChanged={setResults}
            onComplete={autoAdvance}
            skipChemistries={props.skipChemistries}
          />
        )}
        {page === ManualUAPages.Chemistries && (
          <ManualUAChemistryPage
            results={results}
            onResultsChanged={setResults}
            onComplete={autoAdvance}
            availableAssays={props.availableAssays}
          />
        )}
        {page === ManualUAPages.Summary && (
          <SummaryPage
            results={results}
            onResultsChanged={setResults}
            skipChemistries={props.skipChemistries}
            goToPage={(page) => setPageIndex(availablePages.indexOf(page))}
          />
        )}
        {!editing && (
          <CancelRunContainer>
            <Button
              buttonType="link"
              leftIcon="delete"
              onClick={props.onCancelRun}
            >
              {t("inProcess.analyzerRun.buttons.cancelRun")}
            </Button>
          </CancelRunContainer>
        )}
      </PageContainer>
    </Root>
  );
}

const PageMarker = styled.div<{ marked?: boolean }>`
  margin: 0 10px;
  width: ${(p) => (p.marked ? "15px" : "10px")};
  height: ${(p) => (p.marked ? "15px" : "10px")};
  border-radius: 50%;
  background-color: ${(p: { theme: Theme; marked?: boolean }) =>
    p.marked ? p.theme.colors?.text?.link : p.theme.colors?.text?.disabled};
`;

interface PaginatingHeaderProps {
  pages: number;
  currentPage: number;
  onNext: () => void;
  onBack: () => void;
  onDone: () => void;
  doneDisabled?: boolean;
  nextDisabled?: boolean;
  editing: boolean;
}

const PageMarkerContainer = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  display: flex;
`;

function PaginatingHeader({
  onBack,
  onNext,
  onDone,
  currentPage,
  pages,
  ...props
}: PaginatingHeaderProps) {
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleNext = useCallback(() => {
    if (currentPage < pages - 1) {
      onNext();
    } else {
      onDone();
    }
  }, [currentPage, onDone, onNext, pages]);

  return (
    <Header>
      <HeaderButton
        buttonType="secondary"
        onClick={handleBack}
        data-testid={TestId.BackButton}
      >
        {currentPage === 0
          ? t("general.buttons.close")
          : t("general.buttons.back")}
      </HeaderButton>
      <PageMarkerContainer data-testid={TestId.PageMarkerContainer}>
        {new Array(pages).fill(0).map((_v, index) => (
          <PageMarker
            data-testid={TestId.PageMarker}
            key={index}
            marked={currentPage >= index}
          />
        ))}
      </PageMarkerContainer>
      <HeaderButton
        buttonType="primary"
        onClick={handleNext}
        disabled={
          props.nextDisabled || (currentPage >= pages - 1 && props.doneDisabled)
        }
        data-testid={TestId.NextButton}
      >
        {currentPage < pages - 1
          ? t("general.buttons.next")
          : t("general.buttons.save")}
      </HeaderButton>
    </Header>
  );
}
