import {
  CalibrationResult,
  CalibrationResultDto,
  EventIds,
} from "@viewpoint/api";
import { useTranslation } from "react-i18next";
import { useEventListener } from "../../../context/EventSourceContext";
import { useInstrumentNameForId } from "../../../utils/hooks/hooks";
import { useInfoModal } from "../../../components/global-modals/components/GlobalInfoModal";
import { SpotText, useToast } from "@viewpoint/spot-react";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../../utils/toast/toast-defaults";

const useCalibrationResultActions = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { addInfoModal } = useInfoModal();
  const instrumentNameForId = useInstrumentNameForId();

  useEventListener(EventIds.CalibrationResult, (msg) => {
    const dto: CalibrationResultDto = JSON.parse(
      msg.data
    ) as CalibrationResultDto;

    const instrumentName = instrumentNameForId(dto.instrumentId);
    const { result } = dto;

    if (result === CalibrationResult.FAIL) {
      addInfoModal({
        header: t("instrumentScreens.uriSysDx.calibrationResult.failureTitle"),
        secondaryHeader: instrumentName,
        content: t("instrumentScreens.uriSysDx.calibrationResult.failureBody"),
      });
    }

    if (result === CalibrationResult.PASS) {
      addToast({
        ...DefaultSuccessToastOptions,
        content: (
          <ToastContentRoot>
            <ToastTextContentRoot>
              <ToastText level="paragraph" bold $maxLines={1}>
                {instrumentName}
              </ToastText>
              <ToastText level="paragraph" $maxLines={2}>
                {t("instrumentScreens.uriSysDx.calibrationResult.success")}
              </ToastText>
            </ToastTextContentRoot>
          </ToastContentRoot>
        ),
      });
    }
  });
};

export { useCalibrationResultActions };
