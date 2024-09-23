import { Meta, StoryFn } from "@storybook/react";
import { SpotIcon } from "@viewpoint/spot-icons";
import React from "react";
import { BadgeGroup } from "../badges/BadgeGroup";
import { DigitalIdentity } from "../digital-identity/DigitalIdentity";
import { Header as Component, HeaderProps } from "./Header";
import { NavItem, NavItems } from "./NavItems";
import { ProductName } from "./ProductName";

const meta: Meta = {
  title: "spot-react/Header",
  component: Component,
  argTypes: {
    logo: {
      table: { disable: true },
    },
    productName: {
      table: { disable: true },
    },
    rightContent: {
      table: { disable: true },
    },
    centerContent: {
      table: { disable: true },
    },
    optionalContent: {
      table: { disable: true },
    },
    leftContent: {
      table: { disable: true },
    },
  },
};
export default meta;

const Template: StoryFn<HeaderProps> = (args) => <Component {...args} />;

export const Header = Template.bind({});

Header.args = {
  headerType: "normal",
  leftAligned: true,
  fluid: true,
  leftContent: (
    <>
      <ProductName>VetLab Station</ProductName>
    </>
  ),
  centerContent: (
    <>
      <NavItems navType="global-icons">
        <NavItem>
          <BadgeGroup color="red" visible={true}>
            <SpotIcon name="bell" color="#33bfcc" size="1.4em" />
          </BadgeGroup>
        </NavItem>
      </NavItems>
    </>
  ),
  rightContent: (
    <>
      <NavItems>
        <NavItem>
          <DigitalIdentity name="Johnny Appleseed" />
        </NavItem>
      </NavItems>
    </>
  ),
};
