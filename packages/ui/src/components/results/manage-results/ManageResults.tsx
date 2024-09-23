import { useMemo, useState } from "react";
import {
  InstrumentRunDto,
  LabRequestDto,
  UndoMergeRunsDto,
} from "@viewpoint/api";
import {
  ConfirmModal,
  ConfirmModalProps,
} from "../../confirm-modal/ConfirmModal";
import { Trans, useTranslation } from "react-i18next";
import { useFormatDateTime12h } from "../../../utils/hooks/datetime";
import { useFormatPersonalName } from "../../../utils/hooks/LocalizationHooks";
import styled from "styled-components";
import { CardBody } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { useNavigate } from "react-router-dom";
import { SpotText, useToast } from "@viewpoint/spot-react/src";
import { EditResultsContent } from "./EditResultsContent";
import { CardContent, StyledCard } from "./common-components";
import { UndoMergeContent } from "./UndoMergeContent";
import { useUndoMergeMutation } from "../../../api/LabRequestsApi";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../../utils/toast/toast-defaults";

export const TestId = {
  ReassignResultsCard: "manage-results-reassign-results-card",
  EditResultsCard: "manage-results-edit-results-card",
  UndoMergeCard: "manage-results-undo-merge-card",
};

export interface ManageResultsProps {
  open: boolean;
  onClose: () => void;
  labRequest: LabRequestDto;
  editableRuns: InstrumentRunDto[];
  undoMergeRuns: UndoMergeRunsDto;
}

const Pages = {
  Landing: "Landing",
  Edit: "Edit",
  UndoMerge: "UndoMerge",
} as const;
type Page = (typeof Pages)[keyof typeof Pages];

export function ManageResults(props: ManageResultsProps) {
  const [page, setPage] = useState<Page>(Pages.Landing);
  const [runToEdit, setRunToEdit] = useState<number>();
  const [undoingMerge, setUndoingMerge] = useState<boolean>(false);
  const [undoMerge, undoMergeStatus] = useUndoMergeMutation();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const nav = useNavigate();
  const formatDate = useFormatDateTime12h();
  const formatName = useFormatPersonalName();

  const { onClose, editableRuns, undoMergeRuns, labRequest } = props;

  const formattedPatientName = formatName({
    firstName: props.labRequest.patientDto.patientName,
    lastName: props.labRequest.patientDto.clientDto.lastName,
  });

  const modalProps = useMemo<
    Omit<
      ConfirmModalProps,
      "responsive" | "open" | "headerContent" | "secondaryHeaderContent"
    >
  >(() => {
    switch (page) {
      case Pages.Edit:
        return {
          onClose: () => setPage(Pages.Landing),
          confirmable: runToEdit != null,
          onConfirm: () => {
            onClose();
            nav(`/labRequest/${labRequest.id}?editRun=${runToEdit}`);
          },
          bodyContent: (
            <EditResultsContent
              editableRuns={editableRuns}
              labRequestId={labRequest.id}
              onRunSelected={(runId) => setRunToEdit(runId)}
              selectedRunId={runToEdit}
            />
          ),
          confirmButtonContent: t("general.buttons.next"),
          cancelButtonContent: t("general.buttons.back"),
        };
      case Pages.UndoMerge:
        return {
          onClose: () => setPage(Pages.Landing),
          confirmable: true,
          onConfirm: async () => {
            // Undo the merge here
            if (undoingMerge) {
              try {
                await undoMerge(props.labRequest.id).unwrap();
                addToast({
                  ...DefaultSuccessToastOptions,
                  content: (
                    <ToastContentRoot>
                      <ToastTextContentRoot>
                        <ToastText level="paragraph" bold $maxLines={1}>
                          {formattedPatientName}
                        </ToastText>
                        <ToastText level="paragraph" $maxLines={2}>
                          {t("resultsPage.manageResults.undoMerge.toast")}
                        </ToastText>
                      </ToastTextContentRoot>
                    </ToastContentRoot>
                  ),
                });
              } catch (e) {
                console.error(e);
              }
            }
            onClose();
          },
          headerContent: t("resultsPage.manageResults.undoMerge.title"),
          bodyContent: (
            <UndoMergeContent
              labRequest={labRequest}
              undoingMerge={undoingMerge}
              onUndoingMergeChanged={(undo) => setUndoingMerge(undo)}
              undoMergeRuns={undoMergeRuns}
              loading={undoMergeStatus.isLoading}
            />
          ),
          confirmButtonContent: t("general.buttons.save"),
          cancelButtonContent: t("general.buttons.back"),
        };
      default:
        return {
          onClose: onClose,
          onConfirm: () => {},
          bodyContent: (
            <ManageResultsContent
              onReassignResults={() =>
                nav(`/labRequest/${labRequest.id}/transfer`)
              }
              onEditResults={() => {
                if (editableRuns.length === 1) {
                  // Go to edit directly
                  onClose();
                  nav(
                    `/labRequest/${labRequest.id}?editRun=${editableRuns[0].id}`
                  );
                } else {
                  setPage(Pages.Edit);
                }
              }}
              onUndoMerge={() => setPage(Pages.UndoMerge)}
              canEdit={editableRuns.length > 0}
              canUndoMerge={labRequest.containsMergedRuns}
            />
          ),
          confirmButtonContent: undefined,
          cancelButtonContent: t("general.buttons.cancel"),
        };
    }
  }, [
    addToast,
    editableRuns,
    formattedPatientName,
    labRequest,
    nav,
    onClose,
    page,
    props.labRequest.id,
    runToEdit,
    t,
    undoMerge,
    undoMergeRuns,
    undoMergeStatus.isLoading,
    undoingMerge,
  ]);

  return (
    <ConfirmModal
      responsive
      open={props.open}
      headerContent={t("resultsPage.manageResults.title", {
        timestamp: formatDate(props.labRequest.requestDate),
      })}
      secondaryHeaderContent={formattedPatientName}
      {...modalProps}
    />
  );
}

const ManageResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContentRoot = styled.div`
  display: flex;
  gap: 18px;
  max-width: 675px;
`;

interface ManageResultsContentProps {
  onReassignResults: () => void;
  onEditResults: () => void;
  onUndoMerge: () => void;
  canEdit: boolean;
  canUndoMerge: boolean;
}

function ManageResultsContent(props: ManageResultsContentProps) {
  const { t } = useTranslation();
  return (
    <ManageResultsWrapper>
      <SpotText level="secondary">
        {t("resultsPage.manageResults.instructions")}
      </SpotText>
      <ContentRoot>
        <StyledCard
          isInteractive
          data-testid={TestId.ReassignResultsCard}
          variant="secondary"
          disabled={false}
          onClick={props.onReassignResults}
        >
          <CardBody>
            <SpotIcon name="reassign" />

            <CardContent>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={
                    "resultsPage.manageResults.descriptions.reassignResults"
                  }
                  components={CommonTransComponents}
                />
              </SpotText>
            </CardContent>
          </CardBody>
        </StyledCard>

        <StyledCard
          variant="secondary"
          data-testid={TestId.EditResultsCard}
          isInteractive={props.canEdit}
          disabled={!props.canEdit}
          onClick={props.onEditResults}
        >
          <CardBody>
            <SpotIcon name="edit" />

            <CardContent>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={"resultsPage.manageResults.descriptions.editResults"}
                  components={CommonTransComponents}
                />
              </SpotText>
            </CardContent>
          </CardBody>
        </StyledCard>

        <StyledCard
          variant="secondary"
          data-testid={TestId.UndoMergeCard}
          isInteractive={props.canUndoMerge}
          disabled={!props.canUndoMerge}
          onClick={props.onUndoMerge}
        >
          <CardBody>
            <SpotIcon name="undo" />

            <CardContent>
              <SpotText level="paragraph">
                <Trans
                  i18nKey={"resultsPage.manageResults.descriptions.undoMerge"}
                  components={CommonTransComponents}
                />
              </SpotText>
            </CardContent>
          </CardBody>
        </StyledCard>
      </ContentRoot>
    </ManageResultsWrapper>
  );
}
