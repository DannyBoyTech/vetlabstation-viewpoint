import { TestOrderDto, TheiaSampleLocation } from "@viewpoint/api";
import { Cell } from "../common-components/result-table-components";
import { SpotText } from "@viewpoint/spot-react/src";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { RunTableRow } from "../common-components/RunTableRow";

const StyledCell = styled(Cell)`
  grid-column: 2 / 5;
`;

export function TheiaSourceRow(props: {
  additionalColumnCount: number;
  testOrder: TestOrderDto;
}) {
  const { t } = useTranslation();

  return (
    <RunTableRow
      includePlaceholders
      additionalColumnCount={props.additionalColumnCount}
    >
      <Cell>
        <SpotText level="secondary">
          {t("resultsPage.resultDetails.labels.source")}
        </SpotText>
      </Cell>
      <StyledCell>
        <Cell>
          <SpotText level="secondary" bold>
            {props.testOrder.earSwabRunConfigurationDto?.theiaSampleLocation ===
            TheiaSampleLocation.LEFT
              ? t("theia.sampleSource.LEFT_EAR")
              : t("theia.sampleSource.RIGHT_EAR")}
          </SpotText>
        </Cell>
      </StyledCell>
    </RunTableRow>
  );
}
