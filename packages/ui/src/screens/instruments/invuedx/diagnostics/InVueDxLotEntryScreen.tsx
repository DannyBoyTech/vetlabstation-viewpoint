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
} from "../../common-components";
import { useCallback, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useValidateBarcodeMutation } from "../../../../api/InstrumentApi";
import { useGetValidBarcodeTypesQuery } from "../../../../api/TheiaApi";
import { LotEntry } from "../../common/LotEntry";
import { useToast } from "@viewpoint/spot-react/src";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../../../utils/toast/toast-defaults";
import {
  useHeaderTitle,
  useInstrumentNameForId,
} from "../../../../utils/hooks/hooks";
import { unstable_useBlocker as useBlocker } from "react-router";
import { CancelConfirmationModal } from "../../../../components/confirm-modal/CancelConfirmationModal";
import { RequiredInput } from "../../../../components/input/RequiredInput";
import { InputAware } from "../../../../components/InputAware";
import {
  CommonMasks,
  MaskedInput,
} from "../../../../components/input/MaskedInput";

type ValidBarcodeTypes = Extract<
  BarcodeType,
  BarcodeType.BLOOD | BarcodeType.EAR_SWAB | BarcodeType.FNA
>;
export const TestId = {
  NextButton: "invue-lot-entry-next-button",
  CancelButton: "invue-lot-entry-cancel-button",
  CancelConfirmationModal: "invue-lot-entry-cancel-confirm-modal",
  LotEntryInput: "lot-entry-input",
} as const;

export interface InVueDxLotEntryScreenProps {
  instrument: InstrumentStatusDto;
}

export function InVueDxLotEntryScreen(props: InVueDxLotEntryScreenProps) {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("instrumentScreens.lotEntry.title", {
      instrumentName: t(`instruments.names.${InstrumentType.Theia}`),
    }),
  });
  const [selectedOption, setSelectedOption] = useState<ValidBarcodeTypes>();
  const [barcodeEntry, setBarcodeEntry] = useState<string>();
  const [isError, setIsError] = useState(false);

  const [validateBarcode, validateBarcodeStatus] = useValidateBarcodeMutation();
  const { data: validBarcodeTypes } = useGetValidBarcodeTypesQuery();

  const getInstrumentName = useInstrumentNameForId();
  const nav = useNavigate();
  const { addToast } = useToast();

  const validated = useRef(false);
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
        addToast({
          ...DefaultSuccessToastOptions,
          content: (
            <ToastContentRoot>
              <ToastTextContentRoot>
                <ToastText level="paragraph" bold $maxLines={1}>
                  {getInstrumentName(props.instrument.instrument.id)}
                </ToastText>
                <ToastText level="paragraph" $maxLines={2}>
                  <Trans
                    i18nKey={
                      "instrumentScreens.inVue.diagnostics.lotEntrySuccess"
                    }
                  />
                </ToastText>
              </ToastTextContentRoot>
            </ToastContentRoot>
          ),
        });
        nav("/");
      } else {
        validated.current = false;
        setIsError(true);
      }
    }
  }, [
    barcodeEntry,
    selectedOption,
    validateBarcode,
    props.instrument.instrument.id,
    addToast,
    getInstrumentName,
    nav,
  ]);

  const handleTextEntry = (text: string) => {
    setIsError(false);
    setBarcodeEntry(text);
  };

  const errorText = isError ? t("instrumentScreens.lotEntry.error") : undefined;

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        {validBarcodeTypes != null && (
          <LotEntry
            instrument={props.instrument}
            barcodeTypes={validBarcodeTypes}
            barcodeType={selectedOption}
            onBarcodeTypeChanged={(type) =>
              setSelectedOption(type as ValidBarcodeTypes)
            }
            inputElem={
              <RequiredInput
                data-testid="error-message"
                error={isError}
                errorText={errorText}
              >
                <InputAware>
                  <MaskedInput
                    data-testid={TestId.LotEntryInput}
                    autoFocus
                    type="search"
                    error={isError}
                    mask={CommonMasks.DIGITS_ALPHA_ANYCASE}
                    onAccept={handleTextEntry}
                    value={barcodeEntry}
                  />
                </InputAware>
              </RequiredInput>
            }
          />
        )}
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
          data-testid={TestId.CancelConfirmationModal}
          onConfirm={() => blocker.proceed()}
          onClose={() => blocker.reset()}
          open
        />
      )}
    </InstrumentPageRoot>
  );
}
