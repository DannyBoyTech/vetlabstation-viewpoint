import styled from "styled-components";
import {
  isFormattable,
  useFormatDate,
  useFormatTime12h,
} from "../../utils/hooks/datetime";
import { ReactNode } from "react";
import classnames from "classnames";

interface DateTimeSegmentProps {
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}

function DateTimeSegment(props: DateTimeSegmentProps) {
  const { className: passedClassName, ...otherProps } = props;
  const classes = classnames("date-time-segment", passedClassName);
  return <div className={classes} {...otherProps} />;
}

/**
 * Renders a datetime value into distinct date and time12h fields, which are, by default, rendered on a single line.
 * This component exists to allow styling the date/time presentation when appropriate.
 *
 * @param value - date-like value (one understood by dayjs)
 * @returns react component representing a date and time, but logically split to allow styling
 */
export const SegmentedDateTimeCell = ({ value }: { value: unknown }) => {
  const formatDate = useFormatDate();
  const formatTime12h = useFormatTime12h();

  return (
    <>
      {value != null && isFormattable(value) ? (
        <>
          <DateTimeSegment className="date">
            {formatDate(value)}
          </DateTimeSegment>
          <DateTimeSegment className="time">
            {formatTime12h(value)}
          </DateTimeSegment>
        </>
      ) : (
        "--"
      )}
    </>
  );
};
