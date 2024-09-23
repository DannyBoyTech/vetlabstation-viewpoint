import {
  useDeleteUsbBackupsMutation,
  useLazyGetDeletableBackupCandidatesQuery,
} from "../../../../api/UsbApi";
import { useEffect, useState } from "react";
import { BackupMetadataWrapperDto } from "@viewpoint/api";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { Trans, useTranslation } from "react-i18next";
import { Modal, SpotText, Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { useFormatLongDateTime12h } from "../../../../utils/hooks/datetime";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";

export const TestId = {
  Modal: "usb-delete-backups-modal",
};

export interface DeleteBackupsModalProps {
  usbId: string;
  backupSize: number;
  onCancel: () => void;
  onConfirm: () => void;
  onError: (error: "NotEnoughCapacity" | "UnknownError") => void;
}

export function DeleteBackupsModal(props: DeleteBackupsModalProps) {
  const [deletableCandidates, setDeletableCandidates] =
    useState<BackupMetadataWrapperDto[]>();

  const [getCandidates, { isLoading: fetchIsLoading }] =
    useLazyGetDeletableBackupCandidatesQuery();
  const [deleteCandidates, { isLoading: deletingIsLoading }] =
    useDeleteUsbBackupsMutation();

  const { t } = useTranslation();

  useEffect(() => {
    getCandidates({ usbId: props.usbId, backupSize: props.backupSize })
      .unwrap()
      .then((candidates) => {
        if (candidates.length === 0) {
          props.onError("NotEnoughCapacity");
        } else {
          setDeletableCandidates(candidates);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const onConfirm = () => {
    if (deletableCandidates != null) {
      deleteCandidates(deletableCandidates)
        .unwrap()
        .then((success) => {
          if (success) {
            props.onConfirm();
          } else {
            props.onError("UnknownError");
          }
        });
    }
  };

  return (
    <BasicModal
      data-testid={TestId.Modal}
      dismissable={false}
      open={true}
      onClose={props.onCancel}
      bodyContent={
        <DeleteBackupsContent
          candidates={deletableCandidates}
          loading={deletingIsLoading || fetchIsLoading}
        />
      }
      headerContent={
        <SpotText level="h3">{t("backups.notEnoughSpace.title")}</SpotText>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton onClick={props.onCancel}>
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>

          <Button onClick={onConfirm} disabled={deletableCandidates == null}>
            {t("general.buttons.ok")}
          </Button>
        </>
      }
    />
  );
}

const DeleteBackupRoot = styled.div`
  height: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BackupList = styled.div`
  position: relative;
  flex: auto;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  * {
    padding: 15px;
  }
`;

interface DeleteBackupsContentProps {
  candidates?: BackupMetadataWrapperDto[];
  loading: boolean;
}

function DeleteBackupsContent(props: DeleteBackupsContentProps) {
  const formatDate = useFormatLongDateTime12h();
  return (
    <DeleteBackupRoot>
      <SpotText level="paragraph">
        <Trans
          i18nKey={"backups.notEnoughSpace.body"}
          components={{
            ...CommonTransComponents,
          }}
        />
      </SpotText>

      <BackupList>
        <>
          {props.loading && <SpinnerOverlay />}
          {props.candidates?.map((candidate) => (
            <div key={candidate.backupMetadataDto.backupId}>
              {formatDate(candidate.backupMetadataDto.timestamp)}
            </div>
          ))}
        </>
      </BackupList>
    </DeleteBackupRoot>
  );
}
