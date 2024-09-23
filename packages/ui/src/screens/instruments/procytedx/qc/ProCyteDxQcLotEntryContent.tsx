import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { Fragment, useContext, useEffect, useMemo, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  CommonMasks,
  MaskedInput,
} from "../../../../components/input/MaskedInput";
import { ViewpointKeyboard } from "../../../../components/keyboard/ViewpointKeyboard";
import { BarcodeStatusEnum } from "@viewpoint/api";
import type { AcceptedBarcodes } from "./ProCyteDxLotEntryModal";
import { SpotText, ValidationError } from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { ViewpointThemeContext } from "../../../../context/ThemeContext";
import { QC_BARCODE_LENGTH } from "../../../../api/ProCyteDxApi";

export const TestId = {
  BarcodeInput: "pdx-qc-lot-barcode-input",
  ErrorText: "pdx-qc-lot-error-text",
  BarcodeStatus: (sequence: number) => `pdx-qc-lot-barcode-status-${sequence}`,
};

const LotEntryRoot = styled.div`
  width: 700px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const EntrySection = styled.div`
  display: flex;
  flex: 1;
  gap: 50px;
`;
const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .spot-form__field-error {
    margin: 0;
  }
`;
const SummaryBox = styled(Section)`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  padding: 10px;
`;

const BarCodeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 10px;
  width: 85%;
`;

const ValidationErrorContainer = styled.div<{ isVisible: boolean }>`
  ${(p) => (!p.isVisible ? "visibility: hidden;" : "")}
`;

const SEQUENCE_INPUT_ORDER = [4, 5, 6, 1, 2, 3];

const SEQUENCE_TO_DISPLAY_NUMBER_MAPPING: Record<number, number> = {
  4: 1,
  5: 2,
  6: 3,
  1: 4,
  2: 5,
  3: 6,
};

interface LotEntryContentProps {
  currentBarcodeEntry: string;
  onBarcodeEntered: (barcode: string) => void;
  acceptedBarcodes: AcceptedBarcodes;
  isError: boolean;
}

export function ProCyteDxQcLotEntryContent(props: LotEntryContentProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { t } = useTranslation();

  // Focus on input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear the input field if the barcode they've entered has been accepted
  useEffect(() => {
    if (
      Object.values(props.acceptedBarcodes).some(
        ({ barcode }) => barcode === props.currentBarcodeEntry
      )
    ) {
      props.onBarcodeEntered("");
    }
  }, [props.acceptedBarcodes]);

  // Calculate which input (based on the sequence order defined above) should be marked as "next"
  // It is just a visual indication -- when the user inputs their barcode, IVLS determines which sequence it belongs to
  // and will give us that info so that we can appropriately mark the barcode as entered
  const nextSequence = useMemo(() => {
    const keys = Object.keys(props.acceptedBarcodes);
    return SEQUENCE_INPUT_ORDER.find((seq) => !keys.includes(`${seq}`));
  }, [props.acceptedBarcodes]);

  return (
    <LotEntryRoot>
      <SpotText level="paragraph">
        <Trans i18nKey="instrumentScreens.proCyteDx.qualityControl.addQcLot.instructions" />
      </SpotText>

      <EntrySection>
        <SummaryBox>
          <SpotText level="paragraph">
            {t(
              "instrumentScreens.proCyteDx.qualityControl.addQcLot.barcodesHeader"
            )}
          </SpotText>

          <SpotText level="paragraph" bold>
            {t("instrumentScreens.proCyteDx.qualityControl.addQcLot.levelTwo")}
          </SpotText>

          <BarCodeGrid>
            {[4, 5, 6].map((sequence) => (
              <Fragment key={sequence}>
                <BarcodeLabel
                  displayNumber={SEQUENCE_TO_DISPLAY_NUMBER_MAPPING[sequence]}
                  isNext={nextSequence === sequence}
                  validationStatus={
                    props.acceptedBarcodes[sequence]?.barcodeStatus
                  }
                />
                <BarcodeStatus
                  sequence={sequence}
                  isNext={nextSequence === sequence}
                  validationStatus={
                    props.acceptedBarcodes[sequence]?.barcodeStatus
                  }
                />
              </Fragment>
            ))}
          </BarCodeGrid>

          <SpotText level="paragraph" bold>
            {t("instrumentScreens.proCyteDx.qualityControl.addQcLot.levelOne")}
          </SpotText>

          <BarCodeGrid>
            {[1, 2, 3].map((sequence) => (
              <Fragment key={sequence}>
                <BarcodeLabel
                  displayNumber={SEQUENCE_TO_DISPLAY_NUMBER_MAPPING[sequence]}
                  isNext={nextSequence === sequence}
                  validationStatus={
                    props.acceptedBarcodes[sequence]?.barcodeStatus
                  }
                />
                <BarcodeStatus
                  sequence={sequence}
                  isNext={nextSequence === sequence}
                  validationStatus={
                    props.acceptedBarcodes[sequence]?.barcodeStatus
                  }
                />
              </Fragment>
            ))}
          </BarCodeGrid>
        </SummaryBox>

        <Section>
          <div>
            <MaskedInput
              type="search"
              data-testid={TestId.BarcodeInput}
              value={props.currentBarcodeEntry}
              onAccept={props.onBarcodeEntered}
              mask={CommonMasks.DIGITS}
              maxLength={QC_BARCODE_LENGTH}
              inputRef={inputRef}
              onBlur={() => inputRef.current?.focus()}
            />
            <ValidationErrorContainer
              isVisible={props.isError}
              data-testid={TestId.ErrorText}
            >
              <ValidationError>
                {t("instrumentScreens.proCyteDx.qualityControl.addQcLot.error")}
              </ValidationError>
            </ValidationErrorContainer>
          </div>
          <ViewpointKeyboard alwaysVisible keyboardType="numpad" />
        </Section>
      </EntrySection>
    </LotEntryRoot>
  );
}

const BarcodeLabelContainer = styled.div<{ validated: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;

  ${(p) =>
    !p.validated
      ? `
    .icon {
      visibility: hidden;
    }
  `
      : ""}
`;

