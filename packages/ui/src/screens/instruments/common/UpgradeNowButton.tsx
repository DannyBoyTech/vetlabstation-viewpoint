import {
  InstrumentDto,
  InstrumentStatus,
  InstrumentStatusDto,
} from "@viewpoint/api";
import { Button } from "@viewpoint/spot-react";
import { InstrumentPageRightPanelButtonContainer } from "../common-components";
import { useTranslation } from "react-i18next";
import { useUpgradeNowMutation } from "../../../api/InstrumentUpgradeApi";
import { useState } from "react";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";

interface UpgradeNowButtonProps {
  instrumentStatus: InstrumentStatusDto;
}

/**
 * Only supported for instruments that provide pending upgrade version in the
 * "instrumentStringProperties" field.
 */
export function UpgradeNowButton(props: UpgradeNowButtonProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { t } = useTranslation();
  const [initiateUpgrade] = useUpgradeNowMutation();
  const availableUpgrade = getAvailableUpgrade(
    props.instrumentStatus.instrument
  );

  return (
    <>
      <InstrumentPageRightPanelButtonContainer>
        <Button
          leftIcon="bell"
          onClick={() => setUpgradeModalOpen(true)}
          disabled={
            props.instrumentStatus.instrumentStatus === InstrumentStatus.Busy ||
            props.instrumentStatus.instrumentStatus === InstrumentStatus.Standby
          }
        >
          {t("general.buttons.upgradeNow")}
        </Button>
      </InstrumentPageRightPanelButtonContainer>

      {upgradeModalOpen && availableUpgrade != null && (
        <ConfirmModal
          open
          headerContent={t("upgrades.instrumentUpgradeModal.title")}
          secondaryHeaderContent={t(
            `instruments.names.${props.instrumentStatus.instrument.instrumentType}`
          )}
          onClose={() => setUpgradeModalOpen(false)}
          onConfirm={() => {
            setUpgradeModalOpen(false);
            initiateUpgrade({
              instrumentId: props.instrumentStatus.instrument.id,
              version: availableUpgrade,
            });
          }}
          bodyContent={t("upgrades.instrumentUpgradeModal.body", {
            currentVersion: props.instrumentStatus.instrument.softwareVersion,
            newVersion: availableUpgrade,
            instrumentName: t(
              `instruments.names.${props.instrumentStatus.instrument.instrumentType}`
            ),
          })}
          confirmButtonContent={t("general.buttons.upgradeNow")}
          cancelButtonContent={t("general.buttons.cancel")}
        />
      )}
    </>
  );
}

export function getAvailableUpgrade(instrument: InstrumentDto) {
  return instrument.instrumentStringProperties?.upgrade;
}
