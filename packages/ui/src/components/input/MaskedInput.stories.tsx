import { Meta, StoryFn } from "@storybook/react";
import { MaskedInput as Component, MaskedInputProps } from "./MaskedInput";
import { IMaskInputProps } from "react-imask/esm/mixin";

const meta: Meta = {
  title: "viewpoint/Inputs",
  component: Component,
};
export default meta;

type Props = IMaskInputProps & MaskedInputProps;

const Template: StoryFn<Props> = (args) => {
  return (
    <div style={{ maxWidth: "300px" }}>
      <Component {...args} />
    </div>
  );
};

export const MaskedInput = Template.bind({});
MaskedInput.args = {
  mask: "{1.\\0}00",
  prefix: "1.0",
  placeholder: "1.0__",
};
