import styled from "styled-components";
import { InstrumentResultDto } from "@viewpoint/api";
import { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getLocalizedAssayName, getOutOfRangeColor } from "../result-utils";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { Cell } from "../common-components/result-table-components";
import { SpotText } from "@viewpoint/spot-react";
import { useResultColors } from "../../../context/ResultsPageContext";

const TestId = {
  AssayCell: (assay: string) => `results-page-assay-cell-${assay}`,
};

const CenteredCell = styled(Cell)`
  align-items: center;
`;

const StyledText = styled(SpotText)<{ $abnormalColoring?: string }>`
  overflow: hidden;
  overflow-wrap: break-word;
  ${(p) =>
    p.$abnormalColoring == null
      ? ""
      : `
        &&& {
          color: ${p.$abnormalColoring};
        }
      `}
`;

export interface AssayCellProps {
  result: InstrumentResultDto;
  indented?: boolean;
  assayIcon?: ReactNode;
  graphIcon?: ReactNode;
  useAbnormalColoring?: boolean;
  "data-testid"?: string;
}

export function AssayNameCell(props: AssayCellProps) {
  const { t } = useTranslation();

  const resultColors = useResultColors();
  const outOfRangeColor = getOutOfRangeColor(props.result, resultColors);

  return (
    <CenteredCell
      data-testid={props["data-testid"] ?? TestId.AssayCell(props.result.assay)}
    >
      {props.indented && <>&nbsp;&nbsp;&nbsp;&nbsp;</>}
      {props.assayIcon}
      {props.graphIcon}
      <StyledText
        level="secondary"
        bold={props.useAbnormalColoring && props.result.abnormal}
        $abnormalColoring={
          props.useAbnormalColoring ? outOfRangeColor : undefined
        }
      >
        <Trans
          i18nKey={`Assay.extended.${props.result.assayIdentityName}` as any}
          defaults={getLocalizedAssayName(
            t,
            props.result.assayIdentityName,
            props.result.assay
          )}
          components={CommonTransComponents}
        />
      </StyledText>
    </CenteredCell>
  );
}
