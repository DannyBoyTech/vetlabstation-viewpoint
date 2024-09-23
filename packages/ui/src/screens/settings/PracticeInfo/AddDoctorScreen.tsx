import { useState } from "react";
import { unstable_useBlocker as useBlocker } from "react-router";

import { useHeaderTitle } from "../../../utils/hooks/hooks";
import { CancelConfirmationModal } from "../../../components/confirm-modal/CancelConfirmationModal";
import { Input, Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { InputAware } from "../../../components/InputAware";
import { useNavigate } from "react-router-dom";
import { useAddDoctorMutation } from "../../../api/DoctorApi";
import {
  Root,
  LeftSection,
  RightSection,
  InputWrapper,
} from "./common-practice-info-components";

export const AddDoctorScreen = () => {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("settings.practiceInfo.headers.doctorsName"),
  });
  const nav = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hasChangesMade, setHasChangesMade] = useState(false);
  const [addDoctor] = useAddDoctorMutation();

  const blocker = useBlocker(hasChangesMade);

  const handleFirstNameChange = (value: string) => {
    setHasChangesMade(value || lastName ? true : false);
    setFirstName(value);
  };

  const handleLastNameChange = (value: string) => {
    setHasChangesMade(firstName || value ? true : false);
    setLastName(value);
  };

  const handleSave = () => {
    setHasChangesMade(false);
    addDoctor({ firstName, lastName }).then(() =>
      nav("/settings/practice_info")
    );
  };

  const handleCancel = () => nav(-1);

  const TestId = {
    addDoctorMain: "add-doctor-main",
    doctorFirstName: "doctor-first-name",
    doctorLastName: "doctor-last-name",
    addDoctor: "add-doctor",
    cancelAddDoctor: "cancel-add-doctor",
  } as const;

  return (
    <Root>
      <LeftSection data-testid={TestId.addDoctorMain}>
        <SpotText level="paragraph" bold>
          {t("settings.practiceInfo.labels.enterDoctorName")}
        </SpotText>
        <InputWrapper>
          <SpotText level="secondary">
            {t("settings.practiceInfo.labels.firstName")}
          </SpotText>
          <InputAware>
            <Input
              type="search"
              data-testid={TestId.doctorFirstName}
              autoFocus={true}
              value={firstName}
              maxLength={255}
              onChange={(ev) => handleFirstNameChange(ev.target.value)}
            />
          </InputAware>
        </InputWrapper>
        <InputWrapper>
          <SpotText level="secondary">
            {t("settings.practiceInfo.labels.lastName")}
          </SpotText>
          <InputAware>
            <Input
              type="search"
              data-testid={TestId.doctorLastName}
              value={lastName}
              maxLength={255}
              onChange={(ev) => handleLastNameChange(ev.target.value)}
            />
          </InputAware>
        </InputWrapper>
      </LeftSection>
      <RightSection>
        <Button
          data-testid={TestId.addDoctor}
          onClick={handleSave}
          disabled={!(firstName || lastName)}
        >
          {t("general.buttons.add")}
        </Button>
        <Button
          data-testid={TestId.cancelAddDoctor}
          buttonType="secondary"
          onClick={handleCancel}
        >
          {t("general.buttons.cancel")}
        </Button>
      </RightSection>
      {blocker.state === "blocked" && (
        <CancelConfirmationModal
          open={true}
          onClose={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
        />
      )}
    </Root>
  );
};
