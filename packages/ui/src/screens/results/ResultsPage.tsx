import { Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { labRequestApi } from "../../api/LabRequestsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import {
  InstrumentRunDto,
  LabRequestDto,
  ServiceCategory,
} from "@viewpoint/api";
import { useMemo, useRef, useState } from "react";
import { ResultsTable } from "../../components/results/ResultsTable";
import { ResultsPageHeader } from "../../components/results/ResultsPageHeader";
import { EditResults } from "../../components/result-entry/EditResults";
import { ResultDetailsPopover } from "./ResultDetailsPopover";
import ViewpointResultsPageProvider from "../../context/ResultsPageContext";
import { sortRecords } from "../../utils/patient-utils";
import { ResultsCommunicationsLogModal } from "./ResultsCommunicationsLog";
import { useGetPimsEverConnectedQuery } from "../../api/PimsApi";
import { useGetVcpConfigurationQuery } from "../../api/VetConnectPlusApi";
import {
  useHeaderTitle,
  usePimsInstrumentStatus,
} from "../../utils/hooks/hooks";
import {
  ServiceCategorySortOrder,
  ServiceCategorySvgs,
} from "../../components/results/result-utils";
import { ManageResults } from "../../components/results/manage-results/ManageResults";
import { HorizontalScrollContainer } from "../../components/analyzer-status/HorizontalScrollContainer";
import PopoverContextProvider from "../../components/popover/popover-context";
import { usePrintResult } from "../../utils/print/printResult";
import { trackResultPrinted } from "../../analytics/nltx-events";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
`;

const ButtonContainer = styled.div`
  margin-left: auto;
  display: flex;
  gap: 10px;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
  margin: 0px 15px;
  flex: 1;
`;

const ResultsTableScrollContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
`;

const RunHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-top: unset;
  border-radius: 5px;
  padding: 10px 10px 10px 8px;

  display: flex;
  align-items: center;
  z-index: 1;
`;

const RunHeaderServiceCategoryImgContainer = styled(HorizontalScrollContainer)`
  flex: 1;
  margin: 0 24px;
`;

const RunHeaderServiceCategoryButton = styled(Button)`
  margin: 0 12px;
