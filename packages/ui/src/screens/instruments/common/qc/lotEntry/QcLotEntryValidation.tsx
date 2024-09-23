import styled from "styled-components";
import { ValidationError } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";
import classNames from "classnames";

const ValidationErrorContainer = styled.div<{ isVisible: boolean }>`
  ${(p) => (!p.isVisible ? "visibility: hidden;" : "")}
`;

interface QcLotEntryValidationProps {
  className?: string;
  "data-testid"?: string;

  children: ReactNode;

  errorVisible: boolean;
  errorKey?: string;
}

/**
 *  Provides validation UI around QC Lot Entry input controls.
 */
const QcLotEntryValidation = (props: QcLotEntryValidationProps) => {
  const { t } = useTranslation();
  const classes = classNames(props.className, "qc-lot-entry-validation");

  return (
    <div className={classes} data-testid={props["data-testid"]}>
      {props.children}
      <ValidationErrorContainer isVisible={props.errorVisible}>
        <ValidationError>{t(props.errorKey as any)}</ValidationError>
      </ValidationErrorContainer>
    </div>
  );
};

export type { QcLotEntryValidationProps };
export { QcLotEntryValidation };
