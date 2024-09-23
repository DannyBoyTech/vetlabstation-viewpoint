import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ExecuteLabRequestDto,
  InstrumentType,
  LabRequestRunType,
  PatientWeightUnitsEnum,
  PimsRequestTypeEnum,
  SettingTypeEnum,
} from "@viewpoint/api";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import {
  PatientPanel,
  PatientPanelSelectionValues,
} from "../../components/patient-panel/PatientPanel";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { SelectInstruments } from "./SelectInstruments";
import { Button } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useLazyGetSuggestedLifestageQuery } from "../../api/PatientApi";
import {
  useAddTestAppendMutation,
  useAddTestMergeMutation,
  useAddTestNewMutation,
  useSubmitNewMutation,
  useValidateAddTestTypesForRunRequestMutation,
} from "../../api/LabRequestsApi";
import { validateExecuteLabRequest } from "../../utils/validation/labrequest-validation";
import { settingsApi } from "../../api/SettingsApi";
import BuildLabRequestProvider, {
  BuildLabRequestContext,
  BuildLabRequestProviderProps,
} from "./BuildLabRequestContext";
import { AddTestModal } from "../../components/add-test-modal/AddTestModal";
import {
  useGetSampleTypesQuery,
  useLazyGetReferenceClassificationsQuery,
} from "../../api/SpeciesApi";
import { doctorApi } from "../../api/DoctorApi";
import { instrumentApi } from "../../api/InstrumentApi";
import { ShoppingCart } from "./ShoppingCart";
import { useGetSnapDevicesQuery } from "../../api/SnapApi";
import { useMarkPimsRequestProcessedMutation } from "../../api/PimsApi";
import { trackLabRequest } from "../../analytics/nltx-events";

const PatientPanelWrapper = styled.div`
  width: 400px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  overflow-y: auto;
`;

const BuildLabRequestRoot = styled.div`
  display: flex;
  flex: 1;
  overflow-y: hidden;
`;

const InstrumentOptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  gap: 20px;
  width: 100%;
`;
const SelectionHeader = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 20px;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
  padding: 20px 10px 20px 0;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
`;

const SelectInstrumentsContainer = styled.div`
  padding: 0 20px 20px 20px;
  overflow-y: auto;
`;

const TestId = {
  RunButton: "run-button",
  BackButton: "back-button",
  AddTestButton: "addTest-button",
};

function useRefClassesWithSuggestion({
  patientId,
  speciesId,
}: {
  patientId?: number;
  speciesId?: number;
}) {
  const [initialized, setInitialized] = useState(false);
  const [getRefClasses, getRefClassesStatus] =
    useLazyGetReferenceClassificationsQuery();
  const [getSuggestedRefClass, getSuggestedRefClassStatus] =
    useLazyGetSuggestedLifestageQuery();

  useEffect(() => {
    (async function () {
      if (speciesId != null && patientId != null) {
        const refClasses = await getRefClasses(speciesId).unwrap();
        // If there are no ref classes for whatever reason, then whatever
        // "suggestion" comes back won't be valid, no point making the request
        if (refClasses.length > 0) {
          await getSuggestedRefClass(patientId).unwrap();
        }
        setInitialized(true);
      }
    })();
  }, [getRefClasses, getSuggestedRefClass, patientId, speciesId]);

  return {
    initialized,
    availableRefClasses: getRefClassesStatus.data,
    suggestedRefClass: getSuggestedRefClassStatus.data,
  };
}