`;

type CategorizedRuns = { [key in ServiceCategory]?: InstrumentRunDto[] };

function splitRunsIntoCategories(runs: InstrumentRunDto[]): CategorizedRuns {
  return runs.reduce((prev, curr) => {
    const category = curr.serviceCategory;
    if (!prev[category]) {
      prev[category] = [];
    }
    prev[category]?.push(curr);
    return prev;
  }, {} as CategorizedRuns);
}

export function ResultsPage() {
  const { t } = useTranslation();
  useHeaderTitle({ label: t("resultsPage.title") });

  const { labRequestId: labRequestIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const labRequestId = parseInt(labRequestIdParam!);
  const editingRun =
    searchParams.get("editRun") == null
      ? undefined
      : parseInt(searchParams.get("editRun")!);

  const { data: labRequest } = labRequestApi.useGetDetailedLabRequestQuery(
    labRequestId == null
      ? skipToken
      : {
          labRequestId: labRequestId,
          previousRunDepth: 2,
        }
  );

  const { data: records, currentRecord } =
    labRequestApi.useGetRecordsForPatientQuery(
      labRequest?.patientDto.id ?? skipToken,
      {
        selectFromResult: (result) => ({
          ...result,
          data: sortRecords(result.data),
          currentRecord: result.data?.find(
            (rec) => rec.labRequestId === labRequestId
          ),
        }),
      }
    );

  const editableRuns = useMemo(
    () => labRequest?.instrumentRunDtos?.filter((ir) => ir.editable) ?? [],
    [labRequest?.instrumentRunDtos]
  );

  const nav = useNavigate();

  if (records == null || currentRecord == null) {
    return <SpinnerOverlay />;
  }

  return (
    <Wrapper>
      <ViewpointResultsPageProvider
        labRequest={labRequest}
        record={currentRecord}
      >
        {/* Used data instead of currentData here because we don't care if it changes -- we're only interested in the patient info*/}
        {labRequest != null && (
          <ResultsPageHeader
            labRequestId={labRequestId}
            labRequest={labRequest}
            records={records}
            onRecordSelected={(rec) => {
              if (rec.labRequestId !== labRequestId) {
                nav(`/labRequest/${rec.labRequestId}`, { replace: true });
              }
            }}
          />
        )}

        {labRequest?.id !== labRequestId && <SpinnerOverlay />}
        {labRequest != null && <ResultsContent labRequest={labRequest} />}
      </ViewpointResultsPageProvider>

      {editingRun != null && (
        <EditResults
          labRequestId={labRequestId}
          selectedRun={editableRuns.find((ir) => ir.id === editingRun)!}
          onClose={() => {
            searchParams.delete("editRun");
            setSearchParams(Object.fromEntries(searchParams));
          }}
        />
      )}
    </Wrapper>
  );
}

interface ResultsContentProps {
  labRequest: LabRequestDto;
}

function ResultsContent(props: ResultsContentProps) {
  const [commsLogOpen, setCommsLogOpen] = useState(false);
  const [manageResultsOpen, setManageResultsOpen] = useState(false);

  const serviceCategoryRefs = useRef<{
    [key in ServiceCategory]?: HTMLDivElement | null;
  }>({});
  const [expandedServiceCategories, setExpandedServiceCategories] = useState<{
    [key in ServiceCategory]?: boolean;
  }>(
    Object.fromEntries(Object.keys(ServiceCategory).map((key) => [key, true]))
  );

  const { categorizedRuns, editableRuns } = useMemo(
    () => ({
      categorizedRuns:
        props.labRequest.instrumentRunDtos == null
          ? undefined
          : splitRunsIntoCategories(props.labRequest.instrumentRunDtos),
      editableRuns:
        props.labRequest.instrumentRunDtos?.filter((ir) => ir.editable) ?? [],
    }),
    [props.labRequest]
  );

  const { t } = useTranslation();

  const { data: undoMergeRuns } = labRequestApi.useGetUndoMergeRunsQuery(
    props.labRequest.id
  );

  const { data: everHadPims } = useGetPimsEverConnectedQuery();
  const { data: vcpConfig } = useGetVcpConfigurationQuery();
  const pimsStatus = usePimsInstrumentStatus();

  const hasVcpTransmissions = !!props.labRequest.instrumentRunDtos?.some(
    (ir) => ir.connectedApplicationHistoryDto?.dateSentToDxPortal != null
  );

  const sortedServiceCategories = useMemo(
    () =>
      (Object.keys(categorizedRuns ?? {}) as ServiceCategory[]).sort(
        (catOne, catTwo) =>
          ServiceCategorySortOrder[catOne] - ServiceCategorySortOrder[catTwo]
      ),
    [categorizedRuns]
  );

  const handleServiceCategoryButtonClick = (category: ServiceCategory) => {
    requestAnimationFrame(() => {
      serviceCategoryRefs.current[category]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setExpandedServiceCategories({
        ...expandedServiceCategories,
        [category]: true,
      });
    });
  };

  const [printing, setPrinting] = useState(false);
  const printResult = usePrintResult();

  const handlePrint = async () => {
    try {
      setPrinting(true);
      await printResult(props.labRequest.id);
      trackResultPrinted({ type: "auto", copies: 1 });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <ResultsContainer key={props.labRequest.id}>
      <RunHeader>
        <ResultDetailsPopover
          labRequestData={props.labRequest}
          onViewCommsLog={() => setCommsLogOpen(true)}
          hideCommsLog={
            !everHadPims && !vcpConfig?.vcpActivated && !hasVcpTransmissions
          }
        />

        {commsLogOpen && (
          <ResultsCommunicationsLogModal
            open={commsLogOpen}
            onClose={() => setCommsLogOpen(false)}
            labRequest={props.labRequest}
            hasPims={!!everHadPims}
            pimsOnline={!!pimsStatus?.connected}
            hasVcp={vcpConfig?.vcpActivated || hasVcpTransmissions}
          />
        )}
        <RunHeaderServiceCategoryImgContainer>
          {sortedServiceCategories.map((category: ServiceCategory) => (
            <div key={category}>
              <RunHeaderServiceCategoryButton
                key={category}
                buttonType="secondary"
                iconOnly
                leftIcon={ServiceCategorySvgs[category]?.({
                  className: "spot-button__icon spot-button__icon-left",
                })}
                onClick={() => handleServiceCategoryButtonClick(category)}
              />
            </div>
          ))}
        </RunHeaderServiceCategoryImgContainer>

        <ButtonContainer>
          <Button
            buttonType="secondary"
            buttonSize="small"
            iconOnly
            leftIcon="print"
            onClick={handlePrint}
            disabled={printing}
          />
          <Button
            buttonType="secondary"
            buttonSize="small"
            onClick={() => setManageResultsOpen(true)}
            data-testid="manage-results-button"
          >
            {t("resultsPage.buttons.manageResults")}
          </Button>

          {manageResultsOpen &&
            editableRuns != null &&
            undoMergeRuns != null && (
              <ManageResults
                open
                labRequest={props.labRequest}
                onClose={() => setManageResultsOpen(false)}
                editableRuns={editableRuns}
                undoMergeRuns={undoMergeRuns}
              />
            )}
        </ButtonContainer>
      </RunHeader>
      <PopoverContextProvider>
        <ResultsTableScrollContainer>
          {categorizedRuns != null &&
            sortedServiceCategories.map((category: ServiceCategory) => {
              const runs = categorizedRuns[category] ?? [];
              const historicalRuns = runs.reduce(
                (prev, curr) => ({
                  ...prev,
                  [curr.id]: getHistoricalRuns(curr),
                }),
                {} as Record<number, InstrumentRunDto[]>
              );
              return (
                <div
                  key={category}
                  ref={(r) => (serviceCategoryRefs.current[category] = r)}
                >
                  <ResultsTable
                    key={props.labRequest.id}
                    serviceCategory={category}
                    instrumentRuns={runs}
                    historicalRuns={historicalRuns}
                    expanded={expandedServiceCategories[category] || false}
                    onToggleExpanded={() =>
                      setExpandedServiceCategories({
                        ...expandedServiceCategories,
                        [category]: !expandedServiceCategories[category],
                      })
                    }
                  />
                </div>
              );
            })}
        </ResultsTableScrollContainer>
      </PopoverContextProvider>
    </ResultsContainer>
  );
}

function getHistoricalRuns(run: InstrumentRunDto): InstrumentRunDto[] {
  let runToCheck = run.previousRun;
  const previousRuns: InstrumentRunDto[] = runToCheck ? [runToCheck] : [];
  while (runToCheck?.previousRun) {
    previousRuns.push(runToCheck.previousRun);
    runToCheck = runToCheck.previousRun;
  }
  return previousRuns;
}

const getMaxHistoricalRuns = (
  historicalRuns: Record<number, InstrumentRunDto[]>
) =>
  Object.values(historicalRuns).reduce(
    (prev, curr) => (curr.length > prev ? curr.length : prev),
    0
  );
