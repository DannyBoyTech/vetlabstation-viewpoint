import { SmartQCResult } from "@viewpoint/api";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

const StyledSpan = styled.span`
  &&.out-of-range {
    color: red;
    font-weight: bold;
  }
`;

export const SmartQCResultCell = ({ value }: { value: unknown }) => {
  const { t } = useTranslation();

  const outOfRangeClass = classNames({
    "out-of-range": value === SmartQCResult.OUT_OF_RANGE,
  });

  return (
    <>
      {value != null ? (
        <StyledSpan className={outOfRangeClass}>
          {t(`instrumentScreens.smartQc.result.${value as SmartQCResult}`)}
        </StyledSpan>
      ) : (
        "--"
      )}
    </>
  );
};
