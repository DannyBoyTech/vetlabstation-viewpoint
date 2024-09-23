import { Meta, StoryFn } from "@storybook/react";
import { Popover as PopoverComponent, PopoverProps } from "./Popover";
import { Button, Checkbox, SpotText } from "@viewpoint/spot-react";
import { useContext, useRef, useState } from "react";
import { ViewpointThemeContext } from "../../context/ThemeContext";

const meta: Meta = {
  title: "viewpoint/Popover",
  component: PopoverComponent,
  parameters: {
    layout: "centered",
  },
  args: {
    anchorTo: {
      defaultValue: "left",
    },
    fitWidth: {
      defaultValue: true,
    },
  },
};
export default meta;

const UsableComponent = (args: PopoverProps) => {
  const anchor = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const { theme } = useContext(ViewpointThemeContext);
  return (
    <>
      <Button innerRef={anchor} onClick={() => setOpen(!open)}>
        Click me to open!
      </Button>

      {open && (
        <PopoverComponent anchor={anchor.current} {...args}>
          <div
            style={{
              backgroundColor: theme.colors?.background?.primary,
              border: theme.borders?.controlFocus,
              flex: "0 0 100%",
              padding: "10px",
            }}
          >
            <Checkbox label="Option 1" />
            <Checkbox label="Option 2" />
            <Checkbox label="Option 3" />
            <Checkbox label="Option 4" />
          </div>
        </PopoverComponent>
      )}

      <SpotText level="secondary" style={{ marginTop: "20px" }}>
        This text will be covered by the popover
      </SpotText>
    </>
  );
};

const PopoverTemplate: StoryFn<PopoverProps> = (args) => (
  <UsableComponent {...args} />
);

export const Popover = PopoverTemplate.bind({});
const args: Omit<PopoverProps, "anchorTo"> = {};
Popover.args = args;
