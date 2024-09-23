import { SampleTypeDto, SampleTypeEnum, SettingTypeEnum } from "@viewpoint/api";
import { useState } from "react";
import { SampleTypeConfiguration } from "../SampleTypeConfiguration";
import { ConfirmModal } from "../../confirm-modal/ConfirmModal";
import { useGetSettingQuery } from "../../../api/SettingsApi";
import { Trans, useTranslation } from "react-i18next";
import { CommonTransComponents } from "../../../utils/i18n-utils";

interface TenseiRunConfigurationPanelProps {
  sampleTypes: SampleTypeDto[];
  selectedSampleTypeId?: number;
  onSampleTypeSelected: (sampleType: SampleTypeDto | undefined) => void;
}

export function TenseiRunConfigurationPanel(
  props: TenseiRunConfigurationPanelProps
) {
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const { data: showWarning } = useGetSettingQuery(
    SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER
  );
  const { t } = useTranslation();
  return (
    <>
      <SampleTypeConfiguration
        sampleTypes={props.sampleTypes}
        selectedSampleTypeId={props.selectedSampleTypeId}
        onSampleTypeSelected={(st) => {
          if (st?.name === SampleTypeEnum.SYNOVIAL && showWarning === "true") {
            setWarningModalVisible(true);
          }
          props.onSampleTypeSelected(st);
        }}
      />
      {warningModalVisible && (
        <ConfirmModal
          open
          onClose={() => setWarningModalVisible(false)}
          onConfirm={() => setWarningModalVisible(false)}
          headerContent={t(
            "orderFulfillment.runConfig.tensei.synovialReminder.title"
          )}
          secondaryHeaderContent={t("instruments.names.TENSEI")}
          bodyContent={
            <Trans
              i18nKey="orderFulfillment.runConfig.tensei.synovialReminder.body"
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
    </>
  );
}