interface BarcodeLabelProps {
  displayNumber: number; // Not the same as the sequence we get from the barcode
  isNext: boolean;
  validationStatus?: BarcodeStatusEnum;
}

function BarcodeLabel(props: BarcodeLabelProps) {
  const { t } = useTranslation();
  const { theme } = useContext(ViewpointThemeContext);
  return (
    <BarcodeLabelContainer validated={props.validationStatus != null}>
      <SpotIcon
        name={
          props.validationStatus === BarcodeStatusEnum.ACCEPTED
            ? "checkmark"
            : "cancel"
        }
        size={15}
        color={
          props.validationStatus === BarcodeStatusEnum.ACCEPTED
            ? theme.colors?.feedback?.success
            : theme.colors?.feedback?.error
        }
      />
      <SpotText level="paragraph" bold={props.isNext}>
        {t(
          "instrumentScreens.proCyteDx.qualityControl.addQcLot.barCodePlaceholder",
          { number: props.displayNumber }
        )}
      </SpotText>
    </BarcodeLabelContainer>
  );
}

const BarcodeStatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

interface BarcodeStatusProps {
  sequence: number;
  isNext: boolean;
  validationStatus?: BarcodeStatusEnum;
}

function BarcodeStatus(props: BarcodeStatusProps) {
  const { t } = useTranslation();
  return (
    <BarcodeStatusContainer data-testid={TestId.BarcodeStatus(props.sequence)}>
      {props.validationStatus === BarcodeStatusEnum.ACCEPTED && (
        <SpotText level="secondary">
          {t(
            "instrumentScreens.proCyteDx.qualityControl.addQcLot.barcodeAccepted"
          )}
        </SpotText>
      )}

      {props.isNext && (
        <SpotText level="paragraph" bold>
          {t(
            "instrumentScreens.proCyteDx.qualityControl.addQcLot.enterBarcode"
          )}
        </SpotText>
      )}
    </BarcodeStatusContainer>
  );
}
