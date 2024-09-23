import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import SpotSignInBox from "./SignInBox";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";
import { SpotIcon } from "@viewpoint/spot-icons";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";

export default {
  title: "spot-react/Sign In Box",
  component: SpotSignInBox,
  argTypes: {
    ...DefaultArgTypes,
    registerText: {
      name: "Register text",
      defaultValue: "Register",
      type: {
        name: "string",
      },
    },
    forgotPasswordText: {
      name: "Forgot Password text",
      defaultValue: "Forgot your password?",
      type: {
        name: "string",
      },
    },
    helpText: {
      name: "Help text",
      defaultValue: "Help",
      type: {
        name: "string",
      },
    },
    buttonText: {
      name: "Button Text",
      defaultValue: "Sign In",
      type: {
        name: "string",
      },
    },
    onSignIn: {
      action: "event",
    },
    iconColor: {
      name: "Color of the header icon",
      type: {
        name: "string",
      },
    },
    errorMessage: {
      name: "Error message to display",
      type: {
        name: "string",
      },
    },
    iconName: {
      name: "Spot icon to use in the header",
      options: ["home", "help", "add"],
      type: {
        name: "option",
      },
    },
    buttonDisabled: {
      name: "Disable the sign in button",
      defaultValue: false,
      type: {
        name: "boolean",
      },
    },
    inputDisabled: {
      name: "Disable the inputs",
      defaultValue: false,
      type: {
        name: "boolean",
      },
    },
    showSpinner: {
      name: "Show spinner icon",
      defaultValue: false,
      type: {
        name: "boolean",
      },
    },
  },
  decorators: [DefaultDecorator],
} as Meta;

export interface SignInBoxProps {
  registerText: string;
  forgotPasswordText: string;
  helpText: string;
  buttonText: string;
  onSignIn: (creds: { username: string; password: string }) => void;
  iconName?: SpotIconName;
  iconColor?: string;
  buttonDisabled?: boolean;
  inputDisabled?: boolean;
  errorMessage?: string;
  showSpinner?: boolean;
}

export const SignInBox: StoryFn<SignInBoxProps> = (props) => {
  return (
    <SpotSignInBox>
      {props.iconName ? (
        <SpotSignInBox.Header>
          <SpotIcon
            name={props.iconName}
            color={props.iconColor}
            size={"50%"}
          />
        </SpotSignInBox.Header>
      ) : (
        <SpotSignInBox.DefaultHeader />
      )}
      <SpotSignInBox.Content
        buttonText={props.buttonText}
        onSignIn={props.onSignIn}
        buttonDisabled={props.buttonDisabled}
        inputDisabled={props.inputDisabled}
        errorMessage={props.errorMessage}
        showSpinner={props.showSpinner}
      />
      <SpotSignInBox.DefaultFooter
        registerText={props.registerText}
        helpText={props.helpText}
        forgotPasswordText={props.forgotPasswordText}
      />
    </SpotSignInBox>
  );
};
