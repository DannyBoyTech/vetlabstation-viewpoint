import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InstrumentSettingKey, InstrumentStatusDto } from "@viewpoint/api";
import { Fragment, useMemo, useState } from "react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ViewpointKeyboard } from "../../../../components/keyboard/ViewpointKeyboard";
import { AdvancedSettingValueCell } from "./AdvancedSettingsSection";
import { MaskedInput } from "../../../../components/input/MaskedInput";
import { useHeaderTitle } from "../../../../utils/hooks/hooks";
import {
  useGetInstrumentQuery,
  useRequestInstrumentSettingsUpdateMutation,
} from "../../../../api/InstrumentApi";
import { UpdateSettingsModal } from "./UpdateSettingsModal";
import { skipToken } from "@reduxjs/toolkit/query";

const Content = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
`;
const Table = styled.div`
  flex: 2;
  gap: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;
const Cell = styled.div<{ column?: number }>`
  ${(p) => (p.column != null ? `grid-column: ${p.column};` : "")}
  display: flex;
  align-items: center;
`;

const KeyboardContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
`;

export function UpdateAdvancedSettings() {
  const [updatedValues, setUpdatedValues] = useState<{
    [key in InstrumentSettingKey]?: number;
  }>({});
  const [currentValues, setCurrentValues] = useState<{
    [key in InstrumentSettingKey]?: number;
  }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();
  const nav = useNavigate();
  const [requestSettingUpdate] = useRequestInstrumentSettingsUpdateMutation();

  const { instrumentId: instrumentIdParam } = useParams();
  const instrumentId = useMemo(
    () => parseInt(instrumentIdParam as string),
    [instrumentIdParam]
  );

  const { data: instrument }: { data?: InstrumentStatusDto } =
    useGetInstrumentQuery(instrumentId ?? skipToken);

  useHeaderTitle({
    label: t("instrumentScreens.common.catalyst.advancedSettings.header", {
      instrumentName: instrument?.instrument.instrumentType
        ? t(`instruments.names.${instrument.instrument.instrumentType}`)
        : "",
    }),
  });

  const [searchParams] = useSearchParams();
  const settings: InstrumentSettingKey[] = useMemo(
    () => searchParams.getAll("setting") as InstrumentSettingKey[],
    [searchParams]
  );

  const canUpdate = useMemo(
    () => Object.values(updatedValues).length > 0,
    [updatedValues]
  );

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <Content>
          <Table>
            <Cell column={2}>
              <SpotText level="paragraph" bold>
                {t(
                  "instrumentScreens.common.catalyst.advancedSettings.existing"
                )}
              </SpotText>
            </Cell>
            <Cell column={3}>
              <SpotText level="paragraph" bold>
                {t(
                  "instrumentScreens.common.catalyst.advancedSettings.proposed"
                )}
              </SpotText>
            </Cell>

            {settings?.sort().map((setting) => (
              <Fragment key={setting}>
                <Cell column={1}>
                  <SpotText level="paragraph">
                    {t(
                      `instrumentScreens.common.catalyst.advancedSettings.${setting}` as any
                    )}
                  </SpotText>
                </Cell>

                <Cell>
                  <AdvancedSettingValueCell
                    settingKey={setting}
                    instrumentId={instrumentId}
                    onValueChanged={(val) =>
                      setCurrentValues((cv) => ({
                        ...cv,
                        [setting]: Number(val),
                      }))
                    }
                  />
                </Cell>

                <Cell>
                  <MaskedInput
                    mask={Number}
                    radix="."
                    scale={1000}
                    onAccept={(value) => {
                      const updated = { ...updatedValues };
                      if (value == null) {
                        delete updated[setting];
                      } else {
                        const parsed = parseFloat(value);
                        if (isNaN(parsed)) {
                          delete updated[setting];
                        } else {
                          updated[setting] = parsed;
                        }
                      }
                      setUpdatedValues(updated);
                    }}
                  />
                </Cell>
              </Fragment>
            ))}
          </Table>

          <KeyboardContainer>
            <ViewpointKeyboard keyboardType="numpad" alwaysVisible zIndex={0} />
          </KeyboardContainer>
        </Content>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button disabled={!canUpdate} onClick={() => setModalOpen(true)}>
            {t("general.buttons.update")}
          </Button>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      {/* Don't retain modal's state when it's closed*/}
      {modalOpen && instrument && (
        <UpdateSettingsModal
          open={modalOpen}
          onClose={() => {
            // Request a refresh when the modal is closed
            (Object.keys(currentValues) as InstrumentSettingKey[]).forEach(
              (settingKey) =>
                requestSettingUpdate({
                  instrumentId,
                  settingKey,
                })
            );
            setModalOpen(false);
          }}
          instrumentType={instrument.instrument.instrumentType}
          instrumentId={instrumentId}
          updatedSettings={updatedValues}
          currentSettings={currentValues}
        />
      )}
    </InstrumentPageRoot>
  );
}
