import { Meta, StoryFn } from "@storybook/react";
import {
  SelectableInstrument as Component,
  SelectableInstrumentProps,
} from "./SelectableInstrument";
import {
  InstrumentStatus,
  InstrumentType,
  SampleTypeEnum,
} from "@viewpoint/api";
import { useState } from "@storybook/preview-api";
import { SampleTypeConfiguration } from "../../components/run-configurations/SampleTypeConfiguration";

const meta: Meta = {
  title: "viewpoint/AnalyzerCard",
  component: Component,
  argTypes: {
    className: {
      table: { disable: true },
    },
    type: {
      defaultValue: InstrumentType.SediVueDx,
    },
    status: {
      defaultValue: InstrumentStatus.Busy,
    },
    manualInstrument: {
      defaultValue: false,
    },
    selected: {
      defaultValue: false,
    },
  },
};
export default meta;

const Template: StoryFn<SelectableInstrumentProps> = (args) => {
  const [sampleTypeId, setSampleTypeId] = useState<number | undefined>(1);
  return (
    <div style={{ maxWidth: "25em" }}>
      <Component {...args}>
        <div style={{ margin: "12px" }}>
          This is an example run configuration panel
          <SampleTypeConfiguration
            sampleTypes={[
              { id: 1, name: SampleTypeEnum.URINE },
              { id: 2, name: SampleTypeEnum.ABDOMINAL },
              { id: 3, name: SampleTypeEnum.THORACIC },
              { id: 4, name: SampleTypeEnum.SYNOVIAL },
              { id: 5, name: SampleTypeEnum.OTHER },
              { id: 6, name: SampleTypeEnum.CSF },
            ]}
            onSampleTypeSelected={(type) => setSampleTypeId(type?.id)}
            selectedSampleTypeId={sampleTypeId}
          />
        </div>
      </Component>
    </div>
  );
};

export const SelectableInstrument = Template.bind({});
SelectableInstrument.args = {
  type: InstrumentType.CatalystOne,
};
