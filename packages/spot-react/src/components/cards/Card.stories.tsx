import React from "react";
import docPic from "../../../../../.storybook/assets/image.png";
import { Meta, StoryFn } from "@storybook/react";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderProps,
  CardProps,
  CardFooter,
  CardFooterProps,
  ALIGNMENT_OPTIONS,
  CardImageProps,
  CardImage,
} from "./Card";

export default {
  title: "spot-react/Card",
  component: Card,
  args: {},
  argTypes: {
    variant: {
      control: {
        type: "inline-radio",
        options: ["primary", "secondary"],
      },
    },
    isInteractive: {
      control: "boolean",
    },
  },
} as Meta;

const BasicCardTemplate: StoryFn<CardProps> = (args) => (
  <Card {...args}>
    <CardBody>Basic Card</CardBody>
  </Card>
);

type WithImageTemplateProps = CardProps & CardImageProps;
const WithImageTemplate: StoryFn<WithImageTemplateProps> = ({
  hasFrame,
  ...args
}) => (
  <div style={{ width: "60ch" }}>
    <Card {...args}>
      <CardImage src={docPic} alt="" hasFrame={hasFrame}>
        <div className="spot-typography__heading--level-3">Text Overlay</div>
      </CardImage>
      <CardBody>
        Content - may contain text, form fields, tables, list groups, etc from
        SPOT
      </CardBody>
    </Card>
  </div>
);

type HeaderTemplateProps = CardHeaderProps & CardProps;
const HeaderTemplate: StoryFn<HeaderTemplateProps> = ({
  addContrast,
  noBorder,
  ...args
}) => (
  <Card {...args}>
    <CardHeader addContrast={addContrast} noBorder={noBorder}>
      <h3 className="spot-typography__heading--level-3">Header</h3>
    </CardHeader>
    <CardBody>Card Body</CardBody>
  </Card>
);

type FooterTemplateProps = CardFooterProps & CardProps;
const FooterTemplate: StoryFn<FooterTemplateProps> = ({
  addContrast,
  noBorder,
  ...args
}) => (
  <Card {...args}>
    <CardBody>Card Body</CardBody>
    <CardFooter addContrast={addContrast} noBorder={noBorder}>
      <div className="spot-typography__text--secondary">Footer</div>
    </CardFooter>
  </Card>
);

type HeaderFooterTemplateProps = CardFooterProps & CardProps;
const HeaderFooterTemplate: StoryFn<HeaderFooterTemplateProps> = ({
  addContrast,
  noBorder,
  ...args
}) => (
  <Card {...args}>
    <CardHeader addContrast={addContrast} noBorder={noBorder}>
      <h3 className="spot-typography__heading--level-3">Header</h3>
    </CardHeader>
    <CardBody>Card Body</CardBody>
    <CardFooter addContrast={addContrast} noBorder={noBorder}>
      <div className="spot-typography__text--secondary">Footer</div>
    </CardFooter>
  </Card>
);

type DismissableTemplateProps = CardFooterProps & CardProps;
const DismissableTemplate: StoryFn<DismissableTemplateProps> = ({
  addContrast,
  noBorder,
  ...args
}) => (
  <Card {...args} dismissible>
    <CardHeader addContrast={addContrast} noBorder={noBorder}>
      <h3 className="spot-typography__heading--level-3">Header</h3>
    </CardHeader>
    <CardBody>Card Body</CardBody>
    <CardFooter addContrast={addContrast} noBorder={noBorder}>
      <div className="spot-typography__text--secondary">Footer</div>
    </CardFooter>
  </Card>
);

type AlignmentTemplateProps = CardFooterProps & CardProps;
const AlignmentTemplate: StoryFn<AlignmentTemplateProps> = ({ alignment }) => (
  <div style={{ width: "60ch" }}>
    <Card>
      <CardHeader alignment={alignment} style={{ height: 150 }}>
        <h3 className="spot-typography__heading--level-3">Header</h3>
      </CardHeader>
      <CardImage src={docPic} alt="" alignment={alignment}>
        <div className="spot-typography__heading--level-3">
          Text Overlay - {alignment}
        </div>
      </CardImage>
      <CardBody alignment={alignment} style={{ height: 150 }}>
        Card Body
      </CardBody>
      <CardFooter alignment={alignment} style={{ height: 150 }}>
        <div className="spot-typography__text--secondary">Footer</div>
      </CardFooter>
    </Card>
  </div>
);

export const BasicCard = BasicCardTemplate.bind({});

export const WithImage = WithImageTemplate.bind({});
WithImage.argTypes = {
  hasFrame: { control: "boolean" },
};

export const CardWithHeader = HeaderTemplate.bind({});
CardWithHeader.argTypes = {
  addContrast: {
    control: "boolean",
  },
  noBorder: {
    control: "boolean",
  },
};

export const CardWithFooter = FooterTemplate.bind({});
CardWithHeader.argTypes = {
  addContrast: {
    control: "boolean",
  },
  noBorder: {
    control: "boolean",
  },
};

export const CardWithHeaderAndFooter = HeaderFooterTemplate.bind({});
CardWithHeaderAndFooter.argTypes = {
  addContrast: {
    control: "boolean",
  },
  noBorder: {
    control: "boolean",
  },
};

export const DismissableCard = DismissableTemplate.bind({});
DismissableCard.argTypes = {
  addContrast: {
    control: "boolean",
  },
  noBorder: {
    control: "boolean",
  },
  onDismiss: {
    action: "dismissed",
  },
};
export const AlignContent = AlignmentTemplate.bind({});
AlignContent.argTypes = {
  alignment: {
    control: {
      type: "inline-radio",
      options: ALIGNMENT_OPTIONS,
    },
  },
  variant: {
    control: false,
  },
  isInteractive: {
    control: false,
  },
};
