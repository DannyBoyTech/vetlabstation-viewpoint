import { Fragment, PropsWithChildren, useState } from "react";
import styled from "styled-components";
import { ButtonGroup } from "@viewpoint/spot-react";

const StyledLabel = styled.label`
  flex: 1;
  justify-content: center;
  border-radius: 50%;
`;

const LabelRoot = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledButtonGroup = styled(ButtonGroup)`
  margin: 10px 3px 10px 3px;
`;

interface RunConfigToggleProps<T extends string> extends PropsWithChildren {
  toggleKeys: T[];
  onToggleChange: (toggleKey?: T) => void;
  selectedToggle?: T;
  getToggleLabel?: (toggleKey: T) => string;
}

export const TestId = {
  ToggleInput: (key: string) => `run-config-toggle-input-${key}`,
  ToggleLabel: (key: string) => `run-config-toggle-label-${key}`,
};

export function RunConfigToggle<T extends string>({
  ...props
}: RunConfigToggleProps<T>) {
  return (
    <div>
      <LabelRoot>
        <StyledButtonGroup withLines className="spot-button-group-toggle">
          {props.toggleKeys?.map((toggleKey) => (
            <Fragment key={toggleKey}>
              <input
                type="radio"
                checked={props.selectedToggle === toggleKey}
                readOnly
                data-testid={TestId.ToggleInput(toggleKey)}
              />
              <StyledLabel
                onClick={() => props.onToggleChange(toggleKey)}
                data-testid={TestId.ToggleLabel(toggleKey)}
              >
                {props.getToggleLabel?.(toggleKey) ?? toggleKey}
              </StyledLabel>
            </Fragment>
          ))}
        </StyledButtonGroup>
      </LabelRoot>
    </div>
  );
}
