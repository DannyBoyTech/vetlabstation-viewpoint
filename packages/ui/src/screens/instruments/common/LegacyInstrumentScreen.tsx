import { InstrumentStatusDto } from "@viewpoint/api";
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
import { useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import { CancelProcessButton } from "./CancelProcessButton";

export interface LegacyInstrumentScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

export const TestId = {
  RightPanel: "legacy-instrument-right-panel",
  OfflineInstructions: "legacy-instrument-offline-instructions",
};

export function LegacyInstrumentScreen(props: LegacyInstrumentScreenProps) {
  const { t } = useTranslation();

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent data-testid="legacy-instrument-main">
        <AnalyzerOverview
          instrument={props.instrumentStatus}
          offlineBodyContent={
            <GenericOfflineInstructions
              data-testid={TestId.OfflineInstructions}
              instrumentType={props.instrumentStatus.instrument.instrumentType}
              includeReconnect
            />
          }
        />
      </InstrumentPageContent>

      <InstrumentPageRightPanel data-testid={TestId.RightPanel}>
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
