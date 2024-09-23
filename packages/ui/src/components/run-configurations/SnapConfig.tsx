import { SettingTypeEnum, SnapDeviceDto } from "@viewpoint/api";
import styled from "styled-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Checkbox, SpotText } from "@viewpoint/spot-react";
import { CustomizableDropdown } from "../customizable-dropdown/CustomizableDropdown";
import { useConfirmModal } from "../global-modals/components/GlobalConfirmModal";
import { CommonTransComponents } from "../../utils/i18n-utils";

const TestId = {
  SnapContent: "snap-content",
  SnapCheckbox: (snapDeviceId: number) =>
    `snap-checkbox-device-${snapDeviceId}`,
};

const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 8px 4px 2px 4px;
`;

export interface SnapConfigProps {
  onSelectionsChanged: (selectedSnapDeviceIds: number[]) => void;
  selectedSnapDeviceIds: number[];
  availableSnaps: SnapDeviceDto[];
}

const SnapConfigContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  white-space: nowrap;
  max-height: 150px;
  text-overflow: ellipsis;

  .spot-form__checkbox {
    margin: 10px;
  }
`;
const ScrollTarget = styled.div`
  margin-top: 10px;
`;

export function SnapConfig(props: SnapConfigProps) {
  const [expanded, setExpanded] = useState(true);

  const { t } = useTranslation();
  const { addConfirmModal } = useConfirmModal();

  const scrollTarget = useRef<HTMLDivElement>(null);
  const bothLeishmaniaSnapsAvailable = useMemo(() => {
    const originalLeishmania = props.availableSnaps.find(
      (s) => s.settingType === SettingTypeEnum.SNAP_CANINELEISHMANIA
    );
    const twoSpotLeishmania = props.availableSnaps.find(
      (s) => s.settingType === SettingTypeEnum.SNAP_CANINELEISHMANIA2SPOT
    );
    return originalLeishmania != null && twoSpotLeishmania != null;
  }, [props.availableSnaps]);

  const handleExpandedChange = (expanded: boolean) => {
    setTimeout(
      () => scrollTarget.current?.scrollIntoView({ behavior: "smooth" }),
      300
    );
    setExpanded(expanded);
  };

  const handleChanged = (deviceId: number, checked: boolean) => {
    const snap = props.availableSnaps.find((s) => s.snapDeviceId === deviceId);
    const leishmaniaType = getLeishmaniaType(snap);
    if (
      checked &&
      leishmaniaType != null &&
      (leishmaniaType === "original" || bothLeishmaniaSnapsAvailable)
    ) {
      // If user is running the original leishmania SNAP, always show the confirmation modal.
      // Otherwise, if the user is running the 2-spot leishmania SNAP, only show the confirmation modal if both leishmania SNAPs are available.
      addConfirmModal({
        headerContent: t(
          "orderFulfillment.runConfig.snap.confirmLeishmania.title"
        ),
        bodyContent: (
          <Trans
            i18nKey={`orderFulfillment.runConfig.snap.confirmLeishmania.body_${leishmaniaType}`}
            components={CommonTransComponents}
          />
        ),
        dismissable: false,
        confirmButtonContent: t("general.buttons.confirm"),
        cancelButtonContent: t("general.buttons.cancel"),
        onConfirm: () => {
          handleSnapToggled(deviceId, checked);
        },
        onClose: () => {},
      });
    } else {
      handleSnapToggled(deviceId, checked);
    }
  };

  const handleSnapToggled = (deviceId: number, checked: boolean) => {
    const newIds = [...props.selectedSnapDeviceIds];
    if (checked) {
      newIds.push(deviceId);
    } else {
      newIds.splice(newIds.indexOf(deviceId), 1);
    }
    props.onSelectionsChanged(newIds);
  };

  const selectedSummary =
    props.selectedSnapDeviceIds.length > 0
      ? props.selectedSnapDeviceIds
          .map((id) =>
            t(
              props.availableSnaps.find((s) => s.snapDeviceId === id)
                ?.displayNamePropertyKey as any
            )
          )
          .join(", ")
      : "Select a SNAP Test";

  useEffect(() => {
    if (expanded) {
    }
  }, [expanded]);

  return (
    <ConfigContainer>
      <div>
        <CustomizableDropdown
          headerContent={selectedSummary}
          expanded={expanded}
          onExpandedChange={handleExpandedChange}
        >
          <SnapConfigContent data-testid={TestId.SnapContent}>
            {props.availableSnaps.map((snap) => (
              <div key={snap.snapDeviceId}>
                <Checkbox
                  label={t(snap.displayNamePropertyKey as any)}
                  onChange={(ev) =>
                    handleChanged(snap.snapDeviceId, ev.target.checked)
                  }
                  checked={props.selectedSnapDeviceIds.includes(
                    snap.snapDeviceId
                  )}
                  data-testid={TestId.SnapCheckbox(snap.snapDeviceId)}
                />
              </div>
            ))}
          </SnapConfigContent>
        </CustomizableDropdown>
      </div>
      <ScrollTarget ref={scrollTarget}>
        <SpotText level="secondary">
          {t("orderFulfillment.guidance.enterResults")}
        </SpotText>
      </ScrollTarget>
    </ConfigContainer>
  );
}

const getLeishmaniaType = (snap: SnapDeviceDto | undefined) => {
  if (snap?.settingType === SettingTypeEnum.SNAP_CANINELEISHMANIA) {
    return "original";
  } else if (snap?.settingType === SettingTypeEnum.SNAP_CANINELEISHMANIA2SPOT) {
    return "twoSpot";
  }
};
