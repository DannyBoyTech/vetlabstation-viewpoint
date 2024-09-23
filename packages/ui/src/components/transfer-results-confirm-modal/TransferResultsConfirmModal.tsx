import { LabRequestDto } from "@viewpoint/api";
import { SpotText } from "@viewpoint/spot-react";
import classNames from "classnames";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { ConfirmModal } from "../confirm-modal/ConfirmModal";
import { TransferResultsDetail } from "./TransferResultsDetail";

interface TransferResultsConfirmModalProps {
  className?: string;
  labRequest?: LabRequestDto;
  destPatientName?: string;
  destClientFamilyName?: string;

  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  .prompt {
    flex: 0;
  }

  .detail {
    flex: 1;
  }
`;

const InlineText = styled(SpotText)`
  display: inline;
`;

const TransferResultsConfirmModal = ({
  labRequest,
  destPatientName,
  destClientFamilyName,
  ...props
}: TransferResultsConfirmModalProps) => {
  const { t } = useTranslation();
  const classes = classNames("transfer-confirm-modal", props.className);

  const patientName = destPatientName ?? "";
  const clientFamilyName = destClientFamilyName ?? "";

  return (
    <ConfirmModal
      className={classes}
      headerContent={t("transferResultsModal.title")}
      bodyContent={
        <ModalContent className="transfer-results-modal__content">
          <div className="prompt">
            <Trans
              i18nKey="transferResultsModal.prompt"
              components={{
                strong: <InlineText level="paragraph" bold />,
              }}
              values={{ patientName, clientFamilyName }}
            />
          </div>
          <TransferResultsDetail className="content" labRequest={labRequest} />
        </ModalContent>
      }
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.reassign")}
    />
  );
};

export type { TransferResultsConfirmModalProps };

export { TransferResultsConfirmModal };
