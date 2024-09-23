import { Meta, StoryFn } from "@storybook/react";
import { SpotText, Button } from "@viewpoint/spot-react";
import {
  SlideOut as SlideOutComponent,
  SlideOutProps,
  useOpenStateForSlideout,
} from "./SlideOut";
import { useState } from "@storybook/preview-api";

const meta: Meta = {
  title: "viewpoint/SlideOut",
  component: SlideOutComponent,
};
export default meta;

const SlideOutTemplate: StoryFn<SlideOutProps> = ({ open, ...args }) => {
  const [isOpen, setIsOpen] = useOpenStateForSlideout(open);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open me</Button>
      <SlideOutComponent
        {...args}
        open={isOpen}
        onTapShade={() => setIsOpen(false)}
      >
        <div
          style={{
            backgroundColor: "white",
            height: "100%",
            border: "1px solid gray",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SpotText level="h3">This is a slide out</SpotText>
        </div>
      </SlideOutComponent>
    </div>
  );
};

export const SlideOut = SlideOutTemplate.bind({});
