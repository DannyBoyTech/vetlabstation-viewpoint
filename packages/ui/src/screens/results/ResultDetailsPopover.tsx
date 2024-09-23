import { Button, SpotText } from "@viewpoint/spot-react";
import { SpotPopover } from "../../components/popover/Popover";
import styled from "styled-components";
import {
  InstrumentRunDto,
  LabRequestDto,
  PatientWeightUnitsEnum,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useRef, useState } from "react";
import { Theme } from "../../utils/StyleConstants";
import { useTranslation } from "react-i18next";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import {
  useFormatDate,
  useFormatDateTime12h,
} from "../../utils/hooks/datetime";
import { settingsApi } from "../../api/SettingsApi";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { Link } from "../../components/Link";
import { useFormatPersonalName } from "../../utils/hooks/LocalizationHooks";
import { isQcRequest, qcLotNumber } from "../../utils/run-utils";

const ResultDetailsTable = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  width: 400px;
  margin-top: 10px;

  .spot-typography__text--secondary {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
const ResultDetailsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  margin: 20px 0;
`;

const InstrumentImage = styled.img`
  width: 40px;
`;

export const dedupInstrumentTypes = (instrumentRuns: InstrumentRunDto[]) =>
  Object.values(
    instrumentRuns?.reduce(
      (agg: Record<string, InstrumentRunDto>, run: InstrumentRunDto) => {
        agg[run.instrumentType] = run;
        return agg;
      },
      {}
    )
  );

export const ResultDetailsPopover = ({
  labRequestData,
  onViewCommsLog,
  hideCommsLog,
}: {
  labRequestData?: LabRequestDto;
  onViewCommsLog?: () => void;
  hideCommsLog?: boolean;
}) => {
  const { data: settings } = settingsApi.useGetSettingsQuery([
    SettingTypeEnum.WEIGHT_UNIT_TYPE,
  ]);
  const [resultDetailsDropdownOpen, setResultDetailsDropdownOpen] =
    useState(false);
  const resultDetailsButtonRef = useRef(null);
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const formatDateTime12h = useFormatDateTime12h();
  const formatName = useFormatPersonalName();

  return (
    <>
      <Button
        buttonType="link"
        buttonSize="small"
        rightIcon="caret-down"
        onClick={() => setResultDetailsDropdownOpen(!resultDetailsDropdownOpen)}
        innerRef={resultDetailsButtonRef}
        data-testid="results-page-result-details-popover-button"
      >
        {t("resultsPage.buttons.resultDetails")}
      </Button>
      {resultDetailsDropdownOpen && (
        <SpotPopover
          anchor={resultDetailsButtonRef.current}
          onClickAway={() => setResultDetailsDropdownOpen(false)}
          popFrom="bottom"
          offsetTo="right"
        >
          {!settings ? (
            <SpinnerOverlay />
          ) : (
            <div data-testid="results-page-result-details-popover">
              <ResultDetailsHeader>
                <SpotText level="h5">
                  {t("resultsPage.resultDetails.labels.header")}
                </SpotText>
                {labRequestData?.requestDate && (
                  <SpotText level="secondary">
                    {formatDate(labRequestData?.requestDate)}
                  </SpotText>
                )}
              </ResultDetailsHeader>
              <ResultDetailsTable>
                <SpotText level="secondary">
                  {t("resultsPage.resultDetails.labels.source")}
                </SpotText>
                <div>
                  {dedupInstrumentTypes(
                    labRequestData?.instrumentRunDtos || []
                  ).map((run: InstrumentRunDto) => (
                    <InstrumentImage
                      key={run.id}
                      src={getInstrumentDisplayImage(run.instrumentType)}
                    />
                  ))}
                </div>
                <>
                  <SpotText level="secondary">
                    {t("resultsPage.resultDetails.labels.runDate")}
                  </SpotText>
                  <SpotText level="secondary">
                    {labRequestData?.requestDate
                      ? formatDateTime12h(labRequestData?.requestDate)
                      : t("general.placeholder.noValue")}
                  </SpotText>
                </>
                {isQcRequest(labRequestData) ? (
                  <>
                    <SpotText level="secondary">
                      {t("resultsPage.resultDetails.labels.qcLotNumber")}
                    </SpotText>
                    <SpotText level="secondary">
                      {qcLotNumber(labRequestData) ??
                        t("general.placeholder.noValue")}
                    </SpotText>
                  </>
                ) : (
                  <>
                    <SpotText level="secondary">
                      {t("resultsPage.resultDetails.labels.veterinarian")}
                    </SpotText>
                    <SpotText level="secondary">
                      {labRequestData?.doctorDto == null
                        ? t("general.placeholder.noValue")
                        : formatName(labRequestData.doctorDto)}
                    </SpotText>
                    <SpotText level="secondary">
                      {`${t(
                        "resultsPage.resultDetails.labels.requisition"
                      )} ${t("general.numberSign")}`}
                    </SpotText>
                    <SpotText level="secondary">
                      {labRequestData?.requisitionId != null
                        ? labRequestData.requisitionId
                        : t("general.placeholder.noValue")}
                    </SpotText>
                  </>
                )}
                {!hideCommsLog && (
                  <Link
                    to={"#"}
                    small
                    onClick={() => {
                      setResultDetailsDropdownOpen(false);
                      onViewCommsLog?.();
                    }}
                  >
                    {t("resultsPage.commsLog.viewLog")}
                  </Link>
                )}
              </ResultDetailsTable>
              <Divider />
              <ResultDetailsHeader>
                <SpotText level="h5">
                  {t("resultsPage.resultDetails.labels.patientDetails")}
                </SpotText>
                {labRequestData?.requestDate && (
                  <SpotText level="secondary">
                    {formatDate(labRequestData?.requestDate)}
                  </SpotText>
                )}
              </ResultDetailsHeader>
              <ResultDetailsTable>
                <SpotText level="secondary">
                  {t("resultsPage.resultDetails.labels.lastKnownWeight")}
                </SpotText>
                <SpotText level="secondary">
                  {labRequestData?.weight
                    ? `${labRequestData?.weight} ${
                        settings[SettingTypeEnum.WEIGHT_UNIT_TYPE] ===
                        PatientWeightUnitsEnum.POUNDS
                          ? t("weightUnits.POUNDS")
                          : t("weightUnits.KILOGRAMS")
                      }`
                    : t("general.placeholder.noValue")}
                </SpotText>
              </ResultDetailsTable>
            </div>
          )}
        </SpotPopover>
      )}
    </>
  );
};
