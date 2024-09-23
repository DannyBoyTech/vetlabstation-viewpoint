import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCancelCopyMutation,
  useCopyUpgradeMutation,
  useLazyGetRemovableDrivesQuery,
} from "../../../../api/UsbApi";
import {
  useLazyGetUsbUpgradePropertiesQuery,
  useLazyHasValidUpgradeQuery,
  useUpgradeByUsbMutation,
} from "../../../../api/UpgradeApi";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { UsbSelectionModal } from "../../../../components/usb/UsbSelectionModal";
import { SpotText } from "@viewpoint/spot-react";
import { UsbCopyProgressDialog } from "../../../../components/usb/UsbCopyProgressDialog";
import { ReadyToUpgrade } from "./ReadyToUpgrade";
import { UpgradeLetterModal } from "./UpgradeLetterModal";
import { useShutdownClient } from "../../../../utils/hooks/Shutdown";

export const TestId = {
  NoUpgrade: "usb-upgrade-no-valid-upgrades",
};

interface UsbUpgradeProps {
  onCancel: () => void;
  onUpgradeInitiated: () => void;
}

export function UsbUpgrade(props: UsbUpgradeProps) {
  // Non-rtk query isLoading value
  // (the selection dialog queries drives on an interval which causes the RTK query isFetching value to reflect that interval when that modal is open)
  const [isLoading, setIsLoading] = useState(false);
  // The drive the user selected
  const [selectedUsbId, setSelectedUsbId] = useState<string>();
  // Whether to show the removable drive selector modal
  const [waitingForDriveSelection, setWaitingForDriveSelection] =
    useState(false);
  // Whether to show the upgrade letter for selected drive
  const [upgradeLetterVisible, setUpgradeLetterVisible] = useState(false);
  // Either no drives returned by IVLS, or the drive the user selected does not have a valid upgrade
  const [noUpgradesFound, setNoUpgradesFound] = useState(false);
  // ID of the copying process
  const [copyId, setCopyId] = useState<string>();
  const [copyInProgress, setCopyInProgress] = useState(false);
  const [restartRequired, setRestartRequired] = useState(false);
  // Whether copying of the upgrade is complete
  const [copyComplete, setCopyComplete] = useState(false);
  // Whether the user actually viewed the upgrade letter
  const [upgradeLetterViewed, setUpgradeLetterViewed] = useState(false);
  const [upgradeLetterPath, setUpgradeLetterPath] = useState<string>();

  const { t } = useTranslation();

  // Don't use potentially stale data -- there is nothing from VP or RabbitMQ that can be
  // used to invalidate the cache for these endpoints
  const [getDrives] = useLazyGetRemovableDrivesQuery();
  const [validateUpgrade] = useLazyHasValidUpgradeQuery();
  const [copyUpgrade] = useCopyUpgradeMutation();
  const [cancelCopy] = useCancelCopyMutation();
  const [getUpgradeProperties] = useLazyGetUsbUpgradePropertiesQuery();
  const [upgradeByUsb] = useUpgradeByUsbMutation();
  const shutdownClient = useShutdownClient();

  const handleSelectedDrive = (usbId: string) => {
    setSelectedUsbId(usbId);
    getUpgradeProperties(usbId)
      .unwrap()
      .then((properties) => {
        if (properties.notificationPackagePresent) {
          // If there's an upgrade letter, show it to the customer
          setUpgradeLetterVisible(true);
        } else {
          // Otherwise, just start copying the upgrade
          startCopyProcess(usbId);
        }
      });
  };

  const startCopyProcess = (usbId: string) => {
    validateUpgrade(usbId)
      .unwrap()
      .then(async (hasValidUpgrade) => {
        if (hasValidUpgrade) {
          try {
            const result = await copyUpgrade(usbId).unwrap();
            setCopyInProgress(true);
            setCopyId(result.copyId);
            setRestartRequired(!!result.restartRequired);
          } catch (err) {
            console.error(err);
            props.onCancel();
          }
        } else {
          setNoUpgradesFound(true);
        }
      });
  };

  const handleCancelCopy = () => {
    if (copyId != null) {
      cancelCopy(copyId);
      setCopyInProgress(false);
      props.onCancel();
    }
  };

  const handlePerformUpgrade = () => {
    if (copyId != null) {
      upgradeByUsb({
        usbCopyId: copyId,
        isRead: upgradeLetterViewed,
        path: upgradeLetterPath,
      });
      props.onUpgradeInitiated();
      if (restartRequired) {
        shutdownClient();
      }
    }
  };

  // On mount
  useEffect(() => {
    setIsLoading(true);
    // Check the available drives
    getDrives()
      .unwrap()
      .then((drives) => {
        if (drives != null) {
          if (drives.length === 1) {
            // If there is only one drive, use that
            handleSelectedDrive(drives[0].id);
          } else if (drives.length > 1) {
            // If there are multiple drives, let the user pick
            setWaitingForDriveSelection(true);
          } else {
            // No drives found
            setNoUpgradesFound(true);
          }
        } else {
          setNoUpgradesFound(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    // Loading -- show spinner
    return <SpinnerOverlay />;
  } else if (noUpgradesFound) {
    // Notify user no valid upgrade available
    return (
      <ConfirmModal
        data-testid={TestId.NoUpgrade}
        open={true}
        onClose={props.onCancel}
        onConfirm={props.onCancel}
        bodyContent={
          <SpotText level="paragraph">{t("upgrades.noUpgrades.body")}</SpotText>
        }
        confirmButtonContent={"OK"}
        headerContent={t("upgrades.noUpgrades.title")}
      />
    );
  } else if (waitingForDriveSelection) {
    // Multiple drives -- have user select
    return (
      <UsbSelectionModal
        visible={true}
        onClose={props.onCancel}
        onDriveSelected={(usbId) => {
          setWaitingForDriveSelection(false);
          handleSelectedDrive(usbId);
        }}
        bodyContent={
          <SpotText level="paragraph">
            {t("upgrades.driveSelection.body")}
          </SpotText>
        }
      />
    );
  } else if (upgradeLetterVisible) {
    return (
      <UpgradeLetterModal
        usbId={selectedUsbId}
        open={upgradeLetterVisible}
        onCancel={props.onCancel}
        onConfirm={(viewed, path) => {
          setUpgradeLetterViewed(viewed);
          setUpgradeLetterPath(path);
          setUpgradeLetterVisible(false);
          startCopyProcess(selectedUsbId!);
        }}
      />
    );
  } else if (copyInProgress) {
    if (copyId == null) {
      // Wait for response from call to initiate copy process
      return <SpinnerOverlay />;
    } else {
      // Drive selected -- proceed with copy and upgrade process
      return (
        <UsbCopyProgressDialog
          open={copyInProgress}
          copyId={copyId}
          onCancel={handleCancelCopy}
          headerContent={
            <SpotText level="h3">{t("upgrades.copying.title")}</SpotText>
          }
          bodyContent={
            <SpotText level="paragraph">{t("upgrades.copying.body")}</SpotText>
          }
          onComplete={() => {
            setCopyInProgress(false);
            setCopyComplete(true);
          }}
        />
      );
    }
  } else if (copyComplete) {
    return (
      <ReadyToUpgrade
        onCancel={props.onCancel}
        onProceed={handlePerformUpgrade}
        restartRequired={restartRequired}
      />
    );
  }

  return <></>;
}
