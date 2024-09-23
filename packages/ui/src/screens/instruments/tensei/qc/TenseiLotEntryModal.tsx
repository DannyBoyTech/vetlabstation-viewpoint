import {
  TenseiQcBarcodeResponseDto,
  TenseiQcBarcodeSaveRequestDto,
  TenseiQcBarcodeValidateRequestDto,
  CurrentBarcodeStatusEnum,
  InstrumentStatusDto,
} from "@viewpoint/api";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { Trans, useTranslation } from "react-i18next";
import { SpotText, useToast } from "@viewpoint/spot-react";
import { useCallback, useEffect, useState } from "react";
import {
  QC_BARCODE_LENGTH,
  useSaveTenseiQcBarcodesMutation,
  useValidateTenseiQcBarcodesMutation,
} from "../../../../api/TenseiApi";
import { CancelConfirmationModal } from "../../../../components/confirm-modal/CancelConfirmationModal";
import { TenseiQcLotEntryContent } from "./TenseiQcLotEntryContent";
import { useInstrumentNameForId } from "../../../../utils/hooks/hooks";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../../../utils/toast/toast-defaults";

export interface TenseiLotEntryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  instrumentStatus: InstrumentStatusDto;
}

export const TestId = {
  ExpiredLotConfirmModal: "tensei-qc-lot-expired-confirm-modal",
};

export type AcceptedBarcodes = { [key: number]: TenseiQcBarcodeResponseDto };

