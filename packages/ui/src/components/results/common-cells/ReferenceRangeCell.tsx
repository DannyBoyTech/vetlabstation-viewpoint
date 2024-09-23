import { InstrumentResultDto } from "@viewpoint/api";
import { SpotText } from "@viewpoint/spot-react";
import { Cell } from "../common-components/result-table-components";

export interface ReferenceRangeCellProps {
  result: InstrumentResultDto;
}

export function ReferenceRangeCell({ result }: ReferenceRangeCellProps) {
  return (
    <Cell>
      <SpotText level="tertiary">
        {result.referenceRangeString
          ? `${result.referenceRangeString} ${result.assayUnits}`
          : ""}
      </SpotText>
    </Cell>
  );
}
