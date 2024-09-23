import { defineConfig } from "cypress";
import { E2ETasks } from "./cypress/util/tasks/e2e-tasks";
import { setApiTargets } from "./cypress/util/tasks/api-services";
import fetch from "node-fetch";
import {
  FetchAPI,
  initializeApiServices as initializeSimulatorApiServices,
} from "./cypress/util/instrument-simulator";
import { initializeApiServices as initializeIvlsApiServices } from "@viewpoint/api";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";
import registerRp from "@reportportal/agent-js-cypress/lib/plugin";
import ipc from "node-ipc";
import { EventForwarder } from "./cypress/util/EventForwarder";

const IS_CI = process.env.CI === "true";

const RP_OPTIONS = getReportPortalReporterOptions();

// When using report portal, define the specPattern here in the config rather than
// command line because the Cypress reporter doesn't have access to the --spec command line arg,
// and requires the specPattern to accurately count the total number of tests for the run.
const AUTOMATION_SUITE: "UI" | "E2E" | "EXPORTS" = process.env
  .AUTOMATION_SUITE as "E2E" | "UI" | "EXPORTS" | undefined;

const cfg: Cypress.ConfigOptions = {
  defaultCommandTimeout: 10000,
  e2e: {
    retries: IS_CI ? 2 : undefined,
    specPattern:
      AUTOMATION_SUITE == null
        ? "cypress/**/*.cy.{js,jsx,ts,tsx}"
        : `cypress/${AUTOMATION_SUITE.toLowerCase()}/**/*.cy.{js,jsx,ts,tsx}`,
    setupNodeEvents(cypressOn, config) {
      // Cypress's "on" function only allows one hook per event
      const eventForwarder = new EventForwarder();
      const on = eventForwarder.on;

      if (RP_OPTIONS != null) {
        // Register the report portal plugin
        registerRp(on, config);

        // Fix for issue with RP reporter that causes the config to not make it to the reporter
        ipc.config.retry = 15;

        // Track flaky tests via RP attributes -- Cypress only provides after:spec which runs
        // when the whole test file completes, but after:screenshot will fire
        // whenever an individual test fails, and includes the attempt count
        on("after:screenshot", (testDetails) => {
          if (testDetails.testFailure) {
            ipc.of.reportportal.emit("addAttributes", {
              attributes: [
                {
                  key: "flaky",
                  value: "true",
                },
                {
                  key: "retryCount",
                  value: ((testDetails as any).testAttemptIndex ?? 0) + 1,
                },
              ],
            });
            ipc.of.reportportal.emit("setStatus", {
              status: "failed",
            });
          }
        });
      }
      installLogsPrinter(on);

      // Set up configs
      setApiTargets({
        ivlsTarget: config.env.IVLS_TARGET ?? "127.0.0.1:50042",
        irisTarget: config.env.IRIS_TARGET ?? "127.0.0.1:50045",
      });
      initializeIvlsApiServices(fetch);
      initializeSimulatorApiServices(fetch as unknown as FetchAPI); // node-fetch doesn't include formData field in the response for some reason, but we don't care about that
      on("task", E2ETasks);

      eventForwarder.forward(cypressOn);
    },
    // This can be overridden with an env var CYPRESS_BASE_URL
    baseUrl: "http://127.0.0.1:5173",
    viewportWidth: 1024,
    viewportHeight: 768,
  },

  experimentalMemoryManagement: true, // attempt to prevent browser crash in github actions
  numTestsKeptInMemory: 0, // attempt to prevent browser crash in github actions

  chromeWebSecurity: false,
  video: false,

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
};

if (RP_OPTIONS != null) {
  // Cypress can't handle NPM workspaces for reporters, will only resolve ones that
  // live in node_modules of the automation workspace.
  cfg.reporter = "../../node_modules/@reportportal/agent-js-cypress";
  cfg.reporterOptions = {
    ...RP_OPTIONS,
  };
}

function getReportPortalReporterOptions():
  | Cypress.ConfigOptions["reporterOptions"]
  | undefined {
  const reporterOptions: Cypress.ConfigOptions["reporterOptions"] = {
    apiKey: process.env.RP_API_KEY,
    endpoint: process.env.RP_ENDPOINT,
    project: process.env.RP_PROJECT,
    launch: process.env.RP_LAUNCH_NAME ?? "viewpoint-automation",
    autoMerge: true,
  };

  if (
    reporterOptions.apiKey != null &&
    reporterOptions.endpoint != null &&
    reporterOptions.project != null
  ) {
    return reporterOptions;
  }
}

export default defineConfig(cfg);
