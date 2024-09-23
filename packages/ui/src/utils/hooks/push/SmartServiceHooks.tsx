import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener } from "../../../context/EventSourceContext";
import {
  EventIds,
  SettingTypeEnum,
  SettingUpdatedDto,
  SmartServiceAgentNotificationDto,
  SmartServiceStatus,
  SmartServiceStatusEvent,
} from "@viewpoint/api";
import { Button, SpotText, useToast } from "@viewpoint/spot-react/src";
import { TFunction, Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  useActivateSmartServiceMutation,
  useEnableSmartServiceMutation,
  useGetSmartServiceStatusQuery,
  useRescheduleOfflineNotificationMutation,
  useResetOfflineNotificationStatusMutation,
} from "../../../api/SmartServiceApi";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { ActivateSmartServiceContent } from "../../../screens/boot/ActivateSmartServiceModal";
import { useGetSmartServiceEulaQuery } from "../../../api/ServerResourceApi";
import { CommonTransComponents } from "../../i18n-utils";
import { useGetBootItemsQuery } from "../../../api/BootItemsApi";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../toast/toast-defaults";
import SmartServiceLogo from "../../../assets/smartservice/smartservice-not-activated.png";
import { useRequestSystemRestartMutation } from "../../../api/SystemInfoApi";
import { BasicModal } from "../../../components/basic-modal/BasicModal";
import { useGlobalModals } from "../../../components/global-modals/GlobalModals";
import {
  LocalStorageKey,
  useLocalStorageData,
} from "../../../context/LocalStorageContext";

export const TestId = {
  SmartServiceOfflineModal: "smart-service-offline-modal",
};

// Track whether we should display a SmartService connection toast on
// a successful connection -- we only want to display it for the first
// successful connection event after a user has enabled/activated SmartService.
// Since enabling/activating can also happen in first boot, which can end in a
// reboot before the first connection event, persist it in localstorage as well
function useSmartServiceActivationTracker() {
  const { data, update } = useLocalStorageData(
    LocalStorageKey.SSConnectNotificationPending
  );

  return {
    showConnectionNotification: !!data,
    updateShowConnectionNotification: update,
  };
}

export function useSmartServiceActivationHook() {
  const { showConnectionNotification, updateShowConnectionNotification } =
    useSmartServiceActivationTracker();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const { data: status } = useGetSmartServiceStatusQuery();

  const statusCallback = useCallback(() => {
    if (showConnectionNotification && status === SmartServiceStatus.CONNECTED) {
      updateShowConnectionNotification(false);

      addToast({
        ...DefaultSuccessToastOptions,
        content: (
          <ToastContentRoot>
            <ToastTextContentRoot>
              <ToastText level="paragraph" $maxLines={1} bold>
                {t("settings.smartService.labels.smartService")}
              </ToastText>
              <ToastText level="paragraph" $maxLines={2}>
                {t("settings.smartService.activate.success")}
              </ToastText>
            </ToastTextContentRoot>
          </ToastContentRoot>
        ),
      });
    }
  }, [
    addToast,
    showConnectionNotification,
    status,
    t,
    updateShowConnectionNotification,
  ]);

  useEffect(statusCallback, [statusCallback]);

  // Listen to SmartService setting changes -- if the user enables or activates SmartService,
  // we need to track that so we can display a toast message the next time it connects successfully
  const settingCallback = useCallback(
    (msg: MessageEvent) => {
      const settingData: SettingUpdatedDto = JSON.parse(msg.data);
      if (
        (settingData.settingType ===
          SettingTypeEnum.ESUPPORT_ESUPPORT_ACTIVATED ||
          settingData.settingType ===
            SettingTypeEnum.ESUPPORT_ENABLE_ESUPPORT) &&
        settingData.newValue
      ) {
        updateShowConnectionNotification(true);
      }
    },
    [updateShowConnectionNotification]
  );

  useEventListener(EventIds.IvlsSettingUpdated, settingCallback);
}

export function usePostRestoreEulaModal() {
  const [modalShown, setModalShown] = useState(false);
  const { data: bootItems } = useGetBootItemsQuery();
  const { data: ssStatus } = useGetSmartServiceStatusQuery();
  const { data: ssEula } = useGetSmartServiceEulaQuery();
  const [activateSmartService, activateSmartServiceStatus] =
    useActivateSmartServiceMutation();
  const [enableSmartService, enableSmartServiceStatus] =
    useEnableSmartServiceMutation();
  const { t } = useTranslation();

  const { addConfirmModal } = useConfirmModal();

  const showEulaModal = useCallback(() => {
    addConfirmModal({
      id: "ssEulaAcceptModal",
      headerContent: t("boot.smartService.header"),
      bodyContent: <ActivateSmartServiceContent />,
      confirmButtonContent: t("eula.common.buttons.agree"),
      cancelButtonContent: t("general.buttons.cancel"),
      onConfirm: async () => {
        if (ssEula != null) {
          await activateSmartService(ssEula);
          await enableSmartService();
        }
      },
      onClose: () => {},
    });
  }, [activateSmartService, addConfirmModal, enableSmartService, ssEula, t]);

  const showNotificationModal = useCallback(() => {
    addConfirmModal({
      id: "ssEulaNotificationModal",
      dismissable: false,
      headerContent: t("boot.ssEula.title"),
      bodyContent: (
        <SpotText level="paragraph">
          <Trans
            i18nKey="boot.ssEula.body"
            components={CommonTransComponents}
          />
        </SpotText>
      ),
      confirmButtonContent: t("general.buttons.ok"),
      onConfirm: () => {
        showEulaModal();
      },
      onClose: () => {},
    });
  }, [addConfirmModal, showEulaModal, t]);

  useEffect(() => {
    if (
      !modalShown &&
      ssEula != null &&
      bootItems?.restoreDto.restorePerformed &&
      ssStatus === SmartServiceStatus.NOT_ACTIVATED
    ) {
      setModalShown(true);
      showNotificationModal();
    }
  }, [
    bootItems?.restoreDto.restorePerformed,
    modalShown,
    showNotificationModal,
    ssEula,
    ssStatus,
  ]);
}

const RightAlignedButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

const StyledBasicModal = styled(BasicModal)`
  max-width: 70vw;
`;

export function useSmartServiceOfflineNotifier() {
  // Reuse the same ID so that updated messages just update the existing modal if it's being displayed
  const modalId = useRef(Date.now().toString());
  const { addModal, removeModal } = useGlobalModals();
  const { addConfirmModal, removeConfirmModal } = useConfirmModal();
  const { t } = useTranslation();

  const [restart] = useRequestSystemRestartMutation();
  const [reschedule] = useRescheduleOfflineNotificationMutation();

  const confirmRestart = useCallback(() => {
    const id = addConfirmModal({
      headerContent: t("instrumentScreens.system.restartModal.title"),
      bodyContent: t("instrumentScreens.system.restartModal.message"),
      confirmButtonContent: t("general.buttons.restart"),
      cancelButtonContent: t("general.buttons.cancel"),
      onConfirm: () => {
        removeConfirmModal(id);
        restart();
      },
      onClose: () => {},
    });
  }, [addConfirmModal, removeConfirmModal, restart, t]);

  const callback = useCallback(
    (msg: MessageEvent) => {
      const notification: SmartServiceAgentNotificationDto = JSON.parse(
        msg.data
      );
      if (
        notification != null &&
        notification.smartServiceStatus === SmartServiceStatus.OFFLINE
      ) {
        addModal({
          id: modalId.current,
          content: (
            <StyledBasicModal
              data-testid={TestId.SmartServiceOfflineModal}
              open={true}
              headerContent={
                <>
                  <SpotText level="h4" className="spot-modal__secondary-title">
                    {t("smartService.offlineNotificationModal.secondaryHeader")}
                  </SpotText>
                  <SpotText level="h3" className="spot-modal__title">
                    {t("smartService.offlineNotificationModal.header")}
                  </SpotText>
                </>
              }
              bodyContent={
                <OfflineNotificationBody
                  daysOffline={notification.daysOffline}
                  minutesOffline={notification.minutesOffline}
                  hoursOffline={notification.hoursOffline}
                  onReconnect={() => removeModal(modalId.current)}
                />
              }
              footerContent={
                <>
                  <RightAlignedButton
                    buttonType="secondary"
                    onClick={() => {
                      reschedule();
                      removeModal(modalId.current);
                    }}
                  >
                    {t("general.buttons.remindMeLater")}
                  </RightAlignedButton>
                  <Button
                    buttonType="primary"
                    onClick={() => {
                      confirmRestart();
                      removeModal(modalId.current);
                    }}
                  >
                    {t("general.buttons.restart")}
                  </Button>
                </>
              }
              onClose={() => {
                removeModal(modalId.current);
              }}
            />
          ),
        });
      }
    },
    [addModal, removeModal, confirmRestart, reschedule, t]
  );

  useEventListener(EventIds.SmartServiceAgentNotification, callback);
}

const NotificationRoot = styled.div`
  display: flex;
  gap: 24px;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 3;
  gap: 20px;
`;
const ImageContent = styled.div`
  flex: 0;
  justify-content: center;
  align-items: center;
  display: flex;
`;

interface OfflineNotificationBodyProps {
  daysOffline: number;
  minutesOffline: number;
  hoursOffline: number;
  onReconnect: () => void;
}

function OfflineNotificationBody(props: OfflineNotificationBodyProps) {
  const { daysOffline, minutesOffline, hoursOffline, onReconnect } = props;
  const { t } = useTranslation();
  const statusListener = useCallback(
    (msg: MessageEvent) => {
      const data: SmartServiceStatusEvent = JSON.parse(msg.data);
      // Close the modal if we reconnect to SmartService
      if (data?.smartServiceStatus === SmartServiceStatus.CONNECTED) {
        onReconnect();
      }
    },
    [onReconnect]
  );
  useEventListener(EventIds.SmartServiceStatus, statusListener);

  const timeDuration = formatTimeDuration(
    t,
    daysOffline,
    minutesOffline,
    hoursOffline
  );

  return (
    <NotificationRoot>
      <TextContent>
        <div>
          {t("smartService.offlineNotificationModal.offlineDurationMessage", {
            timeDuration,
          })}
        </div>
        <div>
          <Trans
            i18nKey="smartService.reconnectionInstructions"
            components={CommonTransComponents}
          />
        </div>
      </TextContent>
      <ImageContent>
        <img src={SmartServiceLogo} alt="SmartService" />
      </ImageContent>
    </NotificationRoot>
  );
}

function formatTimeDuration(
  t: TFunction,
  daysOffline: number,
  minutesOffline: number,
  hoursOffline: number
) {
  const durations = [];

  if (daysOffline > 0) {
    durations.push(
      t("general.duration.day", {
        count: daysOffline,
      })
    );
  }
  if (minutesOffline > 0) {
    durations.push(
      t("general.duration.minute", {
        count: minutesOffline,
      })
    );
  }
  if (hoursOffline > 0) {
    durations.push(
      t("general.duration.hour", {
        count: hoursOffline,
      })
    );
  }

  return durations.join(", ");
}

// Reset the offline timer when the client starts up so that it is shown
// on every client startup.
export function useResetRescheduledOfflineNotification() {
  const [reset] = useResetOfflineNotificationStatusMutation();

  useEffect(() => {
    reset();
  }, [reset]);
}
