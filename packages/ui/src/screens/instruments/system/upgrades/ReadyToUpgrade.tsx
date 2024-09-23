import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLazyGetRemovableDrivesQuery } from "../../../../api/UsbApi";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { SpotText } from "@viewpoint/spot-react";
import { CommonTransComponents } from "../../../../utils/i18n-utils";

export const TestId = {
  Modal: "usb-upgrade-ready-to-upgrade-modal",
  WarningModal: "usb-upgrade-ready-to-upgrade-warning-modal",
};

interface ReadyToUpgradeModalProps {
  onCancel: () => void;
  onProceed: () => void;
  restartRequired: boolean;
}

// Show initial confirmation to user, warning them to remove all USB drives.
// If all drives are removed when they confirm, proceed with upgrade. If there
// are still removable drives connected, show a warning to the user. Once they
// hit OK, check one more time and present the warning again -- if they hit OK
// for a second time, proceed with the upgrade.
//
// This was done because some fielded IVLS PCs have the boot order
// set to removable drives first, and this was driving a lot of calls
//
export function ReadyToUpgrade(props: ReadyToUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [driveCheckCount, setDriveCheckCount] = useState(0);

  const { t } = useTranslation();

  const [getDrives] = useLazyGetRemovableDrivesQuery();

  const handleUpgradeConfirmation = () => {
    setIsLoading(true);
    // If the upgrade requires a reboot, verify user has removed all USB drives before
    // proceeding with upgrade/reboot
    if (props.restartRequired) {
      getDrives()
        .unwrap()
        .then((drives) => {
          if (drives.length === 0 || driveCheckCount >= 2) {
            props.onProceed();
          }
          setDriveCheckCount(driveCheckCount + 1);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      props.onProceed();
    }
  };

  if (isLoading) {
    return <SpinnerOverlay />;
  } else if (driveCheckCount > 0) {
    return (
      <ConfirmModal
        open={true}
        data-testid={TestId.WarningModal}
        onClose={props.onCancel}
        onConfirm={handleUpgradeConfirmation}
        bodyContent={
          <SpotText level="paragraph">
            <Trans
              i18nKey={
                driveCheckCount < 2
                  ? "upgrades.drivesFound.firstWarning"
                  : "upgrades.drivesFound.secondWarning"
              }
              components={CommonTransComponents}
            />
          </SpotText>
        }
        confirmButtonContent={t("general.buttons.ok")}
        cancelButtonContent={t("general.buttons.cancel")}
        headerContent={t("upgrades.drivesFound.title")}
      />
    );
  }
  return (
    <ConfirmModal
      open={true}
      data-testid={TestId.Modal}
      onClose={props.onCancel}
      onConfirm={handleUpgradeConfirmation}
      bodyContent={
        <SpotText level="paragraph">
          <Trans
            i18nKey={"upgrades.readyToUpgrade.body"}
            components={CommonTransComponents}
          />
        </SpotText>
      }
      confirmButtonContent={t("general.buttons.ok")}
      cancelButtonContent={t("general.buttons.cancel")}
      headerContent={t("upgrades.readyToUpgrade.title")}
    />
  );
}
