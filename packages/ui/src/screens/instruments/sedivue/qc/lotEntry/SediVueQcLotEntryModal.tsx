import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../../components/confirm-modal/ConfirmModal";
import { QcLotEntryContent } from "../../../common/qc/lotEntry/QcLotEntryContent";
import { SediVueDxQcBarcodeSummary } from "./SediVueDxQcBarcodeSummary";
import {
  CommonMasks,
  MaskedInput,
} from "../../../../../components/input/MaskedInput";
import { QcLotEntryValidation } from "../../../common/qc/lotEntry/QcLotEntryValidation";
import { useEffect, useRef, useState } from "react";
import {
  InstrumentType,
  QualityControlBarcodeDto,
  QualityControlBarcodeSetStatus,
  QualityControlBarcodeStatus,
} from "@viewpoint/api";
import { ExpiredQcLotModal } from "../../../common/qc/lotEntry/ExpiredQcLotModal";
import { SpotText } from "@viewpoint/spot-react";
import { CancelConfirmationModal } from "../../../../../components/confirm-modal/CancelConfirmationModal";
import styled from "styled-components";
import { CommonTransComponents } from "../../../../../utils/i18n-utils";
import classNames from "classnames";
import {
  useSaveSediVueQcLotMutation,
  useValidateSediVueQcLotMutation,
} from "../../../../../api/SediVueApi";

const TestId = {
  BarcodeSummary: "barcode-summary",
  BarcodeInput: "barcode-input",
  ExpiredConfirmation: "expired-confirmation",
  CancelConfirmation: "cancel-confirmation",
} as const;

const BARCODE_LENGTH = 23;

const StyledQcLotEntryValidation = styled(QcLotEntryValidation)`
  min-height: 80px;
`;

function nextEnteredBarcodes(validatedBarcodes: QualityControlBarcodeDto[]) {
  return validatedBarcodes
    .filter(
      (it) =>
        it.barcodeStatus === QualityControlBarcodeStatus.ACCEPTED &&
        (it.sequenceNumber === 1 || it.sequenceNumber === 2)
    )
    .reduce((acc, it) => {
      acc.set(it.sequenceNumber, it);
      return acc;
    }, new Map());
}

function nextOkExpiredBarcodes(
  okBarcodes: QualityControlBarcodeDto[],
  prevOkBarcodes: Set<string>
) {
  return okBarcodes.reduce((acc, it) => {
    acc.add(it.barcode);
    return acc;
  }, new Set(prevOkBarcodes));
}

function requiresUserAckOfExpired(
  validatedBarcodes: QualityControlBarcodeDto[],
  okExpiredBarcodes: Set<string>
) {
  return validatedBarcodes.some(
    (it) =>
      it.barcodeStatus === QualityControlBarcodeStatus.ACCEPTED &&
      it.expired &&
      !okExpiredBarcodes.has(it.barcode)
  );
}

function i18nErrorKey(setStatus?: QualityControlBarcodeSetStatus) {
  let suffix: string | undefined;

  switch (setStatus) {
    case QualityControlBarcodeSetStatus.BARCODE_ERROR:
    case QualityControlBarcodeSetStatus.CROSS_CHECKSUM_ERROR:
      suffix = "barcodeInvalid";
      break;
    case QualityControlBarcodeSetStatus.LOT_EXPIRED:
      suffix = "lotExpired";
      break;
    default:
      suffix = undefined;
      break;
  }
  return suffix
    ? `instrumentScreens.sediVueDx.qc.lotEntry.${suffix}`
    : undefined;
}

function barcodeStrings(
  enteredBarcodes: Map<number, QualityControlBarcodeDto>
) {
  return Array.from(enteredBarcodes.values()).map((it) => it.barcode);
}

