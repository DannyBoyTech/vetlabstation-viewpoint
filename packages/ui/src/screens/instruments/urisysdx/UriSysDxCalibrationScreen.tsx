import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  InstrumentStatusDto,
  CalibrationResult,
  InstrumentType,
  EventIds,
  InstrumentRunProgressDto,
  InstrumentStatus,
} from "@viewpoint/api";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import {
  Button,
  DataTable,
  DataTableColumn,
  Spinner,
  SpotText,
} from "@viewpoint/spot-react";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { useGetUriSysDxCalibrationRunsQuery } from "../../../api/UriSysDxApi";
import { Theme } from "../../../utils/StyleConstants";
import { useFormatDateTime12h } from "../../../utils/hooks/datetime";
import { useRunSmartQcMutation } from "../../../api/QualityControlApi";
import { getInstrumentDisplayImage } from "../../../utils/instrument-utils";
import { useEventListener } from "../../../context/EventSourceContext";
import { useHeaderTitle } from "../../../utils/hooks/hooks";

const TableWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  table {
    margin: 0;
    margin-top: 24px;
    table-layout: fixed;
  }

  table thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary};
  }
`;

const StyledSpan = styled.span<{ isOutOfRange: boolean }>`
  ${(props) => props.isOutOfRange && `color: red`};
`;

const NoResultsText = styled(SpotText)`
  margin: 30px auto;
`;

const StyledSpinner = styled(Spinner)`
  margin: 30px auto;
  width: 100%;
`;

const BodyContentWrapper = styled.div`
  display: flex;
  ol {
    padding-left: 16px;
  }
`;

const ImageContainer = styled.div`
  width: 450px;
`;

const InstrumentImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

const TestIds = {
  nguaCalibrationScreenMain: "ngua-calibration-screen-main",
  nguaCalibrationScreenRight: "ngua-calibration-screen-right",
} as const;

interface UriSysDxCalibrationScreenProps {
  instrument?: InstrumentStatusDto;
}

function UriSysDxCalibrationScreen({
  instrument,
}: UriSysDxCalibrationScreenProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const formatDateTime = useFormatDateTime12h();

  const instrumentId = instrument?.instrument.id;
  const analyzerSerialNumber = instrument?.instrument.instrumentSerialNumber;

  const { currentData, isFetching } = useGetUriSysDxCalibrationRunsQuery({
    instrumentId: Number(instrumentId),
  });

  const modalId = "urisysdx-calibration-result-modal";
  const { addConfirmModal, removeConfirmModal } = useConfirmModal();
  const [runSmartQc] = useRunSmartQcMutation();
  const [isRunCalibrationStarted, setIsRunCalibrationStarted] = useState(false);

  useEventListener(EventIds.InstrumentRunProgress, (msg) => {
    const data: InstrumentRunProgressDto = JSON.parse(msg.data);
    if (data.instrumentId === instrumentId && isRunCalibrationStarted) {
      removeConfirmModal(modalId);
      nav("/");
    }
  });

  const handleRunCalibration = () => {
    setIsRunCalibrationStarted(true);
    if (instrumentId) {
      runSmartQc(Number(instrumentId));
    }
    addConfirmModal({
      id: modalId,
      dismissable: false,
      headerContent: t("instrumentScreens.uriSysDx.calibrationModal.title"),
      secondaryHeaderContent: t(`instruments.names.URISYS_DX`),
      bodyContent: (
        <BodyContentWrapper>
          <div>
            <SpotText level="paragraph">
              <Trans
                i18nKey={"instrumentScreens.uriSysDx.calibrationModal.body"}
                components={CommonTransComponents}
              />
            </SpotText>
            <SpotText level="paragraph">
              {t("instrumentScreens.uriSysDx.calibrationModal.bodyNote")}
            </SpotText>
          </div>
          <ImageContainer>
            <InstrumentImage
              src={getInstrumentDisplayImage(
                instrument?.instrument.instrumentType as InstrumentType
              )}
            />
          </ImageContainer>
        </BodyContentWrapper>
      ),
      confirmButtonContent: t("general.buttons.ok"),
      onClose: () => {},
      onConfirm: () => nav("/"),
    });
  };

  const handleBack = () => {
    nav(-1);
  };

  const columns = useMemo(
    () =>
      [
        {
          Header: t("instrumentScreens.uriSysDx.labels.time"),
          accessor: ({ runDate }: { runDate: number }) =>
            formatDateTime(runDate),
        },
        {
          Header: t("instrumentScreens.uriSysDx.labels.results"),
          accessor: "result",
          Cell: ({ value }: { value: CalibrationResult }) => (
            <>
              {value != null ? (
                <StyledSpan isOutOfRange={value === CalibrationResult.FAIL}>
                  {t(`instrumentScreens.uriSysDx.calibrationResult.${value}`)}
                </StyledSpan>
              ) : (
                "--"
              )}
            </>
          ),
        },
      ] as unknown as DataTableColumn<Record<string, unknown>>[],
    [t]
  );

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent data-testid={TestIds.nguaCalibrationScreenMain}>
        <SpotText level="h3">
          {t("instrumentScreens.uriSysDx.calibration")}
        </SpotText>
        <SpotText level="paragraph">
          {t("instrumentScreens.uriSysDx.analyzerSerialNumber", {
            serialNumber: analyzerSerialNumber,
          })}
        </SpotText>

        <TableWrapper>
          <DataTable
            clickable={true}
            sortable={true}
            columns={columns}
            data={(currentData ?? []) as unknown as Record<string, unknown>[]}
          />
        </TableWrapper>
        <div>
          {isFetching ? (
            <StyledSpinner />
          ) : (
            currentData?.length === 0 && (
              <NoResultsText level="secondary">
                {t("qc.records.noResults")}
              </NoResultsText>
            )
          )}
        </div>
      </InstrumentPageContent>

      <InstrumentPageRightPanel
        data-testid={TestIds.nguaCalibrationScreenRight}
      >
        <InstrumentPageRightPanelButtonContainer>
          <Button
            onClick={handleRunCalibration}
            disabled={
              isFetching ||
              (instrument?.instrumentStatus !== InstrumentStatus.Ready &&
                instrument?.instrumentStatus !== InstrumentStatus.Alert)
            }
          >
            {t("instrumentScreens.uriSysDx.buttons.runCalibration")}
          </Button>
          <Button buttonType="secondary" onClick={handleBack}>
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}

export { UriSysDxCalibrationScreen };
