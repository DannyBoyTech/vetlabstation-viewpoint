import { Meta, StoryFn } from "@storybook/react";
import {
  CustomizableDropdown as Component,
  CustomizableDropdownProps,
} from "./CustomizableDropdown";
import { Checkbox } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useState } from "@storybook/preview-api";

const meta: Meta = {
  title: "viewpoint/CustomizableDropdown",
  component: Component,
};
export default meta;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: nowrap;
  max-height: 150px;
  text-overflow: ellipsis;

  .spot-form__checkbox {
    margin: 10px;
  }
`;

const Options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"];
const Template: StoryFn<CustomizableDropdownProps> = (args) => {
  const [checked, setChecked] = useState<string | undefined>(undefined);
  return (
    <div style={{ maxWidth: "300px" }}>
      <Component {...args}>
        <ContentWrapper>
          {Options.map((option) => (
            <div key={option}>
              <Checkbox
                label={option}
                onChange={(ev) =>
                  setChecked(ev.target.checked ? option : undefined)
                }
                checked={checked === option}
              />
            </div>
          ))}
        </ContentWrapper>
      </Component>
    </div>
  );
};

export const CustomizableDropdown = Template.bind({});
CustomizableDropdown.args = {
  headerContent: "Open me",
};
