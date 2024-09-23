import { Button, Input, Modal, SpotText } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../../common-components";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { useNavigate, useParams } from "react-router-dom";
import {
  InstrumentSettingKey,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entry } from "../../../../components/patient-entry/Inputs";
import { ViewpointKeyboard } from "../../../../components/keyboard/ViewpointKeyboard";
import { AdvancedSettingsSection } from "./AdvancedSettingsSection";
import { RequiredInput } from "../../../../components/input/RequiredInput";
import { useHeaderTitle } from "../../../../utils/hooks/hooks";
import { useGetInstrumentQuery } from "../../../../api/InstrumentApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { CatOneOffsetsWizard } from "../../catone/offsets/CatOneOffsetsWizard";
import { InputProps } from "@viewpoint/spot-react/src/components/forms/input/Input";

const ContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.extraLightPrimary};
  margin: 10px 0px;
`;

const Workflows = {
  SCALARS: "SCALARS",
  OFFSETS: "OFFSET",
  SDMA: "SDMA",
} as const;
type Workflow = (typeof Workflows)[keyof typeof Workflows];

const requiredPassword = (instrumentType: InstrumentType, workflow: Workflow) =>
  instrumentType === InstrumentType.CatalystOne &&
  workflow === Workflows.OFFSETS
    ? "3693"
    : "5482";

interface UpdateRequest {
  workflow: Workflow;
  settingsToUpdate: InstrumentSettingKey[];
}

function UpdateRequest(
  workflow: Workflow,
  settingsToUpdate: InstrumentSettingKey[]
): UpdateRequest {
  return {
    workflow,
    settingsToUpdate,
  };
}

const SectionContainer = styled.div`
  margin: 0px 10px 15px 10px;
`;

const InlineText = styled(SpotText)`
  display: inline;
`;

export function CatalystAdvancedSettings() {
  const nav = useNavigate();
  const { t } = useTranslation();

  const [requestedUpdate, setRequestedUpdate] = useState<UpdateRequest>();
  const [offsetsModalOpen, setOffsetsModalOpen] = useState(false);

  const { instrumentId: instrumentIdParam } = useParams();
  const instrumentId = useMemo(
    () => parseInt(instrumentIdParam as string),
    [instrumentIdParam]
  );
  const { data: instrumentStatus }: { data?: InstrumentStatusDto } =
    useGetInstrumentQuery(instrumentId ?? skipToken);
  const instrumentType = instrumentStatus?.instrument.instrumentType;

  useHeaderTitle({
    label: t("instrumentScreens.common.catalyst.advancedSettings.header", {
      instrumentName: instrumentType
        ? t(`instruments.names.${instrumentType}`)
        : "",
    }),
  });

  const offsetsColumns = [
    t("instrumentScreens.common.catalyst.advancedSettings.existing"),
  ];

  const sdmaColumns = [
    t("instrumentScreens.common.catalyst.advancedSettings.existing"),
  ];

  if (instrumentType === InstrumentType.CatalystOne) {
    offsetsColumns.push(
      t("instrumentScreens.common.catalyst.advancedSettings.lastCalibrated")
    );
    sdmaColumns.push(
      t("instrumentScreens.common.catalyst.advancedSettings.lastCalibrated")
    );
  }

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <ContentRoot>
          <SpotText data-testid="title" level="h3">
            {t("instrumentScreens.common.catalyst.advancedSettings.label")}
          </SpotText>

          <SpotText data-testid="warning-text" level="paragraph">
            <Trans
              i18nKey={
                "instrumentScreens.common.catalyst.advancedSettings.warning"
              }
              components={{
                strong: <InlineText level="paragraph" bold />,
              }}
            ></Trans>
          </SpotText>

          <Divider />

          <SpotText level="h5">
            {t("instrumentScreens.common.catalyst.advancedSettings.scalars")}
          </SpotText>
          <SectionContainer data-testid="scalars">
            <AdvancedSettingsSection
              instrumentId={instrumentId}
              columns={[
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.existing"
                ),
              ]}
              rows={[
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.CL_SCALAR"
                ),
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.K_SCALAR"
                ),
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.NA_SCALAR"
                ),
              ]}
              values={[
                [InstrumentSettingKey.CL_SCALAR],
                [InstrumentSettingKey.K_SCALAR],
                [InstrumentSettingKey.NA_SCALAR],
              ]}
              onUpdatePressed={() => {
                setRequestedUpdate(
                  UpdateRequest(Workflows.SCALARS, [
                    InstrumentSettingKey.CL_SCALAR,
                    InstrumentSettingKey.K_SCALAR,
                    InstrumentSettingKey.NA_SCALAR,
                  ])
                );
              }}
            />
          </SectionContainer>

          <Divider />

          <SpotText level="h5">
            {t("instrumentScreens.common.catalyst.advancedSettings.offsets")}
          </SpotText>
          <SectionContainer data-testid="offsets">
            <AdvancedSettingsSection
              instrumentId={instrumentId}
              columns={offsetsColumns}
              rows={[
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.ALB_OFFSET"
                ),
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.CA_OFFSET"
                ),
              ]}
              values={[
                [
                  InstrumentSettingKey.ALB_OFFSET,
                  InstrumentSettingKey.ALB_OFFSET_DATE,
                ],
                [
                  InstrumentSettingKey.CA_OFFSET,
                  InstrumentSettingKey.CA_OFFSET_DATE,
                ],
              ]}
              onUpdatePressed={() => {
                setRequestedUpdate(
                  UpdateRequest(Workflows.OFFSETS, [
                    InstrumentSettingKey.ALB_OFFSET,
                    InstrumentSettingKey.CA_OFFSET,
                  ])
                );
              }}
            />
          </SectionContainer>

          <Divider />

          <SpotText level="h5">
            {t("instrumentScreens.common.catalyst.advancedSettings.SDMA")}
          </SpotText>

          <SectionContainer data-testid="SDMA">
            <AdvancedSettingsSection
              instrumentId={instrumentId}
              columns={sdmaColumns}
              rows={[
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.QSDMA_GAIN"
                ),
                t(
                  "instrumentScreens.common.catalyst.advancedSettings.QSDMA_OFFSET"
                ),
              ]}
              values={[
                [
                  InstrumentSettingKey.QSDMA_GAIN,
                  InstrumentSettingKey.QSDMA_GAIN_DATE,
                ],
                [
                  InstrumentSettingKey.QSDMA_OFFSET,
                  InstrumentSettingKey.QSDMA_OFFSET_DATE,
                ],
              ]}
              onUpdatePressed={() => {
                setRequestedUpdate(
                  UpdateRequest(Workflows.SDMA, [
                    InstrumentSettingKey.QSDMA_GAIN,
                    InstrumentSettingKey.QSDMA_OFFSET,
                  ])
                );
              }}
            />
          </SectionContainer>
        </ContentRoot>
      </InstrumentPageContent>

      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button onClick={() => nav(-1)} buttonType="secondary">
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
      {instrumentType && requestedUpdate && (
        <PasswordModal
          visible={true}
          onClose={() => setRequestedUpdate(undefined)}
          requiredPassword={requiredPassword(
            instrumentType,
            requestedUpdate.workflow
          )}
          onNext={() => {
            if (
              instrumentType === InstrumentType.CatalystOne &&
              requestedUpdate.workflow === Workflows.OFFSETS
            ) {
              setOffsetsModalOpen(true);
              setRequestedUpdate(undefined);
            } else if (requestedUpdate) {
              const params = new URLSearchParams();
              requestedUpdate.settingsToUpdate.forEach((setting) =>
                params.append("setting", setting)
              );
              nav(
                `/instruments/${instrumentId}/settings/advanced/update?${params.toString()}`
              );
            }
          }}
        />
      )}
      {offsetsModalOpen && instrumentStatus != null && (
        <CatOneOffsetsWizard
          instrumentStatus={instrumentStatus}
          onCancel={() => setOffsetsModalOpen(false)}
          onDone={() => setOffsetsModalOpen(false)}
        />
      )}
    </InstrumentPageRoot>
  );
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: flex-start;
`;

const PasswordContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  flex: 0;
`;

interface PasswordModalProps {
  requiredPassword: string;
  visible: boolean;
  onClose: () => void;
  onNext: () => void;
}

const ObscuredInput = styled(Input)`
  -webkit-text-security: disc;
`;

/**
 * A search-like (clearable) input that also has its contents obscured.
 *
 * Beware, this component only obscures its contents in browsers that
 * support `-webkit-text-security`.
 *
 * @param props
 */
function ClearablePasswordInput(props: Omit<InputProps, "type">) {
  return <ObscuredInput {...props} type="search" />;
}

function PasswordModal(props: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (props.visible) {
      inputRef.current?.focus();
    }
  }, [props.visible]);

  const { onNext, requiredPassword } = props;
  const handleNext = useCallback(() => {
    if (password === requiredPassword) {
      onNext();
    } else {
      setInvalidPassword(true);
    }
  }, [requiredPassword, password, onNext]);

  return (
    <Modal
      data-testid="password-modal"
      visible={props.visible}
      onClose={props.onClose}
    >
      <Modal.Header onClose={props.onClose}>
        <SpotText level="h3">
          {t("instrumentScreens.common.catalyst.advancedSettings.label")}
        </SpotText>
      </Modal.Header>
      <Modal.Body>
        <ModalContent>
          <SpotText level="paragraph">
            <Trans
              i18nKey={
                "instrumentScreens.common.catalyst.advancedSettings.warning"
              }
            ></Trans>
          </SpotText>

          <PasswordContent>
            <RequiredInput
              error={invalidPassword}
              errorText={"Invalid password."}
            >
              <Entry label="Password">
                <input
                  id="password"
                  style={{ display: "none" }}
                  type="password"
                  name="hiddenpassword"
                />
                <ClearablePasswordInput
                  innerRef={inputRef}
                  value={password}
                  onChange={(ev) => {
                    setInvalidPassword(false);
                    setPassword(ev.target.value);
                  }}
                  onBlur={() => inputRef.current?.focus()}
                  autoComplete="off"
                />
              </Entry>
            </RequiredInput>

            <ViewpointKeyboard keyboardType="numpad" alwaysVisible />
          </PasswordContent>
        </ModalContent>
      </Modal.Body>

      <Modal.Footer>
        <Modal.FooterCancelButton onClick={props.onClose}>
          {t("general.buttons.cancel")}
        </Modal.FooterCancelButton>
        <Button
          buttonType="primary"
          disabled={password.length === 0}
          onClick={handleNext}
        >
          {t("general.buttons.next")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
