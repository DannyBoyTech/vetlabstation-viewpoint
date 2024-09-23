import styled from "styled-components";
import { useTranslation } from "react-i18next";
import TermsOfServiceUSA from "../../../assets/smartservice/terms-usacanada.png";
import TermsOfServiceOtherLocations from "../../../assets/smartservice/terms-otherlocations.png";
import React from "react";
import { SpotText } from "@viewpoint/spot-react";

export const Image = styled.img`
  max-width: 45%;
  object-fit: contain;
`;
const Title = styled(SpotText)`
  margin-bottom: 50px;
`;
const Body = styled.div`
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    max-width: 100%;
    padding: 0 20px;
  }
`;
const Banner = styled.div`
  display: flex;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  align-items: center;
  max-width: 50%;
  text-align: center;
  padding: 0 20px;

  :first-child {
    border-right: solid 2px #adaa9c;
  }
`;

export const TestIds = {
  tosModal: "tos-modal",
};

export function SmartServiceTOS() {
  const { t } = useTranslation();
  return (
    <Body data-testid={TestIds.tosModal}>
      <Title level="h5">
        {t("settings.smartService.termsModal.instructions")}
      </Title>

      <Banner>
        <Column>
          <Image src={TermsOfServiceUSA} />
          <SpotText level="paragraph">
            {t("settings.smartService.termsModal.uslabel")}
          </SpotText>
          <SpotText level="secondary">
            {t("settings.smartService.termsModal.smartServiceTerms")}
          </SpotText>
        </Column>

        <Column>
          <Image src={TermsOfServiceOtherLocations} />
          <SpotText level="paragraph">
            {t("settings.smartService.termsModal.otherLocations")}
          </SpotText>
        </Column>
      </Banner>
    </Body>
  );
}
