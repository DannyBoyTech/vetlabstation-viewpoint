import { Radio, SpotText } from "@viewpoint/spot-react";
import { ChangeEvent, ReactNode } from "react";
import styled from "styled-components";

const RadioTristateRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export interface RadioTristateProps {
  ["data-testid"]?: string;
  label: ReactNode;
  trueLabel: ReactNode;
  falseLabel: ReactNode;
  value: boolean | undefined;
  onChange?: (value: boolean) => void;
}

/**
 * A tri-state (the third state being undefined) boolean input that leverages
 * radio buttons.
 */
export function RadioTristate(props: RadioTristateProps) {
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const value =
      ev.target.value === "true"
        ? true
        : ev.target.value === "false"
        ? false
        : undefined;

    if (value !== undefined) {
      props.onChange?.(value);
    }
  };

  return (
    <RadioTristateRoot data-testid={props["data-testid"]}>
      <SpotText level="h4">{props.label}</SpotText>
      <form>
        <Radio
          small
          name="val"
          label={props.trueLabel}
          checked={props.value === true}
          value="true"
          onChange={handleChange}
        />
        <Radio
          small
          name="val"
          label={props.falseLabel}
          checked={props.value === false}
          value="false"
          onChange={handleChange}
        />
      </form>
    </RadioTristateRoot>
  );
}
