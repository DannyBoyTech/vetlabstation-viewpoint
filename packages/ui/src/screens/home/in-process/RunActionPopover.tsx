import { Link, Popover } from "@viewpoint/spot-react";
import {
  Fragment,
  MouseEventHandler,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { Theme } from "../../../utils/StyleConstants";
import { TFunction, useTranslation } from "react-i18next";
import { SpotIcon, SpotIconName } from "@viewpoint/spot-icons";
import { PopoverFrom } from "@viewpoint/spot-react/src/components/popover/Popover";

export const TestId = {
  Popover: "run-action-popover",
};

export const RunActions = {
  Start: "Start",
  Cancel: "Cancel",
  EnterResults: "EnterResults",
  SelectSnapTest: "SelectSnapTest",
  AddDetails: "AddDetails",
  EjectCartridge: "EjectCartridge",
  StartTimer: "StartTimer",
} as const;
export type RunAction = (typeof RunActions)[keyof typeof RunActions];

export interface RunActionDefinition {
  action: RunAction;
  disabled?: boolean;
  label?: string;
  iconName?: SpotIconName;
}

const StyleContainer = styled.div`
  display: contents;

  .spot-popover-target {
    width: 100%;
  }
`;

const ListContainer = styled.div`
  white-space: nowrap;
  min-width: 100px;
`;

export interface RunActionPopoverProps extends PropsWithChildren {
  open?: boolean;
  className?: string;
  availableActions: RunActionDefinition[];
  onAction?: (action: RunAction) => void;
  onClose: () => void;
  omitDivider?: boolean;
  intersectionRootRef?: MutableRefObject<HTMLElement | null>;
  runDetails?: ReactNode;
}

export const RunActionPopover = (props: RunActionPopoverProps) => {
  const [popFrom, setPopFrom] = useState<PopoverFrom>("bottom");

  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleAction = (action: RunAction) => {
    props.onAction?.(action);
  };

  const availableActions = [...props.availableActions];
  const { t } = useTranslation();

  return (
    <StyleContainer>
      <Popover
        open={props.open}
        onClickAway={props.onClose}
        popFrom={popFrom}
        offsetTo="left"
        caretAlign="right"
        target={props.children}
        intersectionRootRef={props.intersectionRootRef}
        onOutOfView={(pos) => {
          if (pos === "bottom") {
            setPopFrom("top");
          } else {
            setPopFrom("bottom");
          }
        }}
      >
        <ListContainer ref={contentRef} data-testid={TestId.Popover}>
          {props.runDetails != null && (
            <>
              {props.runDetails}
              <Divider />
            </>
          )}
          {availableActions.map((def, index) => {
            return (
              <Fragment key={def.action}>
                {availableActions.length > 1 &&
                index === availableActions.length - 1 &&
                !props.omitDivider ? (
                  <Divider />
                ) : null}
                <ActionLink
                  onClick={() => handleAction(def.action)}
                  label={def.label ?? getActionLabel(t, def.action)}
                  disabled={def.disabled}
                  iconName={def.iconName}
                />
              </Fragment>
            );
          })}
        </ListContainer>
      </Popover>
    </StyleContainer>
  );
};

const StyledLink = styled(Link)`
  margin: 10px 0;
`;

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

const ActionLinkContainer = styled.div`
  display: flex;
`;

interface ActionLinkProps {
  onClick: MouseEventHandler;
  label: string;
  disabled?: boolean;
  iconName?: SpotIconName;
}

const ActionLink = (props: ActionLinkProps) => {
  return (
    <ActionLinkContainer>
      <StyledLink
        onClick={props.disabled ? undefined : props.onClick}
        size="medium"
        disabled={props.disabled}
        iconLeft={
          props.iconName == null ? undefined : (
            <SpotIcon name={props.iconName} />
          )
        }
      >
        {props.label}
      </StyledLink>
    </ActionLinkContainer>
  );
};

export function getActionLabel(t: TFunction, action: RunAction): string {
  switch (action) {
    case RunActions.Cancel:
      return t("inProcess.analyzerRun.buttons.cancelRun");
    case RunActions.Start:
      return t("inProcess.analyzerRun.buttons.startRun");
    case RunActions.EjectCartridge:
      return t("inProcess.analyzerRun.buttons.ejectCartridge");
    case RunActions.StartTimer:
      return t("inProcess.analyzerRun.buttons.startTimer");
    case RunActions.EnterResults:
    case RunActions.SelectSnapTest:
      return t("inProcess.analyzerRun.buttons.addResults");
    default:
      return action;
  }
}
