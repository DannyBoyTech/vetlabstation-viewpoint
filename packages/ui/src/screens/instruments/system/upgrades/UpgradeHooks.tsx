import { useCallback, useEffect, useRef, useState } from "react";
import {
  SmartServiceUpgradeAction,
  useGetUpgradeStatusQuery,
  useLazyGetUpgradeStatusQuery,
  useLazyUpgradeAvailableQuery,
  useResetUpgradeStatusMutation,
  useUpgradeBySmartServiceMutation,
} from "../../../../api/UpgradeApi";
import { Trans, useTranslation } from "react-i18next";
import { useInfoModal } from "../../../../components/global-modals/components/GlobalInfoModal";
import { useGlobalModals } from "../../../../components/global-modals/GlobalModals";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { Modal, SpotText, Button } from "@viewpoint/spot-react";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { useEventListener } from "../../../../context/EventSourceContext";
import {
  EventIds,
  InstrumentType,
  UpgradeAvailableDto,
  UpgradeStatusDto,
} from "@viewpoint/api";
import styled from "styled-components";
import { InstrumentUpgradeStatusCompletedEvent } from "@viewpoint/api/src/events";
import { useInstrumentNameForId } from "../../../../utils/hooks/hooks";
import { useShutdownClient } from "../../../../utils/hooks/Shutdown";
import {
  LocalStorageKey,
  useLocalStorageData,
} from "../../../../context/LocalStorageContext";
import { useToast } from "@viewpoint/spot-react/src";
import { DefaultSuccessToastOptions } from "../../../../utils/toast/toast-defaults";

export const TestId = {
  UpgradeAvailableModal: "ss-upgrade-available-modal",
  RemindMeLaterButton: "ss-upgrade-available-remind-later-button",
  UpgradeNowButton: "ss-upgrade-available-upgrade-now-button",
  UpgradeSuccessToastMessage: "upgrade-success-toast-message",
};

export function useUpgradeStatusNotifier() {
  const [getStatus] = useLazyGetUpgradeStatusQuery();
  const [resetStatus] = useResetUpgradeStatusMutation();
  const { addInfoModal } = useInfoModal();
  const { addToast } = useToast();

  const { data: welcomeScreenShown } = useLocalStorageData(
    LocalStorageKey.WelcomeScreenShown
  );

  const { t } = useTranslation();

  const userNotified = useRef(false);

  const notifyUpgradeStatus = useCallback(
    (upgradeStatus: UpgradeStatusDto) => {
      if (upgradeStatus?.upgradeAttempted) {
        userNotified.current = true;
        const title = upgradeStatus?.upgradeSuccess
          ? t("upgrades.success.title")
          : t("upgrades.failure.title");
        const body = upgradeStatus?.upgradeSuccess
          ? t("upgrades.success.body")
          : t("upgrades.failure.body");

        if (!welcomeScreenShown && upgradeStatus.upgradeSuccess) {
          // Use a toast if the welcome screen is going to be displayed and the upgrade was successful
          addToast({
            ...DefaultSuccessToastOptions,
            content: (
              <SpotText
                level="paragraph"
                data-testid={TestId.UpgradeSuccessToastMessage}
              >
                {body}
              </SpotText>
            ),
          });
        } else {
          addInfoModal({
            header: title,
            content: body,
          });
        }
        resetStatus();
      }
    },
    [addInfoModal, addToast, resetStatus, t, welcomeScreenShown]
  );

  useEffect(() => {
    if (!userNotified.current) {
      userNotified.current = true;
      getStatus()
        .unwrap()
        .then((res) => notifyUpgradeStatus(res))
        .catch((err) => console.error(err));
    }
  }, [notifyUpgradeStatus, getStatus]);
}

