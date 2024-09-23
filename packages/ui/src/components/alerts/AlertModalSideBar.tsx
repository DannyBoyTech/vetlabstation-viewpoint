import { InstrumentAlertDto, InstrumentStatusDto } from "@viewpoint/api";
import { useInstrumentStatusForId } from "../../utils/hooks/hooks";
import { useMemo } from "react";
import styled from "styled-components";
import { DarkTheme, SpotTokens, Theme } from "../../utils/StyleConstants";
import { List } from "@viewpoint/spot-react";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { Badge } from "@viewpoint/spot-react/src";
import { SideBarModalSideBarRoot } from "../modal/ModalWithSideBar";

export const TestId = {
  Instrument: (instrumentId: number) =>
    `alert-modal-instrument-${instrumentId}`,
};

const TestIds = {
  alertModalSideBarImage: "alert-modal-side-bar-image",
} as const;

const StyledSideBarRoot = styled(SideBarModalSideBarRoot)`
  .spot-badge--negative {
    color: ${SpotTokens.color.white};
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.feedback?.error};
  }
`;

const InstrumentImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

interface AlertModalSideBar {
  selectedInstrumentId?: number;
  onInstrumentSelected: (instrumentId: number) => void;
  instrumentAlerts?: InstrumentAlertDto[];
}

export function AlertModalSideBar(props: AlertModalSideBar) {
  const getInstrumentStatus = useInstrumentStatusForId();
  const mappedInstruments: InstrumentStatusDto[] = useMemo(
    () =>
      props.instrumentAlerts
        ?.map((ia) => getInstrumentStatus(ia.instrumentId))
        .filter((is) => is != null),
    [getInstrumentStatus, props.instrumentAlerts]
  ) as InstrumentStatusDto[];

  return (
    <StyledSideBarRoot>
      {mappedInstruments?.map((is: InstrumentStatusDto) => (
        <List.Item
          key={is.instrument.id}
          data-testid={TestId.Instrument(is.instrument.id)}
          active={props.selectedInstrumentId === is.instrument.id}
          onClick={() => props.onInstrumentSelected(is.instrument.id)}
        >
          <Badge
            data-testid={TestIds.alertModalSideBarImage}
            color="negative"
            badgeContent={
              props.instrumentAlerts?.find(
                (iad) => iad.instrumentId === is.instrument.id
              )?.alerts.length
            }
          >
            <InstrumentImage
              src={getInstrumentDisplayImage(is.instrument.instrumentType)}
            />
          </Badge>
        </List.Item>
      ))}
    </StyledSideBarRoot>
  );
}
