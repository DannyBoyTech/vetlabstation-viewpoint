import { ConfirmModal } from "../../components/confirm-modal/ConfirmModal";
import { useTranslation } from "react-i18next";
import {
  useAppDispatch,
  useInstrumentNameForId,
  usePimsInstrumentStatus,
} from "../../utils/hooks/hooks";
import {
  InstrumentRunDto,
  InstrumentType,
  LabRequestDto,
} from "@viewpoint/api";
import { StickyHeaderTableWrapper } from "../../components/table/StickyHeaderTable";
import { useEffect, useMemo } from "react";
import {
  DataTable,
  DataTableColumn,
  SpotText,
  useToast,
} from "@viewpoint/spot-react/src";
import { useFormatDateTime12h } from "../../utils/hooks/datetime";
import styled from "styled-components";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { useResendLabRequestToPimsMutation } from "../../api/LabRequestsApi";
import {
  DefaultSuccessToastOptions,
  ToastContentRoot,
  ToastText,
  ToastTextContentRoot,
} from "../../utils/toast/toast-defaults";
import { CacheTags, viewpointApi } from "../../api/ApiSlice";
import { useFormatPersonalName } from "../../utils/hooks/LocalizationHooks";

const ModalContainer = styled.div`
  .spot-button {
    max-width: 300px;

    .spot-button__text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

interface ResultsCommunicationsLogModal {
  open: boolean;
  onClose: () => void;
  labRequest: LabRequestDto;
  hasPims: boolean;
  hasVcp: boolean;
  pimsOnline: boolean;
}

export function ResultsCommunicationsLogModal(
  props: ResultsCommunicationsLogModal
) {
  const { t } = useTranslation();
  const formatName = useFormatPersonalName();
  const getInstrumentName = useInstrumentNameForId();
  const pimsInstrumentStatus = usePimsInstrumentStatus();
  const [resend, resendStatus] = useResendLabRequestToPimsMutation();
  const { addToast } = useToast();

  const isLoading = resendStatus.isLoading;

  const pimsName =
    pimsInstrumentStatus == null
      ? t(`instruments.names.${InstrumentType.InterlinkPims}`)
      : getInstrumentName(pimsInstrumentStatus.instrument.id);

  const resendToPims = async () => {
    await resend(props.labRequest.id).unwrap();
    addToast({
      ...DefaultSuccessToastOptions,
      content: (
        <ToastContentRoot>
          <ToastTextContentRoot>
            <ToastText level="paragraph" $maxLines={1} bold>
              {formatName({
                firstName: props.labRequest.patientDto.patientName,
                lastName: props.labRequest.patientDto.clientDto.lastName,
              })}
            </ToastText>
            <ToastText level={"paragraph"} $maxLines={2}>
              {t("resultsPage.commsLog.resentNotification", { pimsName })}
            </ToastText>
          </ToastTextContentRoot>
        </ToastContentRoot>
      ),
    });
    props.onClose();
  };

  return (
    <ModalContainer>
      <ConfirmModal
        responsive
        confirmable={!isLoading && props.hasPims && props.pimsOnline}
        open={props.open}
        onClose={props.onClose}
        onConfirm={resendToPims}
        bodyContent={
          <ResultsCommunicationsLog
            labRequest={props.labRequest}
            hasPims={props.hasPims}
            hasVcp={props.hasVcp}
            pimsName={pimsName}
          />
        }
        confirmButtonContent={t("resultsPage.commsLog.resendToPims", {
          pimsName,
        })}
        cancelButtonContent={t("general.buttons.close")}
        headerContent={t("resultsPage.commsLog.title")}
        secondaryHeaderContent={formatName({
          firstName: props.labRequest.patientDto.patientName,
          lastName: props.labRequest.patientDto.clientDto.lastName,
        })}
      />
    </ModalContainer>
  );
}

const InstrumentCell = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InstrumentIcon = styled.img`
  max-height: 30px;
