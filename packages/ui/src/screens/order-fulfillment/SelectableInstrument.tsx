import {
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ViewpointThemeContext } from "../../context/ThemeContext";
import { Analyzer } from "./Analyzer";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { SpotIcon } from "@viewpoint/spot-icons";
import classnames from "classnames";

export const TestId = {
  SelectableInstrument: (serialNumber: string) =>
    `selectable-analyzer-${serialNumber}`,
};

const AnalyzerDetails = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  transition: margin 300ms;
`;

const Spacer = styled.div`
  margin-left: 0px;
  transition: margin 300ms;

  &.selected {
    margin-left: 20px;
  }
`;

const AdditionalContentRoot = styled.div`
  max-height: 0px;
  opacity: 0%;
  transition: all 300ms;
  overflow: auto;

  &.selected {
    max-height: 500px;
    opacity: 100%;
  }
`;

interface AdditionalContentProps {
  className?: string;
  ["data-testid"]?: string;

  selected?: boolean;
  onReadyChange?: (ready: boolean) => void;
  children?: ReactNode;
}

function AdditionalContent(props: AdditionalContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const classes = classnames({ selected: props.selected });

  const { onReadyChange } = props;
  useEffect(() => {
    const onTransitionStart = () => {
      onReadyChange?.(false);
    };
    const onTransitionEnd = () => {
      onReadyChange?.(true);
    };

    const refCurrent = ref.current; //close over this for cleanup purposes

    refCurrent?.addEventListener("transitionstart", onTransitionStart);
    refCurrent?.addEventListener("transitionend", onTransitionEnd);

    return () => {
      refCurrent?.removeEventListener("transitionstart", onTransitionStart);
      refCurrent?.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [onReadyChange]);

  return (
    <AdditionalContentRoot className={classes} ref={ref}>
      {props.children}
    </AdditionalContentRoot>
  );
}

const SelectableInstrumentRoot = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 6px 0 0;
  border-radius: 10px;
  background-color: ${(t: { theme: Theme; selected: boolean }) =>
    t.selected
      ? t.theme.colors?.background?.primary
      : t.theme.colors?.background?.disabled};

  border: ${(t: { theme: Theme; selected: boolean }) =>
    t.selected ? t.theme.borders?.controlFocus : t.theme.borders?.lightPrimary};

  border-width: 2px;
`;

export interface SelectableInstrumentProps extends PropsWithChildren {
  name?: string;
  type: InstrumentType;
  status: InstrumentStatus;
  serialNumber?: string;
  manualInstrument: boolean;
  selected: boolean;
  selectedSampleType: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function SelectableInstrument(props: SelectableInstrumentProps) {
  const { theme } = useContext(ViewpointThemeContext);
  const elementRef = useRef<HTMLDivElement>(null);
  const [contentReady, setContentReady] = useState(false);
  const [scrollWaiting, setScrollWaiting] = useState(false);

  useEffect(() => {
    if (contentReady && scrollWaiting) {
      elementRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
      setScrollWaiting(false);
    }
  }, [contentReady, scrollWaiting]);

  const handleAnalyzerClick: MouseEventHandler = (ev) => {
    // Don't let the event bubble to parent, since the "add" icon is a child of the analyzer details,
    // and both are clickable to add the analyzer
    ev.stopPropagation();
    // If LOB/UX is OK with the visual implementation for multiple queued runs, remove this check
    if (!props.selected) {
      setScrollWaiting(true);
      props.onAdd();
    }
  };

  const handleRemove: MouseEventHandler = (ev) => {
    ev.stopPropagation();
    // If LOB/UX is OK with the visual implementation for multiple queued runs, stop propagation of the event here
    // so that it doesn't bubble to the parent and add the removed analyzer back
    props.onRemove();
  };

  const className = classnames({
    selected: props.selected,
  });

  const analyzerDetailsClassName = classnames({
    selected:
      props.selected &&
      !(props.children as unknown[]).every?.((item) => !!item),
  });

  return (
    <SelectableInstrumentRoot
      ref={elementRef}
      selected={props.selected}
      data-testid={TestId.SelectableInstrument(props.serialNumber ?? "unknown")}
    >
      <AnalyzerDetails
        onClick={handleAnalyzerClick}
        selected={props.selected}
        className={analyzerDetailsClassName}
      >
        <Analyzer
          type={props.type}
          status={props.status}
          manualInstrument={props.manualInstrument}
          name={props.name}
          selectedSampleType={props.selectedSampleType}
        />
        <Spacer className={className} />

        {props.selected ? (
          <div
            data-testid={"selectable-analyzer-delete-icon"}
            onClick={handleRemove}
          >
            <SpotIcon
              name={"delete"}
              size={25}
              style={{ marginLeft: "auto" }}
              color={theme.colors?.interactive?.primary}
            />
          </div>
        ) : (
          <div
            data-testid={"selectable-analyzer-add-icon"}
            onClick={handleAnalyzerClick}
          >
            <SpotIcon
              name={"add"}
              size={25}
              style={{ marginLeft: "auto" }}
              color={theme.colors?.interactive?.primary}
            />
          </div>
        )}
      </AnalyzerDetails>
      {props.children && (
        <AdditionalContent
          className={className}
          onReadyChange={setContentReady}
          selected={props.selected}
        >
          {props.children}
        </AdditionalContent>
      )}
    </SelectableInstrumentRoot>
  );
}
