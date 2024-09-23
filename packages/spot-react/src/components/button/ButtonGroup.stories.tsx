import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import ButtonGroup, { ButtonGroupProps } from "./ButtonGroup";
import Button from "./Button";

export default {
  title: "spot-react/Buttons/ButtonGroup",
  component: ButtonGroup,
  args: {
    withLines: false,
    disabled: false,
    variant: "default",
  },
  argTypes: {
    as: {
      options: ["div", "span", "nav"],
      control: {
        type: "radio",
      },
    },
    variant: {
      options: ["default", "toggle"],
      control: {
        type: "radio",
      },
    },
    disabled: {
      control: {
        type: "boolean",
      },
    },
    withLines: {
      control: {
        type: "boolean",
      },
    },
  },
} as Meta;

const SingleTemplate: StoryFn<ButtonGroupProps> = (args) => (
  <ButtonGroup {...args}>
    <Button buttonType="secondary">PDF</Button>
    <Button buttonType="secondary">Doc</Button>
    <Button buttonType="secondary">Image</Button>
  </ButtonGroup>
);

const WithIconsTemplate: StoryFn<ButtonGroupProps> = (args) => (
  <ButtonGroup {...args}>
    <Button leftIcon="file-pdf" buttonType="secondary">
      PDF
    </Button>
    <Button leftIcon="document" buttonType="secondary">
      Doc
    </Button>
    <Button leftIcon="image" buttonType="secondary">
      Image
    </Button>
  </ButtonGroup>
);

const ToggleVariantTemplate: StoryFn<ButtonGroupProps> = (args) => (
  <ButtonGroup {...args} variant="toggle">
    <input type="radio" id="left" name="id-64277" />
    <label htmlFor="left"> Left </label>
    <input type="radio" id="middle" name="id-64277" />
    <label htmlFor="middle"> Middle </label>
    <input type="radio" id="right" name="id-64277" />
    <label htmlFor="right"> Right </label>
  </ButtonGroup>
);

export const ButtonGroupComponent = SingleTemplate.bind({});
export const WithIcons = WithIconsTemplate.bind({});

export const ToggleVariant = ToggleVariantTemplate.bind({});

ToggleVariant.argTypes = {
  variant: {
    control: "none",
  },
};
