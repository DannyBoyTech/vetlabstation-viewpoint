import styled from "styled-components";
import { PropsWithChildren } from "react";
import { QcLotDto } from "@viewpoint/api";
import { SpotText } from "@viewpoint/spot-react";

const BodyRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  li {
    margin-top: 10px;
  }
`;
const LotInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 10px;
  max-width: 300px;
`;

export interface SediVueDxQcInstructionsProps extends PropsWithChildren {
  qcLotInfo: QcLotDto;
}

export function SediVueDxQcInstructionsBody(
  props: SediVueDxQcInstructionsProps
) {
  return (
    <BodyRoot>
      <LotInfoGrid>
        <SpotText level="paragraph" bold>
          Lot:
        </SpotText>
        <SpotText level="paragraph">{props.qcLotInfo.lotNumber}</SpotText>
        <SpotText level="paragraph" bold>
          Level:
        </SpotText>
        <SpotText level="paragraph">{props.qcLotInfo.fluidType}</SpotText>
      </LotInfoGrid>

      {props.children}
    </BodyRoot>
  );
}
