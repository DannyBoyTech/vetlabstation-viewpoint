import styled from "styled-components";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ClientSaveEditDto,
  PatientSaveEditDto,
  PatientWeightUnitsEnum,
  ReferenceClassType,
  SettingTypeEnum,
} from "@viewpoint/api";
import { AgeInput } from "./AgeInput";
import {
  MaskedTextEntry,
  SelectEntry,
  SelectEntryOption,
  TextEntry,
} from "./Inputs";
import { ClientDetails } from "./ClientDetails";
import { ViewpointInputContext } from "../../context/InputContext";
import { useTranslation } from "react-i18next";
import { RequiredInput } from "../input/RequiredInput";
import {
  useCalculateLifestageQuery,
  useGetBreedsQuery,
  useGetReferenceClassificationsQuery,
  useGetSpeciesQuery,
} from "../../api/SpeciesApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { patientApi } from "../../api/PatientApi";
import { usePrevious } from "../../utils/hooks/hooks";
import { settingsApi } from "../../api/SettingsApi";
import SpinnerOverlay from "../overlay/SpinnerOverlay";

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
  margin-right: 30px;
`;

const RefClassSpecies = [ReferenceClassType.LifeStage, ReferenceClassType.Type];

export type PatientSaveEditDtoWithSpeciesClass = PatientSaveEditDto & {
  speciesClass?: ReferenceClassType;
};

export interface PatientEntryProps {
  onPatientChanged: (
    patient: Partial<PatientSaveEditDtoWithSpeciesClass>
  ) => void;
  patient?: Partial<PatientSaveEditDto>;
  onClientChanged: (client: Partial<ClientSaveEditDto>) => void;
  client?: Partial<ClientSaveEditDto>;
  clientAlreadyConfirmed?: boolean;
  disabledControls?: {
    species?: boolean;
  };
}

export const TestId = {
  PatientName: "patient-input",
  Species: "species-select",
  Breeds: "breed-select",
  Gender: "gender-select",
  LastKnownWeight: "last-known-weight-input",
  Lifestage: "lifestage-select",
} as const;

export function PatientEntry(props: PatientEntryProps) {
  const {
    patient,
    client,
    clientAlreadyConfirmed,
    onPatientChanged,
    onClientChanged,
  } = props;

  const [refClassConfirmed, setRefClassConfirmed] = useState<boolean>(
    patient?.lastKnownRefClassDto != null
  );

  const patientNameInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  const { data: allSpecies, isFetching: speciesLoading } = useGetSpeciesQuery();
  const newPatientSpeciesId = props.patient?.speciesDto?.id;

  const newPatientSpecies = allSpecies?.find(
    (sp) => sp.id === newPatientSpeciesId
  );
  const newPatientSpeciesClass = newPatientSpecies?.speciesClass;

  const { data: breeds, isFetching: breedsLoading } = useGetBreedsQuery(
    newPatientSpeciesId &&
      newPatientSpeciesClass === ReferenceClassType.LifeStage
      ? newPatientSpeciesId
      : skipToken
  );
  const { data: refClasses, isFetching: refClassesLoading } =
    useGetReferenceClassificationsQuery(
      newPatientSpeciesClass &&
        newPatientSpeciesId &&
        RefClassSpecies.includes(newPatientSpeciesClass)
        ? newPatientSpeciesId
        : skipToken
    );
  const { data: genders, isFetching: gendersLoading } =
    patientApi.useGetGendersQuery(
      newPatientSpeciesClass === ReferenceClassType.LifeStage
        ? undefined
        : skipToken
    );

  const shouldCalculateRefClass =
    !refClassConfirmed &&
    patient?.birthDate != null &&
    newPatientSpeciesClass != null &&
    newPatientSpeciesId != null &&
    RefClassSpecies.includes(newPatientSpeciesClass);

  const {
    currentData: calculatedRefClass,
    isFetching: calculateLifestageLoading,
  } = useCalculateLifestageQuery(
    {
      speciesId: newPatientSpeciesId as number,
      birthDate: patient?.birthDate as string,
    },
    {
      skip: !shouldCalculateRefClass,
      selectFromResult: (res) => ({
        ...res,
        currentData: shouldCalculateRefClass ? res.currentData : undefined,
      }),
    }
  );

  const { data: settings } = settingsApi.useGetSettingsQuery(
    [
      SettingTypeEnum.WEIGHT_UNIT_TYPE,
      SettingTypeEnum.DISPLAY_PATIENT_WEIGHT,
      SettingTypeEnum.DISPLAY_PATIENT_GENDER,
      SettingTypeEnum.DISPLAY_PATIENT_BREED,
    ],
    {
      selectFromResult: (res) => ({
        ...res,
        data:
          res.data == null
            ? undefined
            : {
                weightUnit: res.data[
                  SettingTypeEnum.WEIGHT_UNIT_TYPE
                ] as PatientWeightUnitsEnum,
                displayBreed:
                  res.data[SettingTypeEnum.DISPLAY_PATIENT_BREED] === "true",
                displayWeight:
                  res.data[SettingTypeEnum.DISPLAY_PATIENT_WEIGHT] === "true",
                displayGender:
                  res.data[SettingTypeEnum.DISPLAY_PATIENT_GENDER] === "true",
              },
      }),
    }
  );

  const speciesOptions: SelectEntryOption[] =
    allSpecies?.map(({ id, speciesName }) => ({
      label: t(`Species.${speciesName}`),
      value: id.toString(),
    })) ?? [];
  const breedsOptions: SelectEntryOption[] =
    breeds
      ?.map(({ id, breedName }) => ({ label: breedName, value: id.toString() }))
      .sort((a, b) => (a.label < b.label ? -1 : 1)) ?? [];
  const gendersOptions: SelectEntryOption[] =
    genders?.map(({ id, genderName }) => ({
      label: t(`gender.${genderName}`, {
        context: newPatientSpecies?.speciesName,
      }),
      value: id.toString(),
    })) ?? [];
  const refClassesOptions: SelectEntryOption[] =
    refClasses?.map(({ id, refClassName }) => ({
      label: t(`referenceClass.${refClassName}` as any),
      value: id.toString(),
    })) ?? [];

  useEffect(() => {
    patientNameInputRef.current?.focus();
  }, []);

  const handlePatientChanged = useCallback(
    (updates: Partial<PatientSaveEditDtoWithSpeciesClass>) => {
      onPatientChanged({
        speciesClass: newPatientSpeciesClass,
        ...updates,
      });
    },
    [newPatientSpeciesClass, onPatientChanged]
  );

  // Sync back the calculated ref class if one hasn't been selected by the user
  const prevRefClassId = usePrevious(calculatedRefClass?.id);
  useEffect(() => {
    if (calculatedRefClass?.id !== prevRefClassId && !refClassConfirmed) {
      handlePatientChanged({
        ...patient,
        lastKnownRefClassDto:
          calculatedRefClass == null
            ? undefined
            : { id: calculatedRefClass.id },
      });
    }
  }, [
    calculatedRefClass,
    refClassConfirmed,
    handlePatientChanged,
    patient,
    prevRefClassId,
  ]);

  return (
    <>
      {settings == null && <SpinnerOverlay />}
      <InputGrid>
        <RequiredInput
          error={patient?.patientName?.length === 0}
          errorText={t("validation.genericInput")}
        >
          <TextEntry
            label={t("patientEntry.labels.patientName")}
            required
            value={patient?.patientName}
            onChange={(patientName) =>
              handlePatientChanged({ ...patient, patientName })
            }
            maxLength={255}
            inputProps={{
              type: "search",
              "data-testid": TestId.PatientName,
              innerRef: patientNameInputRef,
            }}
          />
        </RequiredInput>

        <ClientDetails
          client={client}
          onClientChanged={onClientChanged}
          alreadyConfirmed={clientAlreadyConfirmed}
        />

        {/* Patient name and client selection (or determination that user is going to be creating a new client) is required before proceeding to allow additional entry*/}
        {patient?.patientName != null &&
          patient.patientName.length > 0 &&
          client?.clientId != null &&
          client.clientId.length > 0 && (
            <>
              <RequiredInput
                error={patient.speciesDto?.id == null}
                errorText={t("validation.genericSelect")}
              >
                <SelectEntry
                  options={speciesOptions}
                  value={patient?.speciesDto?.id?.toString()}
                  onChange={(speciesIdStr) => {
                    const speciesId = Number(speciesIdStr);
                    handlePatientChanged({
                      ...patient,
                      speciesDto: { id: speciesId },
                      speciesClass: allSpecies?.find(
                        (sp) => sp.id === speciesId
                      )?.speciesClass,
                    });
                  }}
                  loading={speciesLoading}
                  label={t("patientEntry.labels.species")}
                  selectProps={{ "data-testid": TestId.Species }}
                  required
                  disabled={props.disabledControls?.species}
                />
              </RequiredInput>
              {newPatientSpeciesClass === ReferenceClassType.LifeStage && (
                <>
                  {settings?.displayBreed && (
                    <SelectEntry
                      options={breedsOptions}
                      value={patient.breedDto?.id?.toString()}
                      onChange={(id) =>
                        handlePatientChanged({
                          ...patient,
                          breedDto: { id: Number(id) },
                        })
                      }
                      loading={breedsLoading}
                      selectProps={{ "data-testid": TestId.Breeds }}
                      label={t("patientEntry.labels.breed")}
                    />
                  )}

                  {settings?.displayGender && (
                    <SelectEntry
                      options={gendersOptions}
                      value={patient.genderDto?.id?.toString()}
                      onChange={(id) =>
                        handlePatientChanged({
                          ...patient,
                          genderDto: { id: Number(id) },
                        })
                      }
                      loading={gendersLoading}
                      selectProps={{ "data-testid": TestId.Gender }}
                      label={t("patientEntry.labels.sex")}
                    />
                  )}

                  {settings?.displayWeight && (
                    <MaskedTextEntry
                      label={`${t("patientEntry.labels.lastKnownWeight")} (${t(
                        `weightUnits.${settings.weightUnit}`
                      )})`}
                      value={patient.lastKnownWeight}
                      inputAwareProps={{
                        layout: "numpad",
                      }}
                      inputProps={{
                        "data-testid": TestId.LastKnownWeight,
                        type: "search",
                        mask: Number,
                        scale: 2,
                        min: 0,
                        max: 9999.99,
                      }}
                      onChange={(weight) =>
                        handlePatientChanged({
                          ...patient,
                          lastKnownWeight: weight,
                        })
                      }
                    />
                  )}

                  <RequiredInput
                    error={patient.lastKnownRefClassDto?.id == null}
                    errorText={t("validation.genericSelect")}
                  >
                    <SelectEntry
                      options={refClassesOptions}
                      value={patient.lastKnownRefClassDto?.id?.toString()}
                      onChange={(refClassId) => {
                        setRefClassConfirmed(true);
                        handlePatientChanged({
                          ...patient,
                          lastKnownRefClassDto: { id: Number(refClassId) },
                        });
                      }}
                      selectProps={{ "data-testid": TestId.Lifestage }}
                      loading={refClassesLoading || calculateLifestageLoading}
                      label={t("patientEntry.labels.lifestage")}
                      required
                    />
                  </RequiredInput>

                  <AgeInput
                    onChanged={(values) => {
                      handlePatientChanged({
                        ...patient,
                        ...values,
                      });
                    }}
                    ageValues={{
                      birthDate: patient.birthDate,
                      ageIsApproximate: patient.ageIsApproximate,
                      birthDateCalculated: patient.birthDateCalculated,
                    }}
                  />
                </>
              )}

              {newPatientSpeciesClass === ReferenceClassType.Type && (
                <RequiredInput
                  error={patient.lastKnownRefClassDto?.id == null}
                  errorText={t("validation.genericSelect")}
                  style={{ gridColumnStart: "1" }}
                >
                  <SelectEntry
                    options={refClassesOptions}
                    value={patient.lastKnownRefClassDto?.id?.toString()}
                    onChange={(refClassId) => {
                      setRefClassConfirmed(true);
                      handlePatientChanged({
                        ...patient,
                        lastKnownRefClassDto: { id: Number(refClassId) },
                      });
                    }}
                    selectProps={{ "data-testid": TestId.Lifestage }}
                    loading={refClassesLoading}
                    label={t("patientEntry.labels.type")}
                    required
                  />
                </RequiredInput>
              )}
            </>
          )}
      </InputGrid>
    </>
  );
}
