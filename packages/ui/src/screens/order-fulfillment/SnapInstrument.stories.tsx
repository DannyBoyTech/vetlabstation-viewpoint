import { Meta, StoryFn } from "@storybook/react";
import {
  SelectableInstrument as Component,
  SelectableInstrumentProps,
} from "./SelectableInstrument";
import {
  InstrumentStatus,
  InstrumentType,
  SettingTypeEnum,
  SnapDeviceDto,
  SnapResultTypeEnum,
} from "@viewpoint/api";
import { useState } from "@storybook/preview-api";
import { SnapConfig } from "../../components/run-configurations/SnapConfig";
import { randomInstrumentDto } from "@viewpoint/test-utils";
import { useEffect } from "react";

const meta: Meta = {
  title: "viewpoint/AnalyzerCard",
  component: Component,
  argTypes: {
    className: {
      table: { disable: true },
    },
    type: {
      defaultValue: InstrumentType.SNAP,
    },
    status: {
      defaultValue: InstrumentStatus.Ready,
    },
    manualInstrument: {
      defaultValue: true,
    },
    selected: {
      defaultValue: false,
    },
    availableSnaps: {
      defaultValue: [
        {
          snapDeviceId: 1,
          displayNamePropertyKey: "Instrument.Snap.Canine.4DxPlus",
        },
        {
          snapDeviceId: 2,
          displayNamePropertyKey: "Instrument.Snap.Canine.cPL",
        },
        {
          snapDeviceId: 3,
          displayNamePropertyKey: "Instrument.Snap.Canine.Giardia",
        },
        {
          snapDeviceId: 4,
          displayNamePropertyKey: "Instrument.Snap.Canine.Lepto",
        },
        {
          snapDeviceId: 5,
          displayNamePropertyKey: "Instrument.Snap.Canine.Parvo",
        },
      ],
    },
  },
};
export default meta;

const SnapTemplate: StoryFn<
  SelectableInstrumentProps & { availableSnaps: SnapDeviceDto[] }
> = ({ availableSnaps, ...args }) => {
  const [open, setOpen] = useState(args.selected);
  const [snapIds, setSnapIds] = useState<number[]>([]);

  useEffect(() => {
    setOpen(args.selected);
  }, [args.selected]);

  return (
    <div style={{ maxWidth: "25em" }}>
      <Component
        {...args}
        selected={open}
        onAdd={() => setOpen(true)}
        onRemove={() => setOpen(false)}
      >
        <SnapConfig
          onSelectionsChanged={(ids) => setSnapIds(ids)}
          selectedSnapDeviceIds={snapIds}
          availableSnaps={availableSnaps}
        />
      </Component>
    </div>
  );
};

const snapInstrumentDto = randomInstrumentDto({
  instrumentType: InstrumentType.SNAP,
  manualEntry: true,
});
export const SnapInstrument = SnapTemplate.bind({});
SnapInstrument.args = {
  type: InstrumentType.SNAP,
  status: InstrumentStatus.Ready,
  availableSnaps: [
    {
      snapDeviceId: 1,
      displayNamePropertyKey: "Instrument.Snap.Canine.4DxPlus",
      settingType: SettingTypeEnum.SNAP_CANINE4DXPLUS,
      snapResultTypes: [SnapResultTypeEnum.CANINE_4DX_PLUS_NEGATIVE],
      instrumentDto: snapInstrumentDto,
    },
    {
      snapDeviceId: 2,
      displayNamePropertyKey: "Instrument.Snap.Canine.cPL",
      settingType: SettingTypeEnum.SNAP_CANINECPL,
      snapResultTypes: [SnapResultTypeEnum.CANINE_4DX_PLUS_NEGATIVE],
      instrumentDto: snapInstrumentDto,
    },
    {
      snapDeviceId: 3,
      displayNamePropertyKey: "Instrument.Snap.Canine.Parvo",
      settingType: SettingTypeEnum.SNAP_CANINEPARVO,
      snapResultTypes: [SnapResultTypeEnum.CANINE_4DX_PLUS_NEGATIVE],
      instrumentDto: snapInstrumentDto,
    },
  ],
};
