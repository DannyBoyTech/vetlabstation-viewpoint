import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import SpotModal, { ModalProps } from "./Modal";
import {
  DefaultArgTypes,
  DefaultDecorator,
} from "../../storybook-utils/storybook-utils";
import { Button } from "../button";
import { SpotText } from "../typography";

export default {
  title: "spot-react/Modal",
  component: SpotModal,
  argTypes: DefaultArgTypes,
  decorators: [DefaultDecorator],
} as Meta;

const TestBed = () => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  return (
    <div>
      <SpotModal visible={open} onClose={onClose}>
        <SpotModal.Header onClose={onClose}>
          <SpotText level="h2" className="spot-modal__title">
            Hello!
          </SpotText>
        </SpotModal.Header>
        <SpotModal.Body>
          Now you can link a patient&apos;s diagnostic history between referral
          and referring clinics and share their results in real time to ensure
          both clinics have the most complete and recent information.
        </SpotModal.Body>
        <SpotModal.Footer>
          <SpotModal.FooterCancelButton onClick={onClose}>
            Cancel
          </SpotModal.FooterCancelButton>
          <Button>OK</Button>
        </SpotModal.Footer>
      </SpotModal>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
    </div>
  );
};

export const Modal: StoryFn<ModalProps> = (args) => <TestBed {...args} />;
