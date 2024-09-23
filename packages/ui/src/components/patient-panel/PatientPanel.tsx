import {
  Checkbox,
  Input,
  Label,
  PatientDisplay,
  PatientImage,
  Select,
  SpotText,
  ValidationError,
} from "@viewpoint/spot-react";
import { InputAware } from "../InputAware";
import styled from "styled-components";
import {
  DoctorDto,
  PatientDto,
  PatientWeightUnitsEnum,
  PimsServiceRequestDto,
  RefClassDto,
  ReferenceClassType,
  TestingReason,
} from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import SpinnerOverlay from "../overlay/SpinnerOverlay";
import { RequiredInput } from "../input/RequiredInput";
import { MaskedInput } from "../input/MaskedInput";
import { PatientProfilePopover } from "../../screens/PatientProfilePopover";
import { Theme } from "../../utils/StyleConstants";
import { useFormatPersonalName } from "../../utils/hooks/LocalizationHooks";
import { useRef, useState } from "react";
import { SpotPopover } from "../popover/Popover";
import { ViewpointKeyboard } from "../keyboard/ViewpointKeyboard";

import { FloatingKeyboardContainer } from "../keyboard/keyboard-components";
import { useLocaleData } from "../../context/AppStateContext";

const PatientPanelRoot = styled.div`
  padding: 10px 10px 0 10px;
  display: flex;
  flex-direction: column;

  > * > .spot-form__field-error {
    margin-bottom: 0;
  }

  > * .spot-popover::before {
    background-color: ${(p) => p.theme.colors?.background?.secondary};
  }
`;

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin: 12px 0 0 0;
`;

const StyledLabel = styled(Label)`
  margin-top: 20px;
  font-weight: bold;
`;

const PatientDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledPatientImage = styled(PatientImage)`
  && {
    transform: scale(0.8);
    width: 35px;
  }
`;

const PatientName = styled(SpotText)`
  font-size: 16px;
  text-transform: capitalize;
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 200px;
  overflow: hidden;
