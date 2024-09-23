import styled from "styled-components";
import { useMemo, useState } from "react";
import { Checkbox, SpotText } from "@viewpoint/spot-react";
import { MaskedTextEntry, SelectEntry } from "./Inputs";
import dayjs, { ManipulateType } from "dayjs";
import { useTranslation } from "react-i18next";
import { useFormatDateISO } from "../../utils/hooks/datetime";
import {
  DateOfBirthFields,
  DobStringValues,
  dobStringValuesNotEmpty,
} from "./DateOfBirthFields";

export const TestId = {
  Age: "age-input",
  AgeCategory: "age-category-select",
  IsApproximate: "age-approximate-checkbox",
} as const;

const AgeInputContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 4fr 1fr 6fr;
  gap: 10px;
  align-items: center;
  grid-column: 2 / 5;
`;

const Divider = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
`;

const CheckBoxContainer = styled.div`
  grid-column: 1 / 3;
`;

const AgeCategories = {
  Years: "Years",
  Months: "Months",
  Weeks: "Weeks",
  Days: "Days",
} as const;
type AgeCategory = (typeof AgeCategories)[keyof typeof AgeCategories];

const getDayjsUnitType = (
  category: AgeCategory
): ManipulateType | undefined => {
  switch (category) {
    case "Years":
      return "years";
    case "Months":
      return "months";
    case "Weeks":
      return "weeks";
    case "Days":
      return "days";
  }
};

// Structure of patient DOB/Age that comes from IVLS
export interface PatientAgeValues {
  birthDate?: string;
  ageIsApproximate?: boolean;
  birthDateCalculated?: boolean;
}

export interface AgeInputProps {
  ageValues?: PatientAgeValues;
  onChanged: (values?: PatientAgeValues) => void;
}

function getDobValuesFromBirthdate(
  birthDate?: string
): DobStringValues | undefined {
  if (birthDate != null) {
    const parsedDob = dayjs(birthDate);
    return {
      day: parsedDob.date().toString().padStart(2, "0"),
      month: (parsedDob.month() + 1).toString().padStart(2, "0"),
      year: parsedDob.year().toString(),
    };
  }
  return undefined;
}

function getAgeFromBirthdate(
  birthDate?: string,
  ageCategory?: AgeCategory
): number | undefined {
  if (birthDate != null && ageCategory != null) {
    return dayjs().diff(birthDate, getDayjsUnitType(ageCategory));
  }
  return undefined;
}

function getDefaultAgeCategory(birthDate?: string): AgeCategory | undefined {
  if (birthDate != null) {
    const today = dayjs();
    if (today.diff(birthDate, "days") < 7) {
      return AgeCategories.Days;
    } else if (today.diff(birthDate, "week") < 5) {
      return AgeCategories.Weeks;
    } else if (today.diff(birthDate, "month") < 12) {
      return AgeCategories.Months;
    } else {
      return AgeCategories.Years;
    }
  }
}

