import { Button } from "@viewpoint/spot-react";
import {
  BarcodeType,
  BarcodeValidationResponseDto,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SmartQCLabel from "../../../assets/lot-entry/pco/Acadia_SmartQC_Label.png";
import ReagentLabel from "../../../assets/lot-entry/pco/Acadia_Reagent_Label.png";
import SheathLabel from "../../../assets/lot-entry/pco/Acadia_Sheath_Label.png";
import { useValidateBarcodeMutation } from "../../../api/InstrumentApi";
import { LotEntry } from "../common/LotEntry";
import { unstable_useBlocker as useBlocker } from "react-router";
import { CancelConfirmationModal } from "../../../components/confirm-modal/CancelConfirmationModal";
import { useHeaderTitle } from "../../../utils/hooks/hooks";
import { RequiredInput } from "../../../components/input/RequiredInput";
import styled from "styled-components";
import { ViewpointKeyboard } from "../../../components/keyboard/ViewpointKeyboard";
import {
  CommonMasks,
  MaskedInput,
} from "../../../components/input/MaskedInput";

type ValidBarcodeTypes = Extract<
  BarcodeType,
  BarcodeType.SMART_QC | BarcodeType.SHEATH | BarcodeType.REAGENT
>;

export const TestId = {
  NextButton: "pco-lot-entry-next-button",
  CancelButton: "pco-lot-entry-cancel-button",
  LotEntryInput: "lot-entry-input",
  Numpad: "numpad",
} as const;

const Labels = {
  [BarcodeType.REAGENT]: ReagentLabel,
  [BarcodeType.SHEATH]: SheathLabel,
  [BarcodeType.SMART_QC]: SmartQCLabel,
};

export interface ProCyteOneLotEntryScreenProps {
  instrument: InstrumentStatusDto;
  initialBarcodeType?: string;
}

export function ProCyteOneLotEntryScreen(props: ProCyteOneLotEntryScreenProps) {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("instrumentScreens.lotEntry.title", {
      instrumentName: t(`instruments.names.${InstrumentType.ProCyteOne}`),
    }),
  });
  const [selectedOption, setSelectedOption] = useState<ValidBarcodeTypes>();
  const [barcodeEntry, setBarcodeEntry] = useState<string>();
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [validateBarcode, validateBarcodeStatus] = useValidateBarcodeMutation();
  const validated = useRef(false);

  const nav = useNavigate();

  const blocker = useBlocker(
    barcodeEntry != null && barcodeEntry.length > 0 && !validated.current
  );

  const handleNext = useCallback(async () => {
    if (barcodeEntry && selectedOption) {
      validated.current = true;
      const response: BarcodeValidationResponseDto = await validateBarcode({
        instrumentId: props.instrument.instrument.id,
        barcodeType: selectedOption,
        barcode: barcodeEntry,
      }).unwrap();
      if (response.isValid) {
        nav("/");
      } else {
        validated.current = false;
        setIsError(true);
      }
    }
  }, [
    props.instrument.instrument.id,
    barcodeEntry,
    selectedOption,
    nav,
    validateBarcode,
  ]);

  const handleTextEntry = (text: string) => {
    setIsError(false);
    setBarcodeEntry(text);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (props.initialBarcodeType === BarcodeType.SHEATH) {
      setSelectedOption(BarcodeType.SHEATH);
    } else if (props.initialBarcodeType === BarcodeType.REAGENT) {
      setSelectedOption(BarcodeType.REAGENT);
    }
  }, [props.initialBarcodeType]);

  const errorText = isError ? t("instrumentScreens.lotEntry.error") : undefined;

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <LotEntry
          instrument={props.instrument}
          barcodeTypes={[
            BarcodeType.SMART_QC,
            BarcodeType.SHEATH,
            BarcodeType.REAGENT,
          ]}
          barcodeType={selectedOption}
          onBarcodeTypeChanged={(type) =>
            setSelectedOption(type as ValidBarcodeTypes)
          }
          exampleImageSrc={
            selectedOption == null ? undefined : Labels[selectedOption]
          }
          inputElem={
            <RequiredInput
              data-testid="error-message"
              error={isError}
              errorText={errorText}
            >
              <MaskedInput
                type="search"
                data-testid={TestId.LotEntryInput}
                inputRef={inputRef}
                onBlur={() => inputRef.current?.focus()}
                error={isError}
                mask={CommonMasks.DIGITS}
                onAccept={handleTextEntry}
                scale={0}
              />
            </RequiredInput>
          }
          keyboardElem={
            <ViewpointKeyboard
              data-testid={TestId.Numpad}
              keyboardType="numpad"
              alwaysVisible
            />
          }
        />
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.NextButton}
            buttonType="primary"
            disabled={
              !barcodeEntry ||
              !selectedOption ||
              validateBarcodeStatus.isLoading
            }
            onClick={handleNext}
          >
            {t("general.buttons.next")}
          </Button>
          <Button
            data-testid={TestId.CancelButton}
            buttonType="secondary"
            onClick={() => nav(-1)}
          >
            {t("general.buttons.cancel")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>

      {blocker.state === "blocked" && (
        <CancelConfirmationModal
          onConfirm={() => blocker.proceed()}
          onClose={() => blocker.reset()}
          open
        />
      )}
    </InstrumentPageRoot>
  );
}
