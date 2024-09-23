import styled from "styled-components";
import { SetInput } from "./SetInput";
import { Consumable } from "./Consumable";
import { Theme } from "../../../../utils/StyleConstants";
import { TheiaClinicalSigns } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import type { EarSwabSelections } from "./EarSwabModal";

const Root = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 56px;

  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
`;

const CHOICES = new Set(Object.values(TheiaClinicalSigns));

function ValueLabel({ value }: { value: `${TheiaClinicalSigns}` }) {
  const { t } = useTranslation();

  return (
    <span className="spot-form__checkbox-label">
      {t(`theia.clinicalSigns.${value}` as any)}
    </span>
  );
}

export interface SignsFormProps {
  value: EarSwabSelections;
  onChange?: (selections: EarSwabSelections) => void;
}

export function SignsForm(props: SignsFormProps) {
  const { t } = useTranslation();

  return (
    <Root>
      <SetInput
        label={t("theia.clinicalSigns.label")}
        choices={CHOICES}
        value={props.value?.clinicalSigns}
        onChange={(clinicalSigns) =>
          props.onChange?.({ ...props.value, clinicalSigns })
        }
        renderValueLabel={(value) => <ValueLabel value={value} />}
      />
      <Consumable
        leftFilled={props.value?.leftFilled}
        rightFilled={props.value?.rightFilled}
      />
    </Root>
  );
}
