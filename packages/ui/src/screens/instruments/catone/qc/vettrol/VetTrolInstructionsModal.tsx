import { Trans, useTranslation } from "react-i18next";
import {
  ConfirmModal,
  ConfirmModalProps,
} from "../../../../../components/confirm-modal/ConfirmModal";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import styled from "styled-components";
import VialsImage from "../../.././../../assets/instruments/qc/catOne/catOne_vetTrol_vials.png";

const Root = styled.div`
  display: flex;
  gap: 34px;
  justify-content: space-around;
`;

const ImageSection = styled.div`
  flex: initial;
  > img {
    width: 145px;
  }
`;

const InstructionsSection = styled.div`
  flex: 1;

  > ol > li {
    padding-bottom: 12px;
    margin: 0;
  }
`;

const StyledConfirmModal = styled(ConfirmModal)`
  .spot-modal__content {
    max-height: unset;
  }
`;

function BodyContent() {
  return (
    <Root>
      <ImageSection>
        <img src={VialsImage} />
      </ImageSection>
      <InstructionsSection>
        <Trans
          i18nKey="instrumentScreens.catOne.vetTrolInstructionsModal.instructions"
          components={CommonTransComponents}
        />
      </InstructionsSection>
    </Root>
  );
}

interface VetTrolInstructionsModalProps
  extends Omit<
    ConfirmModalProps,
    "bodyContent" | "confirmButtonContent" | "headerContent"
  > {}

export function VetTrolInstructionsModal(props: VetTrolInstructionsModalProps) {
  const { t } = useTranslation();

  return (
    <StyledConfirmModal
      {...props}
      dismissable={true}
      headerContent={t(
        "instrumentScreens.catOne.vetTrolInstructionsModal.title"
      )}
      secondaryHeaderContent={props.secondaryHeaderContent}
      bodyContent={<BodyContent />}
      confirmButtonContent={t("general.buttons.done")}
    />
  );
}
