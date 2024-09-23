import { FluidPackStatusResponseDto } from "@viewpoint/api";
import { SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { Theme } from "../../../../utils/StyleConstants";
import { ResponsiveModalWrapper } from "../../../../components/modal/ResponsiveModalWrapper";
import ReplaceReagent from "../../../../assets/instruments/maintenance/proCyteOne/replace-reagent.png";
import ReplaceSheath from "../../../../assets/instruments/maintenance/proCyteOne/replace-sheath.png";

const ModalWrapper = styled(ResponsiveModalWrapper)`
  .spot-modal {
    max-width: 95vw;
    width: auto;
  }
`;

const Content = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;

  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TextContainer = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 60px;
`;

const TextSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InstructionList = styled(TextSection)`
  margin-left: 10px;
`;

const ImageSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const StyledImg = styled.img`
  object-fit: contain;
  width: 192px;
`;

const Images = {
  Sheath: ReplaceSheath,
  Reagent: ReplaceReagent,
};

const i18nKeys: Record<string, "replaceSheathModal" | "replaceReagentModal"> = {
  Sheath: "replaceSheathModal",
  Reagent: "replaceReagentModal",
};

export const TestId = {
  Modal: (type: FluidPackStatusResponseDto["packType"]) =>
    `pco-replace-${type}-modal`,
};

export interface ProCyteOneReplaceFluidModalProps {
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  type: FluidPackStatusResponseDto["packType"];
}

export function ProCyteOneReplaceFluidModal(
  props: ProCyteOneReplaceFluidModalProps
) {
  const { t } = useTranslation();

  return (
    <ModalWrapper>
      <ConfirmModal
        {...props}
        data-testid={TestId.Modal(props.type)}
        open={props.open}
        dismissable={false}
        bodyContent={
          <Content>
            <TextContainer>
              <TextSection>
                <SpotText level="paragraph" bold>
                  <Trans
                    i18nKey={`instrumentScreens.proCyteOne.maintenance.${
                      i18nKeys[props.type]
                    }.remove.header`}
                  />
                </SpotText>
                <InstructionList>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={`instrumentScreens.proCyteOne.maintenance.${
                        i18nKeys[props.type]
                      }.remove.stepOne`}
                    />
                  </SpotText>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={`instrumentScreens.proCyteOne.maintenance.${
                        i18nKeys[props.type]
                      }.remove.stepTwo`}
                    />
                  </SpotText>
                </InstructionList>
              </TextSection>
              <TextSection>
                <SpotText level="paragraph" bold>
                  <Trans
                    i18nKey={`instrumentScreens.proCyteOne.maintenance.${
                      i18nKeys[props.type]
                    }.install.header`}
                  />
                </SpotText>
                <InstructionList>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={`instrumentScreens.proCyteOne.maintenance.${
                        i18nKeys[props.type]
                      }.install.stepOne`}
                    />
                  </SpotText>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={`instrumentScreens.proCyteOne.maintenance.${
                        i18nKeys[props.type]
                      }.install.stepTwo`}
                    />
                  </SpotText>
                </InstructionList>
              </TextSection>
            </TextContainer>

            <Section>
              <ImageSection>
                <StyledImg src={Images[props.type]} />
              </ImageSection>
            </Section>
          </Content>
        }
        cancelButtonContent={t("general.buttons.cancel")}
        confirmButtonContent={t("general.buttons.done")}
        headerContent={
          <>
            {t(
              `instrumentScreens.proCyteOne.maintenance.${
                i18nKeys[props.type]
              }.title`
            )}
          </>
        }
      />
    </ModalWrapper>
  );
}
