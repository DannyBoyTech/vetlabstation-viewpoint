import {
  isFormattable,
  useFormatDateTime12h,
} from "../../utils/hooks/datetime";

export const DateTime12hCell = ({ value }: { value: unknown }) => {
  const formatDateTime12h = useFormatDateTime12h();
  return (
    <>
      {value != null && isFormattable(value) ? formatDateTime12h(value) : "--"}
    </>
  );
};
