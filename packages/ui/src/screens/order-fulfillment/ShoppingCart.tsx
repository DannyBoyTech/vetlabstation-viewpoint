import styled from "styled-components";
import { HorizontalScrollContainer } from "../../components/analyzer-status/HorizontalScrollContainer";
import { ExecuteInstrumentRunDto } from "@viewpoint/api";
import { SelectedInstrumentIndicator } from "./SelectedInstrumentIndicator";
import { useMemo } from "react";

const Cell = styled.div`
  display: flex;
  align-items: center;
`;

const SelectedInstrumentsBar = styled(Cell)`
  gap: 20px;
  height: 50px;
  padding-right: 50px;
  padding-left: 8px;
`;

export interface ShoppingCartProps {
  className?: string;
  "data-testid"?: string;
  instrumentRunDtos: ExecuteInstrumentRunDto[];
}

export function ShoppingCart(props: ShoppingCartProps) {
  const { instrumentRunDtos } = props;
  const aggregatedRuns = useMemo(
    () =>
      Array.from(
        instrumentRunDtos
          .reduce((acc, it) => {
            if (it.instrumentId) {
              const aggregate = acc.get(it.instrumentId) ?? [];
              aggregate.push(it);
              acc.set(it.instrumentId, aggregate);
            }
            return acc;
          }, new Map<number, ExecuteInstrumentRunDto[]>())
          .entries()
      ),
    [instrumentRunDtos]
  );

  return (
    <HorizontalScrollContainer
      className={props.className}
      data-testid={props["data-testid"]}
      align={"left"}
    >
      <SelectedInstrumentsBar>
        {aggregatedRuns?.map(([instrumentId, runs]) => (
          <SelectedInstrumentIndicator
            key={`${instrumentId}-${runs[0].runQueueId}`}
            instrumentId={instrumentId}
            executeRunRequests={runs}
          />
        ))}
      </SelectedInstrumentsBar>
    </HorizontalScrollContainer>
  );
}
