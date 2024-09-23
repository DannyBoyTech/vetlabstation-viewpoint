import styled from "styled-components";
import {
  InstrumentStatus as InstStatus,
  InstrumentType,
  InstrumentType as InstType,
} from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import classnames from "classnames";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { StatusPill } from "../status-pill/StatusPill";
import { useContext } from "react";
import { Pill, SpotText } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { ViewpointThemeContext } from "../../context/ThemeContext";

interface StatusDetailProps {
  className?: string;
  "data-testid"?: string;

  name: string;
  type: InstType;
  iconColor?: string;
  status?: InstStatus;
  manualInstrument?: boolean;
  useOutline?: boolean;
  hidePseudoStatus?: boolean;
}

const IndicatorContainer = styled.div.attrs((props) => ({
  className: props.className,
}))`
  display: flex;
  gap: 1em;
  align-items: center;
  flex: 1;
  margin: 4px 0;
`;
const Description = styled.div.attrs((props) => ({
  className: props.className,
}))`
  display: flex;
  flex-direction: column;
  min-width: 0px;
  overflow: hidden;
  text-overflow: ellipsis;

  .spot-typography__text--body {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .spot-typography__text--tertiary {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
const ImageContainer = styled.div`
  width: 50px;
`;
const InstrumentImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;
const PillContainer = styled.div`
  margin-top: 0.25em;
`;

// some instruments have a reported status, but it isn't considered 'real'
const PSEUDO_STATUS_INSTRUMENT_TYPES = new Set([
  InstrumentType.SNAP,
  InstrumentType.SNAPPro,
]);

export const InstrumentStatusDetail = (props: StatusDetailProps) => {
  const { t } = useTranslation();
  const classes = classnames("", props.className);
  const { theme } = useContext(ViewpointThemeContext);

  return (
    <IndicatorContainer className={classes} data-testid={props["data-testid"]}>
      <ImageContainer>
        {props.type === InstrumentType.InterlinkPims ? (
          <SpotIcon
            name="workstation"
            color={props.iconColor ?? theme.colors?.text?.primary}
            size={50}
          />
        ) : (
          <InstrumentImage src={getInstrumentDisplayImage(props.type)} />
        )}
      </ImageContainer>
      <Description>
        <SpotText level="paragraph" style={{ fontWeight: "bold" }}>
          {props.name}
        </SpotText>
        <PillContainer>
          {props.manualInstrument ? (
            <Pill level="secondary" outline={props.useOutline}>
              {t("instruments.status.MANUAL_ENTRY")}
            </Pill>
          ) : props.hidePseudoStatus &&
            PSEUDO_STATUS_INSTRUMENT_TYPES.has(props.type) ? null : (
            <StatusPill
              status={props.status ?? InstStatus.Unknown}
              outline={props.useOutline}
            />
          )}
        </PillContainer>
      </Description>
    </IndicatorContainer>
  );
};