`;

const NoWrapText = styled(SpotText)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTableWrapper = styled(StickyHeaderTableWrapper)`
  max-height: 350px;
`;

const StyledTable = styled(DataTable)`
  th {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
`;

interface ResultsCommunicationsLogProps {
  labRequest: LabRequestDto;
  hasPims: boolean;
  hasVcp: boolean;
  pimsName?: string;
}

export function ResultsCommunicationsLog(props: ResultsCommunicationsLogProps) {
  const { t } = useTranslation();
  const formatDate = useFormatDateTime12h();
  const getInstrumentName = useInstrumentNameForId();
  const dispatch = useAppDispatch();

  // We currently don't receive any message from IVLS when a result is sent to VC+.
  // This means that it will show stale data even when leaving the page/coming back.
  // As a workaround, invalidate the results cache when the comms log is viewed so that
  // it will get fresh data every time it's opened
  useEffect(() => {
    dispatch(viewpointApi.util.invalidateTags([CacheTags.Results]));
  }, [dispatch]);

  const columns = useMemo(() => {
    const columnDefs: DataTableColumn<any>[] = [];

    columnDefs.push({
      Header: t("resultsPage.commsLog.instrument"),
      accessor: ({ instrumentId, instrumentType }: InstrumentRunDto) => ({
        instrumentId,
        instrumentType,
      }),
      id: "instrumentColumn",
      Cell: ({
        value,
      }: {
        value: {
          instrumentId: number;
          instrumentType: InstrumentType;
        };
      }) => (
        <InstrumentCell>
          <InstrumentIcon
            src={getInstrumentDisplayImage(value.instrumentType)}
          />
          <SpotText level="secondary">
            {getInstrumentName(value.instrumentId)}
          </SpotText>
        </InstrumentCell>
      ),
    });

    columnDefs.push({
      Header: t("resultsPage.commsLog.runDate"),
      accessor: ({ testDateUtc }: InstrumentRunDto) => testDateUtc,
      id: "runDateColumn",
      Cell: ({ value }: { value: number }) => (
        <NoWrapText level="secondary">
          {value == null
            ? t("general.placeholder.noValue")
            : formatDate(value * 1000)}
        </NoWrapText>
      ),
    });

    if (props.hasPims) {
      columnDefs.push({
        Header: t("resultsPage.commsLog.sentTo", {
          targetName: props.pimsName,
        }),
        accessor: ({ dateSentToPims }: InstrumentRunDto) => dateSentToPims,
        id: "sentToPimsColumn",
        Cell: ({ value }: { value: number }) => (
          <NoWrapText level="secondary">
            {value == null
              ? t("general.placeholder.noValue")
              : formatDate(value)}
          </NoWrapText>
        ),
      });
    }

    if (props.hasVcp) {
      columnDefs.push({
        Header: t("resultsPage.commsLog.sentTo", {
          targetName: t("settings.categories.VET_CONNECT_PLUS"),
        }),
        accessor: ({ connectedApplicationHistoryDto }: InstrumentRunDto) =>
          connectedApplicationHistoryDto?.dateSentToDxPortal,
        id: "sentToVcpColumn",
        Cell: ({ value }: { value: number }) => (
          <NoWrapText level="secondary">
            {value == null
              ? t("general.placeholder.noValue")
              : formatDate(value)}
          </NoWrapText>
        ),
      });
    }

    return columnDefs;
  }, [
    formatDate,
    getInstrumentName,
    props.hasPims,
    props.hasVcp,
    props.pimsName,
    t,
  ]);
  return (
    <StyledTableWrapper>
      <StyledTable
        columns={
          columns as unknown as DataTableColumn<Record<string, unknown>>[]
        }
        data={
          (props.labRequest.instrumentRunDtos ?? []) as unknown as Record<
            string,
            unknown
          >[]
        }
      />
    </StyledTableWrapper>
  );
}
