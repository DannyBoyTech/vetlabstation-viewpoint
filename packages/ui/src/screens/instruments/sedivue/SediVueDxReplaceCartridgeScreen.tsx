import { Trans, useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../utils/hooks/hooks";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { Button, SpotText } from "@viewpoint/spot-react";
import { InputAware } from "../../../components/InputAware";
import styled from "styled-components";
import SediVueBarcodeScanImg from "../../../assets/instruments/maintenance/sediVueDx/sedivue_barcode_scan.png";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import {
  CommonMasks,
  MaskedInput,
} from "../../../components/input/MaskedInput";
import { useNavigate, useParams } from "react-router-dom";
import { BarcodeType, BarcodeValidationReason } from "@viewpoint/api";
import { InlineText } from "../../../components/typography/InlineText";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { SpotIcon } from "@viewpoint/spot-icons";
import { useValidateBarcodeMutation } from "../../../api/InstrumentApi";
import ReplaceCartridgeVideo from "../../../assets/instruments/maintenance/sediVueDx/sedivue_replace_cartridge.webm";
import { LimitedLoopedVideo } from "../../../components/video/LimitedLoopedVideo";

export const TestId = {
  cartReplaceModal: "SVDx-cart-install-modal",
} as const;

const Root = styled(InstrumentPageRoot)<{ clearButtonSvg: string }>`
  .section {
    display: inline-flex;
    flex-direction: column;
    gap: 20px;
  }
`;

function continueDisabled(barcode?: string) {
  return !(barcode?.length === 20 || barcode?.length === 24);
}

const VALID_BARCODE_RE = /^[a-zA-Z0-9]*$/;

function modalContentKey(reason?: BarcodeValidationReason) {
  let suffix: string;

  switch (reason) {
    case BarcodeValidationReason.VALID:
    case BarcodeValidationReason.LOT_CONSUMED:
    case BarcodeValidationReason.LOT_EXPIRED:
      suffix = reason;
      break;
    case BarcodeValidationReason.CHECKSUM_FAILURE:
    case BarcodeValidationReason.INVALID_LENGTH:
      suffix = "invalidBarcode"; // report same error for both types of barcode error, deviation from on-market behavior
      break;
    default:
      suffix = "unknownError";
  }

  return `instrumentScreens.sediVueDx.replaceCartridges.modal.content.${suffix}`;
}

const transComponents = {
  linebreak: (
    <>
      <br />
      <br />
    </>
  ),
  b: <InlineText level="paragraph" bold />,
  ol: <ol />,
  li: <li />,
} as const;

const ModalContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

function ModalContentText({ reason }: { reason?: BarcodeValidationReason }) {
  return (
    <Trans
      i18nKey={modalContentKey(reason) as any}
      components={transComponents}
    />
  );
}

function SediVueDxReplaceCartridgeScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const { instrumentId: idParam } = useParams();
  const instrumentId = Number(idParam);

  const [barcode, setBarcode] = useState<string>();
  const [validateBarcode] = useValidateBarcodeMutation();
  const { addConfirmModal } = useConfirmModal();

  const handleContinue = () => {
    if (barcode) {
      (async () => {
        const res = await validateBarcode({
          instrumentId,
          barcodeType: BarcodeType.CUVETTES,
          barcode,
        }).unwrap();

        if (res.isValid) {
          addConfirmModal({
            headerContent: t(
              "instrumentScreens.sediVueDx.replaceCartridges.modal.title"
            ),
            bodyContent: (
              <ModalContentContainer>
                <div>
                  <ModalContentText reason={BarcodeValidationReason.VALID} />
                </div>
                <LimitedLoopedVideo
                  src={ReplaceCartridgeVideo}
                  loopTimes={3}
                  autoPlay
                />
              </ModalContentContainer>
            ),
            "data-testid": TestId.cartReplaceModal,
            confirmButtonContent: t("general.buttons.ok"),
            onClose: () => {},
            onConfirm: () => {
              nav("../");
            },
          });
        } else {
          addConfirmModal({
            headerContent: t(
              "instrumentScreens.sediVueDx.replaceCartridges.modal.title"
            ),
            bodyContent: (
              <ModalContentText
                reason={res.comment != null ? res.comment : undefined}
              />
            ),
            confirmButtonContent: t("general.buttons.close"),
            onClose: () => {},
            onConfirm: () => {},
          });
        }
      })();
    }
  };

  const handleCancel = () => {
    nav("../");
  };

  useHeaderTitle({
    label: t("instrumentScreens.sediVueDx.replaceCartridges.header"),
  });

  return (
    <Root
      clearButtonSvg={renderToString(<SpotIcon name="close" size="24px" />)}
    >
      <InstrumentPageContent data-testid="svdx-replace-cartridge-screen-main">
        <div className="section">
          <SpotText level="paragraph" bold className="prompt">
            {t("instrumentScreens.sediVueDx.replaceCartridges.prompt")}
          </SpotText>
          <InputAware>
            <div className="input-container">
              <MaskedInput
                data-testid="svdx-barcode-input-field"
                type="search"
                autoFocus={true}
                maxLength={24}
                mask={CommonMasks.DIGITS_ALPHA_ANYCASE}
                value={barcode}
                onAccept={(val) => setBarcode(val)}
              />
            </div>
          </InputAware>
          <img width="684" src={SediVueBarcodeScanImg} />
        </div>
      </InstrumentPageContent>
      <InstrumentPageRightPanel data-testid="svdx-replace-cartridge-screen-right">
        <InstrumentPageRightPanelButtonContainer>
          <Button disabled={continueDisabled(barcode)} onClick={handleContinue}>
            {t("general.buttons.continue")}
          </Button>
          <Button buttonType="secondary" onClick={handleCancel}>
            {t("general.buttons.cancel")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </Root>
  );
}

export { SediVueDxReplaceCartridgeScreen };
