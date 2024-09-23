import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { EventIds, UsbCopyProgressDto } from "@viewpoint/api";
import { useEventListener } from "../../context/EventSourceContext";
import { BasicModal } from "../basic-modal/BasicModal";
import { Modal, ProgressBar, SpotText, Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { CommonTransComponents } from "../../utils/i18n-utils";

export const TestId = {
  Modal: "usb-copy-progress-dialog",
  ErrorModal: "usb-copy-error-modal",
};

interface UsbCopyProgressDialogProps {
  open: boolean;
  onCancel: () => void;
  copyId?: string;
  isFirstBoot?: boolean;
  onComplete?: () => void;

  headerContent?: ReactNode;
  bodyContent?: ReactNode;
  footerContent?: ReactNode;
}

const StyledProgressBar = styled(ProgressBar)`
  margin-top: 30px;
`;

const StyledButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

export function UsbCopyProgressDialog({
  onComplete,
  onCancel,
  ...props
}: UsbCopyProgressDialogProps) {
  const [percentComplete, setPercentComplete] = useState<number>(0);
  const { t } = useTranslation();

  const eventCallback = useCallback(
    (msg: MessageEvent<any>) => {
      setPercentComplete((oldPercent) => {
        const data: UsbCopyProgressDto = JSON.parse(msg.data);
        if (oldPercent >= 0 && data.copyId === props.copyId) {
          if (data.percentComplete >= 100) {
            setTimeout(() => onComplete?.(), 10);
          }
          return data.percentComplete;
        } else {
          // If we at one point received a negative value, that indicates an error
          // occurred during copying -- don't overwrite it.
          return oldPercent;
        }
      });
    },
    [props.copyId, onComplete]
  );
  useEventListener(EventIds.UsbCopyProgress, eventCallback);

  if (percentComplete < 0) {
    return (
      <BasicModal
        data-testid={TestId.ErrorModal}
        open={props.open}
        dismissable={false}
        onClose={onCancel}
        headerContent={
          <SpotText level="h3">{t("usb.copyError.title")}</SpotText>
        }
        bodyContent={
          <SpotText level="paragraph">
            <Trans
              i18nKey="usb.copyError.body"
              components={CommonTransComponents}
            />
          </SpotText>
        }
        footerContent={
          <StyledButton onClick={onCancel}>
            {t("general.buttons.ok")}
          </StyledButton>
        }
      />
    );
  } else {
    return (
      <BasicModal
        open={props.open}
        dismissable={false}
        onClose={onCancel}
        headerContent={
          <SpotText level="h3">
            {props.headerContent ??
              t("instrumentScreens.common.usb.copyProgress.title")}
          </SpotText>
        }
        bodyContent={
          <div data-testid={TestId.Modal}>
            {props.bodyContent}
            <StyledProgressBar progress={percentComplete / 100} success />
          </div>
        }
        footerContent={
          props.footerContent ?? (
            <>
              <Modal.FooterCancelButton onClick={onCancel}>
                {t("general.buttons.cancel")}
              </Modal.FooterCancelButton>
              {props.isFirstBoot && (
                <Button
                  buttonType="primary"
                  onClick={onCancel}
                  disabled={percentComplete !== 100}
                >
                  {t("general.buttons.finish")}
                </Button>
              )}
            </>
          )
        }
      />
    );
  }
}
