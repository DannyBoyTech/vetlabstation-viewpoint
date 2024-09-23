import { InstrumentStatusDto } from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import {
  AnalyzerOverview,
  GenericOfflineInstructions,
} from "../AnalyzerOverview";
import { useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import { Button } from "@viewpoint/spot-react";
import { useNavigate } from "react-router-dom";

export interface VetTestInstrumentScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

export function VetTestInstrumentScreen(props: VetTestInstrumentScreenProps) {
  const { t } = useTranslation();
  const nav = useNavigate();

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent data-testid="vetTest-instruments-page-main">
        <AnalyzerOverview
          instrument={props.instrumentStatus}
          offlineBodyContent={
            <GenericOfflineInstructions
              instrumentType={props.instrumentStatus.instrument.instrumentType}
              includeReconnect
            />
          }
        />
      </InstrumentPageContent>

      <InstrumentPageRightPanel data-testid="vetTest-instruments-page-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button onClick={() => nav("qc")}>
            {t("instrumentScreens.catDx.buttons.qualityControl")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
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
