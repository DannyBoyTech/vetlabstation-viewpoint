import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import replaceQcImage from "../../../assets/Acadia_qc_wiz1_img1.png";
import { Theme } from "../../../utils/StyleConstants";

interface ReplaceQcModalProps {
  "data-testid"?: string;

  onClose: () => void;
  onConfirm: () => void;
}

const StyledConfirmModal = styled(ConfirmModal)`
  max-width: 90vw;
  width: auto;
`;
StyledConfirmModal.displayName = "StyledConfirmModal";

const Content = styled.div`
  background-color: ${(t: { theme: Theme }) =>
    t.theme.colors?.background?.secondary};

  overflow: hidden;

  padding: 20px;

  ol {
    list-style: none;
    list-style-position: inside;
    margin: 0;
    padding: 0;
  }

  img {
    vertical-align: top;
    margin-top: 20px;
    margin-bottom: 0;
  }
`;
Content.displayName = "Content";

const ReplaceQcModal = (props: ReplaceQcModalProps) => {
  const { t } = useTranslation();

  return (
    <StyledConfirmModal
      data-testid={props["data-testid"]}
      open={true}
      headerContent={t("instrumentScreens.proCyteOne.replaceQcModal.title")}
      bodyContent={
        <Content>
          <ol>
            <li>{t("instrumentScreens.proCyteOne.replaceQcModal.stepOne")}</li>
            <li>{t("instrumentScreens.proCyteOne.replaceQcModal.stepTwo")}</li>
            <li>
              {t("instrumentScreens.proCyteOne.replaceQcModal.stepThree")}
            </li>
          </ol>
          <img src={replaceQcImage} />
        </Content>
      }
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.done")}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
    />
  );
};

export type { ReplaceQcModalProps };
export { ReplaceQcModal };
