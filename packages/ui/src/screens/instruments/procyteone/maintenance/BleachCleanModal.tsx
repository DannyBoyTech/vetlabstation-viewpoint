import { SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { InlineText } from "../../../../components/typography/InlineText";
import acadiaPressStart from "../../../../assets/Acadia_press_start.png";
import { useCancelBleachCleanMutation } from "../../../../api/ProCyteOneMaintenanceApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useEventListener } from "../../../../context/EventSourceContext";
import { EventIds, InstrumentProgressEvent } from "@viewpoint/api";
import { useGlobalModals } from "../../../../components/global-modals/GlobalModals";

const StyledConfirmModal = styled(ConfirmModal)`
  max-width: 70vw;
`;

const Content = styled.div`
  display: flex;
`;

const Copy = styled.div`
  flex: auto;

  display: flex;
  flex-direction: column;

  gap: 16px;
`;

const Image = styled.div`
  flex: none;

  display: flex;
  align-items: center;
`;

interface BleachCleanModalProps {
  instrumentId: number;
  modalId: string;
}

/* This modal has only a single 'Cancel' button (used as the confirmation button). When the user initiates the workflow
 * as expected (instead of cancelling), the modal closes when the first progress message from ProCyte One is received.*/
const BleachCleanModal = (props: BleachCleanModalProps) => {
  const { t } = useTranslation();
  const [cancelBleachClean] = useCancelBleachCleanMutation();
  const nav = useNavigate();
  const location = useLocation();
  const { removeModal } = useGlobalModals();

  const handleBleachCleanCancel = () => {
    cancelBleachClean(props.instrumentId);
    removeModal(props.modalId);
  };

  useEventListener(EventIds.InstrumentProgress, (msg) => {
    const progress: InstrumentProgressEvent = JSON.parse(msg.data);

    if (progress.instrumentId === props.instrumentId) {
      removeModal(props.modalId);

      /*If the user initiated bleach clean via the maintenance screen, return home. Otherwise, take no explicit nav
       * action because the workflow was started from an alert. In the alert case, the user should remain where they
       * were when the alert modal was opened.*/
      if (
        location.pathname.endsWith(
          `/instruments/${props.instrumentId}/maintenance`
        )
      ) {
        nav("/");
      }
    }
  });

  return (
    <StyledConfirmModal
      {...props}
      onClose={() => {}} // closed when first instrument progress is reported, see progress event listener
      onConfirm={handleBleachCleanCancel} // confirm button is 'Cancel' for this modal
      open={true}
      dismissable={false}
      headerContent={t(
        "instrumentScreens.proCyteOne.maintenance.bleachCleanModal.title"
      )}
      bodyContent={
        <Content>
          <Copy>
            <SpotText level="paragraph" bold>
              {t(
                "instrumentScreens.proCyteOne.maintenance.bleachCleanModal.durationMessage"
              )}
            </SpotText>
            <SpotText level="paragraph">
              {t(
                "instrumentScreens.proCyteOne.maintenance.bleachCleanModal.toBegin"
              )}
            </SpotText>

            <SpotText level="paragraph">
              <ol className="steps">
                <Trans
                  i18nKey="instrumentScreens.proCyteOne.maintenance.bleachCleanModal.instructions"
                  components={{
                    strong: <InlineText level="paragraph" bold />,
                    step: <li className="step" />,
                  }}
                />
              </ol>
            </SpotText>
          </Copy>
          <Image>
            <img src={acadiaPressStart} />
          </Image>
        </Content>
      }
      cancelButtonContent={undefined}
      confirmButtonContent={t("general.buttons.cancel")}
    />
  );
};

export type { BleachCleanModalProps };
export { BleachCleanModal };
