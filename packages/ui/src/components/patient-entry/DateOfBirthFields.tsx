import styled from "styled-components";
import { useMemo, useRef, KeyboardEvent, useEffect } from "react";
import { RequiredInput } from "../input/RequiredInput";
import { MaskedTextEntry } from "./Inputs";
import dayjs from "dayjs";
import { SpotText } from "@viewpoint/spot-react";

export const TestId = {
  Month: "age-month-input",
  Date: "age-date-input",
  Year: "age-year-input",
};

const TextSeparator = styled.div`
  margin: 5px 5px 10px;
`;
const DateContainer = styled.div`
  display: grid;
  grid-template-columns: 5fr auto 5fr auto 6fr;
  align-items: end;
`;

export interface DateOfBirthFieldsProps {
  dobInputValues?: DobStringValues;
  // Called when a valid DOB is entered
  onChange: (dob: DobStringValues) => void;
}

export interface DobStringValues {
  day?: string;
  month?: string;
  year?: string;
}

export function DateOfBirthFields(props: DateOfBirthFieldsProps) {
  const { dobInputValues, onChange } = props;

  const today = useMemo(() => dayjs(), []);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const hasInputValues = dobStringValuesNotEmpty(dobInputValues);

  const onMonthChanged = (val?: string) => {
    // Update internal state, potentially notify parent
    onChange({
      ...dobInputValues,
      month: val,
    });
    if (
      Number(val) !== Number(dobInputValues?.month) &&
      shouldAdvance(val, 12)
    ) {
      // Move to next input
      dayRef.current?.focus();
    }
  };

  const onDayChanged = (val?: string) => {
    onChange({
      ...dobInputValues,
      day: val,
    });
    if (
      Number(val) !== Number(dobInputValues?.day) &&
      shouldAdvance(
        val,
        greatestDayInMonth(dobInputValues?.month, dobInputValues?.year)
      )
    ) {
      yearRef.current?.focus();
    }
  };

  const onYearChanged = (val?: string) => {
    onChange({ ...dobInputValues, year: val });
  };

  return (
    <DateContainer>
      <RequiredInput
        error={
          hasInputValues &&
          (dobInputValues?.month == null || dobInputValues.month.length === 0)
        }
      >
        <MaskedTextEntry
          value={dobInputValues?.month}
          onChange={onMonthChanged}
          inputAwareProps={{ layout: "numpad" }}
          inputProps={{
            "data-testid": TestId.Month,
            placeholder: "mm",
            mask: customMaskWithMax(12),
            inputRef: monthRef,
            onBlur: () =>
              onChange({
                ...dobInputValues,
                month:
                  (dobInputValues?.month ?? "").length === 0
                    ? ""
                    : dobInputValues?.month?.padStart(2, "0"),
              }),
          }}
        />
      </RequiredInput>

      <TextSeparator>
        <SpotText level="secondary">/</SpotText>
      </TextSeparator>

      <RequiredInput
        error={
          hasInputValues &&
          (dobInputValues?.day == null || dobInputValues.day.length === 0)
        }
      >
        <MaskedTextEntry
          value={dobInputValues?.day}
          onChange={onDayChanged}
          inputAwareProps={{ layout: "numpad" }}
          inputProps={{
            "data-testid": TestId.Date,
            placeholder: "dd",
            mask: customMaskWithMax(
              greatestDayInMonth(dobInputValues?.month, dobInputValues?.year)
            ),
            inputRef: dayRef,
            onBlur: () =>
              onChange({
                ...dobInputValues,
                day:
                  (dobInputValues?.day ?? "").length === 0
                    ? ""
                    : dobInputValues?.day?.padStart(2, "0"),
              }),
            onKeyDown: (keyEvent) => {
              if (shouldGoBackwards(dobInputValues?.day, keyEvent)) {
                keyEvent.preventDefault();
                monthRef.current?.focus();
              }
            },
          }}
        />
      </RequiredInput>

      <TextSeparator>
        <SpotText level="secondary">/</SpotText>
      </TextSeparator>

      <RequiredInput
        error={
          hasInputValues &&
          (dobInputValues?.year?.length !== 4 ||
            Number(dobInputValues?.year) < 1900)
        }
      >
        <MaskedTextEntry
          value={dobInputValues?.year}
          onChange={onYearChanged}
          inputAwareProps={{ layout: "numpad" }}
          inputProps={{
            placeholder: "yyyy",
            mask: customMaskWithMax(today.year()),
            inputRef: yearRef,
            "data-testid": TestId.Year,
            onKeyDown: (keyEvent) => {
              if (shouldGoBackwards(dobInputValues?.year, keyEvent)) {
                keyEvent.preventDefault();
                dayRef.current?.focus();
              }
            },
            onBlur: () => {
              // Is it length 2 and a valid year? If so, set it to the full year value
              if (dobInputValues?.year?.length === 2) {
                // Check the current year first -- if that doesn't work, try prepending with 19
                const potentiallyValidYears = [
                  `20${dobInputValues.year}`,
                  `19${dobInputValues.year}`,
                ];
                for (const potentiallyValidYear of potentiallyValidYears) {
                  if (
                    dayjs()
                      .month(Number(dobInputValues.month ?? "1") - 1)
                      .date(Number(dobInputValues.day ?? "1"))
                      .year(Number(potentiallyValidYear))
                      .isBefore(today)
                  ) {
                    onYearChanged(potentiallyValidYear);
                    return;
                  }
                }
              }
            },
          }}
        />
      </RequiredInput>
    </DateContainer>
  );
}

// Whether the user has entered any values into the inputs
export function dobStringValuesNotEmpty(
  inputValues?: DobStringValues
): boolean {
  // Whether user has entered anything into the DOB fields
  return (
    (inputValues?.day?.length ?? 0) > 0 ||
    (inputValues?.month?.length ?? 0) > 0 ||
    (inputValues?.year?.length ?? 0) > 0
  );
}

// Intentionally not using Number constructor/mask directly, as it
// looks like the iMask library somehow checks that that is being used
// and actually returns the value from it, but we want to pad the
// display with a 0.
function customMaskWithMax(maxValue: number) {
  return (val?: string) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed <= maxValue;
  };
}

// Whether we should advance the focus to the next available input
function shouldAdvance(
  newValue: string | undefined,
  maxValue: number
): boolean {
  const parsed = Number(newValue);
  return (
    (newValue?.length ?? 0) >= maxValue.toString().length ||
    (parsed != null && !isNaN(parsed) && parsed > Math.floor(maxValue / 10))
  );
}

// Whether we should go to the previous input when the user hits backspace in
// an empty input
function shouldGoBackwards(
  currentValue: string | undefined,
  event: KeyboardEvent<any>
) {
  return (
    (currentValue == null || currentValue.length === 0) &&
    (event.key === "Backspace" || event.key === "Delete")
  );
}

// Find the greatest day value in the given month
function greatestDayInMonth(month?: string, year?: string) {
  let date = dayjs();
  const parsedMonth = (month ?? "").length > 0 ? parseInt(month!) - 1 : 0;
  const parsedYear = year ?? "".length > 0 ? parseInt(year!) : 2020; // Use a leap year if no year is provided, so that it will return the max value for February
  if (parsedMonth != null) {
    date = date.month(parsedMonth);
  }
  if (parsedYear != null) {
    date = date.year(parsedYear);
  }
  return date.daysInMonth();
}
