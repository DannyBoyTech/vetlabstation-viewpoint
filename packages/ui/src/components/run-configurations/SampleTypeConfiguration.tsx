import { SampleTypeDto } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Select } from "@viewpoint/spot-react";

export const TestId = {
  SampleTypeSelect: "sample-type-select",
};

export interface SampleTypeConfigurationProps {
  sampleTypes: SampleTypeDto[];
  selectedSampleTypeId?: number;
  onSampleTypeSelected?: (sampleType: SampleTypeDto | undefined) => void;
}

export function SampleTypeConfiguration({
  sampleTypes,
  selectedSampleTypeId,
  onSampleTypeSelected,
}: SampleTypeConfigurationProps) {
  const { t } = useTranslation();

  // If the list changes and the selected sample type is no longer valid, call back with undefined to notify parent
  useEffect(() => {
    if (
      selectedSampleTypeId &&
      !sampleTypes.some((st) => st.id === selectedSampleTypeId)
    ) {
      onSampleTypeSelected?.(undefined);
    }
  }, [sampleTypes, selectedSampleTypeId, onSampleTypeSelected]);

  return (
    <Select
      onChange={(ev) =>
        onSampleTypeSelected?.(sampleTypes[ev.target.selectedIndex - 1])
      }
      value={selectedSampleTypeId ?? "unselected"}
      data-testid={TestId.SampleTypeSelect}
    >
      <Select.Option disabled value={"unselected"}>
        {t("orderFulfillment.runConfig.selectSampleType")}
      </Select.Option>
      {sampleTypes.map((st) => (
        <Select.Option key={st.id} value={st.id}>
          {t(`sampleType.${st.name}` as any)}
        </Select.Option>
      ))}
    </Select>
  );
}
