import "./commands";
import chaiColors from "chai-colors";
import { interceptGlobalRequests } from "../util/default-intercepts";
import LogsCollector from "cypress-terminal-report/src/installLogsCollector";
import fetch from "node-fetch";
import { SettingTypeEnum, SettingDto, InstrumentType } from "@viewpoint/api";
import { isE2ETest } from "../util/tasks/task-utils";
import {
  PDxBarcodes,
  SediVueBarcodes,
  TenseiBarcodes,
} from "../util/data/qc-barcodes";

// Show the whole object when diffs fail
chai.config.truncateThreshold = 0;

// Allow asserting colors using HEX instead of RGB
chai.use(chaiColors);

// Collect browser logs to Cypress console
LogsCollector();

before(() => {
  if (isE2ETest()) {
    // Populate QC data for instruments. This data is global for a given instrument,
    // so it can't really be limited to a single test as there is currently
    // no way to remove an entry.
    cy.task("ivls:save-barcodes", {
      instrumentType: InstrumentType.Tensei,
      barcodes: TenseiBarcodes,
    });
    cy.task("ivls:save-barcodes", {
      instrumentType: InstrumentType.ProCyteDx,
      barcodes: PDxBarcodes,
    });
    cy.task("ivls:save-barcodes", {
      instrumentType: InstrumentType.SediVueDx,
      barcodes: SediVueBarcodes,
    });
  }
});

beforeEach(() => {
  if (isE2ETest()) {
    cy.task("ivls:initialize");
    // Skip first boot sequence
    cy.intercept("GET", "**/api/boot/getBootItems", {
      isFirstBoot: false,
      restoreDto: { restorePerformed: false },
      upgradeStatusDto: { upgradeAttempted: false },
    });
    const ivlsTarget = Cypress.env("IVLS_TARGET") ?? "127.0.0.1:50042";
    // Apply Default E2E setting values
    fetch(`http://${ivlsTarget}/labstation-webapp/api/settings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(
        DEFAULT_E2E_SETTINGS.map((setting) => ({
          ...setting,
          "@class": "com.idexx.labstation.core.dto.SettingDto",
        }))
      ),
    }).catch((err) => console.error(err));
  } else {
    interceptGlobalRequests();
  }
  localStorage.setItem(
    "idexx.viewpoint.welcomeScreenShown",
    JSON.stringify(true)
  );
});

const DEFAULT_E2E_SETTINGS: SettingDto[] = [
  {
    settingType: SettingTypeEnum.AUTOMATICALLY_PRINT,
    settingValue: "false",
  },
  { settingType: SettingTypeEnum.MANUAL_UA_AUTO_ADD, settingValue: "false" },
  {
    settingType: SettingTypeEnum.INVERT_SAMPLE_REMINDER,
    settingValue: "false",
  },
  {
    settingType: SettingTypeEnum.PROCYTE_ONE_INVERT_SAMPLE_REMINDER,
    settingValue: "false",
  },
  {
    settingType: SettingTypeEnum.DISPLAY_SHOW_ALERT,
    settingValue: "false",
  },
  {
    settingType: SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER,
    settingValue: "false",
  },
  {
    settingType: SettingTypeEnum.PPR_ENABLED,
    settingValue: "false",
  },
];
