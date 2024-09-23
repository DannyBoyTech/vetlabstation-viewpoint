import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { Trans, useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";

import RemoveFilter from "../../../../assets/instruments/maintenance/proCyteOne/remove-filter.png";
import InstallFilterOne from "../../../../assets/instruments/maintenance/proCyteOne/install-filter-1.png";
import InstallFilterTwo from "../../../../assets/instruments/maintenance/proCyteOne/install-filter-2.png";
import { InlineText } from "../../../../components/typography/InlineText";

const ModalWrapper = styled.div`
  .spot-modal {
    max-width: 85vw;
    width: auto;
  }
`;

const Content = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
  padding: 20px;

  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
`;

const TextSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InstructionList = styled(TextSection)`
  margin-left: 10px;
`;

const ImageSection = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;
`;

const ImageWrapper = styled.div`
  flex: 1;
`;

const StyledImg = styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
  flex: 1;
`;

export interface ProCyteOneReplaceFilterModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ProCyteOneReplaceFilterModal(
  props: ProCyteOneReplaceFilterModalProps
) {
  const { t } = useTranslation();
  return (
    <ModalWrapper>
      <ConfirmModal
        {...props}
        open
        dismissable={false}
        bodyContent={
          <Content>
            <Section>
              <TextSection data-testid="remove-filter-steps">
                <SpotText level="paragraph" bold>
                  <Trans
                    i18nKey={
                      "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.remove.header"
                    }
                  />
                </SpotText>
                <InstructionList>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.remove.stepOne"
                      }
                    />
                  </SpotText>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.remove.stepTwo"
                      }
                    />
                  </SpotText>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.remove.stepThree"
                      }
                    />
                  </SpotText>
                </InstructionList>
              </TextSection>
              <ImageSection data-testid="pco-remove-filter-image">
                <ImageWrapper>
                  <StyledImg src={RemoveFilter} />
                </ImageWrapper>
                <ImageWrapper data-testid="pco-replace-filter-image-1">
                  <StyledImg src={InstallFilterOne} />
                </ImageWrapper>
              </ImageSection>
            </Section>

            <Section>
              <TextSection data-testid="install-filter-steps">
                <SpotText level="paragraph" bold>
                  <Trans
                    i18nKey={
                      "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.install.header"
                    }
                  />
                </SpotText>
                <InstructionList>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.install.stepOne"
                      }
                    />
                  </SpotText>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.install.stepTwo"
                      }
                    />
                  </SpotText>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.install.stepThree"
                      }
                    />
                  </SpotText>
                  <SpotText level="paragraph">
                    <Trans
                      i18nKey={
                        "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.install.stepFour"
                      }
                      components={{
                        strong: <InlineText level="paragraph" bold />,
                      }}
                    />
                  </SpotText>
                </InstructionList>
              </TextSection>
              <ImageSection>
                <ImageWrapper data-testid="pco-replace-filter-image-2">
                  <StyledImg src={InstallFilterTwo} />
                </ImageWrapper>
                <ImageWrapper />
              </ImageSection>
            </Section>
          </Content>
        }
        cancelButtonContent={t("general.buttons.cancel")}
        confirmButtonContent={t("general.buttons.done")}
        headerContent={
          <>
            {t(
              "instrumentScreens.proCyteOne.maintenance.replaceFilterModal.title"
            )}
          </>
        }
      />
    </ModalWrapper>
  );
}
