import { InstrumentStatusDto } from "@viewpoint/api";
import { Button, Link, SpotText } from "@viewpoint/spot-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import { ShutDownModal } from "./ShutDownModal";
import { PowerDownModal } from "./PowerDownModal";
import { FullSystemPrimeModal } from "./FullSystemPrimeModal";
import {
  useRequestBleachCleanMutation,
  useRequestDrainMixChamberMutation,
  useRequestFlowCellSoakMutation,
  useRequestFullSystemPrimeMutation,
  useRequestPowerDownMutation,
  useRequestPrimeReagentMutation,
  useRequestPrimeSheathMutation,
  useRequestShutDownForShippingMutation,
  useRequestSystemFlushMutation,
} from "../../../../api/ProCyteOneMaintenanceApi";
import { ProCyteOneReplaceFilterModal } from "./ProCyteOneReplaceFilterModal";
import { WarningModal } from "./WarningModal";
import {
  DiagnosticsPageContentHeader,
  DiagnosticsSection,
  DiagnosticsSectionContainer,
} from "../../common/diagnostics/common-diagnostics-screen-components";

const TestIds = {
  powerDown: "power-down",
  shutDown: "shut-down",
  primeReagent: "prime-reagent",
  primeSheath: "prime-sheath",
  lotEntry: "lot-entry",
  fullSystemPrime: "full-system-prime",
  systemFlush: "system-flush",
  replaceFilter: "replace-filter",
  bleachClean: "bleach-clean",
  flowCellSoak: "flow-cell-soak",
  drainMixChambers: "drain-mix-chambers",
  backButton: "back-button",
} as const;

interface ProCyteOneDiagnosticsScreenProps {
  instrument: InstrumentStatusDto;
}

