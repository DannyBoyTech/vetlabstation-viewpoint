import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import {
  EventIds,
  InstrumentSettingResponseDto,
  InstrumentSettingKey,
  InstrumentType,
} from "@viewpoint/api";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { Button, Modal, SpotText } from "@viewpoint/spot-react";
import { useUpdateInstrumentSettingMutation } from "../../../../api/InstrumentApi";
import {
  useEventListener,
  useEventSource,
} from "../../../../context/EventSourceContext";
import { SpotIcon } from "@viewpoint/spot-icons";
import { ViewpointThemeContext } from "../../../../context/ThemeContext";

const Table = styled.div`
  flex: 2;
  gap: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`;
const Cell = styled.div<{ column?: number }>`
  ${(p) => (p.column != null ? `grid-column: ${p.column};` : "")}
  display: flex;
  align-items: center;
`;

const InlineText = styled(SpotText)`
  display: inline;
`;

const DoneButton = styled(Button)`
  && {
    margin-left: auto;
  }
`;

interface UpdateSettingsModalProps {
  open: boolean;
  onClose: () => void;
  instrumentType: InstrumentType;
  instrumentId: number;
  updatedSettings: { [key in InstrumentSettingKey]?: number };
  currentSettings: { [key in InstrumentSettingKey]?: number };
}

export function UpdateSettingsModal(props: UpdateSettingsModalProps) {
  // Track whether the user has submitted the async request to update the instrument setting
  const [updateSubmitted, setUpdateSubmitted] = useState(false);
  // Track whether the update has been processed by the instrument and a response has been received via AMQP
  const [updateProcessed, setUpdateProcessed] = useState(false);

  const { t } = useTranslation();

  // Async request -- this request hits the IVLS and returns almost immediately. Asynchronously, the instrument receives
  // the update from IVLS and processes it, then the result of the update is sent back to the client via AMQP message
  const [updateSetting] = useUpdateInstrumentSettingMutation();

  const handleUpdate = useCallback(() => {
    setUpdateSubmitted(true);
    for (const setting of Object.keys(
      props.updatedSettings
    ) as InstrumentSettingKey[]) {
      updateSetting({
        instrumentId: props.instrumentId,
        settingKey: setting,
        value: `${props.updatedSettings[setting]}`,
      });
    }
  }, [updateSetting, props.updatedSettings, props.instrumentId]);

  useEffect(() => {
    // Reset when the modal is closed
    setUpdateProcessed(false);
    setUpdateSubmitted(false);
  }, [props.open]);

  return (
    <BasicModal
      open={props.open}
      onClose={props.onClose}
      bodyContent={
        <UpdateSettingsModalBody
          requestSubmitted={updateSubmitted}
          instrumentId={props.instrumentId}
          instrumentType={props.instrumentType}
          updatedSettings={props.updatedSettings}
          currentValues={props.currentSettings}
          onUpdateProcessed={() => setUpdateProcessed(true)}
        />
      }
      headerContent={
        <SpotText level="h2" className="spot-modal__title">
          {t(
            "instrumentScreens.common.catalyst.advancedSettings.modal.header",
            { instrumentType: t(`instruments.names.${props.instrumentType}`) }
          )}
        </SpotText>
      }
      footerContent={
        <>
          {!updateProcessed && (
            <Modal.FooterCancelButton onClick={props.onClose}>
              {t("general.buttons.cancel")}
            </Modal.FooterCancelButton>
          )}
          {!updateProcessed ? (
            <Button
              buttonType="primary"
              onClick={handleUpdate}
              disabled={updateSubmitted}
            >
              {t(
                "instrumentScreens.common.catalyst.advancedSettings.modal.send"
              )}
            </Button>
          ) : (
            <DoneButton buttonType="primary" onClick={props.onClose}>
              {t("general.buttons.done")}
            </DoneButton>
          )}
        </>
      }
    />
  );
}

