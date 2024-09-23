import { InstrumentType } from "@viewpoint/api";
import { NavItem, Pill } from "@viewpoint/spot-react";
import { useInstrumentStatusForId } from "../../utils/hooks/hooks";
import styled from "styled-components";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { useContext } from "react";
import { ViewPointAppStateApiContext } from "../../context/AppStateContext";
import { useFilteredInstrumentAlerts } from "../alerts/alert-hooks";

export const TestId = {
  AlertPill: "alerted-instrument-pill",
};

const ImageIcon = styled.img`
  height: 12px;
  width: 12px;
`;

const CountText = styled.div`
  margin-right: 5px;
`;

export interface AlertIndicatorProps {
  instrumentType?: InstrumentType;
  alertCount: number;
  onClick: () => void;
}

export function AlertIndicator(props: AlertIndicatorProps) {
  return (
    <Pill
      interactive
      onClick={props.onClick}
      level="negative"
      leftIcon="alert-notification"
      data-testid={TestId.AlertPill}
    >
      <CountText>{getAlertCountLabel(props.alertCount)}</CountText>
      {props.instrumentType != null && (
        <ImageIcon src={getInstrumentDisplayImage(props.instrumentType)} />
      )}
    </Pill>
  );
}

interface AdditionalAlertsIndicator {
  onClick: () => void;
}

function AdditionalAlertsIndicator(props: AdditionalAlertsIndicator) {
  return (
    <Pill
      interactive
      onClick={props.onClick}
      level="negative"
      leftIcon="alert-notification"
      data-testid={TestId.AlertPill}
    >
      <CountText>...</CountText>
    </Pill>
  );
}

const getAlertCountLabel = (count: number) =>
  count < 2 ? undefined : count < 9 ? count.toString() : `9+`;

const StyledNavItem = styled(NavItem)`
  gap: 10px;

  .spot-icon {
    width: 12px;
    height: 12px;
  }
`;

export function AlertNavItem() {
  const { showAlertsModal } = useContext(ViewPointAppStateApiContext);
  const getStatusForId = useInstrumentStatusForId();
  const { data: filteredAlerts } = useFilteredInstrumentAlerts();

  return (
    <StyledNavItem>
      {/* Only ever show 4 alert pills in the header. If there are 4 alerted instruments, 
          show all 4. If there are 5 alerted instruments, show 3 instruments and then 
          the "additional alerts" indicator as the 4th pill */}
      {filteredAlerts
        ?.slice(0, filteredAlerts.length > 4 ? 3 : 4)
        .map((instrumentAlert) => (
          <AlertIndicator
            onClick={() => showAlertsModal(instrumentAlert.instrumentId)}
            key={instrumentAlert.instrumentId}
            instrumentType={
              getStatusForId(instrumentAlert.instrumentId)?.instrument
                .instrumentType
            }
            alertCount={instrumentAlert.alerts.length}
          />
        ))}
      {(filteredAlerts?.length ?? 0) > 4 && (
        <AdditionalAlertsIndicator onClick={() => showAlertsModal()} />
      )}
    </StyledNavItem>
  );
}
