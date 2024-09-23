import { HTMLAttributes, useRef, useState } from "react";
import { PatientDto, ReferenceClassType } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SpotPopover } from "../components/popover/Popover";
import { getAgeString } from "../utils/date-utils";
import styled from "styled-components";
import { Theme } from "../utils/StyleConstants";
import { Button, SpotText } from "@viewpoint/spot-react";
import { PatientWeightUnitsEnum } from "@viewpoint/api";

const ProfileLinkWrapper = styled.div`
  > .spot-button {
    height: unset;
    padding: 0 5px 0 0;
  }

  .spot-button__text.spot-button__text {
    color: ${(p: { theme: Theme }) => p.theme.colors?.text?.link};
  }

  padding: 3px 3px 3px 0;
`;
const PatientProfileTable = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 300px;
  overflow: hidden;

  .spot-typography__text--secondary,
  .spot-typography__heading--level-5 {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
const ProfileHeader = styled.div`
  > .spot-button {
    height: unset;
  }

  display: flex;
  grid-column: auto / span 2;
`;
const CapitalizeSpotText = styled.div`
  grid-column: auto / span 2;
  text-transform: capitalize;
`;

export interface ProfileLinkProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  patient: PatientDto;
  isFromLabRequest?: boolean;
  weightUnits?: PatientWeightUnitsEnum;
}

export function PatientProfilePopover(props: ProfileLinkProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { patient, isFromLabRequest = false } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const TestId = {
    patientNameInPopover: "patient-name-inpopover",
  } as const;

  const refClassName = patient.lastKnownRefClassDto?.refClassName;

  return (
    <ProfileLinkWrapper {...props} ref={ref}>
      <Button
        data-testid="profile-button"
        buttonType="link"
        buttonSize="small"
        rightIcon="caret-down"
        onClick={() => setOpen(!open)}
      >
        {t("resultsPage.patientProfile.labels.header")}
      </Button>
      {open && (
        <SpotPopover
          anchor={ref.current}
          onClickAway={() => setOpen(false)}
          popFrom="bottom"
          offsetTo="right"
        >
          <PatientProfileTable>
            {isFromLabRequest ? (
              <CapitalizeSpotText data-testid={TestId.patientNameInPopover}>
                <SpotText level="h5">
                  {patient?.patientName} {patient.clientDto?.lastName}
                </SpotText>
              </CapitalizeSpotText>
            ) : (
              <ProfileHeader>
                <SpotText level="h5">
                  {t("resultsPage.patientProfile.labels.header")}
                </SpotText>
                <Button
                  data-testid="edit-profile-button"
                  buttonType="link"
                  iconOnly
                  leftIcon="edit"
                  onClick={() => nav(`/patients/${patient.id}`)}
                />
              </ProfileHeader>
            )}

            {!isFromLabRequest && (
              <>
                <SpotText level="secondary">
                  {t("resultsPage.patientProfile.labels.patient")}
                </SpotText>
                <SpotText level="secondary">
                  {patient.patientName || t("general.placeholder.noValue")}
                </SpotText>
                <SpotText level="secondary">
                  {t("resultsPage.patientProfile.labels.patientId")}
                </SpotText>
                <SpotText level="secondary">
                  {patient.pimsPatientId || t("general.placeholder.noValue")}
                </SpotText>
              </>
            )}

            <SpotText level="secondary">
              {t("resultsPage.patientProfile.labels.species")}
            </SpotText>
            <SpotText level="secondary">
              {t(`Species.${patient.speciesDto?.speciesName}` as any)}
            </SpotText>

            {!isFromLabRequest &&
              (patient.speciesDto?.speciesClass ===
                ReferenceClassType.LifeStage ||
                patient.speciesDto?.speciesClass ===
                  ReferenceClassType.Type) && (
                <>
                  <SpotText level="secondary">
                    {t(
                      `resultsPage.patientProfile.labels.${patient.speciesDto.speciesClass}` as any
                    )}
                  </SpotText>
                  <SpotText level="secondary">
                    {t(
                      refClassName != null
                        ? (`referenceClass.${refClassName}` as any)
                        : "general.placeholder.noValue"
                    )}
                  </SpotText>
                </>
              )}

            <SpotText level="secondary">
              {t("resultsPage.patientProfile.labels.breed")}
            </SpotText>
            {/* Breed is "localized" in the IVLS database (does not change value when user changes language) */}
            <SpotText level="secondary">
              {patient.breedDto?.breedName || t("general.placeholder.noValue")}
            </SpotText>

            <SpotText level="secondary">
              {t("resultsPage.patientProfile.labels.sex")}
            </SpotText>
            <SpotText level="secondary">
              {t(
                `gender.${patient.genderDto?.genderName}` as any,
                t("general.placeholder.noValue"),
                {
                  context: patient.speciesDto.speciesName,
                }
              )}
            </SpotText>

            <SpotText level="secondary">
              {t("resultsPage.patientProfile.labels.age")}
            </SpotText>
            <SpotText level="secondary">
              {patient.birthDate
                ? getAgeString(patient.birthDate)
                : t("general.placeholder.noValue")}
            </SpotText>

            {isFromLabRequest && props.weightUnits && (
              <>
                <SpotText level="secondary">
                  {t("general.lastKnownWeight")}
                </SpotText>
                <SpotText level="secondary">
                  {patient.lastKnownWeight
                    ? `${patient.lastKnownWeight} ${t(
                        `weightUnits.${props.weightUnits}`
                      )}`
                    : t("general.placeholder.noValue")}
                </SpotText>
              </>
            )}

            {!isFromLabRequest && (
              <>
                <SpotText level="secondary">
                  {t("resultsPage.patientProfile.labels.clientFirst")}
                </SpotText>
                <SpotText level="secondary">
                  {patient.clientDto?.firstName ||
                    t("general.placeholder.noValue")}
                </SpotText>

                <SpotText level="secondary">
                  {t("resultsPage.patientProfile.labels.clientLast")}
                </SpotText>
                <SpotText level="secondary">
                  {patient.clientDto?.lastName ||
                    t("general.placeholder.noValue")}
                </SpotText>

                <SpotText level="secondary">
                  {t("resultsPage.patientProfile.labels.clientId")}
                </SpotText>
                <SpotText level="secondary">
                  {patient.clientDto?.clientId ||
                    t("general.placeholder.noValue")}
                </SpotText>
              </>
            )}
          </PatientProfileTable>
        </SpotPopover>
      )}
    </ProfileLinkWrapper>
  );
}
