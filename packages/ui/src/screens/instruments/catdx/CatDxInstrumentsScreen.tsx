import { InstrumentStatus, InstrumentStatusDto } from "@viewpoint/api";
import {
  AnalyzerOverview,
  GenericOfflineInstructions,
} from "../AnalyzerOverview";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FeatureFlagName } from "@viewpoint/api";
import { InstrumentInfo } from "../InstrumentInfo";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import { useCallback } from "react";
import { useFeatureFlagQuery } from "../../../api/FeatureFlagApi";
import { useSendEventLogsMutation } from "../../../api/InstrumentApi";
import * as ROUTE_PATH_SEGEMENTS from "../../../constants/routes";
import { CancelProcessButton } from "../common/CancelProcessButton";

export const TestIds = {
  CatDxInstrumentScreen: "cat-dx-instruments-screen",
  CatDxInstrumentPageRightPanel: "cat-dx-instrument-page-right-panel",
  CatDxInstrumentQualityButton: "cat-dx-instrument-quality-button",
  CatDxInstrumentSmartQCButton: "cat-dx-instrument-smartqc-button",
  CatDxInstrumentIdexxUseOnlyButton: "cat-dx-instrument-idexx-use-only-button",
  CatDxInstrumentTransmitLogsButton: "cat-dx-instrument-transmit-logs-button",
};

const { INSTRUMENTS, SETTINGS, ADVANCED, QUALITY_CONTROL } =
  ROUTE_PATH_SEGEMENTS;

const StyledInlineText = styled(SpotText)`
  display: inline;
`;

export interface InstrumentContentProps {
  instrumentStatus: InstrumentStatusDto;
}

export function CatDxInstrumentScreen(props: InstrumentContentProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { instrumentStatus } = props;

  const { data: isSmartQcEnabled, isLoading: isRunningFeatureFlagQuery } =
    useFeatureFlagQuery(FeatureFlagName.CATALYSTDX_SMARTQC);

  const [sendEventLogs, { isLoading: sendEventLogsIsLoading }] =
    useSendEventLogsMutation();

  const handleTransmitLogs = useCallback(() => {
    sendEventLogs({ instrumentId: instrumentStatus.instrument.id });
  }, [instrumentStatus, sendEventLogs]);

  const handleIdexxUseOnly = () =>
    nav(
      `/${INSTRUMENTS}/${instrumentStatus.instrument.id}/${SETTINGS}/${ADVANCED}`
    );

  const handleQualityControl = () =>
    nav(`/${INSTRUMENTS}/${instrumentStatus.instrument.id}/${QUALITY_CONTROL}`);

  const handleRunSmartQc = () =>
    nav(`/${INSTRUMENTS}/${instrumentStatus.instrument.id}/smartQC`);

  const offlineBodyContent = (
    <SpotText level="secondary">
      <>
        <GenericOfflineInstructions
          instrumentType={instrumentStatus.instrument.instrumentType}
        />
        <br />
        <div>
          <b>{t("instrumentScreens.catDx.followSteps")}</b>
        </div>
        <div>
          <Trans
            i18nKey="instrumentScreens.catDx.followStepsDescription1"
            components={{ strong: <StyledInlineText level="secondary" bold /> }}
          />
        </div>
        <div>
          <Trans
            i18nKey="instrumentScreens.catDx.followStepsDescription2"
            components={{ strong: <StyledInlineText level="secondary" bold /> }}
          />
        </div>
        <ol data-testid="catd-dx-offline-follow-steps">
          <li>
            <Trans
              i18nKey="instrumentScreens.catDx.followSteps1"
              components={{
                strong: <StyledInlineText level="secondary" bold />,
              }}
            />
          </li>
          <li>{t("instrumentScreens.catDx.followSteps2")}</li>
          <li>{t("instrumentScreens.catDx.followSteps3")}</li>
          <li>
            <Trans
              i18nKey="instrumentScreens.catDx.followSteps4"
              components={{
                strong: <StyledInlineText level="secondary" bold />,
              }}
            />
          </li>
        </ol>
        {t(`instrumentScreens.catDx.problemPersists`)}
      </>
    </SpotText>
  );

  return (
    <InstrumentPageRoot data-testid={TestIds.CatDxInstrumentScreen}>
      <InstrumentPageContent data-testid="cat-dx-instrument-screen-main">
        {instrumentStatus && (
          <AnalyzerOverview
            instrument={instrumentStatus}
            offlineBodyContent={offlineBodyContent}
          />
        )}
      </InstrumentPageContent>

      <InstrumentPageRightPanel
        data-testid={TestIds.CatDxInstrumentPageRightPanel}
      >
        <InstrumentPageRightPanelButtonContainer>
          <Button
            onClick={handleQualityControl}
            data-testid={TestIds.CatDxInstrumentQualityButton}
          >
            {t("instrumentScreens.catDx.buttons.qualityControl")}
          </Button>
          {isSmartQcEnabled && (
            <Button
              onClick={handleRunSmartQc}
              data-testid={TestIds.CatDxInstrumentSmartQCButton}
            >
              {t("instrumentScreens.general.buttons.smartQC")}
            </Button>
          )}
          <Button
            onClick={handleIdexxUseOnly}
            disabled={
              !instrumentStatus.connected ||
              [
                InstrumentStatus.Offline,
                InstrumentStatus.Busy,
                InstrumentStatus.Standby,
              ].includes(instrumentStatus.instrumentStatus)
            }
            data-testid={TestIds.CatDxInstrumentIdexxUseOnlyButton}
          >
            {t("instrumentScreens.general.buttons.idexxUseOnly")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrumentStatus}
          />

          <Button
            onClick={handleTransmitLogs}
            disabled={
              props.instrumentStatus.instrumentStatus !==
                InstrumentStatus.Ready || sendEventLogsIsLoading
            }
            buttonType="secondary"
            data-testid={TestIds.CatDxInstrumentTransmitLogsButton}
          >
            {t("instrumentScreens.common.buttons.transmitLogs")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              instrumentStatus.instrument.softwareVersion,
            [t("instrumentScreens.general.labels.serialNumber")]:
              instrumentStatus.instrument.instrumentSerialNumber,
          }}
        />
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
