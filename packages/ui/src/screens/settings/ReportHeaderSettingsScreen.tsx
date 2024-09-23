import styled from "styled-components";
import { Button, Input, Select, SpotText, Toggle } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { unstable_useBlocker as useBlocker, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  useBatchUpdateSettingsMutation,
  useGetSettingsQuery,
} from "../../api/SettingsApi";
import { ReportHeaderOptions, SettingTypeEnum } from "@viewpoint/api";
import { CancelConfirmationModal } from "../../components/confirm-modal/CancelConfirmationModal";
import { InputAware } from "../../components/InputAware";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { useHeaderTitle } from "../../utils/hooks/hooks";
import {
  PageContent,
  PageRightPanel,
  PageRightPanelButtonContainer,
  PageRoot,
} from "../../components/layout/common-layout-components";

const Content = styled(PageContent)`
  display: flex;
  flex-direction: column;
  overflow-y: unset;
  gap: 20px;
`;

const ToggleContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SelectContainer = styled(InputContainer)`
  max-width: 200px;
`;

const BlankLineOptions = new Array(15).fill(1).map((_v, index) => index);

export const TestId = {
  LineOneInput: "report-header-settings-line1-input",
  LineTwoInput: "report-header-settings-line2-input",
  LineThreeInput: "report-header-settings-line3-input",
  PrintHeaderToggle: "report-header-settings-print-header-toggle",
  PrintLinesDropdown: "report-header-settings-print-lines-dropdown",
  editHeaderMain: "edit-header-main",
  editHeaderMainOk: "edit-header-main-ok",
  editHeaderMainCancel: "edit-header-main-cancel",
};

