import { useTranslation } from "react-i18next";
import {
  Column,
  Columns,
  Divider,
  PageTitle,
  Section,
  SectionTitle,
  SettingsPageContent,
  SettingsPageRoot,
} from "./common-settings-components";
import styled from "styled-components";
import {
  Button,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  SpotText,
  Toggle as SpotToggle,
} from "@viewpoint/spot-react";
import { ToggleProps } from "@viewpoint/spot-react/src/components/forms/toggle/Toggle";
import { naturals } from "../../utils/general-utils";
import { PaperSize, Printer, SettingTypeEnum } from "@viewpoint/api";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";
import SpinnerOverlay from "../../components/overlay/SpinnerOverlay";
import { useEffect } from "react";
import { useLazyGetPrintersQuery } from "../../api/PrintApi";
import { useClearAllPrintJobs } from "./clearAllPrintJobs";
import { useGetDefaultPrinter } from "../../utils/print/print";

const PRINT_SETTING_KEYS = [
  SettingTypeEnum.AUTOMATICALLY_PRINT,
  SettingTypeEnum.AUTO_PRINT_EXCEPTION_MANUAL_SNAP,
  SettingTypeEnum.AUTO_PRINT_EXCEPTION_SNAPPRO,
  SettingTypeEnum.DEFAULT_PAPER_SIZE,
  SettingTypeEnum.DEFAULT_PRINTER,
  SettingTypeEnum.PRINT_NUMBER_OF_COPIES,
  SettingTypeEnum.PRINT_RESULT_REPORT_NATURAL_PAGE_BREAK,
];

// apply css style to vertically align toggle switch
// NOTE: assumes current fixed height of toggle of 22px (11px == 22px/2)
const ToggleRoot = styled.div`
  .spot-toggle + .spot-toggle-label::before,
  .spot-toggle + .spot-toggle-label::after {
    top: calc(50% - 11px);
  }
`;

/**
 * A modified spot-design toggle that centers the toggle when the label wraps
 * to multiple lines
 */
function Toggle({ className, ...props }: ToggleProps) {
  return (
    <ToggleRoot className={className}>
      <SpotToggle {...props} />
    </ToggleRoot>
  );
}

interface AutoPrintSettingsProps {
  disabled: boolean;

  autoPrint: boolean;
  autoPrintSnap: boolean;
  autoPrintSnapPro: boolean;
  autoPrintCopies: number;

  onChangeAutoPrint: (val: boolean) => void;
  onChangeAutoPrintSnap: (val: boolean) => void;
  onChangeAutoPrintSnapPro: (val: boolean) => void;
  onChangeAutoPrintCopies: (val: number) => void;
}

const TestId = {
  printSettingsScreen: "print-settings-screen",
  autoPrintSettingsSection: "auto-print-section",
  autoPrintSnapPro: "auto-print-snap-pro",
  autoPrintManualSnap: "auto-print-manual-snap",
  autoPrintReports: "auto-print-reports",
  numberOfCopies: "number-of-copies",
  defaultPrinter: "default-printer",
} as const;

