import { LabRequestDto, LabRequestRecordDto } from "@viewpoint/api";
import dayjs from "dayjs";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Fragment, useMemo } from "react";
import { PatientProfilePopover } from "../../screens/PatientProfilePopover";
import { Button, SpotText, Tabs } from "@viewpoint/spot-react";
import { LocalizedPatientSignalment } from "../localized-signalment/LocalizedPatientSignalment";
import { useFormatDayOfMonth } from "../../utils/hooks/datetime";
import { isQcRequest } from "../../utils/run-utils";

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px 15px 0px 15px;
  border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};

  .spot-patient-display {
    flex: 1;
  }
`;
const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
const YearTab = styled.div<{ index: number }>`
  align-self: center;
  margin-right: 10px;
  ${(p) => (p.index > 0 ? "margin-left: 45px;" : "")}
`;

const ButtonContainer = styled.div`
  margin-left: auto;
  display: flex;
  gap: 10px;
`;

// Unset the z-index on the tab bar buttons on this page -- it's not required
// for the tab bar, and the fact that the bar is in a separate stacking context from
// the edit results manual entry slide out causes the buttons to appear
// over that slide out even if the slide out has a higher z-index. Removing
// this z-index removes the stacking context from the tab bar.
const StyledTabBar = styled(Tabs.TabBar)`
  & > .spot-tabs__scroll-button {
    z-index: unset;
  }
`;

interface ResultsPageHeaderProps {
  labRequestId: number;
  labRequest: LabRequestDto;
  records: LabRequestRecordDto[];
  onRecordSelected: (record: LabRequestRecordDto) => void;
}

export const TestId = {
  Header: "results-page-header",
  HistoricalTab: (labRequestId: number) =>
    `results-page-historical-tab-${labRequestId}`,
};

export function ResultsPageHeader(props: ResultsPageHeaderProps) {
  const { t } = useTranslation();
  const formatDayOfMonth = useFormatDayOfMonth();
  const nav = useNavigate();

  const records = useMemo(
    () => splitRecordsByYear(props.records),
    [props.records]
  );

  return (
    <HeaderContainer>
      <HeaderRow data-testid={TestId.Header}>
        <LocalizedPatientSignalment
          size="small"
          patient={props.labRequest.patientDto}
          additionalPatientDetail={
            <PatientProfilePopover patient={props.labRequest.patientDto} />
          }
        />

        <ButtonContainer>
          <Button buttonType="secondary" onClick={() => nav(-1)}>
            {t("general.buttons.back")}
          </Button>
          <Button
            disabled={isQcRequest(props.labRequest)}
            onClick={() =>
              nav(
                `/labRequest/build?originalLabRequestId=${props.labRequest.id}`
              )
            }
          >
            {t("resultsPage.buttons.addTest")}
          </Button>
        </ButtonContainer>
      </HeaderRow>

      <Tabs scrollable>
        <StyledTabBar scrollable>
          {records.map((yearRecords, index) => (
            <Fragment key={yearRecords.year}>
              <YearTab index={index}>
                <SpotText level="secondary">{yearRecords.year}</SpotText>
              </YearTab>

              {yearRecords.records.map((record) => (
                <Tabs.Tab
                  key={record.labRequestId}
                  active={record.labRequestId === props.labRequestId}
                  onClick={() => props.onRecordSelected(record)}
                  data-testid={TestId.HistoricalTab(record.labRequestId)}
                >
                  {formatDayOfMonth(record.labRequestDate)}
                </Tabs.Tab>
              ))}
            </Fragment>
          ))}
        </StyledTabBar>
      </Tabs>
    </HeaderContainer>
  );
}

interface SplitRecords {
  year: number;
  records: LabRequestRecordDto[];
}

function splitRecordsByYear(records: LabRequestRecordDto[]) {
  const allSplitRecords: SplitRecords[] = [];
  const years: Record<number, SplitRecords> = {};
  for (const record of records) {
    const year = dayjs(record.labRequestDate).year();
    if (!years[year]) {
      years[year] = { year, records: [] };
      allSplitRecords.push(years[year]);
    }
    years[year].records.push(record);
  }

  return allSplitRecords;
}
