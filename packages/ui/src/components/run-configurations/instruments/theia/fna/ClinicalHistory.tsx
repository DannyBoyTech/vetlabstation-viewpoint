import {
  Area,
  Binary,
  Distribution,
  FnaRunConfigurationDto,
  LesionAspirateAppearance,
  LesionBothering,
  LesionDuration,
  LesionGrowthRate,
  LesionSizeChanging,
  LesionSizeUnit,
  LesionSwelling,
  PatientLivingLocation,
  QualifierType,
  RecentTravel,
  ResponsiveStatus,
  Symptoms,
} from "@viewpoint/api";
import { Checkbox, Radio, RadioGroup, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { IndividualFnaConfigTypes, updateMultiElementField } from "./fna-utils";
import { MaskedInput } from "../../../../input/MaskedInput";
import { GreaterThanLessThanNumpad } from "../../../../keyboard/GreaterThanLessThanNumpad";

export interface ClinicalHistoryProps {
  onChange: (updatedConfig: Partial<FnaRunConfigurationDto>) => void;
  currentConfig: Partial<FnaRunConfigurationDto>;
}

type ClinicalHistoryData = {
  [key in keyof FnaRunConfigurationDto]?: {
    options: IndividualFnaConfigTypes[];
    i18nTypeKey:
      | "area"
      | "recentTravel"
      | "patientLivingLocation"
      | "binary"
      | "lesionDuration"
      | "symptoms"
      | "lesionSizeChanging"
      | "lesionSwelling"
      | "lesionBothering"
      | "lesionGrowthRate"
      | "distribution"
      | "lesionAspirateAppearance"
      | "responsive";
    controlType: "radio" | "checkbox";
    // All checkbox types automatically convert to an array in the request.
    // For some fields, the experience requested is to use a radio button (single selection)
    // but the data model on IVLS expects an array. This overrides the default behavior.
    useArray?: boolean;
  };
};

const PageOneData: ClinicalHistoryData = {
  recentVaccination: {
    options: [Area.IN_THIS_AREA, Area.ELSEWHERE],
    i18nTypeKey: "area",
    useArray: true,
    controlType: "radio",
  },
  infection: {
    options: [Area.IN_THIS_AREA, Area.ELSEWHERE],
    i18nTypeKey: "area",
    useArray: true,
    controlType: "radio",
  },
  recentTravel: {
    options: [
      RecentTravel.US_WEST,
      RecentTravel.US_MIDWEST,
      RecentTravel.US_SOUTHEAST,
      RecentTravel.US_SOUTHWEST,
      RecentTravel.US_NORTHEAST,
      RecentTravel.OUTSIDE_US,
    ],
    controlType: "checkbox",
    i18nTypeKey: "recentTravel",
  },
  patientLivingLocation: {
    options: [
      PatientLivingLocation.INDOOR,
      PatientLivingLocation.OUTDOOR,
      PatientLivingLocation.INDOOR_OUTDOOR,
    ],
    i18nTypeKey: "patientLivingLocation",
    controlType: "radio",
  },
  recentTrauma: {
    options: [Binary.YES, Binary.NO],
    i18nTypeKey: "binary",
    controlType: "radio",
  },
  recentNeoplasia: {
    options: [Area.IN_THIS_AREA, Area.ELSEWHERE],
    i18nTypeKey: "area",
    controlType: "radio",
    useArray: true,
  },
};

export function ClinicalHistory1(props: ClinicalHistoryProps) {
  return <GenericClinicalHistory displayData={PageOneData} {...props} />;
}

const PageTwoData: ClinicalHistoryData = {
  recentSurgery: {
    options: [Binary.YES, Binary.NO],
    i18nTypeKey: "binary",
    controlType: "radio",
  },
  lesionRecurrent: {
    options: [Binary.YES, Binary.NO],
    i18nTypeKey: "binary",
    controlType: "radio",
  },
  lesionSizeChanging: {
    options: [
      LesionSizeChanging.GROWING,
      LesionSizeChanging.SHRINKING,
      LesionSizeChanging.FLUCTUATING,
    ],
    i18nTypeKey: "lesionSizeChanging",
    controlType: "radio",
  },
  lesionSimilarPresent: {
    options: [Binary.YES, Binary.NO],
    i18nTypeKey: "binary",
    controlType: "radio",
  },
  lesionSwelling: {
    options: [
      LesionSwelling.REGIONAL,
      LesionSwelling.DISTAL,
      LesionSwelling.ASSOCIATED,
    ],
    i18nTypeKey: "lesionSwelling",
    controlType: "radio",
    useArray: true,
  },
  lesionBothering: {
    options: [
      LesionBothering.ITCHING,
      LesionBothering.LICKING,
      LesionBothering.PAINFUL,
      LesionBothering.LIMPING,
    ],
    i18nTypeKey: "lesionBothering",
    controlType: "checkbox",
  },
};

export function ClinicalHistory2(props: ClinicalHistoryProps) {
  return <GenericClinicalHistory displayData={PageTwoData} {...props} />;
}

const PageThreeData: ClinicalHistoryData = {
  lesionDischarge: {
    options: [Binary.YES, Binary.NO],
    i18nTypeKey: "binary",
    controlType: "radio",
  },
  antibioticsTreatment: {
    options: [ResponsiveStatus.RESPONSIVE, ResponsiveStatus.NON_RESPONSIVE],
    i18nTypeKey: "responsive",
    controlType: "radio",
  },
  treatmentOtherResponsive: {
    options: [ResponsiveStatus.RESPONSIVE, ResponsiveStatus.NON_RESPONSIVE],
    i18nTypeKey: "responsive",
    controlType: "radio",
  },
  symptoms: {
    options: [
      Symptoms.FEVER,
      Symptoms.LETHARGY,
      Symptoms.WEIGHT_LOSS,
      Symptoms.INAPPETENCE_ANOREXIA,
      Symptoms.GENERALIZED_LYMPHADENOPATHY,
      Symptoms.REGIONAL_LYMPHADENOPATHY,
    ],
    i18nTypeKey: "symptoms",
    controlType: "checkbox",
  },
  lesionDuration: {
    options: [
      LesionDuration.LESS_THAN_24HOURS,
      LesionDuration.DAYS,
      LesionDuration.WEEKS,
      LesionDuration.ONE_TO_SIX_MONTHS,
      LesionDuration.SIX_TO_TWELVE_MONTHS,
      LesionDuration.MORE_THAN_ONE_YEAR,
    ],
    i18nTypeKey: "lesionDuration",
    controlType: "radio",
  },
};

export function ClinicalHistory3(props: ClinicalHistoryProps) {
  return <GenericClinicalHistory displayData={PageThreeData} {...props} />;
}

const PageFourData: ClinicalHistoryData = {
  lesionGrowthRate: {
    options: [
      LesionGrowthRate.SLOW,
      LesionGrowthRate.MODERATE,
      LesionGrowthRate.RAPID,
    ],
    i18nTypeKey: "lesionGrowthRate",
    controlType: "radio",
  },
  distribution: {
    options: [
      Distribution.SINGLE_LESION,
      Distribution.MULTIPLE_LESIONS,
      Distribution.REGIONALLY_EXTENSIVE,
      Distribution.DIFFUSE,
    ],
    i18nTypeKey: "distribution",
    controlType: "radio",
  },
  lesionAspirateAppearance: {
    options: [
      LesionAspirateAppearance.CLEAR_SEROUS,
      LesionAspirateAppearance.SEROSANGUINOUS,
      LesionAspirateAppearance.BLOODY,
      LesionAspirateAppearance.PURULENT,
      LesionAspirateAppearance.WHITE,
      LesionAspirateAppearance.BLACK,
      LesionAspirateAppearance.VISCOUS_MUCINOUS,
      LesionAspirateAppearance.CHUNKY,
      LesionAspirateAppearance.GREASY,
    ],
    i18nTypeKey: "lesionAspirateAppearance",
    controlType: "checkbox",
  },
};

const ClinicalHistory4Root = styled.div`
  display: flex;
  gap: 16px;
  margin: 4px;
`;

const ContentContainer = styled.div`
  flex: 3;
`;

const NumPadContainer = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .spot-form__radio-group-inner {
    margin-left: 4px;
  }
`;

export function ClinicalHistory4(props: ClinicalHistoryProps) {
  const { t } = useTranslation();

  const prefix =
    props.currentConfig.lesionSizeQualifier === "GREATER_THAN"
      ? "> "
      : props.currentConfig.lesionSizeQualifier === "LESS_THAN"
      ? "< "
      : undefined;

  return (
    <ClinicalHistory4Root>
      <NumPadContainer>
        <SpotText level="paragraph">
          {t(
            "orderFulfillment.runConfig.inVueDx.fna.clinicalHistory.labels.lesionSize"
          )}
        </SpotText>
        <MaskedInput
          type="search"
          mask={prefix == null ? "[00000]" : `{${prefix}}[00000]`}
          placeholder={prefix}
          placeholderChar={" "}
          value={`${prefix}${props.currentConfig.lesionSize}`}
          onAccept={(v) => {
            const updated = { ...props.currentConfig };
            const cleaned = v.replaceAll(">", "").replaceAll("<", "").trim();
            if (cleaned.length === 0) {
              delete updated.lesionSize;
            } else {
              updated.lesionSize = Number(cleaned);
              if (updated.lesionSizeQualifier == null) {
                // Default qualifier of equality
                updated.lesionSizeQualifier = QualifierType.EQUALITY;
              }
              if (updated.lesionSizeUnit == null) {
                // default unit of mm
                updated.lesionSizeUnit = LesionSizeUnit.MM;
              }
            }
            props.onChange(updated);
          }}
        />
        <GreaterThanLessThanNumpad
          onGreaterThanPressed={() =>
            props.onChange({
              ...props.currentConfig,
              lesionSizeQualifier:
                props.currentConfig.lesionSizeQualifier === "GREATER_THAN"
                  ? QualifierType.EQUALITY
                  : QualifierType.GREATER_THAN,
            })
          }
          greaterThanEnabled={
            props.currentConfig.lesionSizeQualifier ===
            QualifierType.GREATER_THAN
          }
          onLessThanPressed={() =>
            props.onChange({
              ...props.currentConfig,
              lesionSizeQualifier:
                props.currentConfig.lesionSizeQualifier === "LESS_THAN"
                  ? QualifierType.EQUALITY
                  : QualifierType.LESS_THAN,
            })
          }
          lessThanEnabled={
            props.currentConfig.lesionSizeQualifier === QualifierType.LESS_THAN
          }
        />

        <SpotText level="paragraph">{t("settings.categories.UNITS")}</SpotText>
        <RadioGroup horizontal>
          <Radio
            checked={props.currentConfig.lesionSizeUnit === LesionSizeUnit.MM}
            onChange={() =>
              props.onChange({
                ...props.currentConfig,
                lesionSizeUnit: LesionSizeUnit.MM,
              })
            }
            label={t("settings.units.labels.millimeters", { context: "short" })}
          />
          <Radio
            checked={props.currentConfig.lesionSizeUnit === LesionSizeUnit.CM}
            onChange={() =>
              props.onChange({
                ...props.currentConfig,
                lesionSizeUnit: LesionSizeUnit.CM,
              })
            }
            label={t("settings.units.labels.centimeters", { context: "short" })}
          />
          <Radio
            checked={
              props.currentConfig.lesionSizeUnit === LesionSizeUnit.INCHES
            }
            onChange={() =>
              props.onChange({
                ...props.currentConfig,
                lesionSizeUnit: LesionSizeUnit.INCHES,
              })
            }
            label={t("settings.units.labels.inches", { context: "short" })}
          />
        </RadioGroup>
      </NumPadContainer>

      <ContentContainer>
        <GenericClinicalHistory displayData={PageFourData} {...props} />
      </ContentContainer>
    </ClinicalHistory4Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  gap: 16px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  > .spot-form__radio {
    margin: 0 4px;
  }

  > .spot-form__checkbox {
    margin: 0 4px;
  }
`;

interface GenericClinicalHistoryProps extends ClinicalHistoryProps {
  displayData: ClinicalHistoryData;
}

function GenericClinicalHistory({
  onChange,
  currentConfig,
  displayData,
}: GenericClinicalHistoryProps) {
  const { t } = useTranslation();

  const handleRadioChange = useCallback(
    (
      key: keyof FnaRunConfigurationDto,
      value: IndividualFnaConfigTypes,
      useArray?: boolean
    ) => {
      onChange({ ...currentConfig, [key]: useArray ? [value] : value });
    },
    [currentConfig, onChange]
  );

  const handleCheckboxChange = useCallback(
    (
      key: keyof FnaRunConfigurationDto,
      value: IndividualFnaConfigTypes,
      checked: boolean
    ) => {
      const updated = updateMultiElementField(
        currentConfig,
        key,
        value,
        checked
      );
      onChange(updated);
    },
    [currentConfig, onChange]
  );

  return (
    <Root>
      {(Object.keys(displayData) as (keyof FnaRunConfigurationDto)[]).map(
        (key) => {
          const data = displayData[key]!;

          return (
            <Section key={key}>
              <div>
                <SpotText level="paragraph">
                  {t(
                    `orderFulfillment.runConfig.inVueDx.fna.clinicalHistory.labels.${key}` as any
                  )}
                </SpotText>
              </div>

              <InputContainer>
                {data.controlType === "checkbox" &&
                  data.options.map((option) => {
                    const checked = !!(
                      currentConfig[key] as unknown[]
                    )?.includes(option);
                    return (
                      <Checkbox
                        key={option}
                        checked={checked}
                        onChange={() =>
                          handleCheckboxChange(key, option, !checked)
                        }
                        label={t(
                          `orderFulfillment.runConfig.inVueDx.fna.clinicalHistory.${data.i18nTypeKey}.${option}` as any
                        )}
                      />
                    );
                  })}

                {data.controlType === "radio" &&
                  data.options.map((option) => (
                    <Radio
                      key={option}
                      checked={
                        data.useArray
                          ? !!(currentConfig[key] as unknown[])?.includes(
                              option
                            )
                          : currentConfig[key] === option
                      }
                      onChange={() =>
                        handleRadioChange(key, option, data.useArray)
                      }
                      label={t(
                        `orderFulfillment.runConfig.inVueDx.fna.clinicalHistory.${data.i18nTypeKey}.${option}` as any
                      )}
                    />
                  ))}
              </InputContainer>
            </Section>
          );
        }
      )}
    </Root>
  );
}
