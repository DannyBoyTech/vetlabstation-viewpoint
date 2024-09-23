import { useBatchUpdateSettingsMutation } from "../../../api/SettingsApi";
import { useEffect, useRef, useState } from "react";
import {
  InstrumentStatusDto,
  InstrumentType,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useLazyGetBootItemsQuery } from "../../../api/BootItemsApi";
import { useSetViewPointEnabledMutation } from "../../../api/ViewPointActivationApi";
import { useRequestSystemRestartMutation } from "../../../api/SystemInfoApi";
import { useInfoModal } from "../../../components/global-modals/components/GlobalInfoModal";
import { useTranslation } from "react-i18next";
import {
  useGetLaserCyteStatusesQuery,
  useLazyGetLaserCyteStatusesQuery,
} from "../../../api/InstrumentApi";
import styled from "styled-components";
import { getInstrumentDisplayImage } from "../../instrument-utils";

export function useInitializeIvlsSettingsForViewpoint() {
  const [updateSettings] = useBatchUpdateSettingsMutation();

  useEffect(() => {
    updateSettings([
      // Following settings have been removed from UI as user-facing -- VP
      // responsible for enabling all of them on startup
      {
        settingType: SettingTypeEnum.BACKUP_SNAPSHOTDX_ACTIVITY_LOG,
        settingValue: "true",
      },
      {
        settingType: SettingTypeEnum.BACKUP_SNAPSHOTDX_DATA_LOG,
        settingValue: "true",
      },
      {
        settingType: SettingTypeEnum.BACKUP_SNAPSHOTDX_ERROR_LOG,
        settingValue: "true",
      },
      {
        settingType: SettingTypeEnum.BACKUP_CATALYSTDX_ACTIVITY_LOG,
        settingValue: "true",
      },
      {
        settingType: SettingTypeEnum.BACKUP_CATALYSTDX_DATA_LOG,
        settingValue: "true",
      },
      {
        settingType: SettingTypeEnum.BACKUP_CATALYSTDX_ERROR_LOG,
        settingValue: "true",
      },
    ]);
  }, [updateSettings]);
}

// Safety measures to prevent users from using non-validated LaserCyte
// instrument in ViewPoint
export function useLaserCyteSafetyMeasures() {
  const [canProceed, setCanProceed] = useState(false);
  const [getLaserCytes] = useLazyGetLaserCyteStatusesQuery();
  const [getBootItems] = useLazyGetBootItemsQuery();
  const [setViewPointEnabled] = useSetViewPointEnabledMutation();
  const [restart] = useRequestSystemRestartMutation();
  const { addInfoModal } = useInfoModal();
  const { t } = useTranslation();
  const {
    hasLaserCyteCurrently,
    data: lcInstruments,
    isLoading,
  } = useGetLaserCyteStatusesQuery(undefined, {
    selectFromResult: (res) => ({
      ...res,
      hasLaserCyteCurrently: (res.data ?? []).length > 0,
    }),
  });
  const userNotified = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    (async function () {
      // On first mount, check if an upgrade was performed and, if so, whether
      // the user has a LaserCyte instrument. If both conditions are true, do not
      // allow the user to proceed, toggle the client back to the FX client
      // and restart the system.
      if (!initialized.current) {
        initialized.current = true;
        try {
          if (
            (await getBootItems().unwrap()).upgradeStatusDto
              ?.upgradeAttempted &&
            (await getLaserCytes().unwrap()).length > 0
          ) {
            console.warn(
              "LaserCyte instrument detected in ViewPoint after an upgrade -- reverting user to the FX client and restarting the system."
            );
            // Toggle back to the FX client and restart the system
            await setViewPointEnabled({ enabled: false }).unwrap();
            restart();
          } else {
            setCanProceed(true);
          }
        } catch (err) {
          console.error(err);
          setCanProceed(true);
        }
      } else if (canProceed && hasLaserCyteCurrently && !userNotified.current) {
        // Normal flow -- if app has loaded successfully (no upgrade was performed)
        // but a LaserCyte is detected, just show the user a popup informing them
        // that the LaserCyte won't be compatible and they should contact support
        userNotified.current = true;
        console.warn(
          "LaserCyte instrument detected in ViewPoint -- notifying user."
        );

        addInfoModal({
          header: t("laserCyte.warning.header"),
          content: (
            <LaserCyteDetectedModalContent
              laserCyteInstruments={[...(lcInstruments ?? [])]}
            />
          ),
          confirmButtonContent: t("general.buttons.ok"),
        });
      }
    })();
  }, [
    getLaserCytes,
    getBootItems,
    canProceed,
    restart,
    hasLaserCyteCurrently,
    addInfoModal,
    setViewPointEnabled,
    t,
  ]);

  return {
    canProceed,
    hasLaserCyteCurrently,
  };
}

const LCDetectedRoot = styled.div`
  display: flex;
  gap: 12px;

  img {
    flex: 0;
    height: 100%;
    object-fit: contain;
  }

  > div:first-child {
    flex: 1;

    img {
      object-fit: contain;
      width: 100%;
    }
  }

  > div:nth-child(2) {
    display: flex;
    flex: 2;
    align-items: center;
  }
`;

interface LaserCyteDetectedModalContentProps {
  laserCyteInstruments: InstrumentStatusDto[];
}

function LaserCyteDetectedModalContent(
  props: LaserCyteDetectedModalContentProps
) {
  const { t } = useTranslation();

  return (
    <LCDetectedRoot>
      <div>
        <img
          alt={"laserCyte"}
          src={getInstrumentDisplayImage(
            props.laserCyteInstruments[0]?.instrument?.instrumentType ??
              InstrumentType.LaserCyteDx
          )}
        />
      </div>
      <div>{t("laserCyte.warning.body")}</div>
    </LCDetectedRoot>
  );
}
