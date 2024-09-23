import { useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Cell } from "../common-components/result-table-components";
import { RunTableRow } from "../common-components/RunTableRow";

const StyledCell = styled(Cell)`
  grid-column: 1 / 5;
`;

export function CategoryRow(props: {
  category: string;
  additionalColumnCount: number;
}) {
  const { t } = useTranslation();
  return (
    <RunTableRow
      includePlaceholders
      additionalColumnCount={props.additionalColumnCount}
    >
      <StyledCell>
        <SpotText level="secondary">
          {t(`Category.${props.category}` as any, props.category)}
        </SpotText>
      </StyledCell>
    </RunTableRow>
  );
}
