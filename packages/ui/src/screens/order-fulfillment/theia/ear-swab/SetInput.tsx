import { Checkbox, SpotText } from "@viewpoint/spot-react";
import { ChangeEvent, ReactNode } from "react";
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export interface SetInputProps<T extends string> {
  choices?: Set<T>;
  label?: ReactNode;
  value?: Set<T>;

  renderValueLabel?: (value: T) => ReactNode;
  onChange?: (value: Set<T>) => void;
}

export function SetInput<T extends string>(props: SetInputProps<T>) {
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const next = new Set(props.value ?? []);

    if (props.choices?.has(ev.target.name as T)) {
      const choice: T = ev.target.name as T;

      if (ev.target.checked) {
        next.add(choice);
      } else {
        next.delete(choice);
      }
    }

    props.onChange?.(next);
  };

  return (
    <Root>
      <SpotText level="h4">{props.label}</SpotText>
      <form>
        {Array.from(props.choices ?? []).map((choice) => (
          <Checkbox
            key={choice}
            name={choice}
            checked={props.value?.has(choice) ?? false}
            label={
              props.renderValueLabel ? props.renderValueLabel(choice) : choice
            }
            onChange={handleChange}
          />
        ))}
      </form>
    </Root>
  );
}
