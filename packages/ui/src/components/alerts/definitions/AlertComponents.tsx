import { Trans, useTranslation } from "react-i18next";
import { getInstrumentDisplayImage } from "../../../utils/instrument-utils";
import { Badge } from "@viewpoint/spot-react";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import styled from "styled-components";
import {
  AlertAction,
  AlertDto,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import Button, {
  ButtonProps,
} from "@viewpoint/spot-react/src/components/button/Button";
import { usePerformAlertActionMutation } from "../../../api/InstrumentAlertApi";
import { InlineText } from "../../typography/InlineText";
import { SpotIcon } from "@viewpoint/spot-icons/src";
import { getDefaultTextFromAlert } from "./alert-component-utils";

const ContentRoot = styled.div`
  height: 100%;
  display: flex;
  gap: 40px;
  overflow: hidden;
  padding: 16px 32px;
`;
const LeftColumn = styled.div`
  flex: 1;
  z-index: 100;

  .spot-badge {
    transform: translate(-10%, -30%);
  }
`;
const RightColumn = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  flex: 4;
`;
const InstrumentImage = styled.img`
  height: 100%;
  width: 100%;
  object-fit: contain;
`;
const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;
const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
  margin-right: 5px;
`;

const TestIds = {
  alertActionButton: "alert-action-button",
  alertTextContent: "alert-text-content",
  alertActionsContainer: "alert-actions-container",
} as const;

interface AlertContentProps {
  instrumentType: InstrumentType;
  instrumentId: number;
  alertDto: AlertDto;
  actions?: React.ReactNode;
  additionalContent?: React.ReactNode;
  content?: React.ReactNode;
}

/** Lower level alert content component that can be used if significant customization
 * is needed for the alert content. In most cases, GenericActionAlertContent can
 * be used instead.
 **/
export function AlertContent(props: AlertContentProps) {
  const { t } = useTranslation("alerts");
  return (
    <ContentRoot>
      <LeftColumn>
        <Badge
          color="negative"
          size="large"
          badgeContent={<SpotIcon name="alert-notification" />}
        >
          <InstrumentImage
            src={getInstrumentDisplayImage(props.instrumentType)}
          />
        </Badge>
      </LeftColumn>

      <RightColumn>
        <TextContent data-testid={TestIds.alertTextContent}>
          {props.content ?? (
            <InlineText level="paragraph">
              <Trans
                ns="alerts"
                i18nKey={
                  `${props.instrumentType}.${props.alertDto.name}.body` as any
                }
                defaults={
                  getDefaultTextFromAlert(props.alertDto) ??
                  t("default.message")
                }
                values={props.alertDto.args}
                components={{ ...CommonTransComponents }}
              />
            </InlineText>
          )}
          <div>{props.additionalContent}</div>
        </TextContent>
        <ActionContainer data-testid={TestIds.alertActionsContainer}>
          {props.actions}
        </ActionContainer>
      </RightColumn>
    </ContentRoot>
  );
}

export interface GenericActionAlertContentProps {
  alert: AlertDto;
  instrumentStatus: InstrumentStatusDto;
  // Actions to allow the user to perform, mapped to buttons shown to the user.
  // Clicking the button will automatically post the action for the given alert
  // back to the IVLS server
  actions: AlertAction[];
  // Optional Additional content to display after the primary alert content
  additionalContent?: React.ReactNode;
  // Escape hatch to override the alert content displayed. Used primarily to
  // override the unmapped alert fallback behavior on a per-instrument basis
  content?: React.ReactNode;
  // Optionally override props for a given action button
  getButtonProps?: (
    action: AlertAction
  ) => Partial<AlertActionButtonProps> | undefined;
  // Optional additional logic to perform after user selects an action
  afterPostAction?: (action: AlertAction) => void;
  // Optionally override the content of an action button
  getButtonContent?: (action: AlertAction) => React.ReactNode;
  // For the provided actions, do not post back to IVLS
  skipActions?: AlertAction[];
}

/**
 * Higher level alert content component that provides optional customization
 * suitable for most alert layouts
 */
export function GenericActionAlertContent(
  props: GenericActionAlertContentProps
) {
  return (
    <AlertContent
      instrumentType={props.instrumentStatus.instrument.instrumentType}
      instrumentId={props.instrumentStatus.instrument.id}
      alertDto={props.alert}
      content={props.content}
      additionalContent={props.additionalContent}
      actions={props.actions.map((action) => (
        <AlertActionButton
          key={props.alert.uniqueId + "_" + action}
          instrumentId={props.instrumentStatus.instrument.id}
          alertAction={action}
          alert={props.alert}
          onClick={() => props.afterPostAction?.(action)}
          skipPostAction={props.skipActions?.includes(action)}
          {...props.getButtonProps?.(action)}
        >
          {props.getButtonContent?.(action) ?? (
            <Trans
              ns="alerts"
              i18nKey={`defaultActionButtons.${action}` as any}
              values={props.alert.args}
            />
          )}
        </AlertActionButton>
      ))}
    />
  );
}

export interface AlertActionButtonProps extends ButtonProps {
  instrumentId: number;
  alertAction: AlertAction;
  alert: AlertDto;
  skipPostAction?: boolean;
}

export function AlertActionButton({
  instrumentId,
  alert,
  alertAction,
  skipPostAction,
  ...props
}: AlertActionButtonProps) {
  const [postAction, postActionStatus] = usePerformAlertActionMutation();

  const onClick = async (ev: any) => {
    if (!skipPostAction) {
      await postAction({
        instrumentId,
        actionDto: {
          alert,
          action: alertAction,
        },
      }).unwrap();
    }
    props.onClick?.(ev);
  };

  return (
    <Button
      data-testid={TestIds.alertActionButton}
      {...props}
      onClick={onClick}
      disabled={props.disabled || postActionStatus.isLoading}
    />
  );
}