interface UpdateSettingsModalBodyProps {
  requestSubmitted: boolean;
  instrumentId: number;
  instrumentType: InstrumentType;
  updatedSettings: { [key in InstrumentSettingKey]?: number };
  currentValues: { [key in InstrumentSettingKey]?: number };
  onUpdateProcessed: () => void;
}

function UpdateSettingsModalBody(props: UpdateSettingsModalBodyProps) {
  const { t } = useTranslation();

  return (
    <ModalBodyContent>
      <div>
        <Trans
          i18nKey={
            props.requestSubmitted
              ? "instrumentScreens.common.catalyst.advancedSettings.modal.submittedBody"
              : "instrumentScreens.common.catalyst.advancedSettings.modal.body"
          }
          values={{
            instrumentType: t(`instruments.names.${props.instrumentType}`),
          }}
          components={{
            strong: <InlineText level="paragraph" bold />,
          }}
        />
      </div>
      <Table>
        <Cell column={2}>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.common.catalyst.advancedSettings.existing")}
          </SpotText>
        </Cell>
        <Cell>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.common.catalyst.advancedSettings.proposed")}
          </SpotText>
        </Cell>
        <Cell>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.common.catalyst.advancedSettings.status")}
          </SpotText>
        </Cell>

        {(Object.keys(props.updatedSettings) as InstrumentSettingKey[])
          .sort()
          .map((setting) => (
            <Fragment key={setting}>
              <Cell column={1}>
                <SpotText level="paragraph" bold>
                  {t(
                    `instrumentScreens.common.catalyst.advancedSettings.${setting}` as any
                  )}
                </SpotText>
              </Cell>

              <Cell>{props.currentValues[setting]}</Cell>
              <Cell>{props.updatedSettings[setting]}</Cell>
              <Cell>
                <UpdateStatus
                  instrumentId={props.instrumentId}
                  settingKey={setting}
                  requestSubmitted={props.requestSubmitted}
                  onResponse={props.onUpdateProcessed}
                />
              </Cell>
            </Fragment>
          ))}
      </Table>
    </ModalBodyContent>
  );
}

const ModalBodyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 30px;
`;

interface UpdateStatusProps {
  requestSubmitted: boolean;
  settingKey: InstrumentSettingKey;
  instrumentId: number;
  onResponse: () => void;
}

export const TestId = {
  UpdateStatusPlaceholder: "update-settings-status-placeholder",
  UpdateStatusText: "update-settings-status-text",
  UpdateStatusIcon: "update-settings-status-icon",
};

export function UpdateStatus(props: UpdateStatusProps) {
  const [response, setResponse] = useState<InstrumentSettingResponseDto>();

  const { t } = useTranslation();
  const { theme } = useContext(ViewpointThemeContext);

  const onSettingUpdated = useCallback(
    (msg: MessageEvent) => {
      const parsed: InstrumentSettingResponseDto = JSON.parse(msg.data);
      if (
        parsed.setting?.settingKey === props.settingKey &&
        parsed.instrumentId === props.instrumentId &&
        props.requestSubmitted
      ) {
        setResponse(parsed);
        props.onResponse();
      }
    },
    [props.requestSubmitted, props.settingKey, props.instrumentId]
  );

  useEventListener(EventIds.InstrumentSettingsUpdated, onSettingUpdated);

  return (
    <div>
      {!response && (
        <SpotText
          level="secondary"
          data-testid={TestId.UpdateStatusPlaceholder}
        >
          {t("instrumentScreens.common.catalyst.advancedSettings.waiting")}
        </SpotText>
      )}
      {response && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div>
            <SpotIcon
              data-testid={TestId.UpdateStatusIcon}
              name={response.success ? "checkmark" : "cancel"}
              size={20}
              color={
                response.success
                  ? theme.colors?.feedback?.success
                  : theme.colors?.feedback?.error
              }
            />
          </div>
          <SpotText data-testid={TestId.UpdateStatusText} level="secondary">
            {response.error}
          </SpotText>
        </div>
      )}
    </div>
  );
}
