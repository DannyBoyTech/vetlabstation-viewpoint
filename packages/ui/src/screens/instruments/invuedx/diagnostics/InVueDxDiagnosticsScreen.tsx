import { InstrumentStatusDto } from "@viewpoint/api";
import { Button, Link, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import {
  DiagnosticsPageContentHeader,
  DiagnosticsSection,
  DiagnosticsSectionContainer,
} from "../../common/diagnostics/common-diagnostics-screen-components";

const TestIds = {
  backButton: "back-button",
  ejectCartridge: "eject-cartridge-link",
  lotEntry: "lot-entry-link",
} as const;

interface InVueDxDiagnosticsScreenProps {
  instrument: InstrumentStatusDto;
}

const InVueDxDiagnosticsScreen = ({
  instrument: instrumentStatus,
}: InVueDxDiagnosticsScreenProps) => {
  const { t } = useTranslation();
  const nav = useNavigate();

  return (
    <>
      <InstrumentPageRoot>
        <InstrumentPageContent
          data-testid="pco-diagnostics-page-main"
          className="mainContent"
        >
          <DiagnosticsPageContentHeader level="h3">
            Diagnostics
          </DiagnosticsPageContentHeader>
          <DiagnosticsSectionContainer className="sectionContainer">
            <DiagnosticsSection className="section">
              <ul>
                <li>
                  <Link
                    data-testid={TestIds.lotEntry}
                    onClick={() => nav("../lotEntry")}
                  >
                    {t("instrumentScreens.inVue.diagnostics.lotEntry")}
                  </Link>
                </li>
              </ul>
            </DiagnosticsSection>
          </DiagnosticsSectionContainer>
        </InstrumentPageContent>

        <InstrumentPageRightPanel>
          <InstrumentPageRightPanelButtonContainer>
            <Button
              buttonType="secondary"
              onClick={() => nav(-1)}
              data-testid={TestIds.backButton}
            >
              {t("general.buttons.back")}
            </Button>
          </InstrumentPageRightPanelButtonContainer>
        </InstrumentPageRightPanel>
      </InstrumentPageRoot>
    </>
  );
};

export { InVueDxDiagnosticsScreen };
