import { EventIds, SmartQCResult, SmartQCResultDto } from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { useEventListener } from "../../context/EventSourceContext";
import { useInstrumentNameForId } from "../../utils/hooks/hooks";
import { useInfoModal } from "../global-modals/components/GlobalInfoModal";

const useSmartQCResultActions = () => {
  const { t } = useTranslation();
  const { addInfoModal } = useInfoModal();
  const instrumentNameForId = useInstrumentNameForId();

  useEventListener(EventIds.SmartQCResult, (msg) => {
    const dto: SmartQCResultDto = JSON.parse(msg.data) as SmartQCResultDto;
    const instrumentName = instrumentNameForId(dto.instrumentId);
    const { result, notify } = dto;

    if (notify) {
      if (result === SmartQCResult.OUT_OF_RANGE) {
        addInfoModal({
          header: t("qc.smartQCResult.title", { instrumentName }),
          content: t("qc.smartQCResult.outOfRangeContent"),
        });
      }

      if (result === SmartQCResult.PASS) {
        addInfoModal({
          header: t("qc.smartQCResult.title", { instrumentName }),
          content: t("qc.smartQCResult.passContent"),
        });
      }
    }
  });
};

export { useSmartQCResultActions };