function AutoPrintSettings(props: AutoPrintSettingsProps) {
  const { t } = useTranslation();

  const {
    onChangeAutoPrint,
    onChangeAutoPrintSnap,
    onChangeAutoPrintSnapPro,
    onChangeAutoPrintCopies,
  } = props;

  return (
    <Section>
      <SectionTitle>{t("settings.printing.autoPrintSettings")}</SectionTitle>
      <Toggle
        data-testid={TestId.autoPrintReports}
        label={t("settings.printing.autoPrintWhenComplete")}
        disabled={props.disabled}
        checked={props.autoPrint}
        onChange={(ev) => onChangeAutoPrint(ev.target.checked)}
      />
      <Checkbox
        data-testid={TestId.autoPrintManualSnap}
        label={t("settings.printing.doNotAutoPrintManualSNAP")}
        disabled={props.disabled || !props.autoPrint}
        checked={!props.autoPrintSnap}
        onChange={(ev) => onChangeAutoPrintSnap(!ev.target.checked)}
      />
      <Checkbox
        data-testid={TestId.autoPrintSnapPro}
        label={t("settings.printing.doNotAutoPrintSNAPPro")}
        disabled={props.disabled || !props.autoPrint}
        checked={!props.autoPrintSnapPro}
        onChange={(ev) => onChangeAutoPrintSnapPro(!ev.target.checked)}
      />
      <SpotText level="paragraph">
        {t("settings.printing.numberOfCopies")}
      </SpotText>
      <Select
        data-testid={TestId.numberOfCopies}
        value={props.autoPrintCopies}
        disabled={props.disabled || !props.autoPrint}
        onChange={(ev) => onChangeAutoPrintCopies(Number(ev.target.value))}
      >
        {naturals(5).map((it) => (
          <Select.Option key={it} value={it}>
            {it}
          </Select.Option>
        ))}
      </Select>
    </Section>
  );
}

interface PaperSettingsProps {
  disabled?: boolean;
  paperSize?: PaperSize;
  onChangePaperSize: (value: PaperSize) => void;
}

function PaperSettings(props: PaperSettingsProps) {
  const { t } = useTranslation();

  const { onChangePaperSize } = props;

  return (
    <Section>
      <SectionTitle>{t("settings.printing.paperFormat")}</SectionTitle>
      <RadioGroup>
        {Object.values(PaperSize).map((paperSize) => (
          <Radio
            key={paperSize}
            name="paperSize"
            label={t(`settings.printing.paperSize.${paperSize}`)}
            checked={props.paperSize === paperSize}
            onChange={(ev) => {
              if (ev.target.checked) onChangePaperSize(paperSize);
            }}
            disabled={props.disabled}
          />
        ))}
      </RadioGroup>
    </Section>
  );
}

interface PageBreakSettingsProps {
  disabled: boolean;
  naturalPageBreaks: boolean;
  onChangeNaturalPageBreaks: (value: boolean) => void;
}

function PageBreakSettings(props: PageBreakSettingsProps) {
  const { t } = useTranslation();

  const { onChangeNaturalPageBreaks } = props;

  return (
    <Section>
      <SectionTitle>{t("settings.printing.pageBreakOptions")}</SectionTitle>
      <Toggle
        label={t("settings.printing.naturalPageBreaks")}
        checked={props.naturalPageBreaks}
        onChange={(ev) => onChangeNaturalPageBreaks(ev.target.checked)}
      />
    </Section>
  );
}

interface DefaultPrinterSettingsProps {
  disabled: boolean;
  defaultPrinter?: Printer;
  availablePrinters?: Printer[];
  onChangeDefaultPrinter: (defaultPrinter: string) => void;
}

function DefaultPrinterSettings(props: DefaultPrinterSettingsProps) {
  const { t } = useTranslation();

  const { onChangeDefaultPrinter } = props;

  const { clearAllPrintJobs } = useClearAllPrintJobs();

  return (
    <Section>
      <SectionTitle>{t("settings.printing.defaultPrinter")}</SectionTitle>
      <Select
        data-testid={TestId.defaultPrinter}
        value={props.defaultPrinter?.name}
        disabled={props.disabled}
        onChange={(ev) => onChangeDefaultPrinter(ev.target.value)}
      >
        {props.availablePrinters?.map(({ name, displayName }) => (
          <Select.Option key={name} value={name} label={displayName} />
        ))}
      </Select>
      <div>
        <Button onClick={clearAllPrintJobs}>
          {t("settings.printing.clearAllPrintJobs.button")}
        </Button>
      </div>
    </Section>
  );
}

