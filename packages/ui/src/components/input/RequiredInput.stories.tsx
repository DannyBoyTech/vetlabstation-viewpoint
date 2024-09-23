import { Meta, StoryFn } from "@storybook/react";
import {
  RequiredInput as Component,
  RequiredInputProps,
} from "./RequiredInput";
import { Input } from "@viewpoint/spot-react";

const meta: Meta = {
  title: "viewpoint/Inputs",
  component: Component,
};
export default meta;

const Template: StoryFn<RequiredInputProps> = (args) => {
  return (
    <div style={{ maxWidth: "300px" }}>
      <Component {...args}>
        <Input />
      </Component>
    </div>
  );
};

export const RequiredInput = Template.bind({});
RequiredInput.args = {
  errorText: "Uh oh",
  error: false,
};
