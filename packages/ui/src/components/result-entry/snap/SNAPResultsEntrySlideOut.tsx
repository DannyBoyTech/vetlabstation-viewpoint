import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SNAPResultsEntry, SnapResultUpdate } from "./SNAPResultsEntry";
import {
  InstrumentType,
  RunEditHistoryDto,
  SettingTypeEnum,
  SnapDeviceAltDto,
  SnapDeviceDto,
  UserEnteredSnapResultDto,
} from "@viewpoint/api";
import { useGetSettingQuery } from "../../../api/SettingsApi";
import {
  CancelRunContainer,
  ManualEntrySlideOutProps,
  Root,
} from "../common-slideout-components";
import { Button } from "@viewpoint/spot-react";
import { CancelConfirmationModal } from "../../confirm-modal/CancelConfirmationModal";
import { SlideOut } from "../../slideout/SlideOut";
import SpinnerOverlay from "../../overlay/SpinnerOverlay";
import { CancelRunModal } from "../../../screens/home/in-process/InProcessComponents";

export const TestId = {
  ResetTimer: "snap-results-reset-timer",
  CancelRunConfirm: "manual-entry-cancel-run-confirm-modal",
  CloseConfirm: "manual-entry-close-confirm-modal",
  SlideOut: "manual-entry-slideout",
};

interface SNAPResultsEntrySlideOutProps extends ManualEntrySlideOutProps {
  editHistory?: RunEditHistoryDto[];
  selectedSnapDevice: SnapDeviceDto | SnapDeviceAltDto;
  instrumentType: InstrumentType.SNAP | InstrumentType.SNAPPro;

  onSaveResults: (snapResultUpdate: SnapResultUpdate) => void;
  onCloseRequested: () => void;
  onCancelRun?: () => void;
  onResetTimer?: () => void;

  resetTimerDisabled?: boolean;

  initialResult?: UserEnteredSnapResultDto;
  loading?: boolean;
}

export function SNAPResultsEntrySlideOut(props: SNAPResultsEntrySlideOutProps) {
  const [confirmingCancelRun, setConfirmingCancelRun] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  const { t } = useTranslation();

  const { data: snapTimerEnabled } = useGetSettingQuery(
    SettingTypeEnum.SNAP_ENABLETIMER,
    {
      selectFromResult: (res) => ({
        ...res,
        data: res.data === "true",
      }),
    }
  );

  const handleCancelRun = async () => {
    props.onCancelRun?.();
  };

  const handleResetTimer = () => {
    props.onResetTimer?.();
  };

  const handleSave = (update: SnapResultUpdate) => {
    props.onSaveResults(update);
  };

  return props.open ? (
    <SlideOut
      side={"right"}
      open={!props.closing}
      onTapShade={() => setConfirmingClose(true)}
      onCloseTransitionEnd={() => props.onClose()}
      data-testid={TestId.SlideOut}
      openWidth={"575px"}
    >
      <Root>
        {props.loading && <SpinnerOverlay />}
        <SNAPResultsEntry
          editHistory={props.editHistory}
          onClose={() => setConfirmingClose(true)}
          onDone={handleSave}
          snapDevice={props.selectedSnapDevice}
          initialResult={props.initialResult}
          footerContent={
            (props.onResetTimer != null || props.onCancelRun != null) && (
              <SNAPResultsEntryFooter
                resetTimerHidden={
                  !snapTimerEnabled || props.onResetTimer == null
                }
                resetTimerDisabled={!!props.resetTimerDisabled}
                onResetTimer={handleResetTimer}
                onCancelRun={() => setConfirmingCancelRun(true)}
              />
            )
          }
        />
      </Root>
      {confirmingCancelRun && (
        <CancelRunModal
          data-testid={TestId.CancelRunConfirm}
          onConfirm={async () => {
            setConfirmingCancelRun(false);
            handleCancelRun().catch((err) => console.error(err));
          }}
          onClose={() => setConfirmingCancelRun(false)}
          instrumentName={t(`instruments.names.${props.instrumentType}`)}
        />
      )}
      {confirmingClose && (
        <CancelConfirmationModal
          onConfirm={() => {
            setConfirmingClose(false);
            props.onCloseRequested();
          }}
          open={confirmingClose}
          onClose={() => setConfirmingClose(false)}
          data-testid={TestId.CloseConfirm}
        />
      )}
    </SlideOut>
  ) : (
    <></>
  );
}

interface SNAPResultsEntryFooterProps {
  resetTimerDisabled: boolean;
  resetTimerHidden: boolean;

  onResetTimer: () => void;
  onCancelRun: () => void;
}

function SNAPResultsEntryFooter(props: SNAPResultsEntryFooterProps) {
  const { t } = useTranslation();

  return (
    <CancelRunContainer>
      <Button buttonType="link" leftIcon="delete" onClick={props.onCancelRun}>
        {t("inProcess.analyzerRun.buttons.cancelRun")}
      </Button>
      {!props.resetTimerHidden && (
        <Button
          data-testid={TestId.ResetTimer}
          disabled={props.resetTimerDisabled}
          buttonType="link"
          leftIcon="redo"
          onClick={props.onResetTimer}
        >
          {t("resultsEntry.snap.buttons.resetTimer")}
        </Button>
      )}
    </CancelRunContainer>
  );
}
