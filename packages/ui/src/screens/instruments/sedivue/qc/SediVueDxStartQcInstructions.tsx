import { Trans, useTranslation } from "react-i18next";
import { SpotText } from "@viewpoint/spot-react";
import { EventIds, InstrumentRunProgressDto, QcLotDto } from "@viewpoint/api";
import { useEventListener } from "../../../../context/EventSourceContext";
import { useGlobalModals } from "../../../../components/global-modals/GlobalModals";
import { SediVueDxQcInstructionsBody } from "./SediVueDxQcInstructionsBody";
import { InlineText } from "../../../../components/typography/InlineText";

export interface SediVueDxStartQcInstructions {
  qcLotInfo: QcLotDto;
  instrumentId: number;
  modalId: string;
}

export function SediVueDxStartQcInstructions(
  props: SediVueDxStartQcInstructions
) {
  const { t } = useTranslation();
  const { removeModal } = useGlobalModals();

  useEventListener(EventIds.InstrumentRunProgress, (msg) => {
    const data: InstrumentRunProgressDto = JSON.parse(msg.data);
    if (data.instrumentId === props.instrumentId) {
      removeModal(props.modalId);
    }
  });

  return (
    <SediVueDxQcInstructionsBody qcLotInfo={props.qcLotInfo}>
      <SpotText level="paragraph" bold>
        {t(`instrumentScreens.sediVueDx.qc.runQc.start.header`)}
      </SpotText>
      <ol>
        <Trans
          i18nKey={`instrumentScreens.sediVueDx.qc.runQc.start.instructions`}
          components={{
            li: <li />,
            linebreak: (
              <>
                <br />
                <br />
              </>
            ),
            strong: <InlineText level="paragraph" bold />,
          }}
        />
      </ol>
    </SediVueDxQcInstructionsBody>
  );
}
