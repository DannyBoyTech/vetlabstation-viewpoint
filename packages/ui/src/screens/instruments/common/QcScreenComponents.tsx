import styled from "styled-components";
import {
  InstrumentPageContent,
  InstrumentPageRoot,
} from "../common-components";
import { Theme } from "../../../utils/StyleConstants";
import { DataTable } from "@viewpoint/spot-react";
import classNames from "classnames";

export const QCScreenRoot = styled(InstrumentPageRoot)`
  overflow: hidden;
`;
export const QCScreenContentPane = styled(InstrumentPageContent)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
`;
QCScreenContentPane.displayName = "ContentPane";

export const QCScreenContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`;
QCScreenContent.displayName = "Content";

export const QCScreenHeading = styled.div`
  flex: 0;
`;
QCScreenHeading.displayName = "Heading";

export const QCDataTable = styled(DataTable)`
  width: 100%;
  margin: 0px;

  thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tbody tr.disabled {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.disabled};
  }
`;
QCDataTable.displayName = "StyledDataTable";

export const calculateRowProps = (
  props: Record<string, unknown>,
  meta: any
) => {
  const existingClass =
    typeof props.className === "string" ? props.className : undefined;

  const disabledClass =
    meta?.row?.original?.canRun !== true || meta.row?.original?.dto?.isExpired
      ? "disabled"
      : undefined;

  const className = classNames(existingClass, disabledClass);

  const calcProps = { ...props };

  if (className) {
    calcProps.className = className;
  }

  return calcProps;
};

export const SmartQCDataTable = styled(DataTable)`
  margin: 0;
  table-layout: fixed;

  thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary};
  }
`;
SmartQCDataTable.displayName = "StyledSmartQCDataTable";