export function BuildLabRequestWithContext(
  props: Omit<BuildLabRequestProviderProps, "referenceData">
) {
  // Gather available reference classes for the patient's species
  const {
    availableRefClasses,
    suggestedRefClass,
    initialized: refClassesInitialized,
  } = useRefClassesWithSuggestion({
    patientId: props.patient.id,
    speciesId: props.patient.speciesDto.id,
  });

  // Gather all the available doctors
  const { data: availableDoctors, ...availableDoctorsStatus } =
    doctorApi.useGetDoctorsQuery(undefined, {
      selectFromResult: (res) => ({
        ...res,
        data: res?.data?.filter((doc) => !doc.isSuppressed),
      }),
    });

  // Get SNAPs that are available for the selected species
  const { data: availableSnaps, ...availableSnapsStatus } =
    useGetSnapDevicesQuery({
      speciesId: props.patient.speciesDto?.id,
      enabledOnly: true,
    });

  // Get applicable instruments
  const { data: availableInstruments, ...availableInstrumentsStatus } =
    instrumentApi.useGetInstrumentsForSpeciesQuery(
      { speciesId: props.patient.speciesDto?.id },
      {
        selectFromResult: (res) => ({
          ...res,
          data: res.data
            ?.map((i) => i) // Map is required because returned data is immutable which prevents sorting
            .filter(
              (i) =>
                i.instrument.instrumentType !== InstrumentType.SNAP ||
                availableSnaps?.length !== 0
            )
            .sort(
              ({ instrument: i1 }, { instrument: i2 }) =>
                i1.displayOrder - i2.displayOrder
            ),
        }),
      }
    );

  // Get sample types applicable to the selected species
  const { data: availableSampleTypes, ...availableSampleTypesStatus } =
    useGetSampleTypesQuery(props.patient.speciesDto?.id);

  // Get the dilution configurations for instruments
  const { data: dilutionConfigs, ...dilutionConfigsStatus } =
    instrumentApi.useGetDilutionConfigsQuery();

  const referenceData = {
    availableInstruments,
    availableRefClasses,
    availableSampleTypes,
    availableDoctors,
    availableSnaps,
    suggestedRefClass,
    dilutionConfigs,
  };

  const loading =
    !refClassesInitialized ||
    availableDoctorsStatus.isLoading ||
    availableInstrumentsStatus.isLoading ||
    availableSampleTypesStatus.isLoading ||
    availableSnapsStatus.isLoading ||
    dilutionConfigsStatus.isLoading;

  if (loading) {
    return <SpinnerOverlay />;
  }

  return (
    <BuildLabRequestProvider {...props} referenceData={referenceData}>
      <BuildLabRequestPanel />
    </BuildLabRequestProvider>
  );
}