export function TenseiLotEntryModal(props: TenseiLotEntryModalProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [lastRequestedInput, setLastRequestedInput] = useState("");
  const [acceptedBarcodes, setAcceptedBarcodes] = useState<AcceptedBarcodes>(
    {}
  );
  const [acknowledgedExpiredBarcodes, setAcknowledgedExpiredBarcodes] =
    useState<Record<string, boolean>>({});
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { t } = useTranslation();
  const { addToast } = useToast();

  const [saveBarcodes] = useSaveTenseiQcBarcodesMutation();

  const [validateBarcode, validateBarcodeStatus] =
    useValidateTenseiQcBarcodesMutation();

  const getInstrumentName = useInstrumentNameForId();

  useEffect(() => {
    if (
      validateBarcodeStatus.data?.currentBarcodeStatus ===
      CurrentBarcodeStatusEnum.BARCODEACCEPTED
    ) {
      // If we haven't already asked the user about this expired barcode, present the confirm modal
      if (
        validateBarcodeStatus.data.barcodes.some(
          (barcodeStatus: TenseiQcBarcodeResponseDto) =>
            barcodeStatus.expired &&
            acknowledgedExpiredBarcodes[barcodeStatus.barcode] == null
        )
      ) {
        setShowExpiredWarning(true);
      }
      setAcceptedBarcodes(
        validateBarcodeStatus.data.barcodes
          // Only allow expired barcodes if they've been explicitly acknowledged by the user
          .filter(
            (barcodeStatus: TenseiQcBarcodeResponseDto) =>
              !barcodeStatus.expired ||
              acknowledgedExpiredBarcodes[barcodeStatus.barcode]
          )
          .reduce(
            (prev: {}, curr: TenseiQcBarcodeResponseDto) => ({
              ...prev,
              [curr.sequenceNumber]: curr,
            }),
            {}
          )
      );
    }
  }, [validateBarcodeStatus.data, acknowledgedExpiredBarcodes]);

  const onBarcodeEntered = useCallback(
    (currentBarcode: string) => {
      setCurrentInput(currentBarcode);
      if (currentBarcode.length === QC_BARCODE_LENGTH) {
        const request: TenseiQcBarcodeValidateRequestDto = {
          currentBarcode: {
            barcode: currentBarcode,
          },
          approvedBarcodes: Object.values(acceptedBarcodes ?? {}).map(
            ({ barcode }) => ({ barcode })
          ),
        };
        validateBarcode(request);
        setLastRequestedInput(currentBarcode);
      }
    },
    [validateBarcode, acceptedBarcodes, setCurrentInput]
  );

  // Must either have exactly 3 barcodes and one level complete, or 6 barcodes and both levels complete
  // otherwise there is an incomplete level
  const confirmable =
    (validateBarcodeStatus.data?.barcodes?.length === 3 &&
      (validateBarcodeStatus.data?.levelOneComplete ||
        validateBarcodeStatus.data?.levelTwoComplete)) ||
    (validateBarcodeStatus.data?.barcodes?.length === 6 &&
      validateBarcodeStatus.data?.levelOneComplete &&
      validateBarcodeStatus.data?.levelTwoComplete);

  // Only indicate the barcode is invalid if:
  // 1. The current input is the same as what was most recently validated by IVLS (avoid error display while validation response is stale)
  // 2. Validation request is not loading
  // 3. Validation request has failed
  //    IVLS has 3 patterns for indicating an invalid barcode:
  //      1. Return a 200 with a currentBarcodeStatus indicating it is invalid
  //      2. Return a 200 with a different response body that just includes a list of error messages (JAX-RS generated response based on validation fields on the request body class)
  //      3. Return a 500 (possibly an IVLS bug - looks like it's due to an NPE that happens during validation)
  const isError =
    lastRequestedInput === currentInput &&
    !validateBarcodeStatus.isLoading &&
    (validateBarcodeStatus.isError ||
      (validateBarcodeStatus.data != null &&
        validateBarcodeStatus.data.currentBarcodeStatus !==
          CurrentBarcodeStatusEnum.BARCODEACCEPTED));

  return (
    <>
      <ConfirmModal
        data-testid="tensei-lot-entry-modal"
        responsive
        dismissable={false}
        confirmable={confirmable}
        open={props.open}
        onClose={() => setCancelling(true)}
        onConfirm={() => {
          const request: TenseiQcBarcodeSaveRequestDto = {
            barcodes:
              validateBarcodeStatus.data?.barcodes.map(({ barcode }) => ({
                barcode,
              })) ?? [],
          };
          saveBarcodes(request)
            .unwrap()
            .then(() => {
              addToast({
                ...DefaultSuccessToastOptions,
                content: (
                  <ToastContentRoot>
                    <ToastTextContentRoot>
                      <ToastText level="paragraph" bold $maxLines={1}>
                        {getInstrumentName(
                          props.instrumentStatus.instrument.id
                        )}
                      </ToastText>
                      <ToastText level="paragraph" $maxLines={2}>
                        {t(
                          "instrumentScreens.tensei.qualityControl.addQcLot.barcodesSaved"
                        )}
                      </ToastText>
                    </ToastTextContentRoot>
                  </ToastContentRoot>
                ),
              });
              props.onConfirm();
            });
        }}
        bodyContent={
          <TenseiQcLotEntryContent
            currentBarcodeEntry={currentInput}
            onBarcodeEntered={onBarcodeEntered}
            isError={isError}
            acceptedBarcodes={acceptedBarcodes}
          />
        }
        cancelButtonContent={t("general.buttons.cancel")}
        confirmButtonContent={t("general.buttons.next")}
        headerContent={t(
          "instrumentScreens.tensei.qualityControl.addQcLot.header"
        )}
      />

      {showExpiredWarning && (
        <ExpiredLotModal
          open={showExpiredWarning}
          onClose={() => {
            setCurrentInput("");
            setShowExpiredWarning(false);
          }}
          onConfirm={() => {
            setAcknowledgedExpiredBarcodes(
              validateBarcodeStatus.data?.barcodes?.reduce(
                (prev: {}, curr: TenseiQcBarcodeResponseDto) => ({
                  ...prev,
                  [curr.barcode]: true,
                }),
                {}
              ) ?? {}
            );
            setShowExpiredWarning(false);
          }}
        />
      )}

      {cancelling && (
        <CancelConfirmationModal
          open={cancelling}
          onClose={() => setCancelling(false)}
          onConfirm={props.onClose}
        />
      )}
    </>
  );
}

interface ExpiredLotModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ExpiredLotModal(props: ExpiredLotModalProps) {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      data-testid={TestId.ExpiredLotConfirmModal}
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      bodyContent={
        <div>
          <SpotText level="paragraph">
            <Trans
              data-testid="tensei-expired-lot-alert"
              i18nKey={
                "instrumentScreens.tensei.qualityControl.addQcLot.expiredWarning"
              }
            />
          </SpotText>

          <SpotText level="paragraph">
            <Trans
              i18nKey={
                "instrumentScreens.tensei.qualityControl.addQcLot.expiredResults"
              }
            />
          </SpotText>
        </div>
      }
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.continue")}
      headerContent={t(
        "instrumentScreens.tensei.qualityControl.addQcLot.expiredHeader"
      )}
    />
  );
}
