import { Meta, StoryFn } from "@storybook/react";
import { Failure as Component, FailureProps } from "./Failure";
import styled from "styled-components";

const meta: Meta = {
  title: "viewpoint/Failure",
  component: Component,
};

const Container = styled.div`
  height: 50vh;
  width: 50vw;
  outline: 1px solid black;
`;

const Template: StoryFn<FailureProps> = (args) => (
  <Container>
    <Component {...args} />
  </Container>
);

const Failure = Template.bind({});

export default meta;
export { Failure };
