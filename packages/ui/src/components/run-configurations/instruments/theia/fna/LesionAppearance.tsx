import {
  FnaRunConfigurationDto,
  LesionAppearance as ApiLesionAppearance,
} from "@viewpoint/api";
import { Checkbox, Radio, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";
import { updateMultiElementField } from "./fna-utils";

export const TestId = {
  LesionAppearanceOption: (option: ApiLesionAppearance) =>
    `theia-fna-lesion-appearance-${option}`,
};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 8px;
`;

const Section = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 80%;

  > .spot-form__radio {
    margin: 0;
  }

  > .spot-form__checkbox {
    margin: 0;
  }
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: ${(p) => p.theme.borders?.lightPrimary};
`;

const Sections: {
  [key in keyof FnaRunConfigurationDto]?: {
    options: ApiLesionAppearance[];
    multiOption: boolean;
  };
} = {
  circumference: {
    options: [
      ApiLesionAppearance.POORLY_CIRCUMSCRIBED,
      ApiLesionAppearance.WELL_CIRCUMSCRIBED,
      ApiLesionAppearance.INVASIVE,
    ],
    multiOption: false,
  },
  elevation: {
    options: [
      ApiLesionAppearance.RAISED,
      ApiLesionAppearance.PEDUNCULATED,
      ApiLesionAppearance.FLAT,
      ApiLesionAppearance.NODULAR,
    ],
    multiOption: true,
  },
  softness: {
    options: [
      ApiLesionAppearance.SOFT,
      ApiLesionAppearance.FIRM,
      ApiLesionAppearance.SEMIFIRM,
      ApiLesionAppearance.SMOOTH,
      ApiLesionAppearance.IRREGULAR,
    ],
    multiOption: true,
  },
  surface: {
    options: [
      ApiLesionAppearance.ULCERATED,
      ApiLesionAppearance.CRUSTED,
      ApiLesionAppearance.OOZING_WEEPING,
      ApiLesionAppearance.FLUID_FILLED,
      ApiLesionAppearance.PRURITIC_ITCHY,
      ApiLesionAppearance.PAINFUL,
    ],
    multiOption: true,
  },
  hair: {
    options: [
      ApiLesionAppearance.ALOPECIC,
      ApiLesionAppearance.HAIRED,
      ApiLesionAppearance.PART_HAIRED,
    ],
    multiOption: false,
  },
  color: {
    options: [
      ApiLesionAppearance.RED,
      ApiLesionAppearance.PINK,
      ApiLesionAppearance.PIGMENTED_BLACK,
      ApiLesionAppearance.NORMAL_SKIN_COLOR,
    ],
    multiOption: true,
  },
  mobility: {
    options: [ApiLesionAppearance.MOVABLE, ApiLesionAppearance.FIXED],
    multiOption: false,
  },
  other: {
    options: [ApiLesionAppearance.UNKNOWN],
    multiOption: true,
  },
};

export interface LesionAppearanceProps {
  onChange: (updatedConfig: Partial<FnaRunConfigurationDto>) => void;
  currentConfig: Partial<FnaRunConfigurationDto>;
}

export function LesionAppearance(props: LesionAppearanceProps) {
  const { t } = useTranslation();

  const handleMulitSelectChange = (
    key: keyof FnaRunConfigurationDto,
    option: ApiLesionAppearance,
    checked: boolean
  ) => {
    if (option === ApiLesionAppearance.UNKNOWN) {
      const updated: Partial<FnaRunConfigurationDto> = {
        ...props.currentConfig,
      };
      if (checked) {
        // Clear out all other values if "unknown" is chosen
        Object.keys(Sections).forEach((k) => {
          delete updated[k as keyof FnaRunConfigurationDto];
        });
        updated.other = ApiLesionAppearance.UNKNOWN;
      } else {
        // It's also slightly different in that presentation is a checkbox, but
        // it's actually not an array value -- just a single value
        delete updated.other;
      }
      props.onChange(updated);
    } else {
      const updated = updateMultiElementField(
        props.currentConfig,
        key,
        option,
        checked
      );
      delete updated.other;
      props.onChange(updated);
    }
  };

  const handleSingleSelectChange = (
    key: keyof FnaRunConfigurationDto,
    option: ApiLesionAppearance
  ) => {
    const updated = {
      ...props.currentConfig,
      [key]: option,
    };
    delete updated.other;
    props.onChange(updated);
  };

  return (
    <Root>
      <SpotText level="paragraph">
        {t("orderFulfillment.runConfig.inVueDx.fna.lesionAppearance.title")}
      </SpotText>
      {(Object.keys(Sections) as (keyof FnaRunConfigurationDto)[]).map(
        (section, index, arr) => {
          const sectionData = Sections[section];

          return (
            <Fragment key={section}>
              <Section>
                {sectionData != null &&
                  sectionData.multiOption &&
                  sectionData.options.map((option) => {
                    const isChecked = !!(
                      props.currentConfig[section] as ApiLesionAppearance[]
                    )?.includes(option);
                    return (
                      <Checkbox
                        data-testid={TestId.LesionAppearanceOption(option)}
                        key={option}
                        checked={isChecked}
                        onChange={() =>
                          handleMulitSelectChange(section, option, !isChecked)
                        }
                        label={t(
                          `orderFulfillment.runConfig.inVueDx.fna.lesionAppearance.${option}`
                        )}
                      />
                    );
                  })}

                {sectionData != null &&
                  !sectionData.multiOption &&
                  sectionData.options.map((option) => (
                    <Radio
                      data-testid={TestId.LesionAppearanceOption(option)}
                      key={option}
                      checked={props.currentConfig[section] === option}
                      onChange={() => handleSingleSelectChange(section, option)}
                      label={t(
                        `orderFulfillment.runConfig.inVueDx.fna.lesionAppearance.${option}`
                      )}
                    />
                  ))}
              </Section>
              {index < arr.length - 1 && <Divider />}
            </Fragment>
          );
        }
      )}
    </Root>
  );
}
