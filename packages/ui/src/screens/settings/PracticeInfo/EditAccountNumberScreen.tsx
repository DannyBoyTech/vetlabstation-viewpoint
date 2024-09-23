import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Input, Button, SpotText } from "@viewpoint/spot-react";

import { useHeaderTitle } from "../../../utils/hooks/hooks";
import { useUpdateSettingMutation } from "../../../api/SettingsApi";
import { SettingTypeEnum } from "@viewpoint/api";
import {
  Root,
  LeftSection,
  RightSection,
  InputWrapper,
} from "./common-practice-info-components";
import { ViewpointKeyboard } from "../../../components/keyboard/ViewpointKeyboard";

const StyledSpotText = styled(SpotText)`
  margin-bottom: 16px;
`;

const StyledKeyboardWrapper = styled.div`
  margin-top: 48px;
`;

export const EditAccountNumberScreen = () => {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("settings.practiceInfo.headers.idexxAccountNumber"),
  });

  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const accountNumberFromQuery = searchParams.get("accountNumber");
  const [accountNumber, setAccountNumber] = useState(
    accountNumberFromQuery ?? ""
  );

  const [updateSetting] = useUpdateSettingMutation();

  const handleSave = async () => {
    await updateSetting({
      settingType: SettingTypeEnum.SAP_REFERENCE_NUMBER,
      settingValue: accountNumber,
    }).unwrap();
    nav(-1);
  };

  const handleCancel = () => nav(-1);

  const TestId = {
    accountNumberMain: "account-number-main",
    accountNumberInput: "account-number-input",
    saveButton: "save-button",
    cancelButton: "cancel-button",
  } as const;

  return (
    <Root>
      <LeftSection data-testid={TestId.accountNumberMain}>
        <InputWrapper>
          <StyledSpotText level="paragraph" bold>
            {t("settings.practiceInfo.labels.enterAccountNumber")}
          </StyledSpotText>
          <Input
            type="search"
            data-testid={TestId.accountNumberInput}
            autoFocus={true}
            value={accountNumber}
            maxLength={30}
            onChange={(ev) => setAccountNumber(ev.target.value)}
          />
          <StyledKeyboardWrapper>
            <ViewpointKeyboard alwaysVisible keyboardType="numpad" />
          </StyledKeyboardWrapper>
        </InputWrapper>
      </LeftSection>
      <RightSection>
        <Button
          data-testid={TestId.saveButton}
          onClick={handleSave}
          disabled={!accountNumber}
        >
          {t("general.buttons.save")}
        </Button>
        <Button
          data-testid={TestId.cancelButton}
          buttonType="secondary"
          onClick={handleCancel}
        >
          {t("general.buttons.cancel")}
        </Button>
      </RightSection>
    </Root>
  );
};
