import { Meta, StoryFn } from "@storybook/react";
import {
  DilutionSelector as DilutionSelectorComponent,
  DilutionSelectorProps,
} from "./DilutionSelector";
import { DilutionTypeEnum } from "@viewpoint/api";

const meta: Meta = {
  title: "viewpoint/Run Config",
  component: DilutionSelectorComponent,
};
export default meta;

export const DilutionSelector: StoryFn<DilutionSelectorProps> = (args) => (
  <div style={{ maxWidth: "300px" }}>
    <DilutionSelectorComponent {...args} />
  </div>
);

DilutionSelector.args = {
  totalParts: 20,
  dilutionType: DilutionTypeEnum.AUTOMATIC,
  partsDiluentConfig: {
    [DilutionTypeEnum.AUTOMATIC]: [1, 2, 5, 10, 20],
    [DilutionTypeEnum.MANUAL]: Array.from({ length: 20 }, (_, i) => i + 1),
    defaultType: DilutionTypeEnum.AUTOMATIC,
  },
};
