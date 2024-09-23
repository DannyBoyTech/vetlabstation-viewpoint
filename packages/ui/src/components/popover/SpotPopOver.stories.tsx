import { Meta, StoryFn } from "@storybook/react";
import { SpotPopover as SpotPopoverComponent, PopoverProps } from "./Popover";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useState } from "@storybook/preview-api";
import { useRef } from "react";

const meta: Meta = {
  title: "viewpoint/Popover",
  component: SpotPopoverComponent,
  parameters: {
    layout: "centered",
  },
};
export default meta;

const PopoverTemplate: StoryFn<PopoverProps> = (args) => {
  const anchor = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button innerRef={anchor} onClick={() => setOpen(!open)}>
        Click me to open!
      </Button>

      {open && (
        <SpotPopoverComponent anchor={anchor.current} {...args}>
          <div className="spot-di__content">
            <div className="spot-di__content-profile">
              <SpotText level="secondary">Item One</SpotText>
            </div>
            <div className="spot-di__content-profile">
              <SpotText level="secondary">Item Two</SpotText>
            </div>
            <div className="spot-di__content-profile">
              <SpotText level="secondary">Item Three</SpotText>
            </div>
            <div className="spot-di__content-profile">
              <SpotText level="secondary">Item Four</SpotText>
            </div>
          </div>
        </SpotPopoverComponent>
      )}
    </>
  );
};

export const SpotPopover = PopoverTemplate.bind({});
const args: Omit<PopoverProps, "anchorTo"> = {
  popFrom: "bottom",
  offsetTo: "left",
};
SpotPopover.args = args;
