import { InstrumentStatus, InstrumentStatusDto } from "@viewpoint/api";
import {
  AnalyzerOverview,
  GenericOfflineInstructions,
} from "../AnalyzerOverview";
import { useState } from "react";
import { Button } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import { useRequestShutdownForShippingMutation } from "../../../api/CatOneApi";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import { useNavigate } from "react-router-dom";
import {
  getAvailableUpgrade,
  UpgradeNowButton,
} from "../common/UpgradeNowButton";
import { CancelProcessButton } from "../common/CancelProcessButton";

/**
 * Returns whether the shutdown button should be disabled.
 *
 * This logic was derived from on-market behavior for the CatOne, by specific LOB request.
 * There is a use of switch fall-through that may or may not be intentional in that code, so
 * 'Offline' handling might be off a bit. For now, we make it match on-market behavior exactly.
 *
 * @param instrumentStatus
 */
export function shutdownDisabled(instrumentStatus: InstrumentStatus) {
  return [
    InstrumentStatus.Offline,
    InstrumentStatus.Busy,
    InstrumentStatus.Standby,
  ].includes(instrumentStatus);
}

export interface InstrumentContentProps {
  instrument: InstrumentStatusDto;
}

export function CatOneInstrumentScreen(props: InstrumentContentProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [isRequestingShutdown, setIsRequestingShutdown] = useState(false);
  const [shutdown] = useRequestShutdownForShippingMutation();

  const handleConfirm = () => {
    props.instrument.instrument.id && shutdown(props.instrument.instrument.id);
    setIsRequestingShutdown(false);
  };

  return (
    <InstrumentPageRoot data-testid="catone-instruments-screen">
      <InstrumentPageContent data-testid="catone-instruments-screen-main">
        <AnalyzerOverview
          instrument={props.instrument}
          offlineBodyContent={
            <GenericOfflineInstructions
              instrumentType={props.instrument.instrument.instrumentType}
              includeReconnect
            />
          }
        />
      </InstrumentPageContent>

      <InstrumentPageRightPanel data-testid="instrument-page-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button
            onClick={() =>
              nav(`/instruments/${props.instrument.instrument.id}/maintenance`)
            }
          >
            {t("instrumentScreens.general.buttons.maintenance")}
          </Button>

          <Button
            data-testid="event-log-button"
            onClick={() => nav("eventlog")}
          >
            {t("instrumentScreens.general.buttons.eventLog")}
          </Button>

          <Button
            data-testid="settings-button"
            onClick={() =>
              nav(`/instruments/${props.instrument.instrument.id}/settings`)
            }
            disabled={!props.instrument.connected}
          >
            {t("instrumentScreens.general.buttons.settings")}
          </Button>

          <Button
            onClick={() =>
              nav(
                `/instruments/${props.instrument.instrument.id}/settings/advanced`
              )
            }
            disabled={
              !props.instrument.connected ||
              [
                InstrumentStatus.Offline,
                InstrumentStatus.Busy,
                InstrumentStatus.Standby,
              ].includes(props.instrument.instrumentStatus)
            }
          >
            {t("instrumentScreens.general.buttons.idexxUseOnly")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrument}
          />
          <Button
            disabled={shutdownDisabled(props.instrument.instrumentStatus)}
            buttonType="secondary"
            onClick={() => setIsRequestingShutdown(true)}
            data-testid="catone-instruments-shutdown-button"
          >
            {t("instrumentScreens.general.buttons.shutDown")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>

        <InstrumentPageRightPanelDivider />

        {props.instrument.connected &&
          getAvailableUpgrade(props.instrument.instrument) != null && (
            <UpgradeNowButton instrumentStatus={props.instrument} />
          )}

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              props.instrument.instrument.softwareVersion,
            [t("instrumentScreens.catOne.labels.calDataVersion")]:
              props.instrument.instrument.instrumentStringProperties?.[
                "version.curves"
              ],
            [t("instrumentScreens.general.labels.serialNumber")]:
              props.instrument.instrument.instrumentSerialNumber,
            [t("instrumentScreens.general.labels.ipAddress")]: props.instrument
              .connected
              ? props.instrument.instrument.ipAddress
              : "",
          }}
        />
      </InstrumentPageRightPanel>

      <ConfirmModal
        open={isRequestingShutdown}
        onClose={() => setIsRequestingShutdown(false)}
        onConfirm={() => handleConfirm()}
        headerContent={t("instrumentScreens.general.buttons.shutDown")}
        bodyContent={t("instrumentScreens.catOne.shutDownConfirm")}
        cancelButtonContent={t("general.buttons.cancel")}
        confirmButtonContent={t("instrumentScreens.general.buttons.shutDown")}
        data-testid="catone-instruments-shutdown-confirmation"
      />
    </InstrumentPageRoot>
  );
}
