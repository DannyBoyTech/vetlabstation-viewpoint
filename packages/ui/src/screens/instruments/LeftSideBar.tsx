import { InstrumentStatusDto } from "@viewpoint/api";
import { LegacyRef, useContext, useEffect, useRef } from "react";
import styled from "styled-components";
import { DarkTheme, Theme } from "../../utils/StyleConstants";
import { useInstrumentNameForId } from "../../utils/hooks/hooks";
import { InstrumentStatusDetail } from "../../components/analyzer-indicator/InstrumentStatusDetail";
import type { InstrumentScreenSelection } from "./InstrumentsScreen";
import { List, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import { getSystemDisplayImage } from "../../utils/instrument-utils";

const SideBarRoot = styled.div.attrs({
  className: DarkTheme.primaryContainerClass,
})`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: 250px;
  height: 100%;
  padding-left: 10px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.getOppositeTheme().colors?.background?.primary};
`;

const SystemItemContentWrapper = styled.div`
  display: flex;
  gap: 1em;
  align-items: center;
  flex: 1;
  margin: 4px 0;
`;

const SystemImageContainer = styled.div`
  width: 50px;
`;

const SystemImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

const StyledListItem = styled(List.Item)`
  justify-content: center;

  .spot-typography__text--body {
    color: ${(p: { theme: Theme }) =>
      p.theme.getOppositeTheme().colors?.borders?.control};
  }

  &.spot-list-group__item--active .spot-typography__text--body {
    color: ${(p: { theme: Theme }) =>
      p.theme.getOppositeTheme().colors?.text?.primary};
  }
`;

interface SideBarProps {
  instruments: InstrumentStatusDto[];
  onSelected: (selection: InstrumentScreenSelection) => void;
  selectedOption: InstrumentScreenSelection;
}

export function LeftSideBar(props: SideBarProps) {
  const { t } = useTranslation();

  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (typeof props.selectedOption === "number") {
      itemRefs.current[props.selectedOption as number]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [props.selectedOption]);

  return (
    <SideBarRoot>
      <StyledListItem
        active={props.selectedOption === "SYSTEM"}
        onClick={() => props.onSelected("SYSTEM")}
      >
        <SystemItemContentWrapper>
          <SystemImageContainer>
            <SystemImage src={getSystemDisplayImage()} />
          </SystemImageContainer>
          <SpotText level="paragraph" style={{ fontWeight: "bold" }}>
            {t("instrumentScreens.general.labels.system")}
          </SpotText>
        </SystemItemContentWrapper>
      </StyledListItem>

      {props.instruments.map((instrumentStatus) => (
        <InstrumentListItem
          key={instrumentStatus.instrument.id}
          instrument={instrumentStatus}
          active={props.selectedOption === instrumentStatus.instrument.id}
          onClick={() => props.onSelected(instrumentStatus.instrument.id)}
          innerRef={(element) =>
            (itemRefs.current[instrumentStatus.instrument.id] = element)
          }
        />
      ))}
    </SideBarRoot>
  );
}

interface InstrumentListItemProps {
  instrument: InstrumentStatusDto;
  active: boolean;
  onClick: () => void;
  innerRef?: LegacyRef<HTMLDivElement>;
}

function InstrumentListItem(props: InstrumentListItemProps) {
  const instrumentNameForId = useInstrumentNameForId();
  const { theme } = useContext(ViewpointThemeContext);
  return (
    <StyledListItem active={props.active} onClick={props.onClick}>
      <InstrumentStatusDetail
        name={instrumentNameForId(props.instrument.instrument.id)}
        type={props.instrument.instrument.instrumentType}
        status={props.instrument.instrumentStatus}
        iconColor={theme.getOppositeTheme().colors?.text?.primary}
        useOutline={true}
        hidePseudoStatus={true}
      />
      <div ref={props.innerRef} />
    </StyledListItem>
  );
}
