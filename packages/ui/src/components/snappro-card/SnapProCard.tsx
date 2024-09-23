import { InstrumentStatus, SnapProInstrumentStatusDto } from "@viewpoint/api";
import { Card, CardBody, SpotText } from "@viewpoint/spot-react";
import classNames from "classnames";
import SnapProEmptyImg from "../../assets/instruments/display/300x300/SNAPPro_empty.png";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { StatusPill } from "../status-pill/StatusPill";
import { AriaRole, ReactNode } from "react";
import { useFormatDateTime12h } from "../../utils/hooks/datetime";
import { t } from "i18next";

const Root = styled.div``;

interface SnapProCardProps {
  className?: string;
  "data-testid"?: string;
  role?: AriaRole;

  status: SnapProInstrumentStatusDto;

  selected?: boolean;

  onClick?: () => void;
}

const StyledCard = styled(Card)`
  box-sizing: border-box;

  && {
    border-color: ${(p: { theme: Theme }) => p.theme.colors?.borders?.primary};
  }

  &&.selected {
    border-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.interactive?.secondary};
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.interactive?.hoverSecondary};
  }
`;

const Body = styled(CardBody)`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 2fr;
  gap: 20px;
  padding: 10px;
`;

const Image = styled.img`
  object-fit: cover;
`;

const NamedFieldRoot = styled.div`
  display: flex;
  flex-direction: column;
  flex: auto;
`;

const ColumnRoot = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  gap: 20px;
  overflow-x: hidden;

  & > * {
    flex: 1 1 50px;
  }
`;

interface ColumnProps {
  className?: string;
  children?: ReactNode;
}

const Column = (props: ColumnProps) => {
  const classes = classNames(props.className, "column");
  return <ColumnRoot className={classes} {...props} />;
};

const StatusRoot = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

const PatientName = styled(SpotText)`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

/**
 * Returns an adjusted snap pro 'visible' status based on its natural status.
 *
 * This adjusted status is meant to adjust how the snap pro looks to users in
 * the UI, and not meant to reflect any real change in behavior of the device.
 *
 * @param naturalStatus - InstrumentStatus of a snap pro as returned from the IVLS backend
 * @returns - a new InstrumentStatus that makes offline devices look offline in the UI
 */
function visibleStatus(naturalStatus: InstrumentStatus) {
  if (naturalStatus === InstrumentStatus.Standby) {
    return InstrumentStatus.Offline;
  }

  return naturalStatus;
}

interface StatusProps {
  className?: string;

  status: InstrumentStatus;
  patientName?: string;
}

const Status = (props: StatusProps) => {
  const classes = classNames(props.className, "status");
  return (
    <StatusRoot className={classes}>
      <div>
        <StatusPill status={visibleStatus(props.status)} outline={false} />
      </div>
      {props.patientName != null && (
        <PatientName level="secondary" bold>
          {props.patientName}
        </PatientName>
      )}
    </StatusRoot>
  );
};

const NamedField = (props: { name: string; value?: string }) => {
  return (
    <NamedFieldRoot>
      <SpotText level="secondary" bold>
        {props.name}
      </SpotText>
      <SpotText level="secondary">{props.value}</SpotText>
    </NamedFieldRoot>
  );
};

const DividerRoot = styled.div`
  flex: 1 1 auto;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
`;

const DividerElem = styled.div`
  flex: 1 0 80px;
  border: 0 solid ${(p: { theme: Theme }) => p.theme.colors?.borders?.primary};
  border-left-width: 1px;
  margin: 20px 0;
`;

const Divider = () => {
  return (
    <DividerRoot>
      <DividerElem />
    </DividerRoot>
  );
};

function SnapProCard(props: SnapProCardProps) {
  const classes = classNames(props.className, "snap-pro-card", {
    selected: props.selected,
  });

  const formatDateTime12h = useFormatDateTime12h();

  return (
    <Root
      className={classes}
      data-testid={props["data-testid"]}
      role={props.role}
      onClick={props.onClick}
    >
      <StyledCard className={classes}>
        <Body>
          <Image height="120" width="80" src={SnapProEmptyImg} />
          <Column>
            <Status
              status={props.status.instrumentStatus}
              patientName={props.status.patientName}
            />
            <NamedField
              name={t("instrumentScreens.general.labels.lastConnected")}
              value={formatDateTime12h(props.status.lastConnectedDate)}
            />
          </Column>
          <Divider />
          <Column>
            <NamedField
              name={t("instrumentScreens.general.labels.softwareVersion")}
              value={props.status.instrument.softwareVersion}
            />
            <NamedField
              name={t("instrumentScreens.general.labels.serialNumber")}
              value={props.status.instrument.instrumentSerialNumber}
            />
          </Column>
        </Body>
      </StyledCard>
    </Root>
  );
}

export type { SnapProCardProps };
export { SnapProCard };
