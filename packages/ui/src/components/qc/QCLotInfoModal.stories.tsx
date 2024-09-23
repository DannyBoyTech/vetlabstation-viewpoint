import { Meta, StoryFn } from "@storybook/react";
import {
  QCLotInfoModal as Component,
  QCLotInfoModalProps,
} from "./QCLotInfoModal";
import { CatalystQualityControlLotDto, InstrumentType } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/QC/QC Lot Info Modal",
  component: Component,
};
export default meta;

const SlideOutTemplate: StoryFn<QCLotInfoModalProps> = (args) => (
  <Component {...args} />
);

export const QCLotInfoModal = SlideOutTemplate.bind({});

const qualityControl: CatalystQualityControlLotDto = {
  id: 1,
  instrumentType: InstrumentType.CatalystDx,
  lotNumber: "G2506",
  enabled: true,
  canRun: true,
  qcReferenceRangeDtos: [],
  calibrationVersion: "10.16",
  controlType: "VetTrol",
};

const args: Omit<QCLotInfoModalProps, "onViewResults" | "onClose"> = {
  instrumentType: InstrumentType.CatalystDx,
  qualityControl,
  open: false,
};

QCLotInfoModal.args = args;