function PrintingSettings() {
  const { t } = useTranslation();
  const { data: settings, isLoading: settingsLoading } =
    useGetSettingsQuery(PRINT_SETTING_KEYS);

  const { data: defaultPrinter, isLoading: defaultPrinterLoading } =
    useGetDefaultPrinter();

  const [
    getAvailablePrinters,
    { data: availablePrinters, isLoading: availablePrintersLoading },
  ] = useLazyGetPrintersQuery();

  const printerDataLoading = defaultPrinterLoading || availablePrintersLoading;

  useEffect(() => {
    getAvailablePrinters();
  }, []);

  const [updateSetting, { isLoading: settingsUpdating }] =
    useUpdateSettingMutation();

  const handleSettingChanged = (
    settingType: SettingTypeEnum,
    settingValue: string
  ) => {
    updateSetting({ settingType, settingValue });
  };

  const controlsDisabled = settingsLoading || settingsUpdating;

  return (
    <SettingsPageRoot>
      {settingsLoading ? <SpinnerOverlay /> : null}
      <SettingsPageContent data-testid={TestId.printSettingsScreen}>
        <PageTitle>{t("settings.printing.title")}</PageTitle>
        <Columns>
          <Column>
            <AutoPrintSettings
              disabled={controlsDisabled}
              autoPrint={settings?.AUTOMATICALLY_PRINT === "true"}
              onChangeAutoPrint={(autoPrint) =>
                handleSettingChanged(
                  SettingTypeEnum.AUTOMATICALLY_PRINT,
                  autoPrint.toString()
                )
              }
              autoPrintSnap={
                !(settings?.AUTOPRINT_EXCEPTION_MANUALSNAP === "true")
              }
              onChangeAutoPrintSnap={(autoPrint) =>
                handleSettingChanged(
                  SettingTypeEnum.AUTO_PRINT_EXCEPTION_MANUAL_SNAP,
                  (!autoPrint).toString()
                )
              }
              autoPrintSnapPro={
                !(settings?.AUTOPRINT_EXCEPTION_SNAPPRO === "true")
              }
              onChangeAutoPrintSnapPro={(autoPrint) =>
                handleSettingChanged(
                  SettingTypeEnum.AUTO_PRINT_EXCEPTION_SNAPPRO,
                  (!autoPrint).toString()
                )
              }
              autoPrintCopies={Number(settings?.PRINT_NUMBER_OF_COPIES ?? 1)}
              onChangeAutoPrintCopies={(copies) =>
                handleSettingChanged(
                  SettingTypeEnum.PRINT_NUMBER_OF_COPIES,
                  copies.toString()
                )
              }
            />
            <Divider />
            <DefaultPrinterSettings
              defaultPrinter={defaultPrinter}
              disabled={printerDataLoading || controlsDisabled}
              availablePrinters={availablePrinters}
              onChangeDefaultPrinter={(defaultPrinter) =>
                handleSettingChanged(
                  SettingTypeEnum.DEFAULT_PRINTER,
                  defaultPrinter
                )
              }
            />
          </Column>
          <Column>
            <PaperSettings
              disabled={controlsDisabled}
              paperSize={settings?.DEFAULT_PAPER_SIZE as PaperSize | undefined}
              onChangePaperSize={(paperSize) =>
                handleSettingChanged(
                  SettingTypeEnum.DEFAULT_PAPER_SIZE,
                  paperSize
                )
              }
            />

            <Divider />

            <PageBreakSettings
              disabled={controlsDisabled}
              naturalPageBreaks={
                settings?.PRINT_RESULT_REPORT_NATURAL_PAGEBREAK === "true"
              }
              onChangeNaturalPageBreaks={(naturalPageBreaks) =>
                handleSettingChanged(
                  SettingTypeEnum.PRINT_RESULT_REPORT_NATURAL_PAGE_BREAK,
                  naturalPageBreaks.toString()
                )
              }
            />
          </Column>
        </Columns>
      </SettingsPageContent>
    </SettingsPageRoot>
  );
}

export { PrintingSettings };
