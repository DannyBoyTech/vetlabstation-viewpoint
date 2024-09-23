import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetRemovableDrivesQuery } from "../../api/UsbApi";
import { BasicModal } from "../basic-modal/BasicModal";
import SpinnerOverlay from "../overlay/SpinnerOverlay";
import styled from "styled-components";
import { Button, Modal, SpotText, List } from "@viewpoint/spot-react";
import { RemovableDriveDto } from "@viewpoint/api";
import { Theme } from "../../utils/StyleConstants";

export const TestId = {
  Modal: "usb-selection-modal",
  NextButton: "usb-selection-modal-next",
  CancelButton: "usb-selection-modal-cancel",
  DriveListItem: (usbId: string) => `usb-selection-drive-list-item-${usbId}`,
};

interface UsbSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onDriveSelected: (usbId: string) => void;
  headerContent?: ReactNode;
  secondaryHeaderContent?: ReactNode;
  bodyContent?: ReactNode;
}

const Content = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export function UsbSelectionModal(props: UsbSelectionModalProps) {
  const [selectedUsbId, setSelectedUsbId] = useState<string>();
  const { t } = useTranslation();
  const { data: availableDrives, isLoading } = useGetRemovableDrivesQuery(
    undefined,
    { pollingInterval: 2000 }
  );

  return (
    <BasicModal
      dismissable={false}
      open={props.visible}
      onClose={props.onClose}
      headerContent={
        <>
          {props.secondaryHeaderContent}
          {props.headerContent ?? (
            <SpotText level="h3" className="spot-modal__title">
              {t("instrumentScreens.common.usb.driveSelectionModal.title")}
            </SpotText>
          )}
        </>
      }
      bodyContent={
        <Content data-testid={TestId.Modal}>
          {props.bodyContent}
          {isLoading && <SpinnerOverlay />}
          <RemovableDriveList
            drives={availableDrives ?? []}
            selectedUsbId={selectedUsbId}
            onDriveSelected={(usbId) =>
              setSelectedUsbId(selectedUsbId === usbId ? undefined : usbId)
            }
          />
        </Content>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton
            onClick={props.onClose}
            data-testid={TestId.CancelButton}
          >
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>

          <Button
            data-testid={TestId.NextButton}
            onClick={() => props.onDriveSelected(selectedUsbId!)}
            disabled={selectedUsbId == null}
          >
            {t("general.buttons.next")}
          </Button>
        </>
      }
    />
  );
}

const RemovableDriveListRoot = styled.div`
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

interface RemovableDriveListProps {
  drives: RemovableDriveDto[];
  selectedUsbId?: string;
  onDriveSelected: (usbId: string) => void;
}

function RemovableDriveList(props: RemovableDriveListProps) {
  return (
    <RemovableDriveListRoot>
      <List>
        {props.drives.map((drive) => (
          <List.Item
            key={drive.id}
            data-testid={TestId.DriveListItem(drive.id)}
            active={props.selectedUsbId === drive.id}
            onClick={() => props.onDriveSelected(drive.id)}
          >
            {drive.label}
          </List.Item>
        ))}
      </List>
    </RemovableDriveListRoot>
  );
}
