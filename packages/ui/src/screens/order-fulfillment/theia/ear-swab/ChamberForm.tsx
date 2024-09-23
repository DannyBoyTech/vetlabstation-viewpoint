import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { useTranslation } from "react-i18next";
import { RadioTristate } from "./RadioTristate";
import { Consumable } from "./Consumable";

const EarSwabChamberFormRoot = styled.div`
  display: flex;
  gap: 50px;

  justify-content: center;
  align-items: flex-start;

  padding: 56px;

  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
`;

export const TestId = {
  LeftEarRadioTristate: "theia-left-ear-radio-tristate",
  RightEarRadioTristate: "theia-right-ear-radio-tristate",
};

export interface ChamberFormSelection {
  leftFilled?: boolean;
  rightFilled?: boolean;
}

export interface ChamberFormProps {
  value?: ChamberFormSelection;
  onChange?: (value: ChamberFormSelection) => void;
}

export function ChamberForm(props: ChamberFormProps) {
  const { t } = useTranslation();

  return (
    <EarSwabChamberFormRoot>
      <RadioTristate
        data-testid={TestId.LeftEarRadioTristate}
        label={t("theia.sampleSource.LEFT_EAR")}
        trueLabel={t("orderFulfillment.earSwab.chamber.filled")}
        falseLabel={t("orderFulfillment.earSwab.chamber.empty")}
        onChange={(leftFilled) =>
          props.onChange?.({ ...props.value, leftFilled })
        }
        value={props.value?.leftFilled}
      />
      <Consumable
        leftFilled={props.value?.leftFilled}
        rightFilled={props.value?.rightFilled}
        onLeftChamberClick={() =>
          props.onChange?.({
            ...props.value,
            leftFilled: !props.value?.leftFilled,
          })
        }
        onRightChamberClick={() =>
          props.onChange?.({
            ...props.value,
            rightFilled: !props.value?.rightFilled,
          })
        }
      />
      <RadioTristate
        data-testid={TestId.RightEarRadioTristate}
        label={t("theia.sampleSource.RIGHT_EAR")}
        trueLabel={t("orderFulfillment.earSwab.chamber.filled")}
        falseLabel={t("orderFulfillment.earSwab.chamber.empty")}
        onChange={(rightFilled) =>
          props.onChange?.({ ...props.value, rightFilled })
        }
        value={props.value?.rightFilled}
      />
    </EarSwabChamberFormRoot>
  );
}