export function ReportHeaderSettingsScreen() {
  const { t } = useTranslation();
  useHeaderTitle({
    label: t("settings.reports.editReportHeader"),
  });
  const [hasSaved, setHasSaved] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lineOne, setLineOne] = useState("");
  const [lineTwo, setLineTwo] = useState("");
  const [lineThree, setLineThree] = useState("");

  const { data: settings, isLoading } = useGetSettingsQuery([
    SettingTypeEnum.PRINT_HEADER_LINE_1,
    SettingTypeEnum.PRINT_HEADER_LINE_2,
    SettingTypeEnum.PRINT_HEADER_LINE_3,
    SettingTypeEnum.PRINT_REPORT_HEADER_OPTION,
    SettingTypeEnum.PRINT_LINES_FOR_LETTERHEAD,
  ]);

  const numLines =
    settings?.[SettingTypeEnum.PRINT_REPORT_HEADER_OPTION] ===
    ReportHeaderOptions.NO_HEADER
      ? 0
      : parseInt(settings?.[SettingTypeEnum.PRINT_LINES_FOR_LETTERHEAD] ?? "0");

  const reportHeaderOption =
    settings?.[SettingTypeEnum.PRINT_REPORT_HEADER_OPTION] ??
    ReportHeaderOptions.NO_HEADER;

  const [updateSettings, updateSettingsStatus] =
    useBatchUpdateSettingsMutation();

  useEffect(() => {
    if (!hasLoaded && settings != null) {
      setLineOne(settings[SettingTypeEnum.PRINT_HEADER_LINE_1] ?? "");
      setLineTwo(settings[SettingTypeEnum.PRINT_HEADER_LINE_2] ?? "");
      setLineThree(settings[SettingTypeEnum.PRINT_HEADER_LINE_3] ?? "");
      setHasLoaded(true);
    }
  }, [settings, hasLoaded]);

  const nav = useNavigate();
  const blocker = useBlocker(
    !hasSaved &&
      settings?.[SettingTypeEnum.PRINT_REPORT_HEADER_OPTION] ===
        ReportHeaderOptions.PRINT_HEADER &&
      (lineOne !== (settings?.[SettingTypeEnum.PRINT_HEADER_LINE_1] ?? "") ||
        lineTwo !== (settings?.[SettingTypeEnum.PRINT_HEADER_LINE_2] ?? "") ||
        lineThree !== (settings?.[SettingTypeEnum.PRINT_HEADER_LINE_3] ?? ""))
  );

  const saveLines = async () => {
    try {
      setHasSaved(true);
      await updateSettings([
        {
          settingType: SettingTypeEnum.PRINT_HEADER_LINE_1,
          settingValue: lineOne,
        },
        {
          settingType: SettingTypeEnum.PRINT_HEADER_LINE_2,
          settingValue: lineTwo,
        },
        {
          settingType: SettingTypeEnum.PRINT_HEADER_LINE_3,
          settingValue: lineThree,
        },
      ]).unwrap();
      nav(-1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageRoot>
      {isLoading && <SpinnerOverlay />}
      <Content data-testid={TestId.editHeaderMain}>
        <ToggleContainer>
          <Toggle
            data-testid={TestId.PrintHeaderToggle}
            disabled={updateSettingsStatus.isLoading}
            checked={reportHeaderOption === ReportHeaderOptions.PRINT_HEADER}
            onChange={(ev) => {
              let newReportHeaderOption: ReportHeaderOptions;

              if (ev.target.checked) {
                newReportHeaderOption = ReportHeaderOptions.PRINT_HEADER;
              } else {
                newReportHeaderOption =
                  numLines > 0
                    ? ReportHeaderOptions.LEAVE_HEADER_SPACE
                    : ReportHeaderOptions.NO_HEADER;
              }

              updateSettings([
                {
                  settingType: SettingTypeEnum.PRINT_REPORT_HEADER_OPTION,
                  settingValue: newReportHeaderOption,
                },
              ]);
            }}
            label={t("settings.reports.header.printHeader")}
          />
        </ToggleContainer>

        {reportHeaderOption === ReportHeaderOptions.PRINT_HEADER ? (
          <PrintHeaderContent
            lineOneText={lineOne}
            lineTwoText={lineTwo}
            lineThreeText={lineThree}
            onLineOneChanged={setLineOne}
            onLineTwoChanged={setLineTwo}
            onLineThreeChanged={setLineThree}
          />
        ) : (
          <DontPrintHeaderContent
            numLines={numLines}
            onChange={(newNumLines) => {
              const newReportHeaderOption =
                newNumLines === 0
                  ? ReportHeaderOptions.NO_HEADER
                  : ReportHeaderOptions.LEAVE_HEADER_SPACE;
              updateSettings([
                {
                  settingType: SettingTypeEnum.PRINT_REPORT_HEADER_OPTION,
                  settingValue: newReportHeaderOption,
                },
                {
                  settingType: SettingTypeEnum.PRINT_LINES_FOR_LETTERHEAD,
                  settingValue: `${newNumLines}`,
                },
              ]);
            }}
          />
        )}
      </Content>

      <PageRightPanel>
        <PageRightPanelButtonContainer>
          <Button
            data-testid={TestId.editHeaderMainOk}
            onClick={saveLines}
            disabled={hasSaved}
          >
            {t("general.buttons.ok")}
          </Button>
          <Button
            data-testid={TestId.editHeaderMainCancel}
            buttonType="secondary"
            onClick={() => nav(-1)}
          >
            {t("general.buttons.back")}
          </Button>
        </PageRightPanelButtonContainer>
      </PageRightPanel>

      {blocker.state === "blocked" && (
        <CancelConfirmationModal
          open={true}
          onClose={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
        />
      )}
    </PageRoot>
  );
}

interface PrintHeaderContent {
  lineOneText: string;
  onLineOneChanged: (v: string) => void;
  lineTwoText: string;
  onLineTwoChanged: (v: string) => void;
  lineThreeText: string;
  onLineThreeChanged: (v: string) => void;
}

function PrintHeaderContent(props: PrintHeaderContent) {
  const { t } = useTranslation();
  return (
    <>
      <InputContainer>
        <SpotText level="paragraph">
          {t("settings.reports.header.lineOne")}
        </SpotText>
        <InputAware>
          <Input
            autoFocus
            data-testid={TestId.LineOneInput}
            maxLength={255}
            value={props.lineOneText}
            onChange={(ev) => props.onLineOneChanged(ev.target.value)}
            type="search"
          />
        </InputAware>
      </InputContainer>

      <InputContainer>
        <SpotText level="paragraph">
          {t("settings.reports.header.lineTwo")}
        </SpotText>
        <InputAware>
          <Input
            data-testid={TestId.LineTwoInput}
            maxLength={255}
            value={props.lineTwoText}
            onChange={(ev) => props.onLineTwoChanged(ev.target.value)}
            type="search"
          />
        </InputAware>
      </InputContainer>

      <InputContainer>
        <SpotText level="paragraph">
          {t("settings.reports.header.lineThree")}
        </SpotText>
        <InputAware>
          <Input
            data-testid={TestId.LineThreeInput}
            maxLength={255}
            value={props.lineThreeText}
            onChange={(ev) => props.onLineThreeChanged(ev.target.value)}
            type="search"
          />
        </InputAware>
      </InputContainer>
    </>
  );
}

interface DontPrintHeaderContentProps {
  numLines: number;
  onChange: (numLines: number) => void;
}

function DontPrintHeaderContent(props: DontPrintHeaderContentProps) {
  const { t } = useTranslation();
  return (
    <SelectContainer>
      <SpotText level="paragraph" bold>
        {t("settings.reports.header.blankLines")}
      </SpotText>
      <Select
        data-testid={TestId.PrintLinesDropdown}
        value={props.numLines}
        onChange={(ev) => props.onChange(parseInt(ev.target.value))}
      >
        {BlankLineOptions.map((numLines) => (
          <Select.Option key={numLines} value={numLines}>
            {numLines === 0
              ? t("settings.reports.header.dontPrint")
              : `${numLines}`}
          </Select.Option>
        ))}
      </Select>
    </SelectContainer>
  );
}
