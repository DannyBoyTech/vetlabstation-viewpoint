import {
  BarcodeValidationResult,
  InstrumentStatusDto,
  ProCyteDxFluidType,
} from "@viewpoint/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input, SpotText } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { InputAware } from "../../../components/InputAware";
import { useEffect, useRef, useState } from "react";
import { useHeaderTitle } from "../../../utils/hooks/hooks";
import {
  useReplaceReagentMutation,
  useValidateReagentBarcodeMutation,
} from "../../../api/ProCyteDxApi";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import { InlineText } from "../../../components/typography/InlineText";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import { unstable_useBlocker as useBlocker } from "react-router";
import { CancelConfirmationModal } from "../../../components/confirm-modal/CancelConfirmationModal";
import { ProCyteDxChangeReagentKitWizard } from "./reagent/kit/ProCyteDxChangeReagentKitWizard";

export const TestId = {
  ContinueButton: "pdx-lot-entry-continue-button",
  CancelButton: "pdx-lot-entry-cancel-button",
  LotInput: "pdx-lot-entry-input",
  ResultModal: (result: BarcodeValidationResult) =>
    `pdx-lot-entry-result-modal-${result}`,
  CancelConfirmModal: "pdx-lot-entry-cancel-confirm-modal",
} as const;

const BARCODE_LENGTH = 22;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
`;

interface ProCyteDxLotEntryScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

const TransComponents = {
  strong: <InlineText level="paragraph" bold />,
  linebreak: <br />,
  ul: <ul />,
  li: <li />,
} as const;

export function ProCyteDxLotEntryScreen(props: ProCyteDxLotEntryScreenProps) {
  const { t } = useTranslation();
  const [inputContent, setInputContent] = useState("");
  const [currentValidationResult, setCurrentValidationResult] =
    useState<BarcodeValidationResult>();

  const [searchParams] = useSearchParams();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const fluidType: ProCyteDxFluidType | null = searchParams.get(
    "fluidType"
  ) as ProCyteDxFluidType | null;
  const skipSufficientVolumeConfirmation: boolean =
    searchParams.get("skipSufficientVolumeConfirmation") === "true";

  useHeaderTitle({
    label:
      fluidType == null
        ? ""
        : t(`instrumentScreens.proCyteDx.fluid.entry.title.${fluidType}`),
  });

  const nav = useNavigate();

  const [validateBarcode, validateBarcodeStatus] =
    useValidateReagentBarcodeMutation();
  const [replaceReagent, replaceReagentStatus] = useReplaceReagentMutation();

  const blocker = useBlocker(
    inputContent.length > 0 && replaceReagentStatus.isUninitialized
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContinue = () => {
    if (fluidType != null) {
      validateBarcode({
        fluidType,
        instrumentId: props.instrumentStatus.instrument.id,
        barcode: inputContent,
      })
        .unwrap()
        .then((result) => {
          /*conditionally skip sufficient volume confirmation by reassigning the validation result, see setters of the
           * query param for detail.*/
          const skip =
            result === BarcodeValidationResult.SUFFICIENT_VOLUME &&
            skipSufficientVolumeConfirmation;
          if (skip) {
            result = BarcodeValidationResult.VALID;
          }
          setCurrentValidationResult(result);
        })
        .catch((err) => {
          console.error(err);
          setCurrentValidationResult(BarcodeValidationResult.UNKNOWN_ERROR);
        });
    }
  };

  const handleReplace = () => {
    setCurrentValidationResult(undefined);
    if (fluidType != null) {
      replaceReagent({
        fluidType,
        instrumentId: props.instrumentStatus.instrument.id,
        replaceReagentDto: {
          encryptedReagentBarcode: inputContent,
        },
      })
        .unwrap()
        .then(() => {
          nav(-1);
        });
    }
  };

  const handleCloseModal = () => setCurrentValidationResult(undefined);

  return (
    <InstrumentPageRoot data-testid="pdx-kit-stain-lot-entry">
      <InstrumentPageContent>
        <Content>
          {fluidType == null ? (
            <SpotText level="paragraph">
              {t("general.messages.somethingWentWrong")}
            </SpotText>
          ) : (
            <>
              <SpotText level="paragraph" bold>
                {t(
                  `instrumentScreens.proCyteDx.fluid.entry.inputLabel.${fluidType}`
                )}
              </SpotText>

              <InputAware>
                <Input
                  type="search"
                  data-testid={TestId.LotInput}
                  maxLength={BARCODE_LENGTH}
                  innerRef={inputRef}
                  value={inputContent}
                  onChange={(ev) => setInputContent(ev.target.value)}
                />
              </InputAware>
            </>
          )}
        </Content>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.ContinueButton}
            onClick={handleContinue}
            disabled={
              inputContent.length !== BARCODE_LENGTH ||
              validateBarcodeStatus.isLoading
            }
            buttonType="primary"
          >
            {t("general.buttons.continue")}
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

      {fluidType != null && currentValidationResult != null && (
        <ResultModals
          currentValidationResult={currentValidationResult}
          fluidType={fluidType}
          onClose={handleCloseModal}
          onSufficientVolumeConfirm={() =>
            setCurrentValidationResult(BarcodeValidationResult.VALID)
          }
          onReplaceConfirm={handleReplace}
        />
      )}

      {replaceReagentStatus.isLoading && <SpinnerOverlay />}

      {blocker.state === "blocked" && (
        <CancelConfirmationModal
          open
          data-testid={TestId.CancelConfirmModal}
          onConfirm={() => blocker.proceed()}
          onClose={() => blocker.reset()}
        />
      )}
    </InstrumentPageRoot>
  );
}

interface ResultModalsProps {
  currentValidationResult: BarcodeValidationResult;
  fluidType: ProCyteDxFluidType;
  onClose: () => void;
  onSufficientVolumeConfirm: () => void;
  onReplaceConfirm: () => void;
}

function ResultModals(props: ResultModalsProps) {
  const { t } = useTranslation();
  return (
    <>
      {props.currentValidationResult ===
        BarcodeValidationResult.SUFFICIENT_VOLUME && (
        <ConfirmModal
          open
          data-testid={TestId.ResultModal(
            BarcodeValidationResult.SUFFICIENT_VOLUME
          )}
          dismissable={false}
          onClose={props.onClose}
          //Move to next modal to confirm the replacement if the user OK's it
          onConfirm={props.onSufficientVolumeConfirm}
          bodyContent={
            <Trans
              i18nKey={`instrumentScreens.proCyteDx.fluid.entry.results.REAGENT.sufficientVolume`}
              components={TransComponents}
            />
          }
          headerContent={t(
            `instrumentScreens.proCyteDx.fluid.entry.title.${props.fluidType}`
          )}
          confirmButtonContent={t("general.buttons.continue")}
          cancelButtonContent={t("general.buttons.cancel")}
        />
      )}
      {props.currentValidationResult === BarcodeValidationResult.VALID &&
        props.fluidType === ProCyteDxFluidType.REAGENT && (
          <ProCyteDxChangeReagentKitWizard
            onCancel={props.onClose}
            onDone={props.onReplaceConfirm}
          />
        )}
      {props.currentValidationResult === BarcodeValidationResult.VALID &&
        props.fluidType === ProCyteDxFluidType.STAIN && (
          <ConfirmModal
            open
            data-testid={TestId.ResultModal(BarcodeValidationResult.VALID)}
            dismissable={false}
            onClose={props.onClose}
            onConfirm={props.onReplaceConfirm}
            bodyContent={
              <Trans
                i18nKey={`instrumentScreens.proCyteDx.fluid.entry.results.${props.fluidType}.valid`}
                components={TransComponents}
              />
            }
            headerContent={t(
              `instrumentScreens.proCyteDx.fluid.entry.title.${props.fluidType}`
            )}
            confirmButtonContent={t("general.buttons.ok")}
            cancelButtonContent={t("general.buttons.cancel")}
          />
        )}
      {props.currentValidationResult ===
        BarcodeValidationResult.REAGENT_EXPIRED && (
        <ConfirmModal
          open
          data-testid={TestId.ResultModal(
            BarcodeValidationResult.REAGENT_EXPIRED
          )}
          dismissable
          onClose={props.onClose}
          onConfirm={props.onClose}
          bodyContent={
            <Trans
              i18nKey={`instrumentScreens.proCyteDx.fluid.entry.results.${props.fluidType}.expired`}
              components={TransComponents}
            />
          }
          headerContent={t(
            `instrumentScreens.proCyteDx.fluid.entry.title.${props.fluidType}`
          )}
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
      {props.currentValidationResult ===
        BarcodeValidationResult.MAX_REPLACEMENT_REACHED && (
        <ConfirmModal
          open
          dismissable
          data-testid={TestId.ResultModal(
            BarcodeValidationResult.MAX_REPLACEMENT_REACHED
          )}
          onClose={props.onClose}
          onConfirm={props.onClose}
          bodyContent={
            <Trans
              i18nKey={`instrumentScreens.proCyteDx.fluid.entry.results.${props.fluidType}.maxReplacement`}
              components={TransComponents}
            />
          }
          headerContent={t(
            `instrumentScreens.proCyteDx.fluid.entry.title.${props.fluidType}`
          )}
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
      {props.currentValidationResult ===
        BarcodeValidationResult.BARCODE_ERROR && (
        <ConfirmModal
          open
          data-testid={TestId.ResultModal(
            BarcodeValidationResult.BARCODE_ERROR
          )}
          onClose={props.onClose}
          onConfirm={props.onClose}
          bodyContent={
            <Trans
              i18nKey={`instrumentScreens.proCyteDx.fluid.entry.results.${props.fluidType}.barcodeError`}
              components={TransComponents}
            />
          }
          headerContent={t(
            `instrumentScreens.proCyteDx.fluid.entry.title.${props.fluidType}`
          )}
          confirmButtonContent={t("general.buttons.close")}
        />
      )}
      {props.currentValidationResult ===
        BarcodeValidationResult.UNKNOWN_ERROR && (
        <ConfirmModal
          open
          data-testid={TestId.ResultModal(
            BarcodeValidationResult.UNKNOWN_ERROR
          )}
          onClose={props.onClose}
          onConfirm={props.onClose}
          bodyContent={
            <Trans
              i18nKey={"general.messages.somethingWentWrong"}
              components={TransComponents}
            />
          }
          headerContent={t(
            `instrumentScreens.proCyteDx.fluid.entry.title.${props.fluidType}`
          )}
          confirmButtonContent={t("general.buttons.ok")}
        />
      )}
    </>
  );
}
