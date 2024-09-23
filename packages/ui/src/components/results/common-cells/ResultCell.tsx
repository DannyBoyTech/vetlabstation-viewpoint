import styled from "styled-components";
import { SpotTokens } from "../../../utils/StyleConstants";
import { InstrumentResultDto } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { getOutOfRangeColor } from "../result-utils";
import { SpotText } from "@viewpoint/spot-react";

import { useResultColors } from "../../../context/ResultsPageContext";
import { Cell } from "../common-components/result-table-components";
import { forwardRef, Fragment, MouseEventHandler } from "react";
import { ResultValue } from "../ResultValue";

export const TestId = {
  ResultCell: (assay: string) => `results-page-result-cell-${assay}`,
};

const IndexesCell = styled(Cell)`
  padding-right: 3px;
  justify-content: end;
  width: 0.5em;
`;

export interface ResultCellProps {
  result: InstrumentResultDto;
  showIndexes?: boolean;
  "data-testid"?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const ResultCell = forwardRef<HTMLDivElement, ResultCellProps>(
  ({ "data-testid": dataTestId, result, showIndexes, onClick }, ref) => {
    const { t } = useTranslation();

    const resultColors = useResultColors();

    return (
      <Cell
        data-testid={dataTestId ?? TestId.ResultCell(result.assay!)}
        onClick={onClick}
        ref={ref}
      >
        <Fragment>
          {showIndexes && (
            <IndexesCell>
              <SpotText level="tertiary">
                {result.noteIndexes?.join(",")}
              </SpotText>
            </IndexesCell>
          )}
          {result.outOfRangeHigh || result.outOfRangeLow || result.abnormal ? (
            <OutOfRangeResultBox
              backgroundColor={getOutOfRangeColor(result, resultColors)}
            >
              <SpotText level="secondary" bold>
                <ResultValue result={result} />
              </SpotText>
            </OutOfRangeResultBox>
          ) : (
            <SpotText level="secondary">
              <ResultValue result={result} />
            </SpotText>
          )}
        </Fragment>
      </Cell>
    );
  }
);

const OutOfRangeResultBox = styled.div<{ backgroundColor: string }>`
  display: flex;
  align-items: center;
  background-color: ${(p) => p.backgroundColor};
  border-radius: 4px;
  padding: 3px;

  .spot-typography__text--secondary.spot-typography__text--secondary {
    color: ${SpotTokens.color.white};
  }
`;
