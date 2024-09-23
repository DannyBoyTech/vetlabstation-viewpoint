import { ConfirmModal } from "../../../../confirm-modal/ConfirmModal";
import { Trans, useTranslation } from "react-i18next";
import React, { useState } from "react";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import { SpotText } from "@viewpoint/spot-react/src";
import { ViewpointKeyboard } from "../../../../keyboard/ViewpointKeyboard";
import { MaskedInput } from "../../../../input/MaskedInput";
import {
  BloodModalContentRoot,
  BloodModalWrapper,
  CbcValues,
} from "./blood-common";
import styled from "styled-components";

export const CbcInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

function BloodLabeledInput(props: {
  "data-testid": string;
  value: string;
  label: string;
  placeholder: string;
  onAccept: (value: string) => void;
}) {
  return (
    <>
      <SpotText level="paragraph">
        <Trans
          i18nKey={props.label as any}
          components={CommonTransComponents}
        />
      </SpotText>
      <MaskedInput
        data-testid={props["data-testid"]}
        value={props.value}
        mask={Number}
        scale={2}
        min={0}
        max={99.99}
        placeholder={props.placeholder}
        onAccept={props.onAccept}
      />
    </>
  );
}

function parseFloatOrUndefined(value: string): number | undefined {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export interface CbcValuesModalProps {
  cbcValues: CbcValues;
  onBack: () => void;
  onClose: () => void;
  onCbcValuesSubmitted: (cbcValues: CbcValues) => void;
}

export function CbcValuesModal(props: CbcValuesModalProps) {
  const { t } = useTranslation();

  const [rbcValue, setRbcValue] = useState<string>(
    String(props.cbcValues.rbcValue)
  );
  const [hctValue, setHctValue] = useState<string>(
    String(props.cbcValues.hctValue)
  );
  const [wbcValue, setWbcValue] = useState<string>(
    String(props.cbcValues.wbcValue)
  );

  const rbc = parseFloatOrUndefined(rbcValue);
  const hct = parseFloatOrUndefined(hctValue);
  const wbc = parseFloatOrUndefined(wbcValue);

  const valid = rbc !== undefined || hct !== undefined || wbc !== undefined;

  const bodyContent = (
    <BloodModalWrapper>
      <SpotText level="secondary">
        <Trans
          i18nKey="orderFulfillment.bloodMorphology.cbc.values.instructions"
          components={CommonTransComponents}
        />
      </SpotText>
      <BloodModalContentRoot>
        <CbcInputsContainer>
          <SpotText level="paragraph" bold>
            {t("orderFulfillment.bloodMorphology.cbc.values.title")}
          </SpotText>
          <BloodLabeledInput
            data-testid="enter-rbc-value"
            value={rbcValue}
            onAccept={setRbcValue}
            label="orderFulfillment.bloodMorphology.cbc.values.rbc"
            placeholder={t(
              "orderFulfillment.bloodMorphology.cbc.values.placeholder.rbc"
            )}
          />
          <BloodLabeledInput
            data-testid="enter-hct-value"
            value={hctValue}
            onAccept={setHctValue}
            label="orderFulfillment.bloodMorphology.cbc.values.hct"
            placeholder={t(
              "orderFulfillment.bloodMorphology.cbc.values.placeholder.hct"
            )}
          />
          <BloodLabeledInput
            data-testid="enter-wbc-value"
            value={wbcValue}
            onAccept={setWbcValue}
            label="orderFulfillment.bloodMorphology.cbc.values.wbc"
            placeholder={t(
              "orderFulfillment.bloodMorphology.cbc.values.placeholder.wbc"
            )}
          />
        </CbcInputsContainer>
        <ViewpointKeyboard alwaysVisible keyboardType="numpad" />
      </BloodModalContentRoot>
    </BloodModalWrapper>
  );

  return (
    <ConfirmModal
      responsive
      headerContent={t("orderFulfillment.bloodMorphology.cbc.values.header")}
      secondaryHeaderContent={t(
        "orderFulfillment.bloodMorphology.cbc.values.secondaryHeader"
      )}
      bodyContent={bodyContent}
      cancelButtonContent={t("general.buttons.back")}
      confirmButtonContent={t("general.buttons.save")}
      confirmable={valid}
      onClose={valid ? props.onBack : props.onClose}
      onConfirm={() => {
        props.onCbcValuesSubmitted({
          rbcValue: rbc,
          wbcValue: wbc,
          hctValue: hct,
        });
      }}
      open
    ></ConfirmModal>
  );
}
