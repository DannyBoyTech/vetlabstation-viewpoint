import { SpotText, List } from "@viewpoint/spot-react";
import { RestoreFileDto } from "@viewpoint/api";
import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { Trans, useTranslation } from "react-i18next";
import { useGetRestoreFilesQuery } from "../../../../api/RestoreApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { ModalStepProps } from "./UsbRestore";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { useFormatDateTime12h } from "../../../../utils/hooks/datetime";

const Section = styled.div<{ gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.gap ?? 15}px;
  overflow-y: hidden;
  height: 300px;
`;

const RestoreListRoot = styled.div`
  height: 100%;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;

  .spot-list-group__item-label.spot-list-group__item-label.spot-list-group__item-label {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.primary};
  }

  .spot-list-group__item {
    padding: 10px 0;
  }

  .spot-list-group__item--active {
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.interactive?.hoverPrimary};
    outline: ${(p: { theme: Theme }) => p.theme.borders?.controlFocus};
  }

  .spot-list-group__item--active:after {
    content: none;
  }
`;

interface BackupFileSelectionModalProps extends ModalStepProps {
  usbId: string | undefined;
  onRestoreFilenameSelected: any;
  selectedRestoreFileDto: RestoreFileDto | undefined;
}

export function BackupFileSelectionModal({
  onCancel,
  onNext,
  selectedRestoreFileDto,
  usbId,
  onRestoreFilenameSelected,
}: BackupFileSelectionModalProps) {
  const { t } = useTranslation();
  const { data: availableRestores, isLoading } = useGetRestoreFilesQuery(
    usbId ?? skipToken,
    {
      selectFromResult: (res) => ({
        ...res,
        data: [...(res.data ?? [])].sort(
          (resOne, resTwo) => resTwo.fileDate - resOne.fileDate
        ),
      }),
    }
  );
  const formatDate = useFormatDateTime12h();

  if (isLoading || availableRestores == null) {
    return null;
  }
  return availableRestores.length > 0 ? (
    <ConfirmModal
      open={true}
      dismissable={false}
      onClose={onCancel}
      headerContent={t("restore.selectDriveData.title")}
      bodyContent={
        <>
          <SpotText level="paragraph">
            <Trans i18nKey="restore.selectDriveData.body" />
          </SpotText>

          <Section>
            <RestoreListRoot>
              <List>
                {availableRestores?.map((restoreFile) => (
                  <List.Item
                    key={restoreFile.fileName}
                    active={selectedRestoreFileDto === restoreFile}
                    onClick={() => {
                      const selectedBackupFilename =
                        selectedRestoreFileDto === restoreFile
                          ? undefined
                          : restoreFile;
                      onRestoreFilenameSelected(selectedBackupFilename);
                    }}
                  >
                    {formatDate(restoreFile.fileDate)}
                  </List.Item>
                ))}
              </List>
            </RestoreListRoot>
          </Section>
        </>
      }
      confirmable={!!selectedRestoreFileDto}
      onConfirm={onNext}
      confirmButtonContent={t("general.buttons.next")}
      cancelButtonContent={t("general.buttons.cancel")}
    />
  ) : (
    <ConfirmModal
      open={true}
      dismissable={false}
      onClose={onCancel}
      onConfirm={onCancel}
      confirmButtonContent="OK"
      headerContent={t("restore.selectDriveData.titleNoBackup")}
      bodyContent={
        <SpotText level="paragraph">
          <Trans i18nKey="restore.selectDriveData.bodyNoBackup" />
        </SpotText>
      }
    />
  );
}
