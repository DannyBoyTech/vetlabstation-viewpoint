import {
  PageContent,
  PageRightPanel,
  PageRightPanelButtonContainer,
  PageRoot,
} from "../../../components/layout/common-layout-components";
import { Trans, useTranslation } from "react-i18next";
import { SpotText, Button, Input } from "@viewpoint/spot-react";
import { useNavigate } from "react-router-dom";
import { RequiredInput } from "../../../components/input/RequiredInput";
import { InputAware } from "../../../components/InputAware";
import { useState } from "react";
import styled from "styled-components";
import { useActivateVcpMutation } from "../../../api/VetConnectPlusApi";
import { VcpActivationResult } from "@viewpoint/api";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import { useToast } from "@viewpoint/spot-react/src";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../../utils/toast/toast-defaults";
import { useHeaderTitle } from "../../../utils/hooks/hooks";

const InputWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 400px;
`;

const ERROR_RESPONSES = [
  VcpActivationResult.INVALID_USER_PASSWORD,
  VcpActivationResult.NOT_REACHABLE,
];

export const TestId = {
  PasswordInput: "vcp-activation-pw-input",
  UsernameInput: "vcp-activation-un-input",
  NextButton: "vcp-activation-next-button",
  CancelButton: "vcp-activation-cancel-button",
  ErrorModal: (result?: VcpActivationResult) =>
    `vcp-activation-error-modal-${result ?? "unknown"}`,
};

export function VetConnectPlusActivationScreen() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("settings.vcp.labels.vcp"),
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const nav = useNavigate();

  const [activate, activateStatus] = useActivateVcpMutation();
  const { addToast } = useToast();

  const handleActivate = async () => {
    try {
      const response = await activate({ username, password }).unwrap();
      if (response === VcpActivationResult.SUCCESS) {
        addToast({
          ...DefaultSuccessToastOptions,
          content: (
            <ToastContentRoot>
              <ToastTextContentRoot>
                <ToastText level="paragraph" bold $maxLines={1}>
                  {t("settings.vcp.labels.vcp")}
                </ToastText>
                <ToastText level="paragraph" $maxLines={2}>
                  {t("settings.vcp.activate.success")}
                </ToastText>
              </ToastTextContentRoot>
            </ToastContentRoot>
          ),
        });
        nav("../vet_connect_plus");
      } else {
        setErrorModalVisible(true);
      }
    } catch (err) {
      console.error(err);
      setErrorModalVisible(true);
    }
  };

  return (
    <PageRoot>
      {errorModalVisible && (
        <ConfirmModal
          data-testid={TestId.ErrorModal(activateStatus.data)}
          open={errorModalVisible}
          onClose={() => setErrorModalVisible(false)}
          onConfirm={() => setErrorModalVisible(false)}
          headerContent={t("settings.vcp.activate.activationError")}
          bodyContent={
            <Trans
              i18nKey={
                activateStatus.data != null &&
                ERROR_RESPONSES.includes(activateStatus.data)
                  ? (`settings.vcp.activate.${activateStatus.data}` as any)
                  : "general.messages.somethingWentWrong"
              }
              components={CommonTransComponents}
            />
          }
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
      <PageContent>
        <SpotText level="paragraph">
          {t("settings.vcp.activate.directions")}
        </SpotText>

        <InputWrapper>
          <SpotText level="paragraph">Username</SpotText>
          <InputAware>
            <Input
              autoFocus
              disabled={activateStatus.isLoading}
              data-testid={TestId.UsernameInput}
              maxLength={255}
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
            />
          </InputAware>
        </InputWrapper>

        <InputWrapper>
          <SpotText level="paragraph">Password</SpotText>
          <InputAware layout="extendedAlphanumeric">
            <Input
              disabled={activateStatus.isLoading}
              type="password"
              autoComplete="off"
              data-testid={TestId.PasswordInput}
              maxLength={255}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </InputAware>
        </InputWrapper>
        <RequiredInput></RequiredInput>
      </PageContent>

      <PageRightPanel>
        <PageRightPanelButtonContainer>
          <Button
            data-testid={TestId.NextButton}
            onClick={handleActivate}
            disabled={
              activateStatus.isLoading ||
              username.length < 1 ||
              password.length < 1
            }
          >
            {t("general.buttons.next")}
          </Button>
          <Button
            data-testid={TestId.CancelButton}
            onClick={() => nav(-1)}
            buttonType="secondary"
          >
            {t("general.buttons.cancel")}
          </Button>
        </PageRightPanelButtonContainer>
      </PageRightPanel>
    </PageRoot>
  );
}
