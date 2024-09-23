import { useEffect, useState } from "react";
import { UpgradeMedium } from "@viewpoint/api";
import {
  SmartServiceUpgradeAction,
  useLazyGetUpgradeMediumsQuery,
  useUpgradeBySmartServiceMutation,
} from "../../../../api/UpgradeApi";
import SpinnerOverlay, {
  FixedSpinnerOverlay,
} from "../../../../components/overlay/SpinnerOverlay";
import { UpgradeMediumSelector } from "./UpgradeMediumSelector";
import { UsbUpgrade } from "./UsbUpgrade";
import { useShutdownClient } from "../../../../utils/hooks/Shutdown";

export interface SystemUpgradeProps {
  onCancel: () => void;
}

export function SystemUpgrade(props: SystemUpgradeProps) {
  const [selectedMedium, setSelectedMedium] = useState<UpgradeMedium>();
  const [upgradeInitiated, setUpgradeInitiated] = useState(false);
  const shutdownClient = useShutdownClient();

  const [getMediums, { data: availableMediums, isLoading: mediumsLoading }] =
    useLazyGetUpgradeMediumsQuery({
      selectFromResult: (result) => ({
        ...result,
        // Remove UpgradeMedium.CD when it's available. The Viewpoint client does not support CD based upgrade workflows.
        data: result.data
          ?.filter((medium) => medium !== UpgradeMedium.CD)
          .sort(),
      }),
    });

  const [upgradeBySmartService] = useUpgradeBySmartServiceMutation();

  useEffect(() => {
    getMediums();
  }, []);

  if (upgradeInitiated) {
    return <FixedSpinnerOverlay />;
  } else if (selectedMedium == null) {
    // availableMediums could contain CD if a CD drive is present on the IVLS, but
    // we're dropping support for CD upgrades -- explicitly check for only either USB or SmartService.
    // USB will always be available
    if (mediumsLoading || availableMediums == null) {
      return <SpinnerOverlay />;
    } else if (
      availableMediums.includes(UpgradeMedium.USB) &&
      !availableMediums.includes(UpgradeMedium.SMART_SERVICE)
    ) {
      // If USB is available but SmartService is not, just proceed with USB
      setSelectedMedium(UpgradeMedium.USB);
    } else if (
      availableMediums.includes(UpgradeMedium.USB) &&
      availableMediums.includes(UpgradeMedium.SMART_SERVICE)
    ) {
      // Let the user select which medium to use
      return (
        <UpgradeMediumSelector
          open={true}
          availableMediums={availableMediums}
          onClose={props.onCancel}
          onMediumSelected={(medium) => {
            setSelectedMedium(medium);
            if (medium === UpgradeMedium.SMART_SERVICE) {
              setUpgradeInitiated(true);
              upgradeBySmartService(SmartServiceUpgradeAction.Manual);
              shutdownClient({ delay: 3_000 });
            }
          }}
        />
      );
    }
  } else {
    // Move onto the actual upgrade process
    if (selectedMedium === UpgradeMedium.USB) {
      return (
        <UsbUpgrade
          onCancel={props.onCancel}
          onUpgradeInitiated={() => setUpgradeInitiated(true)}
        />
      );
    }
  }
  return <></>;
}
