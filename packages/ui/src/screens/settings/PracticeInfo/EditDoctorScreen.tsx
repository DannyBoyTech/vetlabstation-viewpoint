import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { unstable_useBlocker as useBlocker } from "react-router";
import { useTranslation } from "react-i18next";
import { Input, Button, SpotText } from "@viewpoint/spot-react";

import { CancelConfirmationModal } from "../../../components/confirm-modal/CancelConfirmationModal";
import { InputAware } from "../../../components/InputAware";
import { useHeaderTitle } from "../../../utils/hooks/hooks";
import { useEditDoctorMutation } from "../../../api/DoctorApi";
import {
  Root,
  LeftSection,
  RightSection,
  InputWrapper,
} from "./common-practice-info-components";

export const EditDoctorScreen = () => {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("settings.practiceInfo.headers.doctorsName"),
  });

  const nav = useNavigate();
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();

  const firstNameFromUrl = searchParams.get("firstName");
  const lastNameFromUrl = searchParams.get("lastName");

  const [firstName, setFirstName] = useState(firstNameFromUrl ?? undefined);
  const [lastName, setLastName] = useState(lastNameFromUrl ?? undefined);
  const [hasChangesMade, setHasChangesMade] = useState(false);
  const [editDoctor] = useEditDoctorMutation();

  const blocker = useBlocker(hasChangesMade);

  const handleFirstNameChange = (value: string) => {
    setHasChangesMade(true);
    setFirstName(value);
  };

  const handleLastNameChange = (value: string) => {
    setHasChangesMade(true);
    setLastName(value);
  };

  const handleSave = async () => {
    setHasChangesMade(false);
    await editDoctor({
      doctorId: doctorId as string,
      firstName: firstName as string,
      lastName: lastName as string,
    }).unwrap();
    nav(-1);
  };

  const handleCancel = () => nav(-1);

  const TestId = {
    doctorFirstName: "doctor-first-name",
    doctorLastName: "doctor-last-name",
    editDoctorMain: "edit-doctor-main",
    saveDoctorEdit: "save-edit-doctor",
    cancelDoctorEdit: "cancel-edit-doctor",
  };

  return (
    <Root>
      <LeftSection data-testid={TestId.editDoctorMain}>
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
          data-testid={TestId.saveDoctorEdit}
          onClick={handleSave}
          disabled={!(firstName || lastName)}
        >
          {t("general.buttons.save")}
        </Button>
        <Button
          data-testid={TestId.cancelDoctorEdit}
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