export function useUpgradeAvailableNotifier() {
  const [modalId] = useState(crypto.randomUUID());

  const [getUpgradeAvailable] = useLazyUpgradeAvailableQuery();
  const [upgradeAction] = useUpgradeBySmartServiceMutation();
  const shutdownClient = useShutdownClient();

  const { addModal, removeModal } = useGlobalModals();

  const { t } = useTranslation();

  const remindMeLater = useCallback(
    (id: string) => {
      upgradeAction(SmartServiceUpgradeAction.Later)
        .then(() => {
          removeModal(id);
        })
        .catch((err) => console.error(err));
    },
    [upgradeAction, removeModal]
  );

  const upgradeNow = useCallback(
    (id: string, shutdownRequired?: boolean) => {
      upgradeAction(SmartServiceUpgradeAction.Upgrade)
        .then(() => {
          removeModal(id);
        })
        .catch((err) => console.error(err));

      if (shutdownRequired) {
        shutdownClient({ delay: 3_000 });
      }
    },
    [upgradeAction, removeModal, shutdownClient]
  );

  const handleUpgradeAvailable = useCallback(
    (availableUpgrade: UpgradeAvailableDto) => {
      if (availableUpgrade != null && availableUpgrade.validUpgrade) {
        addModal({
          id: modalId,
          content: (
            <BasicModal
              data-testid={TestId.UpgradeAvailableModal}
              open={true}
              dismissable={false}
              onClose={() => removeModal(modalId)}
              bodyContent={
                <>
                  <Trans
                    i18nKey={"upgrades.ssUpgradeAvailable.instructions"}
                    values={{ version: availableUpgrade.version }}
                    components={CommonTransComponents}
                  />
                  {availableUpgrade.shutdownRequired && (
                    <SpotText level="paragraph" bold>
                      {t("upgrades.ssUpgradeAvailable.shutDownWarning")}
                    </SpotText>
                  )}
                </>
              }
              headerContent={
                <SpotText level="h3">
                  {t("upgrades.upgradeAvailable.title")}
                </SpotText>
              }
              footerContent={
                <>
                  <Modal.FooterCancelButton
                    data-testid={TestId.RemindMeLaterButton}
                    onClick={() => remindMeLater(modalId)}
                  >
                    {t("upgrades.ssUpgradeAvailable.buttons.remindMeLater")}
                  </Modal.FooterCancelButton>

                  <Button
                    data-testid={TestId.UpgradeNowButton}
                    onClick={() =>
                      upgradeNow(modalId, availableUpgrade.shutdownRequired)
                    }
                  >
                    {t("upgrades.ssUpgradeAvailable.buttons.upgradeNow")}
                  </Button>
                </>
              }
            />
          ),
        });
      }
    },
    [remindMeLater, upgradeNow, addModal, removeModal, t, modalId]
  );

  const eventCallback = useCallback(
    (msg: MessageEvent) => {
      handleUpgradeAvailable(JSON.parse(msg.data));
    },
    [handleUpgradeAvailable]
  );

  useEventListener(EventIds.UpgradeAvailable, eventCallback);

  // Check if it's available on mount
  useEffect(() => {
    getUpgradeAvailable()
      .unwrap()
      .then((res) => handleUpgradeAvailable(res))
      .catch((err) => console.error(err));
  }, [getUpgradeAvailable, handleUpgradeAvailable]);
}

const StyledButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

export function useUpgradeCompleteStatusNotification() {
  const [modalId] = useState(crypto.randomUUID());

  const { addModal, removeModal } = useGlobalModals();
  const getInstrumentName = useInstrumentNameForId();

  const { t } = useTranslation();

  const handleUpgradeCompleted = useCallback(
    (upgradeCompletedStatus: InstrumentUpgradeStatusCompletedEvent) => {
      if (upgradeCompletedStatus != null && upgradeCompletedStatus.success) {
        addModal({
          id: modalId,
          content: (
            <BasicModal
              open={true}
              dismissable={false}
              onClose={() => removeModal(modalId)}
              bodyContent={
                upgradeCompletedStatus.instrument.instrumentType ===
                InstrumentType.ProCyteDx ? (
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "upgrades.instrumentUpgradeComplete.procyteDxBody"
                      }
                      values={{
                        instrumentName: t(
                          `instruments.names.${upgradeCompletedStatus.instrument.instrumentType}`
                        ),
                      }}
                      components={CommonTransComponents}
                    />
                  </SpotText>
                ) : (
                  <>
                    <SpotText level="paragraph">
                      <Trans
                        i18nKey={`upgrades.instrumentUpgradeComplete.${
                          upgradeCompletedStatus.instrument.instrumentType ===
                          InstrumentType.UriSysDx
                            ? "uriSysDxBody"
                            : "body"
                        }`}
                        values={{
                          instrumentName: t(
                            `instruments.names.${upgradeCompletedStatus.instrument.instrumentType}`
                          ),
                        }}
                        components={CommonTransComponents}
                      />
                    </SpotText>
                    {upgradeCompletedStatus.hasUpgradeLetter && (
                      <>
                        <br />
                        <SpotText level="paragraph">
                          {t(
                            `upgrades.instrumentUpgradeComplete.${
                              upgradeCompletedStatus.upgradeLetterTransferSuccess
                                ? "upgradeLetterTransferSuccess"
                                : "upgradeLetterTransferFail"
                            }`
                          )}
                        </SpotText>
                      </>
                    )}
                  </>
                )
              }
              headerContent={
                <SpotText level="h3">
                  <Trans
                    i18nKey={"upgrades.instrumentUpgradeComplete.title"}
                    values={{
                      instrumentName: t(
                        `instruments.names.${upgradeCompletedStatus.instrument.instrumentType}`
                      ),
                    }}
                  />
                </SpotText>
              }
              footerContent={
                <StyledButton onClick={() => removeModal(modalId)}>
                  {t("general.buttons.ok")}
                </StyledButton>
              }
            />
          ),
        });
      }
    },
    [addModal, removeModal, modalId, t]
  );

  const eventCallback = useCallback(
    (msg: MessageEvent) => {
      handleUpgradeCompleted(JSON.parse(msg.data));
    },
    [handleUpgradeCompleted]
  );

  useEventListener(EventIds.InstrumentSoftwareUpgradeCompleted, eventCallback);
}
