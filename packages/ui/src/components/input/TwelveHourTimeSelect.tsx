import { Select } from "@viewpoint/spot-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import dayjs from "dayjs";

const SelectContainer = styled.div<{ hidden?: boolean }>`
  display: flex;
  gap: 10px;
  ${(p) => (p.hidden ? "visibility: hidden;" : "")}
`;

interface TimeSelectProps {
  mode?: "never" | "daily";
  // HH:mm:ss format
  time?: string;
  // 0 - 23 (dayjs hour format)
  onChanged: (hour: number, minutes: number) => void;
  disabled?: boolean;
  includeMinutes?: boolean;
}

const Hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const Minutes = new Array(60).fill(0).map((_v, index) => index);

export const TestId = {
  HourSelect: "twelve-hour-select-hours",
  MinuteSelect: "twelve-hour-select-minutes",
  AmPmSelect: "twelve-hour-select-ampm",
};

export function TwelveHourTimeSelect(props: TimeSelectProps) {
  const { t } = useTranslation();

  const handleChange = (
    hour: number | undefined,
    minutes: number | undefined,
    amPm: "AM" | "PM"
  ) => {
    if (hour != null) {
      if (hour === 12 && amPm === "AM") {
        props.onChanged(0, minutes ?? 0);
      } else {
        props.onChanged(
          amPm === "PM" && hour !== 12 ? hour + 12 : hour,
          minutes ?? 0
        );
      }
    }
  };

  const {
    hour,
    minutes,
    amPm,
  }: { hour?: number; minutes?: number; amPm: "AM" | "PM" } = useMemo(() => {
    if (props.time == null) {
      return { hour: undefined, minutes: undefined, amPm: "AM" };
    }
    const parsed = dayjs(props.time, "HH:mm:ss");
    return {
      hour: Number(parsed.format("h")),
      minutes: parsed.minute(),
      amPm: parsed.format("A") as "AM" | "PM",
    };
  }, [props.time]);

  return (
    <SelectContainer hidden={props.mode === "never"}>
      <Select
        data-testid={TestId.HourSelect}
        disabled={props.disabled}
        value={hour ?? "default"}
        onChange={(ev) =>
          handleChange(Number(ev.currentTarget.value), minutes, amPm)
        }
      >
        <Select.Option disabled value={"default"}>
          {t("general.select")}
        </Select.Option>
        {Hours.map((hour) => (
          <Select.Option key={hour} value={hour}>
            {hour.toString().padStart(2, "0")}
          </Select.Option>
        ))}
      </Select>
      {props.includeMinutes && (
        <Select
          data-testid={TestId.MinuteSelect}
          disabled={props.disabled}
          value={minutes ?? "default"}
          onChange={(ev) =>
            handleChange(hour, Number(ev.currentTarget.value), amPm)
          }
        >
          <Select.Option disabled value={"default"}>
            {t("general.select")}
          </Select.Option>
          {Minutes.map((minute) => (
            <Select.Option key={minute} value={minute}>
              {minute.toString().padStart(2, "0")}
            </Select.Option>
          ))}
        </Select>
      )}
      <Select
        data-testid={TestId.AmPmSelect}
        disabled={props.disabled}
        value={amPm}
        onChange={(ev) =>
          handleChange(hour, minutes, ev.currentTarget.value as "AM" | "PM")
        }
      >
        <Select.Option value="AM">{t("general.timeAndDate.AM")}</Select.Option>
        <Select.Option value="PM">{t("general.timeAndDate.PM")}</Select.Option>
      </Select>
    </SelectContainer>
  );
}
