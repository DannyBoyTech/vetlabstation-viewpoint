import { Meta, StoryFn } from "@storybook/react";
import { Header as HeaderComponent, HeaderProps } from "./Header";

const meta: Meta = {
  title: "viewpoint/Header",
  component: HeaderComponent,
};
export default meta;

const HeaderTemplate: StoryFn<HeaderProps> = (args) => (
  <HeaderComponent {...args} />
);
export const Header = HeaderTemplate.bind({});
