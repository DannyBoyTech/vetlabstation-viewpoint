import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import {
  AnalyzerOverview,
  GenericOfflineInstructions,
} from "../AnalyzerOverview";
import { InstrumentStatus, InstrumentStatusDto } from "@viewpoint/api";
import { InstrumentInfo } from "../InstrumentInfo";
import { Button } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useSendEventLogsMutation } from "../../../api/InstrumentApi";
import { useCallback } from "react";
import { CancelProcessButton } from "../common/CancelProcessButton";

export interface SnapShotDxInstrumentScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

export const TestId = {
  TransmitLogsButton: "snapshot-dx-transmit-logs-button",
};

export function SnapShotDxInstrumentScreen(
  props: SnapShotDxInstrumentScreenProps
) {
  const { t } = useTranslation();
  const [sendEventLogs, { isLoading: sendEventLogsIsLoading }] =
    useSendEventLogsMutation();

  const handleTransmitLogs = useCallback(() => {
    sendEventLogs({ instrumentId: props.instrumentStatus.instrument.id });
  }, [props.instrumentStatus.instrument.id, sendEventLogs]);

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent data-testid="ssdx-instrument-page-main">
        <AnalyzerOverview
          instrument={props.instrumentStatus}
          offlineBodyContent={
            <GenericOfflineInstructions
              instrumentType={props.instrumentStatus.instrument.instrumentType}
            />
          }
        />
      </InstrumentPageContent>
      <InstrumentPageRightPanel data-testid="ssdx-instrument-page-right">
        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrumentStatus}
          />
          <Button
            data-testid={TestId.TransmitLogsButton}
            onClick={handleTransmitLogs}
            buttonType="secondary"
            disabled={
              props.instrumentStatus.instrumentStatus !==
                InstrumentStatus.Ready || sendEventLogsIsLoading
            }
          >
            {t("instrumentScreens.common.buttons.transmitLogs")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
        <InstrumentPageRightPanelDivider />
        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              props.instrumentStatus.instrument.softwareVersion,
            [t("instrumentScreens.general.labels.serialNumber")]:
              props.instrumentStatus.instrument.instrumentSerialNumber,
          }}
        />
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
