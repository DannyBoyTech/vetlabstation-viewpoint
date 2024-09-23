import { Trans, useTranslation } from "react-i18next";
import { useEventListener } from "../../context/EventSourceContext";
import {
  ConnectionApprovalRequestEvent,
  EventIds,
  InstrumentDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  EulaContentBody,
  EulaContentRoot,
  EulaContentTitle,
} from "./EulaComponents";
import { SpotText } from "@viewpoint/spot-react";
import {
  useApproveConnectionMutation,
  useGetDevicesAwaitingApprovalQuery,
} from "../../api/InstrumentApi";
import { useCallback, useEffect, useRef } from "react";
import { useConfirmModal } from "../global-modals/components/GlobalConfirmModal";

export const TestId = {
  EulaModal: "eula-modal",
  EulaContentBody: "eula-content-body",
};

export function useConnectionRequestActions() {
  const { t } = useTranslation();
  const { addConfirmModal } = useConfirmModal();

  const { data: devices } = useGetDevicesAwaitingApprovalQuery();
  const [approveConnection] = useApproveConnectionMutation();

  // Track which devices we've already shown to avoid double notifying
  const devicesHandled = useRef<number[]>([]);

  const handleEvent = useCallback(
    (instrument: InstrumentDto) => {
      if (!devicesHandled.current.includes(instrument.id)) {
        switch (instrument.instrumentType) {
          case InstrumentType.ProCyteDx:
            addConfirmModal({
              "data-testid": TestId.EulaModal,
              dismissable: false,
              headerContent: <Trans i18nKey="eula.common.header.microsoft" />,
              bodyContent: (
                <EulaContentRoot>
                  <EulaContentTitle>
                    <SpotText level="secondary" bold>
                      <Trans i18nKey="eula.pdx.bodyTitle" />
                    </SpotText>
                  </EulaContentTitle>
                  <EulaContentBody data-testid={TestId.EulaContentBody}>
                    <SpotText level="secondary">
                      <Trans i18nKey="eula.pdx.body" />
                    </SpotText>
                  </EulaContentBody>
                </EulaContentRoot>
              ),
              onConfirm: () =>
                approveConnection({
                  instrumentId: instrument.id,
                  approved: true,
                }),
              onClose: () =>
                approveConnection({
                  instrumentId: instrument.id,
                  approved: false,
                }),
              confirmButtonContent: t("eula.common.buttons.agree"),
              cancelButtonContent: t("eula.common.buttons.disagree"),
              responsive: true,
            });
            break;
        }
      }
    },
    [addConfirmModal, approveConnection, t]
  );

  useEffect(() => {
    for (const device of devices ?? []) {
      handleEvent(device.instrument);
      if (devicesHandled.current.length >= 100) {
        devicesHandled.current.shift();
      }
      devicesHandled.current.push(device.instrument.id);
    }
  }, [handleEvent, devices]);
}
