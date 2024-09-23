import { Trans } from "react-i18next";
import styled from "styled-components";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import LoadMaterialsPng from "../../../../assets/instruments/maintenance/catOne/offsets/CatOne_Offsets_LoadMaterials.png";
import { useEventListener } from "../../../../context/EventSourceContext";
import {
  EventIds,
  InstrumentMaintenanceResultDto,
  MaintenanceProcedure,
} from "@viewpoint/api";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Root = styled.div`
  flex: auto;
  display: flex;
  gap: 50px;
  padding: 20px;
`;

const ImageColumn = styled.div`
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
`;

const InstructionsColumn = styled.div`
  flex: 1 1 50%;
`;

const InstructionsRoot = styled.div`
  padding-right: 50px;

  ol {
    margin-block-start: 5px;
    margin-block-end: 5px;
    padding-inline-start: 20px;
  }
`;

export interface LoadMaterialsProps {
  instrumentId: number;
}

export function LoadMaterials({ instrumentId }: LoadMaterialsProps) {
  const nav = useNavigate();

  const handleMaintenanceResult = useCallback(
    (ev: MessageEvent) => {
      const resultEvent: InstrumentMaintenanceResultDto = JSON.parse(ev.data);

      const instrument = resultEvent.instrument;
      const maintenanceType = resultEvent.maintenanceType;
      if (
        instrument.id === instrumentId &&
        maintenanceType === MaintenanceProcedure.OFFSETS
      ) {
        nav("/");
      }
    },
    [instrumentId, nav]
  );

  useEventListener(
    EventIds.InstrumentMaintenanceResult,
    handleMaintenanceResult
  );

  return (
    <Root>
      <ImageColumn>
        <img src={LoadMaterialsPng} />
      </ImageColumn>
      <InstructionsColumn>
        <InstructionsRoot>
          <Trans
            i18nKey="instrumentScreens.catOne.offsetsWizard.loadMaterials.instructions"
            components={CommonTransComponents}
          />
        </InstructionsRoot>
      </InstructionsColumn>
    </Root>
  );
}
