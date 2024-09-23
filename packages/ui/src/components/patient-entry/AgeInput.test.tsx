import { describe, vi, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { AgeInput, AgeInputProps, PatientAgeValues } from "./AgeInput";
import { render } from "../../../test-utils/test-utils";
import dayjs from "dayjs";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

function AgeInputTestBed(props: Partial<AgeInputProps>) {
  const [values, setValues] = useState<PatientAgeValues>();
  return (
    <AgeInput
      onChanged={(v) => {
        setValues(v);
        props.onChanged?.(v);
      }}
      ageValues={values}
    />
  );
}

describe("age input component", () => {
  it("approximates birth date based on age input", async () => {
    const onChangedCb = vi.fn();
    render(<AgeInputTestBed onChanged={onChangedCb} />);

    // Choose 12 years for the patient's age
    const ageInput = await screen.findByTestId("age-input");
    const ageCategorySelect = await screen.findByTestId("age-category-select");

    await userEvent.type(ageInput, "12");
    await userEvent.selectOptions(ageCategorySelect, "Years");

    // The onChanged callback should receive the appropriate DOB that is 12 years ago
    const expectedDob = dayjs().subtract(12, "years").format("YYYY-MM-DD");

    expect(onChangedCb).toHaveBeenCalledWith({
      birthDate: expectedDob,
      birthDateCalculated: true,
      ageIsApproximate: true,
    });
  });

  it("only provides DOB when the month/date/year fields are populated", async () => {
    const onChangedCb = vi.fn();
    render(<AgeInput onChanged={onChangedCb} />);
    const monthInput = await screen.findByTestId("age-month-input");
    const dateInput = await screen.findByTestId("age-date-input");
    const yearInput = await screen.findByTestId("age-year-input");

    await userEvent.type(monthInput, "10");
    expect(onChangedCb).toHaveBeenLastCalledWith({
      birthDate: undefined,
      birthDateCalculated: false,
    });
    await userEvent.type(dateInput, "17");
    expect(onChangedCb).toHaveBeenLastCalledWith({
      birthDate: undefined,
      birthDateCalculated: false,
    });
    await userEvent.type(yearInput, "2021");

    // Note - DayJS uses 0-indexed months, which is why this is 9 instead of 10
    const expectedDob = dayjs()
      .month(9)
      .date(17)
      .year(2021)
      .format("YYYY-MM-DD");

    expect(onChangedCb).toHaveBeenLastCalledWith({
      birthDate: expectedDob,
      birthDateCalculated: false,
    });
  });

  describe("months field", () => {
    it.each(["01", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"])(
      "progresses from month to day when user enters %s",
      async (value) => {
        render(<AgeInputTestBed />);
        const monthInput = await screen.findByTestId("age-month-input");
        const dateInput = await screen.findByTestId("age-date-input");
        // Give focus to month input
        await userEvent.click(monthInput);
        expect(monthInput).toHaveFocus();

        // Enter value, verify date input has focus
        await userEvent.type(monthInput, value);
        expect(dateInput).toHaveFocus();
      }
    );

    it.each(["1", "0"])(
      "does not progress from month to day when user enters %s",
      async (value) => {
        render(<AgeInputTestBed />);
        const monthInput = await screen.findByTestId("age-month-input");
        // Give focus to month input
        await userEvent.click(monthInput);
        expect(monthInput).toHaveFocus();

        // Enter value, verify month input still has focus
        await userEvent.type(monthInput, value);

        expect(monthInput).toHaveFocus();
      }
    );

    it("does not allow values greater than 12 in the months field", async () => {
      render(<AgeInputTestBed />);
      const monthInput = await screen.findByTestId("age-month-input");
      await userEvent.type(monthInput, "13");
      expect((monthInput as HTMLInputElement).value).toEqual("1");
    });
  });

  describe("date field", () => {
    // All the months
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const greatestDaysInMonths = months.map((month) => ({
      month,
      day: dayjs()
        .month(month - 1)
        .year(2022)
        .daysInMonth(),
      year: 2022,
    }));

    // Leap year can be ignored for this test because it falls into a case for the below test (next day is 30, which starts wtih 3, which automatically jumps to the next input)
    it.each([{ month: 2, day: 28, year: 2022 }])(
      "does not allow date value past $day for $year-$month-$day",
      async ({ month, day, year }) => {
        render(<AgeInputTestBed />);
        const monthInput = await screen.findByTestId("age-month-input");
        const dateInput = await screen.findByTestId("age-date-input");
        const yearInput = await screen.findByTestId("age-year-input");

        await userEvent.type(monthInput, month.toString());
        await userEvent.type(yearInput, year.toString());
        // Type the greatest value in the month
        await userEvent.type(dateInput, day.toString());
        // Verify the value in the input is correct
        expect((dateInput as HTMLInputElement).value).toEqual(day.toString());

        // Clear the date field and try to input 1 greater than the highest in the month
        await userEvent.clear(dateInput);
        expect((dateInput as HTMLInputElement).value).toEqual("");

        const nextDay = day + 1;
        await userEvent.type(dateInput, nextDay.toString());
        // It should revert to the first number in the date
        expect((dateInput as HTMLInputElement).value).toEqual(
          Math.floor(day / 10).toString()
        );
      }
    );

    // Leap year can be ignored because it is the same case as non-leap year (entering 3 instead of 2)
    it.each(greatestDaysInMonths)(
      "automatically focuses on year field when first digit of entered date is greater than $day for $year-$month-$day",
      async ({ month, day, year }) => {
        render(<AgeInputTestBed />);
        const monthInput = await screen.findByTestId("age-month-input");
        const dateInput = await screen.findByTestId("age-date-input");
        const yearInput = await screen.findByTestId("age-year-input");

        await userEvent.type(monthInput, month.toString());
        await userEvent.type(yearInput, year.toString());

        // Try to enter the next tens digit for date
        // Give focus to month input
        await userEvent.click(monthInput);
        const nextDayFirstDigit = Math.floor(day / 10) + 1;
        await userEvent.type(dateInput, nextDayFirstDigit.toString());

        expect(yearInput).toHaveFocus();
        expect((dateInput as HTMLInputElement).value).toEqual(
          `0${nextDayFirstDigit}`
        );
      }
    );
  });
});
