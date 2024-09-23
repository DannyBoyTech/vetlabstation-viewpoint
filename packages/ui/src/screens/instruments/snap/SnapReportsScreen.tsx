import { Button, Radio, RadioGroup, SpotText } from "@viewpoint/spot-react";
import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DatesRangeValue } from "@mantine/dates";
import { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { useFormatShortDate } from "../../../utils/hooks/datetime";
import dayjs, { Dayjs } from "dayjs";
import { PrintPreview } from "../../../components/print-preview/PrintPreview";
import { DateRangePicker } from "../../../components/input/ViewPointDatePicker";
import {
  fetchSnapLogReport,
  fetchSnapSummaryReport,
} from "../../../api/ReportApi";
import { useInfoModal } from "../../../components/global-modals/components/GlobalInfoModal";
import { Views, pdfViewerOpts } from "../../../utils/url-utils";

const DateControls = styled.div`
  position: relative;

  margin: 40px 0;

  .selection-label {
    margin-bottom: 30px;
  }

  .spot-form__radio {
    margin-bottom: 30px;
  }
`;

const DateDisplay = styled.div`
  position: absolute;
  top: 0;
  left: 436px;
`;

const CustomDateSelection = styled.div`
  position: relative;
  top: -6px;

  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 40px;

  > .spot-form__radio {
    margin: 0;
  }
`;

export const TestId = {
  PageTitle: "page-title",
  SelectedDatesTitle: "selected-dates-title",
  SelectedDates: "selected-dates",
  DateRangePicker: "date-range-picker",
  PrintPreview: "print-preview",
} as const;

export const DateRangeTypes = {
  MONTH: "month",
  WEEK: "week",
  YEAR: "year",
  CUSTOM: "custom",
  PREV_MONTH: "prevMonth",
  PREV_WEEK: "prevWeek",
} as const;

export type DateRangeType =
  (typeof DateRangeTypes)[keyof typeof DateRangeTypes];
export type RelativeRangeType = Exclude<DateRangeType, "custom">;

export function relativeDateRange(
  rangeType: RelativeRangeType,
  now: Dayjs
): [Dayjs, Dayjs] {
  switch (rangeType) {
    case DateRangeTypes.WEEK:
      const startOfWeek = now.startOf("week");
      return [startOfWeek, now];

    case DateRangeTypes.MONTH:
      const startOfMonth = now.startOf("month");
      return [startOfMonth, now];

    case DateRangeTypes.YEAR:
      const startOfYear = now.startOf("year");
      return [startOfYear, now];

    case DateRangeTypes.PREV_WEEK:
      const nowLastWeek = now.subtract(1, "week");
      const startOfLastWeek = nowLastWeek.startOf("week");
      const endOfLastWeek = nowLastWeek.endOf("week");
      return [startOfLastWeek, endOfLastWeek];

    case DateRangeTypes.PREV_MONTH:
      const nowLastMonth = now.subtract(1, "month");
      const startOfLastMonth = nowLastMonth.startOf("month");
      const endOfLastMonth = nowLastMonth.endOf("month");
      return [startOfLastMonth, endOfLastMonth];
  }
}

export function SnapReportsScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const formatShortDate = useFormatShortDate();
  const { addInfoModal } = useInfoModal();

  const [customDateRange, setCustomDateRange] = useState<DatesRangeValue>();
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>();
  const [reportUrl, setReportUrl] = useState<string>();
  const [printPreviewHeader, setPrintPreviewHeader] = useState<string>();

  const formatRange = (range: [Dayjs, Dayjs]) => {
    if (range && range[0] != null && range[1] != null) {
      return `${formatShortDate(range[0])} - ${formatShortDate(range[1])}`;
    }
  };

  const handleDateRangeTypeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setDateRangeType(ev.target.value as DateRangeType);
  };

  const handlePrintLogReport = async () => {
    const [startDate, endDate] = selectedDateRange!.map((it) => it.toDate());

    const reportBlob = await fetchSnapLogReport(startDate, endDate);

    if (reportBlob.size === 0) {
      addInfoModal({
        header: t("instrumentScreens.snap.reports.reportModal.logReport"),
        secondaryHeader: t("instruments.names.SNAP"),
        content: t(
          "instrumentScreens.snap.reports.reportModal.noDataAvailable"
        ),
      });
    } else {
      setPrintPreviewHeader(
        t("instrumentScreens.snap.reports.reportModal.logTitle")
      );
      setReportUrl(
        URL.createObjectURL(reportBlob) +
          `#${pdfViewerOpts({ toolbar: false, view: Views.FIT_HORIZONTAL })}`
      );
    }
  };

  const handlePrintSummaryReport = async () => {
    const [startDate, endDate] = selectedDateRange!.map((it) => it.toDate());

    const reportBlob = await fetchSnapSummaryReport(startDate, endDate);

    if (reportBlob.size === 0) {
      addInfoModal({
        header: t("instrumentScreens.snap.reports.reportModal.summaryReport"),
        secondaryHeader: t("instruments.names.SNAP"),
        content: t(
          "instrumentScreens.snap.reports.reportModal.noDataAvailable"
        ),
      });
    } else {
      setPrintPreviewHeader(
        t("instrumentScreens.snap.reports.reportModal.summaryTitle")
      );
      setReportUrl(
        URL.createObjectURL(reportBlob) +
          `#${pdfViewerOpts({ toolbar: false, view: Views.FIT_HORIZONTAL })}`
      );
    }
  };

  const handlePrintPreviewClose = () => {
    setReportUrl(undefined);
  };

  const now = dayjs();

  const selectedDateRange: [Dayjs, Dayjs] | undefined =
    dateRangeType == null
      ? undefined
      : dateRangeType === DateRangeTypes.CUSTOM
      ? customDateRange == null || customDateRange.some((it) => it == null)
        ? undefined
        : [dayjs(customDateRange[0]), dayjs(customDateRange[1])]
      : relativeDateRange(dateRangeType, now);

  const selectedDateRangeIsValid =
    selectedDateRange != null &&
    selectedDateRange.length == 2 &&
    selectedDateRange.every((it) => it instanceof dayjs);

  return (
    <InstrumentPageRoot>
      <InstrumentPageContent>
        <SpotText level="h3" data-testid={TestId.PageTitle}>
          {t("instrumentScreens.snap.reports.title")}
        </SpotText>

        <DateControls>
          <SpotText className="selection-label" level="paragraph">
            {t("instrumentScreens.snap.reports.selectDateRangeForReport")}
          </SpotText>

          {selectedDateRange && (
            <DateDisplay data-testid={TestId.SelectedDates}>
              <SpotText level="paragraph" bold>
                {t("instrumentScreens.snap.reports.selectedDates")}
              </SpotText>
              <SpotText level="paragraph">
                {formatRange(selectedDateRange)}
              </SpotText>
            </DateDisplay>
          )}

          <RadioGroup>
            <Radio
              name="range"
              label={t("instrumentScreens.snap.reports.lastMonth")}
              value={DateRangeTypes.PREV_MONTH}
              onChange={handleDateRangeTypeChange}
            />
            <Radio
              name="range"
              label={t("instrumentScreens.snap.reports.thisMonth")}
              value={DateRangeTypes.MONTH}
              onChange={handleDateRangeTypeChange}
            />
            <Radio
              name="range"
              label={t("instrumentScreens.snap.reports.lastWeek")}
              value={DateRangeTypes.PREV_WEEK}
              onChange={handleDateRangeTypeChange}
            />
            <Radio
              name="range"
              label={t("instrumentScreens.snap.reports.thisWeek")}
              value={DateRangeTypes.WEEK}
              onChange={handleDateRangeTypeChange}
            />
            <Radio
              name="range"
              label={t("instrumentScreens.snap.reports.yearToDate")}
              value={DateRangeTypes.YEAR}
              onChange={handleDateRangeTypeChange}
            />
            <CustomDateSelection>
              <Radio
                name="range"
                label={t("instrumentScreens.snap.reports.customDateRange")}
                value={DateRangeTypes.CUSTOM}
                onChange={handleDateRangeTypeChange}
              />
              {dateRangeType === DateRangeTypes.CUSTOM && (
                <DateRangePicker
                  data-testid={TestId.DateRangePicker}
                  clearable={true}
                  allowSingleDateInRange={true}
                  value={customDateRange}
                  onChange={setCustomDateRange}
                  placeholder={t("instrumentScreens.snap.reports.selectDates")}
                />
              )}
            </CustomDateSelection>
          </RadioGroup>
        </DateControls>
      </InstrumentPageContent>
      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            disabled={!selectedDateRangeIsValid}
            onClick={handlePrintLogReport}
          >
            {t("instrumentScreens.snap.reports.printLog")}
          </Button>
          <Button
            disabled={!selectedDateRangeIsValid}
            onClick={handlePrintSummaryReport}
          >
            {t("instrumentScreens.snap.reports.printSummary")}
          </Button>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.back")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
      {reportUrl && (
        <PrintPreview
          data-testid={TestId.PrintPreview}
          open={true}
          url={reportUrl}
          headerContent={printPreviewHeader}
          printJobName={t("general.printJobs.report")}
          onClose={handlePrintPreviewClose}
          onConfirm={handlePrintPreviewClose}
        />
      )}
    </InstrumentPageRoot>
  );
}
