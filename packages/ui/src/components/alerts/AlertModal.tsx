import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  EllipsizedPaginator,
  Modal,
  Spinner,
  SpotText,
} from "@viewpoint/spot-react/src";
import { useTranslation } from "react-i18next";
import {
  useInstrumentNameForId,
  useInstrumentStatusForId,
} from "../../utils/hooks/hooks";
import { getAlertContent } from "./definitions/AlertDefinitions";
import { AlertModalSideBar } from "./AlertModalSideBar";
import { LightTheme } from "../../utils/StyleConstants";
import { SideBarModalRoot } from "../modal/ModalWithSideBar";
import { ResponsiveModalWrapper } from "../modal/ResponsiveModalWrapper";
import { useFilteredInstrumentAlerts } from "./alert-hooks";

export const TestId = {
  AlertModalContent: "alert-modal-content",
};

const TestIds = {
  currentCollection: "current-collection",
  alertTitle: "alert-title",
} as const;

const StyledSideBarModalRoot = styled(SideBarModalRoot)`
  height: 580px;
  width: 800px;
`;

const StyledFooter = styled(Modal.Footer).attrs({
  className: LightTheme.secondaryContainerClass,
})`
  flex: 0;
  justify-content: center;
`;

const StyledBody = styled(Modal.Body)`
  .spot-modal__copy {
    padding: unset;
  }
`;

export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  initialInstrumentId?: number;
}

export function AlertModal({ onClose, ...props }: AlertModalProps) {
  // ID of the instrument selected in the left panel. Track this and derive the
  // index instead of tracking the index directly because items can be added
  // to the list externally and change the order of the instruments in the panel
  const [currentInstrumentId, setCurrentInstrumentId] = useState<
    number | undefined
  >(props.initialInstrumentId);
  // Track the currently viewed alert ID instead of index for similar reason above
  const [currentAlertId, setCurrentAlertId] = useState<string>();
  // Ref for the actual modal popup to detect when click happens outside
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { t } = useTranslation("alerts");
  const getInstrumentName = useInstrumentNameForId();
  const getInstrumentStatus = useInstrumentStatusForId();
  const { data: allAlerts } = useFilteredInstrumentAlerts();

  // Derive the index of the current instrument
  const currentInstrumentIndex = useMemo(
    () =>
      allAlerts?.findIndex((iad) => iad.instrumentId === currentInstrumentId) ??
      0,
    [allAlerts, currentInstrumentId]
  );

  // Pull out the collection of alerts for the current instrument
  const currentCollection = useMemo(
    () =>
      currentInstrumentIndex == null
        ? undefined
        : allAlerts?.[currentInstrumentIndex],
    [allAlerts, currentInstrumentIndex]
  );

  // Derive the index of the currently viewed alert
  const currentAlertIndex = useMemo(
    () =>
      currentCollection?.alerts?.findIndex(
        (alert) => alert.uniqueId === currentAlertId
      ) ?? 0,
    [currentAlertId, currentCollection?.alerts]
  );

  // The alert currently being viewed
  const currentAlert = currentCollection?.alerts[currentAlertIndex];

  // Instrument status response for the current instrument
  const currentInstrument =
    currentCollection == null
      ? undefined
      : getInstrumentStatus(currentCollection?.instrumentId);

  useEffect(() => {
    // Close the modal if all alerts are gone (they can be removed by actions taken outside of VP)
    if (allAlerts != null && allAlerts.length === 0) {
      onClose();
    } else if (
      // If the instrument being viewed has been removed (no more alerts for it)...
      allAlerts?.find((iad) => iad.instrumentId === currentInstrumentId) == null
    ) {
      // Reset to the first instrument in the list, otherwise undefined
      setCurrentInstrumentId(allAlerts?.[0]?.instrumentId);
    }
  }, [onClose, allAlerts, currentInstrumentId]);

  useEffect(() => {
    // If the alert being viewed has been removed externally
    if (
      currentCollection?.alerts?.find(
        (alert) => alert.uniqueId === currentAlertId
      ) == null
    ) {
      // Reset to the first alert in the list, otherwise undefined
      setCurrentAlertId(currentCollection?.alerts?.[0]?.uniqueId);
    }
  }, [currentAlertId, currentCollection?.alerts]);

  // This uses the lower level SPOT modal components because we need to add the
  // left sidebar, which isn't doable with the higher level components.
  return (
    <ResponsiveModalWrapper>
      <Modal.Overlay
        visible={props.open}
        onClose={onClose}
        dismissable={true}
        modalRef={modalRef}
      >
        <StyledSideBarModalRoot
          ref={modalRef}
          data-testid={TestId.AlertModalContent}
        >
          <AlertModalSideBar
            instrumentAlerts={allAlerts}
            selectedInstrumentId={currentInstrument?.instrument.id}
            onInstrumentSelected={(instrumentId) => {
              setCurrentAlertId(undefined);
              setCurrentInstrumentId(instrumentId);
            }}
          />
          <Modal.Popup>
            <Modal.Header onClose={onClose} dismissable={true}>
              <SpotText
                data-testid={TestIds.currentCollection}
                level="secondary"
                bold
                className="spot-modal__secondary-title"
              >
                {currentCollection == null
                  ? t("alertModal.secondaryHeaderNoInstrument")
                  : t("alertModal.secondaryHeader", {
                      instrumentName: getInstrumentName(
                        currentCollection?.instrumentId
                      ),
                    })}
              </SpotText>
              <SpotText
                data-testid={TestIds.alertTitle}
                level="h4"
                className="spot-modal__title"
              >
                {t(
                  `${currentInstrument?.instrument.instrumentType}.${currentAlert?.name}.title` as any,
                  t(
                    `${currentInstrument?.instrument.instrumentType}.unmapped.title` as any,
                    ""
                  ),
                  currentAlert?.args
                )}
              </SpotText>
            </Modal.Header>

            <StyledBody>
              {currentAlert == null ||
              currentCollection == null ||
              currentInstrument == null ? (
                <Loading />
              ) : (
                getAlertContent(currentInstrument, currentAlert, onClose)
              )}
            </StyledBody>

            {currentCollection?.alerts != null &&
              currentCollection.alerts.length > 1 && (
                <StyledFooter>
                  <EllipsizedPaginator
                    count={currentCollection.alerts.length}
                    size="large"
                    currentPage={currentAlertIndex}
                    onPageChange={(index) =>
                      setCurrentAlertId(
                        currentCollection?.alerts?.[index]?.uniqueId
                      )
                    }
                  />
                </StyledFooter>
              )}
          </Modal.Popup>
        </StyledSideBarModalRoot>
      </Modal.Overlay>
    </ResponsiveModalWrapper>
  );
}

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

function Loading() {
  return (
    <LoadingContent>
      <Spinner size="large" />
    </LoadingContent>
  );
}
