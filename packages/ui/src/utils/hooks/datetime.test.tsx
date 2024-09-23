import dayjs from "dayjs";
import { render, renderHook } from "@testing-library/react";
import { test, describe, expect, it } from "vitest";
import {
  FormatKey,
  useFormat,
  useFormatDate,
  useFormatDateTime12h,
  useFormatDayOfMonth,
  useFormatDurationMinsSecs,
  useFormatTime12h,
} from "./datetime";

describe("datetime hooks", () => {
  describe("useFormat", () => {
    const Format = ({
      formatKey,
      date,
    }: {
      formatKey: FormatKey;
      date: Date;
    }) => {
      const format = useFormat(formatKey);
      return <span className="formatted">{format(date)}</span>;
    };

    const jan4_1997 = dayjs()
      .date(4)
      .month(0)
      .year(1997)
      .hour(8)
      .minute(11)
      .second(13)
      .millisecond(357)
      .toDate();

    test.each<{ format: FormatKey; input: Date; expected: string }>([
      { format: "dateTime.date", input: jan4_1997, expected: "1/04/97" },
      {
        format: "dateTime.dateTime12h",
        input: jan4_1997,
        expected: "1/04/97 8:11 AM",
      },
      {
        input: jan4_1997,
        format: "dateTime.dateTime12h",
        expected: "1/04/97 8:11 AM",
      },
      {
        input: dayjs().month(2).date(5).toDate(),
        format: "dateTime.dayOfMonth",
        expected: "Mar 5",
      },
      {
        input: dayjs().minute(7).second(42).toDate(),
        format: "dateTime.durationMinsSecs",
        expected: "07:42",
      },
      {
        input: dayjs().hour(3).minute(43).toDate(),
        format: "dateTime.time12h",
        expected: "3:43 AM",
      },
    ])(
      "should return function that can format dates using $formatKey pattern",
      ({ input, format, expected }) => {
        const { container } = render(
          <Format formatKey={format} date={input} />
        );

        expect(container.querySelector(".formatted")?.textContent).toEqual(
          expected
        );
      }
    );

    it("should return the same function for the same format", () => {
      const format = "dateTime.date";

      const { result, rerender } = renderHook(() => useFormat(format));
      const result1 = result.current;

      rerender();

      const result2 = result.current;

      expect(result1).toBe(result2);
    });

    it("should update function if format key changes", () => {
      const format = "dateTime.date";

      const { result, rerender } = renderHook(
        ({ format: fmt }: { format: FormatKey }) => useFormat(fmt),
        { initialProps: { format } }
      );

      const result1 = result.current;

      rerender({ format: "dateTime.dateTime12h" });

      const result2 = result.current;

      expect(result1).not.toBe(result2);
    });
  });

  describe("useFormatDate", () => {
    const FormatDate = ({ date }: { date: Date }) => {
      const format = useFormatDate();

      return <span className="formatted">{format(date)}</span>;
    };

    it("should format dates according to 'dateTime.date' pattern", () => {
      const date = dayjs().year(2003).month(1).date(7).toDate();

      const { container } = render(<FormatDate date={date} />);

      expect(container.querySelector(".formatted")?.textContent).toEqual(
        "2/07/03"
      );
    });
  });

  describe("useFormatDateTime12h", () => {
    const FormatDateTime12h = ({ date }: { date: Date }) => {
      const format = useFormatDateTime12h();

      return <span className="formatted">{format(date)}</span>;
    };

    it("should format dates according to 'dateTime.dateTime12h' pattern", () => {
      const date = dayjs()
        .year(1979)
        .month(6)
        .date(13)
        .hour(7)
        .minute(35)
        .second(29)
        .toDate();

      const { container } = render(<FormatDateTime12h date={date} />);

      expect(container.querySelector(".formatted")?.textContent).toEqual(
        "7/13/79 7:35 AM"
      );
    });
  });

  describe("useFormatDayOfMonth", () => {
    const FormatDayOfMonth = ({ date }: { date: Date }) => {
      const format = useFormatDayOfMonth();

      return <span className="formatted">{format(date)}</span>;
    };

    it("should format dates according to 'dateTime.dayOfMonth' pattern", () => {
      const date = dayjs().month(6).date(13).toDate();

      const { container } = render(<FormatDayOfMonth date={date} />);

      expect(container.querySelector(".formatted")?.textContent).toEqual(
        "Jul 13"
      );
    });
  });

  describe("useFormatDurationMinsSecs", () => {
    const FormatDurationMinsSecs = ({ duration }: { duration: number }) => {
      const format = useFormatDurationMinsSecs();

      return <span className="formatted">{format(duration)}</span>;
    };

    it("should format durations (in millis) according to 'dateTime.durationMinsSecs' pattern", () => {
      const duration = 9 * 60 * 1000 + 37 * 1000;

      const { container } = render(
        <FormatDurationMinsSecs duration={duration} />
      );

      expect(container.querySelector(".formatted")?.textContent).toEqual(
        "09:37"
      );
    });
  });

  describe("useFormatTime12h", () => {
    const FormatTime12h = ({ date }: { date: Date }) => {
      const format = useFormatTime12h();

      return <span className="formatted">{format(date)}</span>;
    };

    it("should format time according to 'dateTime.time12h' pattern", () => {
      const date = dayjs()
        .year(1968)
        .month(11)
        .date(25)
        .hour(19)
        .minute(57)
        .second(34)
        .toDate();

      const { container } = render(<FormatTime12h date={date} />);

      expect(container.querySelector(".formatted")?.textContent).toEqual(
        "7:57 PM"
      );
    });
  });
});