const ProCyteOneDiagnosticsScreen = ({
  instrument: instrumentStatus,
}: ProCyteOneDiagnosticsScreenProps) => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();

  // show warning modal when the user first arrives at this location, without
  // requiring inbound links to pass the state
  useEffect(() => {
    if (location.state?.showWarning == null) {
      nav("", {
        replace: true,
        state: { ...location.state, showWarning: true },
      });
    }
  }, [location.state, nav]);

  const { showWarning } = location.state ?? {};
  const instrumentId = instrumentStatus.instrument.id;

  const [powerDownOpen, setPowerDownOpen] = useState(false);
  const [shutDownOpen, setShutDownOpen] = useState(false);
  const [fullSystemPrimeOpen, setFullSystemPrimeOpen] = useState(false);
  const [replaceFilterOpen, setReplaceFilterOpen] = useState(false);

  const [requestBleachClean] = useRequestBleachCleanMutation();
  const [requestDrainMixChamber] = useRequestDrainMixChamberMutation();
  const [requestFlowCellSoak] = useRequestFlowCellSoakMutation();
  const [requestFullSystemPrime] = useRequestFullSystemPrimeMutation();
  const [requestPowerDown] = useRequestPowerDownMutation();
  const [requestPrimeReagent] = useRequestPrimeReagentMutation();
  const [requestPrimeSheath] = useRequestPrimeSheathMutation();
  const [requestShutDown] = useRequestShutDownForShippingMutation();
  const [requestSystemFlush] = useRequestSystemFlushMutation();

  const handleWarningClose = () => nav(-1);
  const handleWarningConfirm = () =>
    nav("", { replace: true, state: { showWarning: false } });

  const handlePowerDown = () => setPowerDownOpen(true);
  const handlePowerDownClose = () => setPowerDownOpen(false);
  const handlePowerDownConfirm = () => {
    requestPowerDown(instrumentId);
    nav("../");
  };

  const handleShutDown = () => setShutDownOpen(true);
  const handleShutDownClose = () => setShutDownOpen(false);
  const handleShutDownConfirm = () => {
    requestShutDown(instrumentId);
    nav("../");
  };

  const handlePrimeReagent = () => {
    requestPrimeReagent(instrumentId);
    nav("../");
  };

  const handlePrimeSheath = () => {
    requestPrimeSheath(instrumentId);
    nav("../");
  };

  const handleLotEntry = () => nav("../lotEntry");

  const handleFullSystemPrime = () => setFullSystemPrimeOpen(true);
  const handleFullSystemPrimeClose = () => setFullSystemPrimeOpen(false);
  const handleFullSystemPrimeConfirm = () => {
    requestFullSystemPrime(instrumentId);
    nav("../");
  };

  const handleSystemFlush = () => {
    requestSystemFlush(instrumentId);
    nav("../");
  };

  const handleReplaceFilter = () => {
    setReplaceFilterOpen(true);
  };

  const handleBleachClean = () => {
    /*Display of BleachCleanModal is managed by InstrumentMaintenanceResultHooks because this workflow can be
     * started here, or via the BLEACH_CLEAN_RECOMMENDED/BLEACH_CLEAN_REQUIRED alerts and is dependent on the
     * MaintenanceProcedureAccepted notification event following this request.*/
    requestBleachClean(instrumentId);
  };

  const handleFlowCellSoak = () => {
    requestFlowCellSoak(instrumentId);
    nav("../");
  };
  const handleDrainMixChambers = () => {
    requestDrainMixChamber(instrumentId);
    nav("../");
  };

  return (
    <>
      {showWarning ? (
        <WarningModal
          onClose={handleWarningClose}
          onConfirm={handleWarningConfirm}
        />
      ) : null}
      {powerDownOpen ? (
        <PowerDownModal
          instrumentId={instrumentId}
          onClose={handlePowerDownClose}
          onConfirm={handlePowerDownConfirm}
        />
      ) : null}
      {shutDownOpen ? (
        <ShutDownModal
          instrumentId={instrumentId}
          onClose={handleShutDownClose}
          onConfirm={handleShutDownConfirm}
        />
      ) : null}
      {fullSystemPrimeOpen ? (
        <FullSystemPrimeModal
          instrumentId={instrumentId}
          onClose={handleFullSystemPrimeClose}
          onConfirm={handleFullSystemPrimeConfirm}
        />
      ) : null}
      {replaceFilterOpen ? (
        <ProCyteOneReplaceFilterModal
          onClose={() => setReplaceFilterOpen(false)}
          onConfirm={() => setReplaceFilterOpen(false)}
        />
      ) : null}
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
              <SpotText level="paragraph" bold>
                {t("instrumentScreens.proCyteOne.maintenance.power")}
              </SpotText>
              <ul>
                <li>
                  <Link
                    onClick={handlePowerDown}
                    data-testid={TestIds.powerDown}
                  >
                    {t("instrumentScreens.proCyteOne.maintenance.powerDown")}
                  </Link>
                </li>
                <li>
                  <Link onClick={handleShutDown} data-test={TestIds.shutDown}>
                    {t("instrumentScreens.proCyteOne.maintenance.shutDown")}
                  </Link>
                </li>
              </ul>
            </DiagnosticsSection>
            <DiagnosticsSection>
              <SpotText level="paragraph" bold>
                {t("instrumentScreens.proCyteOne.maintenance.packProcedures")}
              </SpotText>
              <ul>
                <li>
                  <Link
                    onClick={handlePrimeReagent}
                    data-testid={TestIds.primeReagent}
                  >
                    {t("instrumentScreens.proCyteOne.maintenance.primeReagent")}
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handlePrimeSheath}
                    data-testid={TestIds.primeSheath}
                  >
                    {t("instrumentScreens.proCyteOne.maintenance.primeSheath")}
                  </Link>
                </li>
                <li>
                  <Link onClick={handleLotEntry} data-testid={TestIds.lotEntry}>
                    {t("instrumentScreens.proCyteOne.maintenance.lotEntry")}
                  </Link>
                </li>
              </ul>
            </DiagnosticsSection>
            <DiagnosticsSection>
              <SpotText level="paragraph" bold>
                {t(
                  "instrumentScreens.proCyteOne.maintenance.fluidicProcedures"
                )}
              </SpotText>
              <ul>
                <li>
                  <Link
                    onClick={handleFullSystemPrime}
                    data-testid={TestIds.fullSystemPrime}
                  >
                    {t(
                      "instrumentScreens.proCyteOne.maintenance.fullSystemPrime"
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleSystemFlush}
                    data-testid={TestIds.systemFlush}
                  >
                    {t("instrumentScreens.proCyteOne.maintenance.systemFlush")}
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleReplaceFilter}
                    data-testid={TestIds.replaceFilter}
                  >
                    {t(
                      "instrumentScreens.proCyteOne.maintenance.replaceFilter"
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleBleachClean}
                    data-testid={TestIds.bleachClean}
                  >
                    {t("instrumentScreens.proCyteOne.maintenance.bleachClean")}
                  </Link>
                </li>
              </ul>
            </DiagnosticsSection>
            <DiagnosticsSection>
              <SpotText level="paragraph" bold>
                {t(
                  "instrumentScreens.proCyteOne.maintenance.idexxDirectedProcedures"
                )}
              </SpotText>
              <ul>
                <li>
                  <Link
                    onClick={handleFlowCellSoak}
                    data-testid={TestIds.flowCellSoak}
                  >
                    {t("instrumentScreens.proCyteOne.maintenance.flowCellSoak")}
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={handleDrainMixChambers}
                    data-testid={TestIds.drainMixChambers}
                  >
                    {t(
                      "instrumentScreens.proCyteOne.maintenance.drainMixChambers"
                    )}
                  </Link>
                </li>
              </ul>
            </DiagnosticsSection>
          </DiagnosticsSectionContainer>
        </InstrumentPageContent>

        <InstrumentPageRightPanel data-testid="pco-diagnostics-page-right">
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

export { ProCyteOneDiagnosticsScreen };
