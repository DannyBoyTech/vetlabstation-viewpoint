import { SpotText } from "@viewpoint/spot-react/src";
import { Trans, useTranslation } from "react-i18next";
import { CommonTransComponents } from "../../../../utils/i18n-utils";
import {
  EventIds,
  HealthCode,
  InstrumentRunProgressDto,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import SampleQcDrawerImage from "../../../../assets/catone/smart-qc/SmartQCDrawer.png";
import { useGlobalModals } from "../../../../components/global-modals/GlobalModals";
import { useEventListener } from "../../../../context/EventSourceContext";
import styled from "styled-components";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { WizardFooter } from "../../../../components/wizard/wizard-components";
import { useMemo, useState } from "react";
import { getInstrumentDisplayImage } from "../../../../utils/instrument-utils";
import { CatOneCleaningButton } from "../cleaning/CatOneCleaningButton";
import {
  useGetDetailedInstrumentStatusQuery,
  useGetInstrumentStatusesQuery,
} from "../../../../api/InstrumentApi";
import SpinnerOverlay from "../../../../components/overlay/SpinnerOverlay";

const TestId = {
  CleaningModal: "catone-smartqc-cleaning-modal",
};

const InstructionsRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DrawerImage = styled.img`
  object-fit: contain;
  width: 400px;
  height: 272px;
`;

export interface CatOneSmartQcInstructionsProps {
  instrumentId: number;
  onProgress: () => void;
}

export function CatOneSmartQcInstructions(
  props: CatOneSmartQcInstructionsProps
) {
  useEventListener(EventIds.InstrumentRunProgress, (msg) => {
    const data: InstrumentRunProgressDto = JSON.parse(msg.data);

    if (data.instrumentId === props.instrumentId) {
      props.onProgress();
    }
  });
  return (
    <InstructionsRoot>
      <SpotText level="paragraph">
        <Trans
          i18nKey={"instrumentScreens.catOne.smartQcModal.body"}
          components={CommonTransComponents}
        />
      </SpotText>
      <DrawerImage src={SampleQcDrawerImage} />
    </InstructionsRoot>
  );
}

const CleaningRoot = styled.div`
  display: flex;
  width: 600px;
`;
const CleaningStepColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;

  img {
    max-width: 100%;
    object-fit: contain;
  }
`;

export interface CatOneSmartQcInstructionsModalProps {
  instrumentId: number;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CatOneSmartQcCleaningInstructionsModal(
  props: CatOneSmartQcInstructionsModalProps
) {
  const { t } = useTranslation();

  const { catOneInstrument } = useGetInstrumentStatusesQuery(undefined, {
    selectFromResult: (res) => ({
      ...res,
      catOneInstrument: res.data?.find(
        (is) => is.instrument.id === props.instrumentId
      ),
    }),
  });

  const { data: detailedStatus, isLoading: detailedStatusLoading } =
    useGetDetailedInstrumentStatusQuery(props.instrumentId);

  const isReady = detailedStatus?.status === HealthCode.READY;

  return (
    <ConfirmModal
      responsive
      data-testid={TestId.CleaningModal}
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      headerContent={t("instrumentScreens.catOne.smartQcModal.title")}
      secondaryHeaderContent={t(`instruments.names.CATONE`)}
      bodyContent={
        <CleaningRoot>
          <CleaningStepColumn>
            <img
              alt={InstrumentType.CatalystOne}
              src={getInstrumentDisplayImage(InstrumentType.CatalystOne)}
            />
          </CleaningStepColumn>
          <CleaningStepColumn>
            <SpotText level="paragraph">
              {t("instrumentScreens.catOne.smartQcModal.clean")}
            </SpotText>
            <div>
              <CatOneCleaningButton
                instrumentStatus={catOneInstrument!}
                disabled={catOneInstrument == null}
                buttonType="secondary"
              >
                {t("instrumentScreens.catOne.calibrateWizard.Clean.viewButton")}
              </CatOneCleaningButton>
            </div>
            {!detailedStatusLoading && !isReady && (
              <SpotText level="paragraph" bold>
                {t("instrumentScreens.catOne.smartQcModal.pleaseWait")}
              </SpotText>
            )}
          </CleaningStepColumn>
        </CleaningRoot>
      }
      confirmButtonContent={t("general.buttons.next")}
      confirmable={isReady}
    />
  );
}
