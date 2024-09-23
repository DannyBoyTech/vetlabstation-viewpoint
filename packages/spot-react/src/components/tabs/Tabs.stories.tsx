import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import SpotTabs, { TabWrapperProps } from "./Tabs";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";

export default {
  title: "spot-react/Tabs",
  component: SpotTabs,
  argTypes: DefaultArgTypes,
  decorators: [DefaultDecorator],
  parameters: {
    layout: "padded",
  },
} as Meta;

interface AddedArgs extends TabWrapperProps {
  withIcons: boolean;
}

export const Tabs: StoryFn<AddedArgs> = ({ withIcons, ...args }) => {
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  return (
    <div
      style={{
        alignItems: "flex-start",
        justifyContent: "flex-start",
        maxWidth: args.scrollable ? undefined : undefined,
        display: "flex",
        overflowY: "hidden",
        height: args.scrollableContent ? "400px" : undefined,
      }}
    >
      <SpotTabs {...args}>
        <SpotTabs.TabBar scrollable={args.scrollable}>
          <SpotTabs.Tab
            active={selectedTab === 0}
            onClick={() => setSelectedTab(0)}
            iconName={withIcons ? "home" : undefined}
          >
            This is Tab 1
          </SpotTabs.Tab>
          <SpotTabs.Tab
            active={selectedTab === 1}
            onClick={() => setSelectedTab(1)}
            iconName={withIcons ? "patient" : undefined}
          >
            This is Tab 2
          </SpotTabs.Tab>
          <SpotTabs.Tab
            active={selectedTab === 2}
            onClick={() => setSelectedTab(2)}
            iconName={withIcons ? "settings" : undefined}
          >
            This is Tab 3
          </SpotTabs.Tab>
          {args.scrollable && (
            <>
              <SpotTabs.Tab
                active={selectedTab === 4}
                onClick={() => setSelectedTab(4)}
                iconName={withIcons ? "home" : undefined}
              >
                Long Tab 4
              </SpotTabs.Tab>
              <SpotTabs.Tab
                active={selectedTab === 5}
                onClick={() => setSelectedTab(5)}
                iconName={withIcons ? "patient" : undefined}
              >
                Long Tab 5
              </SpotTabs.Tab>
              <SpotTabs.Tab
                active={selectedTab === 6}
                onClick={() => setSelectedTab(6)}
                iconName={withIcons ? "settings" : undefined}
              >
                Long Tab 6
              </SpotTabs.Tab>
            </>
          )}
        </SpotTabs.TabBar>
        {selectedTab === 0 && (
          <SpotTabs.Content>
            <div className="spot-long-form-text">
              <h2>Tab 1 Content</h2>
              {new Array(100).fill(
                <div>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Possimus doloribus aliquid, omnis. Autem nulla accusantium,
                    laboriosam ab dicta esse natus laborum, tempora perspiciatis
                    numquam, dolorum alias laudantium unde iusto animi?
                  </p>
                  <p>
                    Possimus doloribus aliquid, omnis. Autem nulla accusantium,
                    laboriosam ab dicta esse natus laborum, tempora perspiciatis
                    numquam, dolorum alias laudantium unde iusto animi?
                  </p>
                  <p>
                    Autem nulla accusantium, laboriosam ab dicta esse natus
                    laborum, tempora perspiciatis numquam, dolorum alias
                    laudantium unde iusto animi?
                  </p>
                </div>
              )}
              <p></p>
            </div>
          </SpotTabs.Content>
        )}
        {selectedTab === 1 && (
          <SpotTabs.Content>
            <div className="spot-long-form-text">
              <h2>Tab 2 Content</h2>
              <p>
                Possimus doloribus aliquid, omnis. Autem nulla accusantium,
                laboriosam ab dicta esse natus laborum, tempora perspiciatis
                numquam, dolorum alias laudantium unde iusto animi?
              </p>
            </div>
          </SpotTabs.Content>
        )}
        {selectedTab === 2 && (
          <SpotTabs.Content>
            <div className="spot-long-form-text">
              <h2>Tab 3 Content</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Possimus doloribus aliquid, omnis. Autem nulla accusantium,
                laboriosam ab dicta esse natus laborum, tempora perspiciatis
                numquam, dolorum alias laudantium unde iusto animi?
              </p>
            </div>
          </SpotTabs.Content>
        )}
      </SpotTabs>
    </div>
  );
};

Tabs.args = {
  withIcons: false,
};
