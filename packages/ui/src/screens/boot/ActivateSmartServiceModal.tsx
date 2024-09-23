import React from "react";
import {
  useActivateSmartServiceMutation,
  useEnableSmartServiceMutation,
} from "../../api/SmartServiceApi";
import { useTranslation } from "react-i18next";
import { BasicModal } from "../../components/basic-modal/BasicModal";
import { Modal, Button, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { SmartServiceTOS } from "../settings/SmartService/SmartServiceTOS";
import { Theme } from "../../utils/StyleConstants";
import { useGetSmartServiceEulaQuery } from "../../api/ServerResourceApi";
import {
  LocalStorageKey,
  useLocalStorageData,
} from "../../context/LocalStorageContext";

const ModalWrapper = styled.div`
  display: contents;

  .spot-modal {
    max-width: 700px;
  }
`;

interface ActivateSmartServiceModalProps {
  open: boolean;
  onNext: () => void;
}

export function ActivateSmartServiceModal(
  props: ActivateSmartServiceModalProps
) {
  const [activateSmartService, activateSmartServiceStatus] =
    useActivateSmartServiceMutation();
  const [enableSmartService, enableSmartServiceStatus] =
    useEnableSmartServiceMutation();
  const { data: ssEula, isLoading: ssEulaIsLoading } =
    useGetSmartServiceEulaQuery();
  const { t } = useTranslation();
  const { update: updateShowConnectionNotification } = useLocalStorageData(
    LocalStorageKey.SSConnectNotificationPending
  );

  const onActivate = () => {
    (async () => {
      if (ssEula != null) {
        try {
          await activateSmartService(ssEula);
          await enableSmartService();
          updateShowConnectionNotification(true);
          props.onNext();
        } catch (err) {
          console.error(err);
        }
      }
    })();
  };

  return (
    <ModalWrapper>
      <BasicModal
        dismissable={false}
        open={props.open}
        onClose={props.onNext}
        headerContent={
          <SpotText level="h3" className="spot-modal__title">
            {t("boot.smartService.header")}
          </SpotText>
        }
        bodyContent={<ActivateSmartServiceContent />}
        footerContent={
          <>
            <Modal.FooterCancelButton onClick={props.onNext}>
              {t("general.buttons.skip")}
            </Modal.FooterCancelButton>

            <Button
              onClick={onActivate}
              disabled={
                activateSmartServiceStatus.isLoading ||
                enableSmartServiceStatus.isLoading ||
                ssEulaIsLoading
              }
            >
              {t("eula.common.buttons.agree")}
            </Button>
          </>
        }
      />
    </ModalWrapper>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  gap: 20px;
`;

const TosContainer = styled.div`
  flex: 1;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
  padding: 20px;
  width: 90%;
`;

export function ActivateSmartServiceContent() {
  const { t } = useTranslation();
  return (
    <Root>
      {t("boot.smartService.whyActivate")}
      <TosContainer>
        <SmartServiceTOS />
      </TosContainer>
    </Root>
  );
}
