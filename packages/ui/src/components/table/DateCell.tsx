import { isFormattable, useFormatDate } from "../../utils/hooks/datetime";

export const DateCell = ({ value }: { value: unknown }) => {
  const formatDate = useFormatDate();

  return (
    <>{value != null && isFormattable(value) ? formatDate(value) : "--"}</>
  );
};
