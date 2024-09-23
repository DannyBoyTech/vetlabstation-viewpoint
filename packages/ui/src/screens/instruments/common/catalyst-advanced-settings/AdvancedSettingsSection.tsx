import styled from "styled-components";
import {
  EventIds,
  InstrumentSettingResponseDto,
  InstrumentSettingKey,
} from "@viewpoint/api";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useEventListener,
  useEventSource,
} from "../../../../context/EventSourceContext";
import { useRequestInstrumentSettingsUpdateMutation } from "../../../../api/InstrumentApi";
import { SpotText, Button } from "@viewpoint/spot-react";

const ValuesGrid = styled.div`
  flex: 2;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
`;
const Section = styled.div`
  display: flex;
`;
const UpdateButtonContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: flex-end;
`;
const Cell = styled.div<{ column?: number }>`
  ${(p) => (p.column ? `grid-column: ${p.column};` : "")}
`;

interface SettingsSectionProps {
  instrumentId: number;
  columns: string[];
  rows: string[];
  values: InstrumentSettingKey[][];
  onUpdatePressed: () => void;
}

const TestId = {
  updateButton: "update-button",
} as const;

export function AdvancedSettingsSection(props: SettingsSectionProps) {
  const { t } = useTranslation();
  return (
    <Section>
      <ValuesGrid>
        {props.columns.map((col, index) => (
          <Cell column={index + 2} key={col}>
            <SpotText level="paragraph" bold>
              {col}
            </SpotText>
          </Cell>
        ))}
        {props.rows.map((rowLabel, index) => (
          <Fragment key={rowLabel}>
            <Cell column={1}>
              <SpotText level="paragraph">{rowLabel}</SpotText>
            </Cell>
            {/* Showing the values columns based on column headers length */}
            {props.values[index]
              .slice(0, props.columns.length)
              ?.map((settingKey) => (
                <AdvancedSettingValueCell
                  key={settingKey}
                  settingKey={settingKey}
                  instrumentId={props.instrumentId}
                />
              ))}
          </Fragment>
        ))}
      </ValuesGrid>
      <UpdateButtonContainer>
        <Button
          data-testid={TestId.updateButton}
          onClick={props.onUpdatePressed}
          buttonType="primary"
        >
          {t("general.buttons.update")}
        </Button>
      </UpdateButtonContainer>
    </Section>
  );
}

interface SettingValueCellProps {
  settingKey: InstrumentSettingKey;
  instrumentId: number;
  onValueChanged?: (value: number | string | boolean) => void;
}

export function AdvancedSettingValueCell(props: SettingValueCellProps) {
  const [value, setValue] = useState<string | number | boolean>();

  const { t } = useTranslation();

  const [requestSettingUpdate] = useRequestInstrumentSettingsUpdateMutation();

  const onSettingUpdated = useCallback(
    (msg: MessageEvent) => {
      const parsed: InstrumentSettingResponseDto = JSON.parse(msg.data);
      if (
        parsed.setting?.settingKey === props.settingKey &&
        parsed.instrumentId === props.instrumentId
      ) {
        if (parsed.setting.value != null) {
          setValue(parsed.setting.value);
          props.onValueChanged?.(parsed.setting.value);
        }
      }
    },
    [props.settingKey, props.instrumentId]
  );

  useEventListener(EventIds.InstrumentSettingsUpdated, onSettingUpdated);

  useEffect(() => {
    requestSettingUpdate({
      instrumentId: props.instrumentId,
      settingKey: props.settingKey,
    });
  }, [props.settingKey]);

  return (
    <SpotText level="secondary">
      {value ??
        t("instrumentScreens.common.catalyst.advancedSettings.retrieving")}
    </SpotText>
  );
}
