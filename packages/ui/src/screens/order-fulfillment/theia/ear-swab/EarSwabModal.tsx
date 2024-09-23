import { Button, SpotText } from "@viewpoint/spot-react";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import { ChamberForm, ChamberFormSelection } from "./ChamberForm";
import { TheiaClinicalSigns } from "@viewpoint/api";
import { SignsForm } from "./SignsForm";
import styled from "styled-components";

const Steps = {
  Chambers: "chambers",
  Signs: "signs",
} as const;
type Step = (typeof Steps)[keyof typeof Steps];

const SecondaryHeaderKeys = {
  [Steps.Chambers]: "orderFulfillment.earSwab.header.required",
  [Steps.Signs]: "orderFulfillment.earSwab.header.optional",
} as const;

const StyledBasicModal = styled(BasicModal)`
  min-width: 620px;
  max-width: 90vw;
  width: unset;

  user-select: none;
`;

const Split = styled.div`
  display: contents;

  .spot-modal__footer:has(> &) {
    justify-content: space-between;
  }
`;

const Right = styled.div`
  display: contents;

  .spot-modal__footer:has(> &) {
    justify-content: flex-end;
  }
`;

function chambersComplete(chambers?: ChamberFormSelection) {
  const selections = [chambers?.leftFilled, chambers?.rightFilled];
  return (
    selections.every((it) => it != null) && selections.some((it) => it === true)
  );
}

export interface EarSwabSelections {
  leftFilled: boolean;
  rightFilled: boolean;
  clinicalSigns?: Set<`${TheiaClinicalSigns}`>;
}

export interface EarSwabModalProps {
  selections?: Partial<EarSwabSelections>;

  onUpdate?: (selections: Partial<EarSwabSelections>) => void;
  onCancel?: () => void;
  onSave?: (config: EarSwabSelections) => void;
}

export function EarSwabModal({
  selections,
  onUpdate,
  onCancel,
  onSave,
}: EarSwabModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(Steps.Chambers);

  const handleToSigns = () => {
    setStep(Steps.Signs);
  };

  const handleToChambers = () => {
    setStep(Steps.Chambers);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const complete = chambersComplete(selections);

  const handleSave = useCallback(() => {
    if (complete) {
      onSave?.({
        leftFilled: selections!.leftFilled!,
        rightFilled: selections!.rightFilled!,
        clinicalSigns: selections?.clinicalSigns,
      });
    }
  }, [complete, selections, onSave]);

  const bodyContent = {
    [Steps.Chambers]: (
      <ChamberForm
        value={selections}
        onChange={(update) => onUpdate?.({ ...selections, ...update })}
      />
    ),
    [Steps.Signs]: (
      <SignsForm
        value={selections as EarSwabSelections}
        onChange={(update) => onUpdate?.({ ...selections, ...update })}
      />
    ),
  }[step];

  const footerContent = {
    [Steps.Chambers]: (
      <Right>
        <Button
          onClick={handleSave}
          buttonType="secondary"
          disabled={!complete}
        >
          {t("orderFulfillment.earSwab.buttons.finishAndSave")}
        </Button>
        <Button onClick={handleToSigns} rightIcon="next" disabled={!complete}>
          {t("orderFulfillment.earSwab.buttons.enterClinicalSigns")}
        </Button>
      </Right>
    ),
    [Steps.Signs]: (
      <Split>
        <Button onClick={handleToChambers} leftIcon="previous">
          {t("general.buttons.back")}
        </Button>
        <Button onClick={handleSave}>{t("general.buttons.save")}</Button>
      </Split>
    ),
  }[step];

  return (
    <StyledBasicModal
      open={true}
      dismissable={true}
      onClose={handleCancel}
      headerContent={
        <>
          <SpotText level="h4" className="spot-modal__secondary-title">
            {t(SecondaryHeaderKeys[step])}
          </SpotText>
          <SpotText level="h3" className="spot-modal__title">
            {t("orderFulfillment.earSwab.header.specimenDetails")}
          </SpotText>
        </>
      }
      bodyContent={bodyContent}
      footerContent={footerContent}
    />
  );
}