interface SediVueDxQcLotEntryModalProps {
  className?: string;
  "data-testid"?: string;

  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A SediVue Dx instrument-specfic React modal used for entering quality control lots
 * by barcode.
 *
 * @param props
 */
function SediVueDxQcLotEntryModal(props: SediVueDxQcLotEntryModalProps) {
  const { t } = useTranslation();

  const classes = classNames(props.className, "svdx-qc-lot-entry-modal");

  const inputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState<string>();
  const [enteredBarcodes, setEnteredBarcodes] = useState<
    Map<number, QualityControlBarcodeDto>
  >(new Map());
  const [ackedExpiredBarcodes, setAckedExpiredBarcodes] = useState<Set<string>>(
    new Set()
  );
  const [unAckedExpiredBarcodes, setUnackedExpiredBarcodes] =
    useState<QualityControlBarcodeDto[]>();
  const [errorStatus, setErrorStatus] =
    useState<QualityControlBarcodeSetStatus>();
  const [showDataLossPrompt, setShowDataLossPrompt] = useState(false);
  const [validateQcLot] = useValidateSediVueQcLotMutation();
  const [saveQcLot] = useSaveSediVueQcLotMutation();

  const confirmable = barcodeStrings(enteredBarcodes).length === 2;
  const errorKey = i18nErrorKey(errorStatus);

  function clearBarcodeInput() {
    setBarcodeInput(undefined);
  }

  function clearError() {
    setErrorStatus(undefined);
  }

  function clearUnackedBarcodes() {
    setUnackedExpiredBarcodes(undefined);
  }

  function clearDataLossPrompt() {
    setShowDataLossPrompt(false);
  }

  function focusBarcodeInput() {
    inputRef.current?.focus();
  }

  function closeLotEntryModal() {
    props.onClose();
  }

  function acceptBarcodes(barcodes: QualityControlBarcodeDto[]) {
    setEnteredBarcodes(nextEnteredBarcodes(barcodes));
    clearBarcodeInput();
  }

  async function handleInputChange(input: string) {
    setBarcodeInput(input);
    clearError();

    if (input.length === BARCODE_LENGTH) {
      const res = await validateQcLot({
        instrumentType: InstrumentType.SediVueDx,
        currentBarcode: input,
        preapprovedBarcodes: barcodeStrings(enteredBarcodes),
      }).unwrap();

      if (
        res.barcodeSetStatus === QualityControlBarcodeSetStatus.BARCODE_ACCEPTED
      ) {
        if (requiresUserAckOfExpired(res.barcodes, ackedExpiredBarcodes)) {
          setUnackedExpiredBarcodes(res.barcodes);
        } else {
          acceptBarcodes(res.barcodes);
        }
      } else {
        setErrorStatus(res.barcodeSetStatus);
      }
    }
  }

  async function saveEnteredLots() {
    try {
      await saveQcLot({
        instrumentType: InstrumentType.SediVueDx,
        currentBarcode: "",
        preapprovedBarcodes: barcodeStrings(enteredBarcodes),
      }).unwrap();
      closeLotEntryModal();
    } catch (e) {
      console.error(`unable to save qc lot: ${e}`);
    }
  }

  function dataWillBeLost() {
    return (
      (barcodeInput != null && barcodeInput.length > 0) ||
      (enteredBarcodes != null &&
        Array.from(enteredBarcodes.values()).length > 0)
    );
  }

  function maybeCancelLotEntry() {
    if (dataWillBeLost()) {
      setShowDataLossPrompt(true);
    } else {
      closeLotEntryModal();
    }
  }

  useEffect(() => {
    focusBarcodeInput();
  }, []);

  return (
    <>
      <ConfirmModal
        className={classes}
        data-testid={props["data-testid"]}
        responsive={true}
        dismissable={false}
        confirmable={confirmable}
        open={true}
        onClose={maybeCancelLotEntry}
        onConfirm={saveEnteredLots}
        headerContent={t("instrumentScreens.sediVueDx.qc.lotEntry.title")}
        bodyContent={
          <QcLotEntryContent
            promptContent={
              <SpotText level="paragraph">
                <Trans
                  i18nKey="instrumentScreens.sediVueDx.qc.lotEntry.prompt"
                  components={CommonTransComponents}
                />
              </SpotText>
            }
            inputContent={
              <StyledQcLotEntryValidation
                errorVisible={errorKey != null}
                errorKey={errorKey}
              >
                <MaskedInput
                  data-testid={TestId.BarcodeInput}
                  type="search"
                  value={barcodeInput}
                  onAccept={handleInputChange}
                  mask={CommonMasks.DIGITS}
                  maxLength={BARCODE_LENGTH}
                  inputRef={inputRef}
                  onBlur={() => focusBarcodeInput()}
                />
              </StyledQcLotEntryValidation>
            }
            summaryContent={
              <SediVueDxQcBarcodeSummary
                data-testid={TestId.BarcodeSummary}
                level1Barcode={enteredBarcodes.get(1)}
                level2Barcode={enteredBarcodes.get(2)}
              />
            }
          />
        }
        cancelButtonContent={t("general.buttons.cancel")}
        confirmButtonContent={t("general.buttons.next")}
      />

      {unAckedExpiredBarcodes != null && unAckedExpiredBarcodes.length > 0 ? (
        <ExpiredQcLotModal
          data-testid={TestId.ExpiredConfirmation}
          open={true}
          instrumentType={InstrumentType.SediVueDx}
          onClose={() => {
            clearBarcodeInput();
            clearUnackedBarcodes();
          }}
          onConfirm={() => {
            setAckedExpiredBarcodes(
              nextOkExpiredBarcodes(
                unAckedExpiredBarcodes,
                ackedExpiredBarcodes
              )
            );
            acceptBarcodes(unAckedExpiredBarcodes);
            clearUnackedBarcodes();
          }}
        />
      ) : null}

      {showDataLossPrompt ? (
        <CancelConfirmationModal
          data-testid={TestId.CancelConfirmation}
          open={true}
          onClose={clearDataLossPrompt}
          onConfirm={closeLotEntryModal}
        />
      ) : null}
    </>
  );
}

export type { SediVueDxQcLotEntryModalProps };
export { SediVueDxQcLotEntryModal };

//exported for testing
export { TestId };
