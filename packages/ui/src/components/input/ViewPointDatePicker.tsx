import styled, { css } from "styled-components";
import { DatePickerInput, DatePickerInputProps } from "@mantine/dates";
import { Theme } from "../../utils/StyleConstants";
import { useMemo } from "react";
import dayjs from "dayjs";
import { SpotIcon } from "@viewpoint/spot-icons";

const datePickerInputStyles = css`
  * {
    font-family: "Open Sans", "Helvetica Neue", Arial, sans-serif;
    color: ${(p: { theme: Theme }) =>
      p.theme.colors?.text?.primary}; // TODO - confirm color choice
  }

  .icon {
    fill: ${(p: { theme: Theme }) => p.theme.colors?.interactive?.focus};
  }

  .mantine-DatePickerInput-input {
    min-height: unset;
    font-size: 15px;
    height: 40px;
    border: ${(p: { theme: Theme }) => p.theme.borders?.control};
    border-radius: 2px;
  }

  .mantine-DatePickerInput-input[aria-expanded="true"] {
    box-shadow: 0 0 0 2px
      ${(p: { theme: Theme }) => p.theme.colors?.interactive?.focus};
  }

  .mantine-Month-month {
    height: 300px;
  }

  .mantine-WeekdaysRow-weekday {
    text-align: center;
  }

  .mantine-Day-day[data-weekend],
  .mantine-WeekdaysRow-weekday {
    color: ${(p: { theme: Theme }) =>
      p.theme.colors?.text?.secondary}; // TODO - confirm color choice
  }

  .mantine-Day-day[data-outside] {
    color: ${(p: { theme: Theme }) =>
      p.theme.colors?.text?.secondary}; // TODO - confirm color choice
  }

  .mantine-Day-day[data-selected] {
    color: ${(p: { theme: Theme }) =>
      p.theme.colors?.text?.primary}; // TODO - confirm color choice
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.interactive?.focus};
  }

  .mantine-Popover-dropdown {
    border: ${(p: { theme: Theme }) => p.theme.borders?.control};
    border-radius: 4px;
  }
`;

const StyledDateRangeInput = styled(DatePickerInput<"range">)`
  ${datePickerInputStyles}
`;

export const DateRangePicker = (
  props: Omit<
    DatePickerInputProps<"range">,
    "type" | "firstDayOfWeek" | "size" | "icon"
  > & { placeholder?: string } // See https://github.com/mantinedev/mantine/issues/5401 and https://github.com/DefinitelyTyped/DefinitelyTyped/pull/67170
) => (
  <StyledDateRangeInput
    {...props}
    type="range"
    firstDayOfWeek={0}
    size="md"
    icon={<SpotIcon name="calendar" size={20} />}
  />
);

const StyledDatePickerInput = styled(DatePickerInput<"default">)`
  ${datePickerInputStyles}
`;

interface ViewpointDatePickerInputProps {
  date?: string; // YYYY-MM-DD
  onDateSelected: (newDate: string) => void;
  datePickerProps?: Partial<DatePickerInputProps>;
}

export function ViewpointDatePickerInput({
  date,
  onDateSelected,
  datePickerProps,
}: ViewpointDatePickerInputProps) {
  const dateValue = useMemo(
    () => (date == null ? new Date() : parseDate(date)),
    [date]
  );

  return (
    <StyledDatePickerInput
      type="default"
      size="md"
      firstDayOfWeek={0}
      value={dateValue}
      onChange={(d) => onDateSelected(dayjs(d).format("YYYY-MM-DD"))}
      icon={<SpotIcon name="calendar" size={20} />}
      {...datePickerProps}
    />
  );
}

function parseDate(value: string) {
  if (value != null) {
    try {
      const d = dayjs(value, "YYYY-MM-DD");
      if (d.isValid()) {
        return d.toDate();
      }
    } catch (err) {}
  }
  return undefined;
}