`;

const TestingReasonValues = Object.values(TestingReason).filter(
  (reason) => reason !== TestingReason.NONE_GIVEN
) as Exclude<TestingReason, TestingReason.NONE_GIVEN>[];

export interface PatientPanelSelectionValues {
  requisitionId?: string;
  refClass?: RefClassDto;
  doctor?: DoctorDto;
  lastKnownWeight?: string;
  testingReasons?: TestingReason[];
  stat?: boolean;
}

export interface PatientPanelProps {
  editable?: boolean;
  patient: PatientDto;
  mostRecentWeight?: string;
  availableRefClasses: RefClassDto[];
  availableDoctors: DoctorDto[];
  onValuesChanged?: (values: PatientPanelSelectionValues) => void;
  values?: PatientPanelSelectionValues;
  weightUnits: PatientWeightUnitsEnum;
  reqIdDisabled?: boolean;

  displaySettings?: {
    requireRequisitionId: boolean;
    displayRequisitionId: boolean;
    displayDoctorName: boolean;
    displayWeight: boolean;
    displayReasonForTesting: boolean;
  };
  pimsServiceRequests?: PimsServiceRequestDto[];
}

export const TestId = {
  ReqIdLabel: "requisition-id-label",
  ReqIdInput: "requisition-id-input",
  ReqIdError: "requisition-id-error",
  DoctorInput: "doctor-input",
  LastKnownWeightInput: "last-known-weight-input",
  ReasonForTestingContainer: "reason-for-testing-container",
  RefClassSelect: "ref-class-select",
  RefClassError: "ref-class-error",
  RefClassLabel: "ref-class-label",
  TestOrder: "test-order",
};

export function PatientPanel({
  patient,
  editable = true,
  onValuesChanged,
  ...props
}: PatientPanelProps) {
  const { t, i18n } = useTranslation();
  const formatName = useFormatPersonalName();
  const { decimalSeparator } = useLocaleData();
  const [weightFocused, setWeightFocused] = useState(false);
  const weightRef = useRef<HTMLInputElement | null>(null);

  const refClassLabel =
    patient.speciesDto?.speciesClass === ReferenceClassType.LifeStage
      ? t("orderFulfillment.fulfillment.confirmLifestage")
      : t("orderFulfillment.fulfillment.confirmType");

  const refClassDefaultOption =
    patient.speciesDto?.speciesClass === ReferenceClassType.LifeStage
      ? t("orderFulfillment.fulfillment.selectLifestage")
      : t("orderFulfillment.fulfillment.selectType");

  const handleValueChanged = (
    updates: Partial<PatientPanelSelectionValues>
  ) => {
    // Merge updates
    const merged = {
      ...props.values,
      ...updates,
    };
    // Clean up empty string values
    merged.requisitionId =
      merged.requisitionId?.trim().length === 0
        ? undefined
        : merged.requisitionId;
    merged.lastKnownWeight =
      merged.lastKnownWeight?.trim().length === 0
        ? undefined
        : merged.lastKnownWeight;
    // Notify
    onValuesChanged?.(merged);
  };

  const currentValues: PatientPanelSelectionValues = {
    // Selected values
    ...props.values,
  };

  const testOrder = props?.pimsServiceRequests?.length
    ? props.pimsServiceRequests
        .map((psr: PimsServiceRequestDto) => psr.profileName)
        .join(", ")
    : "";

  if (props.displaySettings == null) {
    return <SpinnerOverlay />;
  }

  return (
    <PatientPanelRoot>
      <PatientDisplay size="small">
        <StyledPatientImage species={patient.speciesDto.speciesName} />
        <div>
          <div>
            <PatientName level="h4">
              {patient.patientName} {patient.clientDto.lastName}
            </PatientName>
          </div>
          <PatientDetail>
            {patient?.pimsPatientId != null && (
              <>
                <SpotText level="paragraph">{patient.pimsPatientId}</SpotText>
                <span> | </span>
              </>
            )}
            <PatientProfilePopover
              patient={patient}
              isFromLabRequest={true}
              weightUnits={props.weightUnits}
            />
          </PatientDetail>
        </div>
      </PatientDisplay>

      <Divider />

      {testOrder && (
        <>
          <StyledLabel>
            {t("orderFulfillment.fulfillment.testOrderLabel")}
          </StyledLabel>
          <SpotText data-testid={TestId.TestOrder} level="secondary">
            {testOrder}
          </SpotText>
          <Divider />
        </>
      )}

      <div>
        {props.displaySettings.displayRequisitionId &&
          currentValues.requisitionId !== "0" && (
            <>
              <StyledLabel data-testid={TestId.ReqIdLabel}>
                {t("orderFulfillment.fulfillment.requisitionId")}
                {props.displaySettings.requireRequisitionId ? " *" : ""}
              </StyledLabel>
              <RequiredInput
                error={
                  props.displaySettings.requireRequisitionId &&
                  (currentValues.requisitionId?.length ?? 0) === 0
                }
                errorText={t("validation.genericInput")}
                data-testid={TestId.ReqIdError}
              >
                <InputAware>
                  <Input
                    type="search"
                    disabled={!editable || props.reqIdDisabled}
                    value={currentValues.requisitionId ?? ""}
                    maxLength={30}
                    onChange={(ev) =>
                      handleValueChanged({ requisitionId: ev.target.value })
                    }
                    data-testid={TestId.ReqIdInput}
                  />
                </InputAware>
              </RequiredInput>
            </>
          )}

        <StyledLabel data-testid={TestId.RefClassLabel}>
          {refClassLabel}
        </StyledLabel>

        <Select
          disabled={!editable}
          onChange={(ev) =>
            handleValueChanged({
              refClass: props.availableRefClasses[ev.target.selectedIndex - 1],
            })
          }
          value={currentValues.refClass?.id}
          data-testid={TestId.RefClassSelect}
        >
          <Select.Option hidden>{refClassDefaultOption}</Select.Option>
          {props.availableRefClasses?.map((refClass) => (
            <Select.Option key={refClass.id} value={refClass.id}>
              {t(
                `referenceClass.${refClass.refClassName}` as any,
                refClass.refClassName
              )}
            </Select.Option>
          ))}
        </Select>
        {currentValues.refClass == null && (
          <ValidationError data-testid={TestId.RefClassError}>
            {t("validation.genericSelect")}
          </ValidationError>
        )}

        {props.displaySettings.displayDoctorName && (
          <>
            <StyledLabel>{t("general.doctor")}</StyledLabel>
            <Select
              disabled={!editable}
              onChange={(ev) =>
                handleValueChanged({
                  doctor: props.availableDoctors?.[ev.target.selectedIndex - 1],
                })
              }
              value={currentValues.doctor?.id}
              data-testid={TestId.DoctorInput}
            >
              <Select.Option hidden>
                {t("orderFulfillment.fulfillment.selectDoctor")}
              </Select.Option>
              {props.availableDoctors.map((doc) => (
                <Select.Option key={doc.id} value={doc.id}>
                  {formatName(doc)}
                </Select.Option>
              ))}
            </Select>
          </>
        )}

        {props.displaySettings.displayWeight && (
          <>
            <StyledLabel>
              {t("general.lastKnownWeight")} (
              {t(`weightUnits.${props.weightUnits}`)})
            </StyledLabel>
            {weightFocused && (
              <SpotPopover
                anchor={weightRef.current}
                popFrom="right"
                inset="none"
              >
                <FloatingKeyboardContainer>
                  <ViewpointKeyboard keyboardType={"numpad"} alwaysVisible />
                </FloatingKeyboardContainer>
              </SpotPopover>
            )}
            <MaskedInput
              type="search"
              mask={Number}
              inputRef={weightRef}
              scale={2}
              min={0}
              max={9999.99}
              value={currentValues.lastKnownWeight}
              disabled={!editable}
              onFocus={() => setWeightFocused(true)}
              onBlur={() => {
                setWeightFocused(false);
                // Convert to 2 decimal point representation when input is blurred
                handleValueChanged({
                  lastKnownWeight:
                    currentValues.lastKnownWeight != null
                      ? parseFloat(
                          currentValues.lastKnownWeight.replaceAll(
                            decimalSeparator,
                            "."
                          )
                        )
                          .toFixed(2)
                          .toString()
                          .replaceAll(".", decimalSeparator)
                      : "",
                });
              }}
              onAccept={(val) => handleValueChanged({ lastKnownWeight: val })}
              data-testid={TestId.LastKnownWeightInput}
            />
          </>
        )}

        {props.displaySettings.displayReasonForTesting && (
          <>
            <StyledLabel>
              {t("orderFulfillment.fulfillment.reasonForTesting")}
            </StyledLabel>
            <ReasonForTestingContainer
              data-testid={TestId.ReasonForTestingContainer}
            >
              {TestingReasonValues.map((reason) => (
                <StyledCheckbox
                  key={reason}
                  label={t(`orderFulfillment.testingReasons.${reason}`)}
                  disabled={!editable}
                  checked={!!currentValues.testingReasons?.includes(reason)}
                  onChange={(ev) => {
                    const updatedReasons = [
                      ...(currentValues.testingReasons ?? []),
                    ];
                    if (ev.target.checked) {
                      // Add it
                      updatedReasons.push(reason);
                    } else {
                      // remove it
                      updatedReasons.splice(updatedReasons.indexOf(reason), 1);
                    }
                    handleValueChanged({ testingReasons: updatedReasons });
                  }}
                />
              ))}
            </ReasonForTestingContainer>
          </>
        )}
      </div>
    </PatientPanelRoot>
  );
}

const ReasonForTestingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 20px;
`;

const StyledCheckbox = styled(Checkbox)`
  .spot-form__checkbox-label {
    font-size: 12px;
    margin-right: 3px;
    margin-bottom: 0px;
  }
`;
