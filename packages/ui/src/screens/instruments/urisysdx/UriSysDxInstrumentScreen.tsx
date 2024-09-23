import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRightPanelDivider,
  InstrumentPageRoot,
} from "../common-components";
import { AnalyzerOverview } from "../AnalyzerOverview";
import { InstrumentStatus, InstrumentStatusDto } from "@viewpoint/api";
import { Trans, useTranslation } from "react-i18next";
import { InstrumentInfo } from "../InstrumentInfo";
import { InlineText } from "../../../components/typography/InlineText";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useNavigate } from "react-router-dom";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import {
  useRequestUriSysDxInitializeProcedureMutation,
  useRequestUriSysDxShutdownProcedureMutation,
} from "../../../api/UriSysDxApi";
import { CancelProcessButton } from "../common/CancelProcessButton";
import {
  UpgradeNowButton,
  getAvailableUpgrade,
} from "../common/UpgradeNowButton";

const transComponents = {
  strong: <InlineText level="paragraph" bold />,
} as const;

const TestIds = {
  nguaInstrumentPageMain: "ngua-screen-main",
  nguaInstrumentPageRight: "ngua-screen-right",
} as const;

interface UriSysDxInstrumentScreenProps {
  instrumentStatus: InstrumentStatusDto;
}

function UriSysDxInstrumentScreen(props: UriSysDxInstrumentScreenProps) {
  const { t } = useTranslation();

  const { addConfirmModal } = useConfirmModal();
  const nav = useNavigate();

  const [requestShutdownProcedure] =
    useRequestUriSysDxShutdownProcedureMutation();
  const [requestInitializeProcedure] =
    useRequestUriSysDxInitializeProcedureMutation();
  const instrumentName = t("instruments.names.URISYS_DX");

  const handlePowerDown = () => {
    addConfirmModal({
      headerContent: t("instrumentScreens.common.powerDownModal.title", {
        instrumentName,
      }),
      bodyContent: (
        <SpotText level="paragraph">
          {t("instrumentScreens.common.powerDownModal.body", {
            instrumentName,
          })}
        </SpotText>
      ),
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("instrumentScreens.general.buttons.powerDown"),
      onClose: () => {},
      onConfirm: () => {
        requestShutdownProcedure({
          instrumentId: props.instrumentStatus.instrument.id,
        });
        nav("/");
      },
    });
  };

  const handleSettings = () => nav("settings");

  const handleCalibration = () => nav("qc");

  const handleIntialize = () =>
    requestInitializeProcedure({
      instrumentId: props.instrumentStatus.instrument.id,
    });

  const isInstrumentOffline =
    props.instrumentStatus.instrumentStatus === InstrumentStatus.Offline;
  const isInstrumentBusy =
    props.instrumentStatus.instrumentStatus === InstrumentStatus.Busy;

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent data-testid={TestIds.nguaInstrumentPageMain}>
        <AnalyzerOverview
          instrument={props.instrumentStatus}
          offlineBodyContent={
            <SpotText level="secondary">
              <Trans
                i18nKey={"instrumentScreens.uriSysDx.offline.description"}
                components={transComponents}
              />
            </SpotText>
          }
        />
      </InstrumentPageContent>

      <InstrumentPageRightPanel data-testid={TestIds.nguaInstrumentPageRight}>
        <InstrumentPageRightPanelButtonContainer>
          <Button onClick={handleCalibration}>
            {t("instrumentScreens.uriSysDx.buttons.calibration")}
          </Button>
          <Button disabled={isInstrumentBusy} onClick={handleSettings}>
            {t("instrumentScreens.general.buttons.settings")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
        <InstrumentPageRightPanelDivider />
        <InstrumentPageRightPanelButtonContainer>
          <CancelProcessButton
            buttonType="secondary"
            instrumentStatus={props.instrumentStatus}
          />
          <Button
            buttonType="secondary"
            disabled={isInstrumentOffline || isInstrumentBusy}
            onClick={handleIntialize}
          >
            {t("instrumentScreens.uriSysDx.buttons.initialize")}
          </Button>
          <Button
            onClick={handlePowerDown}
            buttonType="secondary"
            disabled={isInstrumentOffline || isInstrumentBusy}
          >
            {t("instrumentScreens.general.buttons.powerDown")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
        <InstrumentPageRightPanelDivider />

        {props.instrumentStatus.connected &&
          getAvailableUpgrade(props.instrumentStatus.instrument) != null && (
            <UpgradeNowButton instrumentStatus={props.instrumentStatus} />
          )}

        <InstrumentInfo
          properties={{
            [t("instrumentScreens.general.labels.softwareVersion")]:
              props.instrumentStatus.instrument.softwareVersion,
            [t("instrumentScreens.general.labels.serialNumber")]:
              props.instrumentStatus.instrument.instrumentSerialNumber,
            [t("instrumentScreens.general.labels.ipAddress")]: props
              .instrumentStatus.connected
              ? props.instrumentStatus.instrument.ipAddress
              : "",
          }}
        />
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}

export { UriSysDxInstrumentScreen };
