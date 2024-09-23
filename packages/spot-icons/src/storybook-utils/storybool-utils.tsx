import React from "react";

export const DefaultDecorator = (Story: any, context: any) => (
  <div
    className={
      context.args.spotParent && context.args.spotParent !== "none"
        ? `spot-container--${context.args.spotParent}-primary`
        : ""
    }
    style={{ backgroundColor: "transparent" }}
  >
    <Story />
  </div>
);

// If this ever gets implemented, look into moving this into the preview.js config: https://github.com/storybookjs/storybook/issues/11697
export const DefaultArgTypes = Object.freeze({
  spotParent: {
    name: "Render in Spot parent",
    defaultValue: "light",
    options: ["light", "dark", "none"],
    control: { type: "select" },
    type: {
      name: "string",
      required: true,
    },
    description:
      "This is not a property of the component -- setting this to true will render the component inside a Spot dark mode container",
  },
});
