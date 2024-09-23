import {
  Divider,
  SettingsPageContent,
  SettingsPageRoot,
} from "./common-settings-components";
import styled from "styled-components";
import {
  Button,
  Select,
  SpotText,
  Toggle,
  Checkbox,
} from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import {
  FeatureFlagName,
  HematologyCodes,
  ResultColor,
  ResultReportFormat,
  SettingTypeEnum,
  TestResultsOrder,
} from "@viewpoint/api";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { useNavigate } from "react-router-dom";
import { useFeatureFlagQuery } from "../../api/FeatureFlagApi";

const ColumnsRoot = styled.div`
  display: flex;
  gap: 30px;
`;

const Column = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 15px;
`;

const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TestId = {
  resultsOrderSection: "results-order-section",
  reportFormatSection: "report-format-section",
  reportsHematologySection: "reports-hematology-section",
  outOfRangeSection: "out-of-range-section",
  reportsUrinalysisSection: "reports-urinalysis-section",
  resultsOrderSelection: "results-order-selection",
  reportFormatSelection: "report-format-selection",
  messageCodesSelection: "message-codes-selection",
  outOfRangeHigh: "out-of-range-high",
  outOfRangeLow: "out-of-range-low",
  urinalysisAbnormalColor: "urinalysis-abnormal-color",
  editHeaderButton: "edit-header-button",
} as const;

export function ReportSettings() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const { data: settings, isLoading } = useGetSettingsQuery([
    SettingTypeEnum.PRINT_TEST_RESULTS_ORDER,
    SettingTypeEnum.PRINT_RESULT_REPORT_FORMAT,
    SettingTypeEnum.DISPLAY_ENGLISH_ASSAY_NAME,
    SettingTypeEnum.PRINT_HEMATOLOGY_MESSAGE_CODES,
    SettingTypeEnum.DISPLAY_PROCYTE_INTERPRETIVE_COMMENTS,
    SettingTypeEnum.PRINT_PROCYTE_DOT_PLOTS,
    SettingTypeEnum.PRINT_LASERCYTE_DOT_PLOTS,
    SettingTypeEnum.PRINT_PROCYTE_ONE_DOT_PLOTS,
    SettingTypeEnum.OUT_OF_RANGE_RESULTS_HIGH,
    SettingTypeEnum.OUT_OF_RANGE_RESULTS_LOW,
    SettingTypeEnum.DISPLAY_URINALYSIS_INTERPRETIVE_COMMENTS,
    SettingTypeEnum.ABNORMAL_RESULT_COLOR,
    SettingTypeEnum.PRINT_INVUE_IMAGES,
  ]);

  const [updateSetting, updateSettingStatus] = useUpdateSettingMutation();
  const { data: isTheiaResultsEnabled } = useFeatureFlagQuery(
    FeatureFlagName.THEIA_RESULTS
  );

  const handleSettingChanged = (
    settingType: SettingTypeEnum,
    settingValue: string
  ) => {
    updateSetting({ settingType, settingValue });
  };

  const controlsDisabled = isLoading || updateSettingStatus.isLoading;

  return (
    <SettingsPageRoot>
      {isLoading && <SpinnerOverlay />}
      <SettingsPageContent>
        <Header>
          <SpotText level="h3">{t("settings.reports.title")}</SpotText>

          <Button
            data-testid={TestId.editHeaderButton}
            buttonType="link"
            leftIcon="edit"
            onClick={() => nav("header")}
          >
            {t("settings.reports.editHeader.title")}
          </Button>
        </Header>
        <ColumnsRoot>
          <Column>
            <TestResultsOrderSection
              settingValues={settings}
              controlsDisabled={controlsDisabled}
              onSettingChanged={handleSettingChanged}
            />

            <Divider />

            <TestReportFormatSection
              settingValues={settings}
              controlsDisabled={controlsDisabled}
              onSettingChanged={handleSettingChanged}
            />

            <Divider />

            <HematologySection
              settingValues={settings}
              controlsDisabled={controlsDisabled}
              onSettingChanged={handleSettingChanged}
            />
          </Column>

          <Column>
            <OutOfRangeResultsSection
              settingValues={settings}
              controlsDisabled={controlsDisabled}
              onSettingChanged={handleSettingChanged}
            />

            <Divider />

            <UrinalysisSection
              settingValues={settings}
              controlsDisabled={controlsDisabled}
              onSettingChanged={handleSettingChanged}
            />

            {isTheiaResultsEnabled && (
              <>
                <Divider />
                <InVueSection
                  settingValues={settings}
                  controlsDisabled={controlsDisabled}
                  onSettingChanged={handleSettingChanged}
                />
              </>
            )}
          </Column>
        </ColumnsRoot>
      </SettingsPageContent>
    </SettingsPageRoot>
  );
}

interface SettingSectionProps {
  controlsDisabled: boolean;
  settingValues?: { [key in SettingTypeEnum]?: string };
  onSettingChanged: (
    settingType: SettingTypeEnum,
    settingValue: string
  ) => void;
}

function TestResultsOrderSection(props: SettingSectionProps) {
  const { t } = useTranslation();
  return (
    <GroupContainer data-testid={TestId.resultsOrderSection}>
      <SelectContainer>
        <SpotText level="paragraph" bold>
          {t("settings.reports.labels.testResultsOrder")}
        </SpotText>
        <Select
          data-testid={TestId.resultsOrderSelection}
          disabled={props.controlsDisabled}
          value={
            props.settingValues?.[SettingTypeEnum.PRINT_TEST_RESULTS_ORDER]
          }
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.PRINT_TEST_RESULTS_ORDER,
              ev.target.value
            )
          }
        >
          {Object.values(TestResultsOrder).map((testResultOrder) => (
            <Select.Option key={testResultOrder} value={testResultOrder}>
              {t(`settings.reports.resultsOrder.${testResultOrder}`)}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>
    </GroupContainer>
  );
}

function TestReportFormatSection(props: SettingSectionProps) {
  const { t } = useTranslation();
  return (
    <GroupContainer data-testid={TestId.reportFormatSection}>
      <SelectContainer>
        <SpotText level="paragraph" bold>
          {t("settings.reports.labels.testResultsFormat")}
        </SpotText>
        <Select
          data-testid={TestId.reportFormatSelection}
          disabled={props.controlsDisabled}
          value={
            props.settingValues?.[SettingTypeEnum.PRINT_RESULT_REPORT_FORMAT]
          }
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.PRINT_RESULT_REPORT_FORMAT,
              ev.target.value
            )
          }
        >
          {Object.values(ResultReportFormat).map((reportFormat) => (
            <Select.Option key={reportFormat} value={reportFormat}>
              {t(`settings.reports.reportFormat.${reportFormat}`)}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>

      <Toggle
        checked={
          props.settingValues?.[SettingTypeEnum.DISPLAY_ENGLISH_ASSAY_NAME] ===
          "true"
        }
        onChange={(ev) =>
          props.onSettingChanged(
            SettingTypeEnum.DISPLAY_ENGLISH_ASSAY_NAME,
            `${ev.target.checked}`
          )
        }
        label={t("settings.reports.labels.englishAssayNames")}
      />
    </GroupContainer>
  );
}

const CheckBoxContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

function HematologySection(props: SettingSectionProps) {
  const { t } = useTranslation();

  return (
    <GroupContainer data-testid={TestId.reportsHematologySection}>
      <SpotText level="paragraph" bold>
        {t("instruments.categories.hematology")}
      </SpotText>
      <SelectContainer>
        <SpotText level="paragraph">
          {t("settings.reports.labels.messageCodes")}
        </SpotText>

        <Select
          data-testid={TestId.messageCodesSelection}
          disabled={props.controlsDisabled}
          value={
            props.settingValues?.[
              SettingTypeEnum.PRINT_HEMATOLOGY_MESSAGE_CODES
            ]
          }
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.PRINT_HEMATOLOGY_MESSAGE_CODES,
              ev.target.value
            )
          }
        >
          {Object.values(HematologyCodes).map((messageCode) => (
            <Select.Option key={messageCode} value={messageCode}>
              {t(`settings.reports.hematologyCodes.${messageCode}`)}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>

      <Toggle
        checked={
          props.settingValues?.[
            SettingTypeEnum.DISPLAY_PROCYTE_INTERPRETIVE_COMMENTS
          ] === "true"
        }
        onChange={(ev) =>
          props.onSettingChanged(
            SettingTypeEnum.DISPLAY_PROCYTE_INTERPRETIVE_COMMENTS,
            `${ev.target.checked}`
          )
        }
        label={t("settings.reports.labels.resultsBasedComments")}
      />

      <SpotText level="paragraph">
        {t("settings.reports.labels.printDotPlots")}
      </SpotText>

      <CheckBoxContainer>
        <Checkbox
          disabled={props.controlsDisabled}
          checked={
            props.settingValues?.[SettingTypeEnum.PRINT_PROCYTE_DOT_PLOTS] ===
            "true"
          }
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.PRINT_PROCYTE_DOT_PLOTS,
              `${ev.target.checked}`
            )
          }
          label={t("instruments.names.CRIMSON")}
        />
        <Checkbox
          disabled={props.controlsDisabled}
          checked={
            props.settingValues?.[
              SettingTypeEnum.PRINT_PROCYTE_ONE_DOT_PLOTS
            ] === "true"
          }
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.PRINT_PROCYTE_ONE_DOT_PLOTS,
              `${ev.target.checked}`
            )
          }
          label={t("instruments.names.ACADIA_DX")}
        />
      </CheckBoxContainer>
    </GroupContainer>
  );
}

function OutOfRangeResultsSection(props: SettingSectionProps) {
  const { t } = useTranslation();
  return (
    <GroupContainer data-testid={TestId.outOfRangeSection}>
      <SpotText level="paragraph" bold>
        {t("settings.reports.labels.outOfRange")}
      </SpotText>
      <SelectContainer>
        <SpotText level="paragraph">
          {t("settings.reports.labels.highResults")}
        </SpotText>
        <Select
          data-testid={TestId.outOfRangeHigh}
          disabled={props.controlsDisabled}
          value={
            props.settingValues?.[SettingTypeEnum.OUT_OF_RANGE_RESULTS_HIGH]
          }
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.OUT_OF_RANGE_RESULTS_HIGH,
              ev.target.value
            )
          }
        >
          {Object.values(ResultColor).map((resultColor) => (
            <Select.Option key={resultColor} value={resultColor}>
              {t(`settings.reports.colors.${resultColor}`)}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>

      <SelectContainer>
        <SpotText level="paragraph">
          {t("settings.reports.labels.lowResults")}
        </SpotText>
        <Select
          data-testid={TestId.outOfRangeLow}
          disabled={props.controlsDisabled}
          value={
            props.settingValues?.[SettingTypeEnum.OUT_OF_RANGE_RESULTS_LOW]
          }
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.OUT_OF_RANGE_RESULTS_LOW,
              ev.target.value
            )
          }
        >
          {Object.values(ResultColor).map((resultColor) => (
            <Select.Option key={resultColor} value={resultColor}>
              {t(`settings.reports.colors.${resultColor}`)}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>
    </GroupContainer>
  );
}

function UrinalysisSection(props: SettingSectionProps) {
  const { t } = useTranslation();
  return (
    <GroupContainer data-testid={TestId.reportsUrinalysisSection}>
      <SpotText level="paragraph" bold>
        {t("instruments.categories.urinalysis")}
      </SpotText>

      <Toggle
        checked={
          props.settingValues?.[
            SettingTypeEnum.DISPLAY_URINALYSIS_INTERPRETIVE_COMMENTS
          ] === "true"
        }
        onChange={(ev) =>
          props.onSettingChanged(
            SettingTypeEnum.DISPLAY_URINALYSIS_INTERPRETIVE_COMMENTS,
            `${ev.target.checked}`
          )
        }
        label={t("settings.reports.labels.resultsBasedComments")}
      />

      <SelectContainer>
        <SpotText level="paragraph">
          {t("settings.reports.labels.abnormalResults")}
        </SpotText>

        <Select
          data-testid={TestId.urinalysisAbnormalColor}
          disabled={props.controlsDisabled}
          value={props.settingValues?.[SettingTypeEnum.ABNORMAL_RESULT_COLOR]}
          onChange={(ev) =>
            props.onSettingChanged(
              SettingTypeEnum.ABNORMAL_RESULT_COLOR,
              ev.target.value
            )
          }
        >
          {Object.values(ResultColor).map((resultColor) => (
            <Select.Option key={resultColor} value={resultColor}>
              {t(`settings.reports.colors.${resultColor}`)}
            </Select.Option>
          ))}
        </Select>
      </SelectContainer>
    </GroupContainer>
  );
}

function InVueSection(props: SettingSectionProps) {
  const { t } = useTranslation();
  return (
    <GroupContainer data-testid={TestId.reportsUrinalysisSection}>
      <SpotText level="paragraph" bold>
        {t("instruments.names.THEIA")}
      </SpotText>
      <Toggle
        checked={
          props.settingValues?.[SettingTypeEnum.PRINT_INVUE_IMAGES] === "true"
        }
        onChange={(ev) =>
          props.onSettingChanged(
            SettingTypeEnum.PRINT_INVUE_IMAGES,
            `${ev.target.checked}`
          )
        }
        label={t("settings.reports.labels.inVueImageDisplay")}
      />
    </GroupContainer>
  );
}
