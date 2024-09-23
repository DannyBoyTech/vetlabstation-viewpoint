import { PropsWithChildren } from "react";
import { InputAware, InputAwareProps } from "../InputAware";
import styled from "styled-components";
import { Input, Label, Select, Spinner } from "@viewpoint/spot-react";
import type { InputProps } from "@viewpoint/spot-react/src/components/forms/input/Input";
import { SelectProps } from "@viewpoint/spot-react/src/components/forms/select/Select";
import { PatientGender } from "@viewpoint/api";
import { MaskedInput, MaskedInputProps } from "../input/MaskedInput";
import { IMaskInputProps } from "react-imask/esm/mixin";
import { useTranslation } from "react-i18next";

const EntryWrapper = styled.div`
  display: grid;
`;

const Content = styled.div`
  grid-area: 1 / 1;
`;

const LoadingWrapper = styled.div`
  display: flex;
  grid-area: 1 / 1;
  align-items: center;
  justify-content: center;
`;

interface EntryProps extends PropsWithChildren {
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string | undefined) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function Entry(props: EntryProps) {
  return (
    <EntryWrapper>
      <Content>
        <Label disabled={props.disabled || props.loading}>
          &nbsp;
          {props.label}
          {props.required && <span> *</span>}
        </Label>
        {props.children}
      </Content>
      {props.loading && (
        <LoadingWrapper style={{ position: "relative", top: 0 }}>
          <Spinner />
        </LoadingWrapper>
      )}
    </EntryWrapper>
  );
}

interface TextEntryProps extends EntryProps {
  placeholder?: string;
  inputAwareProps?: Partial<InputAwareProps>;
  inputProps?: InputProps;
  maxLength?: number;
}

export function TextEntry(props: TextEntryProps) {
  return (
    <Entry {...props}>
      <InputAware {...(props.inputAwareProps ?? {})}>
        <Input
          placeholder={props.placeholder}
          disabled={props.loading || props.disabled}
          value={props.value ?? ""}
          onChange={(ev) => props.onChange?.(ev.target.value)}
          maxLength={props.maxLength}
          {...props.inputProps}
        />
      </InputAware>
    </Entry>
  );
}

export interface SelectEntryOption {
  label: string | PatientGender;
  value: string;
}

interface SelectEntryProps extends EntryProps {
  options: SelectEntryOption[];
  selectProps?: SelectProps;
}

const UNSELECTED = "UNSELECTED";

export function SelectEntry(props: SelectEntryProps) {
  const { disabled, loading, value, onChange, selectProps, required, options } =
    props;
  const { t } = useTranslation();
  return (
    <Entry {...props}>
      <Select
        disabled={disabled || loading}
        value={value ?? UNSELECTED}
        onChange={(ev) =>
          onChange?.(
            ev.target.value === UNSELECTED ? undefined : ev.target.value
          )
        }
        {...selectProps}
      >
        <Select.Option disabled={required} value={UNSELECTED}>
          {t("general.select")}
        </Select.Option>
        {options?.map(({ label, value }) => (
          <Select.Option key={value} value={value}>
            {label}
          </Select.Option>
        ))}
      </Select>
    </Entry>
  );
}

export type MaskedTextEntryProps = Omit<TextEntryProps, "inputProps"> & {
  inputProps: MaskedInputProps & IMaskInputProps;
};

export function MaskedTextEntry({
  inputProps,
  inputAwareProps,
  ...props
}: MaskedTextEntryProps) {
  return (
    <Entry {...props}>
      <InputAware {...(inputAwareProps ?? {})}>
        <MaskedInput
          placeholder={props.placeholder}
          disabled={props.loading || props.disabled}
          value={props.value ?? ""}
          onAccept={(text) => props.onChange?.(text)}
          maxLength={props.maxLength}
          {...inputProps}
        />
      </InputAware>
    </Entry>
  );
}
