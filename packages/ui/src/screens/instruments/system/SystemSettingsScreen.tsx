import {
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { Button, SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { EulaDetailModal, LicenseItem } from "./EulaModal/EulaModal";
import { useHeaderTitle } from "../../../utils/hooks/hooks";

type SettingSectionProps = {
  long?: boolean;
};

const PageContent = styled.div`
  flex: 1;
  padding: 30px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
`;

const SettingSection = styled.div<SettingSectionProps>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
  height: ${({ long }) => (long ? "360px" : "260px")};
`;

const Content = styled.div`
  background-color: ${(t: { theme: Theme }) =>
    t.theme.colors?.background?.secondary};
  overflow-y: scroll;
  padding: 20px;
`;

Content.displayName = "Content";

const StyledList = styled.ul`
  columns: 3;
  column-gap: 20px;
  list-style: none;
  padding: 0;
  margin-top: 0;

  li {
    break-inside: avoid;
    padding: 0.2em 0;

    span {
      line-height: 1.1em;
      text-align: left;
    }
  }
`;

export const TestId = {
  BackButton: "system-settings-back-button",
  SystemInfoScreen: "system-info-screen",
};

export function SystemSettingsScreen() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("instrumentScreens.system.systemInformation.title"),
  });
  const nav = useNavigate();
  const [isModalEulaDetailOpen, setIsModalEulaDetailOpen] = useState(false);
  const [currentEula, setCurrentEula] = useState<LicenseItem>(LicenseItem.AMQP);

  const handleEulaDetail = (lib: LicenseItem) => {
    setCurrentEula(lib);
    setIsModalEulaDetailOpen(true);
  };

  const sortedLicenseItems = Object.values(LicenseItem).sort();

  return (
    <InstrumentPageRoot>
      <PageContent data-testid={TestId.SystemInfoScreen}>
        <SettingSection>
          <SpotText level="h3">
            {t("instrumentScreens.system.systemInformation.title")}
          </SpotText>
          <Content>
            <SpotText level="paragraph">
              <Trans
                i18nKey={`instrumentScreens.system.systemInformation.openSourceBlurb`}
              ></Trans>
            </SpotText>
          </Content>
        </SettingSection>

        <br />

        <SettingSection long>
          <SpotText level="paragraph">
            {t("instrumentScreens.system.systemInformation.list")}
          </SpotText>
          <Content>
            <StyledList>
              {sortedLicenseItems.map((lib) => {
                return (
                  <li key={lib}>
                    <Button
                      buttonType="link"
                      onClick={() => handleEulaDetail(lib)}
                    >
                      {t(
                        `instrumentScreens.system.systemInformation.license.${lib}`
                      )}
                    </Button>
                  </li>
                );
              })}
            </StyledList>
          </Content>
        </SettingSection>
      </PageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.BackButton}
            buttonType="secondary"
            onClick={() => nav(-1)}
          >
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      {isModalEulaDetailOpen ? (
        <EulaDetailModal
          onClose={() => setIsModalEulaDetailOpen(false)}
          currentLicense={currentEula}
        />
      ) : null}
    </InstrumentPageRoot>
  );
}