export function BuildLabRequestPanel() {
  const [addTestOpen, setAddTestOpen] = useState(false);

  // Build lab request context data
  const {
    labRequest,
    updateLabRequest,
    originalLabRequest,
    patient,
    pendingRequest,
    referenceData,
  } = useContext(BuildLabRequestContext);

  // Lab request scren settings data
  const { data: settings, isLoading: settingsLoading } =
    settingsApi.useGetSettingsQuery([
      SettingTypeEnum.REQUIRE_REQUISITION_ID,
      SettingTypeEnum.WEIGHT_UNIT_TYPE,
      SettingTypeEnum.DISPLAY_DOCTOR_NAME,
      SettingTypeEnum.DISPLAY_REASON_FOR_TESTING,
      SettingTypeEnum.DISPLAY_PATIENT_WEIGHT,
      SettingTypeEnum.DISPLAY_REQUISITION_ID,
    ]);

  const [submitNew, submitNewStatus] = useSubmitNewMutation();
  const [validateAddTestOptions, validateAddTestOptionsStatus] =
    useValidateAddTestTypesForRunRequestMutation();
  const [addTestAppend, appendStatus] = useAddTestAppendMutation();
  const [addTestNew, addTestNewStatus] = useAddTestNewMutation();
  const [addTestMerge, addTestMergeStatus] = useAddTestMergeMutation();
  const [markPendingRequestProcessed, markPendingRequestProcessedStatus] =
    useMarkPimsRequestProcessedMutation();

  const nav = useNavigate();
  const { t } = useTranslation();

  // Pre-check submission of the lab request
  const checkSubmission = async (
    executor: () => unknown,
    addTestWorkflow?: LabRequestRunType
  ) => {
    setAddTestOpen(false);
    if (labRequestValid) {
      await executor();
    }
  };

  const handleNewLabRequest = async () => {
    if (labRequestValid) {
      try {
        await submitNew(prepareLabRequest(labRequest) as ExecuteLabRequestDto);
        trackLabRequest({
          reqType: "new",
          labReq: labRequest,
          availableInstruments: referenceData.availableInstruments,
        });
        nav("/");
      } catch (err) {
        console.error(err);
      }
    } else {
      console.warn("Could not build valid lab request");
    }
  };

  const handleAddTestAppend = async () => {
    if (labRequestValid && originalLabRequest != null) {
      try {
        addTestAppend({
          labRequestId: originalLabRequest.id,
          runs: (labRequest as ExecuteLabRequestDto).instrumentRunDtos,
        });
        if (pendingRequest != null) {
          markPendingRequestProcessed(pendingRequest?.id);
        }
        trackLabRequest({
          reqType: "add-append",
          labReq: labRequest,
          availableInstruments: referenceData.availableInstruments,
        });
        nav("/");
      } catch (err) {
        console.error(err);
      }
    } else {
      console.warn("Could not build valid lab request");
    }
  };

  const handleAddTestNew = async () => {
    if (labRequestValid && originalLabRequest != null) {
      try {
        addTestNew({
          labRequestId: originalLabRequest.id,
          runs: (labRequest as ExecuteLabRequestDto).instrumentRunDtos,
        });

        if (pendingRequest != null) {
          markPendingRequestProcessed(pendingRequest?.id);
        }
        trackLabRequest({
          reqType: "add-new",
          labReq: labRequest,
          availableInstruments: referenceData.availableInstruments,
        });
        nav("/");
      } catch (err) {
        console.error(err);
      }
    } else {
      console.warn("Could not build valid lab request");
    }
  };

  const handleAddTestMerge = async () => {
    if (labRequestValid && originalLabRequest != null) {
      try {
        addTestMerge({
          labRequestId: originalLabRequest.id,
          runs: (labRequest as ExecuteLabRequestDto).instrumentRunDtos,
        });
        if (pendingRequest != null) {
          markPendingRequestProcessed(pendingRequest?.id);
        }
        trackLabRequest({
          reqType: "add-merge",
          labReq: labRequest,
          availableInstruments: referenceData.availableInstruments,
        });
        nav("/");
      } catch (err) {
        console.error(err);
      }
    } else {
      console.warn("Could not build valid lab request");
    }
  };

  const handleUpdatePatientPanelValues = (
    values: PatientPanelSelectionValues
  ) => {
    updateLabRequest({
      refClassId: values.refClass?.id,
      requisitionId: values.requisitionId,
      weight: values.lastKnownWeight,
      testingReasons: values.testingReasons,
      doctorId: values.doctor?.id,
    });
  };

  const addingTest = originalLabRequest != null;

  const labRequestValid = useMemo(
    () =>
      labRequest != null &&
      referenceData.availableInstruments != null &&
      settings != null &&
      validateExecuteLabRequest(
        labRequest,
        referenceData.availableInstruments,
        settings[SettingTypeEnum.REQUIRE_REQUISITION_ID] === "true",
        addingTest,
        pendingRequest?.pimsRequestType === PimsRequestTypeEnum.CENSUS
      ),
    [
      labRequest,
      referenceData.availableInstruments,
      settings,
      addingTest,
      pendingRequest?.pimsRequestType,
    ]
  );

  const patientPanelValues: PatientPanelSelectionValues = useMemo(
    () => ({
      requisitionId: labRequest.requisitionId,
      refClass: referenceData.availableRefClasses?.find(
        (rc) => rc.id === labRequest.refClassId
      ),
      lastKnownWeight: labRequest.weight,
      doctor: referenceData.availableDoctors?.find(
        (doc) => doc.id === labRequest.doctorId
      ),
      testingReasons: labRequest.testingReasons,
    }),
    [
      labRequest.doctorId,
      labRequest.refClassId,
      labRequest.requisitionId,
      labRequest.testingReasons,
      labRequest.weight,
      referenceData.availableDoctors,
      referenceData.availableRefClasses,
    ]
  );

  const submissionLoading =
    submitNewStatus.isLoading ||
    appendStatus.isLoading ||
    addTestNewStatus.isLoading ||
    markPendingRequestProcessedStatus.isLoading;

  const submitDisabled =
    !labRequestValid ||
    !referenceData.availableInstruments ||
    submissionLoading;

  return (
    <BuildLabRequestRoot>
      <PatientPanelWrapper>
        {settingsLoading ? (
          <SpinnerOverlay />
        ) : (
          <PatientPanel
            editable={!addingTest}
            patient={patient}
            availableRefClasses={referenceData.availableRefClasses || []}
            availableDoctors={referenceData.availableDoctors || []}
            reqIdDisabled={pendingRequest != null}
            weightUnits={
              (settings?.[
                SettingTypeEnum.WEIGHT_UNIT_TYPE
              ] as PatientWeightUnitsEnum) ?? PatientWeightUnitsEnum.POUNDS
            }
            onValuesChanged={handleUpdatePatientPanelValues}
            values={patientPanelValues}
            displaySettings={{
              requireRequisitionId:
                (settings?.[SettingTypeEnum.REQUIRE_REQUISITION_ID] ??
                  "true") === "true",
              displayDoctorName:
                (settings?.[SettingTypeEnum.DISPLAY_DOCTOR_NAME] ?? "true") ===
                "true",
              displayReasonForTesting:
                (settings?.[SettingTypeEnum.DISPLAY_REASON_FOR_TESTING] ??
                  "true") === "true",
              displayWeight:
                (settings?.[SettingTypeEnum.DISPLAY_PATIENT_WEIGHT] ??
                  "true") === "true",
              displayRequisitionId:
                pendingRequest?.pimsRequestType !==
                  PimsRequestTypeEnum.CENSUS &&
                (settings?.[SettingTypeEnum.DISPLAY_REQUISITION_ID] ??
                  "true") === "true",
            }}
            pimsServiceRequests={pendingRequest?.pimsServiceRequests}
          />
        )}
      </PatientPanelWrapper>
      <InstrumentOptionsWrapper>
        <SelectionHeader>
          <ShoppingCart
            instrumentRunDtos={labRequest.instrumentRunDtos ?? []}
          />
          <Cell>
            <Button
              buttonType="secondary"
              style={{ marginLeft: "auto", marginRight: "20px" }}
              onClick={() => nav(-1)}
              data-testid={TestId.BackButton}
            >
              {t("general.buttons.back")}
            </Button>

            {addingTest ? (
              <>
                <Button
                  disabled={submitDisabled}
                  onClick={async () => {
                    if (originalLabRequest != null) {
                      validateAddTestOptions({
                        runs: (labRequest as ExecuteLabRequestDto)
                          .instrumentRunDtos,
                        labRequestId: originalLabRequest.id,
                      });
                      setAddTestOpen(true);
                    }
                  }}
                  data-testid={TestId.AddTestButton}
                >
                  {t("general.buttons.addTest")}
                </Button>
                {validateAddTestOptionsStatus.data != null &&
                  !validateAddTestOptionsStatus.isLoading && (
                    <AddTestModal
                      open={addTestOpen}
                      addTestValidations={validateAddTestOptionsStatus.data}
                      onClose={() => setAddTestOpen(false)}
                      onClickAppend={() =>
                        checkSubmission(
                          handleAddTestAppend,
                          LabRequestRunType.APPEND
                        )
                      }
                      onClickMerge={() =>
                        checkSubmission(
                          handleAddTestMerge,
                          LabRequestRunType.MERGE
                        )
                      }
                      onClickNew={() =>
                        checkSubmission(handleAddTestNew, LabRequestRunType.NEW)
                      }
                    />
                  )}
              </>
            ) : (
              <Button
                disabled={submitDisabled}
                onClick={() => checkSubmission(handleNewLabRequest)}
                data-testid={TestId.RunButton}
              >
                {t("general.buttons.run")}
              </Button>
            )}
          </Cell>
        </SelectionHeader>
        {!referenceData.availableInstruments ||
        !referenceData.availableSnaps ||
        !referenceData.availableSampleTypes ? (
          <SpinnerOverlay />
        ) : (
          <SelectInstrumentsContainer>
            <SelectInstruments
              species={patient.speciesDto}
              lifestage={patientPanelValues?.refClass}
              executeRunRequests={labRequest.instrumentRunDtos ?? []}
            />
          </SelectInstrumentsContainer>
        )}
      </InstrumentOptionsWrapper>
      {submissionLoading && <SpinnerOverlay />}
    </BuildLabRequestRoot>
  );
}

// Add empty string/array values that IVLS expects
function prepareLabRequest(
  labRequest: Partial<ExecuteLabRequestDto>
): Partial<ExecuteLabRequestDto> {
  return {
    ...labRequest,
    weight: labRequest.weight ?? "",
    requisitionId: labRequest.requisitionId ?? "",
    testingReasons: labRequest.testingReasons ?? [],
  };
}
