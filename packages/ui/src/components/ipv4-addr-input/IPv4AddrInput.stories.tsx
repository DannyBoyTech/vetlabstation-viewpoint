import { Meta, StoryFn } from "@storybook/react";
import {
  IPv4AddrInput as Component,
  IPv4AddrInputProps,
} from "./IPv4AddrInput";
import { useEffect, useState } from "react";

const meta: Meta = {
  title: "viewpoint/IPv4AddrInput",
  component: Component,
};
export default meta;

const Usage = (props: any) => {
  const [value, setValue] = useState<string>();

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return <Component {...props} value={value} onAddrChange={setValue} />;
};

const Template: StoryFn<IPv4AddrInputProps> = (args) => <Usage {...args} />;

export const IPv4AddrInput = Template.bind({});
IPv4AddrInput.storyName = "IPv4 Address Input";
IPv4AddrInput.args = {
  value: "123",
  disabled: true,
};
