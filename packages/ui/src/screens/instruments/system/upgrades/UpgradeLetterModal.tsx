import { Trans, useTranslation } from "react-i18next";
import { useGetUpgradeLetterQuery } from "../../../../api/UpgradeApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useState } from "react";
import { IFrameConfirmModal } from "../../../../components/iframe-confirm-modal/IFrameConfirmModal";
import { Failure } from "../../../../components/failure/Failure";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import { Views, pdfViewerOpts } from "../../../../utils/url-utils";

export const TestId = {
  PromptModal: "upgrade-letter-prompt",
  PreviewModal: "upgrade-letter-preview-modal",
  ReadButton: "upgrade-letter-read-button",
  UpgradeButton: "upgrade-letter-upgrade-button",
  CancelButton: "upgrade-letter-cancel-button",
};

export interface UpgradeLetterModalProps {
  usbId?: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: (upgradeLetterViewed: boolean, upgradeLetterPath?: string) => void;
}

export function UpgradeLetterModal(props: UpgradeLetterModalProps) {
  const [letterVisible, setLetterVisible] = useState(false);
  const [letterViewed, setLetterViewed] = useState(false);
  const { t } = useTranslation();

  const { data: upgradeLetterData } = useGetUpgradeLetterQuery(
    props.usbId ?? skipToken
  );

  if (letterVisible) {
    return (
      <IFrameConfirmModal
        data-testid={TestId.PreviewModal}
        dismissable={false}
        open={letterVisible}
        url={
          upgradeLetterData?.content == null
            ? undefined
            : `data:application/pdf;base64,${
                upgradeLetterData.content
              }#${pdfViewerOpts({
                toolbar: false,
                view: Views.FIT_HORIZONTAL,
              })}`
        }
        onClose={() => setLetterVisible(false)}
        onConfirm={() => {
          console.log("CONFIRMED");
          setLetterVisible(false);
        }}
        headerContent={t("upgrades.upgradeLetter.title")}
        confirmButtonContent={t("general.buttons.ok")}
        errorContent={<Failure />}
      />
    );
  }
  return (
    <BasicModal
      data-testid={TestId.PromptModal}
      dismissable={false}
      open={props.open}
      onClose={props.onCancel}
      bodyContent={
        <SpotText level="paragraph">
          <Trans
            i18nKey={"upgrades.upgradeLetter.modalBody"}
            components={CommonTransComponents}
          />
        </SpotText>
      }
      headerContent={
        <SpotText level="h3">{t("upgrades.upgradeLetter.title")}</SpotText>
      }
      footerContent={
        <>
          <Modal.FooterCancelButton
            onClick={props.onCancel}
            data-testid={TestId.CancelButton}
          >
            {t("general.buttons.cancel")}
          </Modal.FooterCancelButton>

          <Button
            data-testid={TestId.ReadButton}
            onClick={() => {
              setLetterViewed(true);
              setLetterVisible(true);
            }}
          >
            {t("upgrades.upgradeLetter.readButton")}
          </Button>

          <Button
            data-testid={TestId.UpgradeButton}
            onClick={() =>
              props.onConfirm(letterViewed, upgradeLetterData?.path)
            }
          >
            {t("upgrades.upgradeLetter.upgradeButton")}
          </Button>
        </>
      }
    />
  );
}
