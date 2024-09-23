import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import { AnalyzerOverview } from "../AnalyzerOverview";
import { InstrumentStatus, InstrumentStatusDto } from "@viewpoint/api";
import { Trans, useTranslation } from "react-i18next";
import {
  InstrumentInfo,
  TestId as InstrumentInfoTestId,
} from "../InstrumentInfo";
import { InlineText } from "../../../components/typography/InlineText";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useNavigate } from "react-router-dom";
import { CancelProcessButton } from "../common/CancelProcessButton";

const TestId = {
  SettingsButton: "settings-button",
  InfoProperty: InstrumentInfoTestId.InfoProperty,
} as const;

const transComponents = {
  strong: <InlineText level="paragraph" bold />,
} as const;

interface UAAnalyzerInstrumentScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

function UAAnalyzerInstrumentScreen(props: UAAnalyzerInstrumentScreenProps) {
  const { t } = useTranslation();
  const nav = useNavigate();

  const handleSettings = () => {
    nav("settings");
  };

  const settingsEnabled =
    props.instrumentStatus.instrumentStatus !== InstrumentStatus.Busy;

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent data-testid="ua-analyzer-instrument-main">
        <AnalyzerOverview
          instrument={props.instrumentStatus}
          offlineBodyContent={
            <SpotText level="secondary">
              <Trans
                i18nKey={"instrumentScreens.uaAnalyzer.offline.description"}
                components={transComponents}
              />
            </SpotText>
          }
        />
      </InstrumentPageContent>

      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            onClick={handleSettings}
            disabled={!settingsEnabled}
            data-testid={TestId.SettingsButton}
          >
            {t("instrumentScreens.general.buttons.settings")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrumentStatus}
          />
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.serialNumber")]:
              props.instrumentStatus.instrument.instrumentSerialNumber,
          }}
        />
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}

//exported for test only
export { TestId };

export type { UAAnalyzerInstrumentScreenProps };
export { UAAnalyzerInstrumentScreen };