export function AgeInput(props: AgeInputProps) {
  const { t } = useTranslation();
  const dateISOFormat = useFormatDateISO();

  const [selectedAgeCategory, setSelectedAgeCategory] = useState(
    props.ageValues?.birthDateCalculated
      ? getDefaultAgeCategory(props.ageValues?.birthDate)
      : undefined
  );

  // Track DOB value state internally because we don't want to pass values up to parent until a valid DOB is entered
  const [dobValues, setDobValues] = useState(
    props.ageValues?.birthDateCalculated
      ? undefined
      : getDobValuesFromBirthdate(props.ageValues?.birthDate)
  );

  const age = props.ageValues?.birthDateCalculated
    ? getAgeFromBirthdate(
        props.ageValues?.birthDate,
        selectedAgeCategory ?? AgeCategories.Years
      )
    : undefined;

  const today = useMemo(() => dayjs(), []);
  const minDate = useMemo(() => dayjs().month(0).date(1).year(1900), []);

  const translatedCategories = Object.values(AgeCategories).map((cat) => ({
    label: t(`patientEntry.labels.ageCategories.${cat}`),
    value: cat,
  }));

  const onAgeChanged = (val?: string) => {
    const parsed = (val?.length ?? 0) > 0 ? Number(val) : undefined;
    if (parsed != null) {
      setDobValues(undefined);
      // Default the category to Years
      if (selectedAgeCategory == null) {
        setSelectedAgeCategory(AgeCategories.Years);
      }
    }
    props.onChanged({
      birthDateCalculated: true,
      ageIsApproximate: props.ageValues?.ageIsApproximate ?? true,
      birthDate: getBirthDateFromAge(
        parsed,
        selectedAgeCategory ?? AgeCategories.Years,
        dateISOFormat
      ),
    });
  };

  const onAgeCategoryChanged = (val?: string) => {
    setSelectedAgeCategory(val as AgeCategory);
    setDobValues(undefined);

    props.onChanged({
      birthDateCalculated: true,
      ageIsApproximate: props.ageValues?.ageIsApproximate,
      birthDate: getBirthDateFromAge(age, val as AgeCategory, dateISOFormat),
    });
  };

  const onDobChanged = (newDobValues: DobStringValues) => {
    // If internal state has been reset (aka dobValues is undefined), ignore empty string updates -- they are
    // caused by the DOB Fields component calling back with an empty string value
    // after "parsing" the undefined value that was just set when resetting the fields
    if (dobValues == null && !dobStringValuesNotEmpty(newDobValues)) {
      return;
    }
    setSelectedAgeCategory(undefined);
    setDobValues(newDobValues);
    const updates: PatientAgeValues = {
      birthDate: undefined,
      birthDateCalculated: false,
      ageIsApproximate: props.ageValues?.ageIsApproximate,
    };
    if (
      newDobValues.day != null &&
      newDobValues.month != null &&
      newDobValues.year != null
    ) {
      const parsed = dayjs()
        .hour(0)
        .minute(0)
        .second(0)
        .year(Number(newDobValues.year))
        .month(Number(newDobValues.month) - 1)
        .date(Number(newDobValues.day));
      if (parsed.isBefore(today.add(1, "day")) && parsed.isAfter(minDate)) {
        updates.birthDate = dateISOFormat(parsed);
      }
    }
    props.onChanged(updates);
  };

  return (
    <AgeInputContainer>
      <MaskedTextEntry
        label={t("patientEntry.labels.age")}
        inputAwareProps={{ layout: "numpad" }}
        value={age?.toString() ?? ""}
        onChange={onAgeChanged}
        maxLength={3}
        inputProps={{ mask: Number, "data-testid": TestId.Age, scale: 0 }}
      />
      <SelectEntry
        options={translatedCategories}
        value={selectedAgeCategory}
        onChange={onAgeCategoryChanged}
        selectProps={{ "data-testid": TestId.AgeCategory }}
      />
      <Divider>
        <SpotText style={{ marginBottom: "10px" }} level="secondary">
          or
        </SpotText>
      </Divider>

      <DateOfBirthFields dobInputValues={dobValues} onChange={onDobChanged} />

      <CheckBoxContainer>
        <Checkbox
          checked={props.ageValues?.ageIsApproximate ?? false}
          onChange={() =>
            props.onChanged({
              ...props.ageValues,
              ageIsApproximate: !props.ageValues?.ageIsApproximate,
            })
          }
          label={t("patientEntry.labels.ageApproximate")}
          data-testid={TestId.IsApproximate}
        />
      </CheckBoxContainer>
    </AgeInputContainer>
  );
}

function getBirthDateFromAge(
  age: number | undefined,
  ageCategory: AgeCategory | undefined,
  formatDate: (date: any) => string
): string | undefined {
  return age != null && ageCategory != null
    ? formatDate(dayjs().subtract(age, getDayjsUnitType(ageCategory)))
    : undefined;
}
