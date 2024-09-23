import { Meta, StoryFn } from "@storybook/react";
import {
  QCResultsModal as QCResultsModalComponent,
  QCResultsModalProps,
} from "./QCResultsModal";
import { CatalystQualityControlLotDto, InstrumentType } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/QC/QC Results Modal",
  component: QCResultsModalComponent,
};
export default meta;

const SlideOutTemplate: StoryFn<QCResultsModalProps> = (args) => (
  <QCResultsModalComponent {...args} />
);

export const QCResultsModal = SlideOutTemplate.bind({});

const qualityControl: CatalystQualityControlLotDto = {
  id: 1,
  instrumentType: InstrumentType.CatalystOne,
  lotNumber: "G2506",
  enabled: true,
  canRun: true,
  qcReferenceRangeDtos: [],
  calibrationVersion: "10.16",
  controlType: "VetTrol",
};

const args: Omit<QCResultsModalProps, "onViewResults" | "onClose"> = {
  visible: false,
  instrumentId: 5,
  instrumentSerialNumber: "catone0",
  instrumentType: InstrumentType.CatalystOne,
  qualityControl,
};

QCResultsModal.args = args;
