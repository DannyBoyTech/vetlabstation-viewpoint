import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Link } from "../link/Link";
import Button from "../button/Button";

import {
  SystemMessage,
  SystemMessageProps,
} from "./SystemMessageBase/SystemMessage";

import {
  ToastProvider,
  useToast,
  AddToastProps,
} from "./SystemMessageToast/Toast";
import { animationInOptions, animationOutOptions } from "./animations";

import { Banner, BannerProps } from "./SystemMessageBanner/Banner";

export default {
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  title: "spot-react/SystemMessage",
  args: {
    header: "Message Sent",
    alertLevel: "default",
    icon: "patient",
  },
  argTypes: {
    header: {
      control: "text",
    },
    size: {
      control: {
        type: "inline-radio",
        options: ["default", "large"],
      },
    },
    icon: {
      control: "text",
    },
    alertLevel: {
      control: {
        type: "inline-radio",
        options: ["default", "success", "warning", "danger"],
      },
    },
  },
} as Meta;

const toastArgTypes = {
  onDismiss: { action: "dismissed" },
  animationIn: {
    options: animationInOptions,
    control: {
      type: "inline-radio",
    },
  },
  animationOut: {
    options: animationOutOptions,
    control: {
      type: "inline-radio",
    },
  },
  location: {
    options: [
      "topLeft",
      "topRight",
      "bottomLeft",
      "bottomRight",
      "topCenter",
      "bottomCenter",
      "centerCenter",
    ],
    control: {
      type: "inline-radio",
    },
  },
  timer: {
    control: "number",
  },
  icon: {
    control: "text",
  },
  alertLevel: {
    options: ["default", "success", "warning", "danger"],
    control: {
      type: "inline-radio",
    },
  },
};

const SingleTemplate: StoryFn<SystemMessageProps> = (args) => (
  <SystemMessage {...args}>
    You&apos;ll recieve a response within 24hrs. <Link>Find out more</Link>
  </SystemMessage>
);
const WithButtonTemplate: StoryFn<SystemMessageProps> = (args) => (
  <SystemMessage {...args} style={{ width: 400 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingRight: 8,
      }}
    >
      <p>Message Text</p>
      <Button buttonType="primary" buttonSize="small">
        Small Button{" "}
      </Button>
    </div>
  </SystemMessage>
);

const ToastTemplate: StoryFn<AddToastProps> = (args) => {
  const { addToast } = useToast();

  const onClick = () => {
    addToast({
      ...args,
      content: (
        <div>
          You&apos;ll recieve a response within 24hrs.{" "}
          <Link>Find out more</Link>
        </div>
      ),
    });
  };

  return (
    <div className="stack center">
      <Button onClick={onClick}>Show Toast</Button>
    </div>
  );
};

const UpdateToastTemplate: StoryFn<AddToastProps> = (args) => {
  const [toastId, setToastId] = useState<string | undefined>(undefined);
  const { addToast } = useToast();

  const onClick = () => {
    const id = addToast({
      ...args,
      id: toastId,
      content: (
        <div>
          You&apos;ll recieve a response within 24hrs.{" "}
          <Link>Find out more</Link>
        </div>
      ),
    });
    setToastId(id);
  };

  return (
    <div className="stack center">
      <Button onClick={onClick}>Show Toast</Button>
    </div>
  );
};

const BannerTemplate: StoryFn<BannerProps> = (args) => {
  const [showBanner, setShowBanner] = useState(false);

  const onClick = () => {
    setShowBanner(true);
  };

  const onClose = () => {
    setShowBanner(false);
  };

  return (
    <div className="stack center">
      <Button onClick={onClick}>Show Banner</Button>
      {showBanner ? (
        <Banner {...args} onDismiss={onClose}>
          You&apos;ll recieve a response within 24hrs.
        </Banner>
      ) : null}
    </div>
  );
};

export const SystemMessageIndividual = SingleTemplate.bind({});

export const WithButton = WithButtonTemplate.bind({});
WithButton.args = {
  header: undefined,
};
export const WithOnDismiss = SingleTemplate.bind({});
WithOnDismiss.argTypes = {
  onDismiss: { action: "dismissed" },
};

export const Toast = ToastTemplate.bind({});
Toast.args = {
  location: "topRight",
};
Toast.argTypes = toastArgTypes;

export const UpdateSameToast = UpdateToastTemplate.bind({});
UpdateSameToast.args = {
  location: "topRight",
};

export const BannerComponent = BannerTemplate.bind({});
BannerComponent.args = {
  location: "bottom",
  header: undefined,
};
BannerComponent.argTypes = {
  location: {
    control: {
      type: "inline-radio",
      options: ["top", "bottom"],
    },
  },
  animationIn: {
    options: animationInOptions,
    control: {
      type: "inline-radio",
    },
  },
  animationOut: {
    options: animationOutOptions,
    control: {
      type: "inline-radio",
    },
  },
};
