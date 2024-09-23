import { Meta, StoryObj } from "@storybook/react";
import { Collapse as CollapseComp } from "./Collapse";

const meta: Meta<typeof CollapseComp> = {
  title: "viewpoint/Collapse",
  component: CollapseComp,
};
export default meta;

type Story = StoryObj<typeof CollapseComp>;

export const Collapse: Story = {
  args: {
    expanded: true,
    expandDuration: 1_000,
    mountOnExpand: false,
    unmountOnCollapse: false,
  },
  argTypes: {
    onCollapsed: { action: "onCollapsed" },
    onExpanded: { action: "onExpanded" },
  },
  render: (args) => (
    <>
      <div>--content above collapse--</div>
      <CollapseComp {...args}>
        <>
          <div style={{ border: "1px solid black", borderRadius: "8px" }}>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magnam, ab
            consequuntur! Eos suscipit inventore voluptatibus exercitationem
            natus ipsa illum facilis deserunt consectetur similique, quam est
            voluptatum fugiat corporis. Est aliquid voluptas dolorem sint dolor
            consequatur consequuntur, quas nemo, alias ut, quibusdam optio sequi
            reiciendis quasi ducimus quod eius repellendus totam?
          </div>
        </>
      </CollapseComp>
      <div>--content below collapse--</div>
    </>
  ),
};
