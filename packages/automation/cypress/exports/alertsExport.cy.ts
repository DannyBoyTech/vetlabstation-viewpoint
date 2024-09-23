import {
  randomAlertDto,
  randomInstrumentDto,
  randomInstrumentStatus,
  RUNNABLE_INSTRUMENT_TYPES,
  RunnableInstrumentType,
} from "@viewpoint/test-utils";
import {
  CatalystDxAlerts,
  InstrumentStatus,
  ProCyteDxAlerts,
  ProCyteOneAlerts,
  CatalystOneAlerts,
  CoagDxAlerts,
  InVueDxAlerts,
  SediVueAlerts,
  UAAnalyzerAlerts,
  UriSysDxAlerts,
  VetTestAlerts,
} from "@viewpoint/api";
import { interceptRequestsForHomeScreen } from "../util/default-intercepts";
import { INSTRUMENT_NAMES } from "../util/translation-utils";

const INSTRUMENT_TYPES = RUNNABLE_INSTRUMENT_TYPES.sort((a, b) =>
  INSTRUMENT_NAMES[a].localeCompare(INSTRUMENT_NAMES[b])
);

// Exports screenshots and JSON data containing content of all supported alerts within ViewPoint
describe("alert exports", () => {
  const INSTRUMENT_TYPE_ALERT_MAPPINGS: Record<
    RunnableInstrumentType,
    string[]
  > = {
    ACADIA_DX: Object.values(ProCyteOneAlerts),
    AUTOREADER: [],
    CATALYST_DX: Object.values(CatalystDxAlerts),
    CATONE: Object.values(CatalystOneAlerts),
    COAG_DX: Object.values(CoagDxAlerts),
    CRIMSON: Object.values(ProCyteDxAlerts),
    SNAP: [],
    SNAPPRO: [],
    SNAPSHOT_DX: [],
    TENSEI: [],
    THEIA: Object.values(InVueDxAlerts),
    UA_ANALYZER: Object.values(UAAnalyzerAlerts),
    URISED: Object.values(SediVueAlerts),
    URISYS_DX: Object.values(UriSysDxAlerts),
    VETLYTE: [],
    VETSTAT: [],
    VETTEST: Object.values(VetTestAlerts),
  };

  before(() => {
    cy.writeFile(
      `cypress/screenshots/alertsExport.cy.ts/instruments.json`,
      JSON.stringify(INSTRUMENT_TYPES, null, 2)
    );
  });

  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  for (const instrumentType of INSTRUMENT_TYPES as RunnableInstrumentType[]) {
    const alerts = INSTRUMENT_TYPE_ALERT_MAPPINGS[instrumentType];
    if (alerts.length > 0) {
      for (const alertName of alerts) {
        it(`captures alert ${alertName} for instrument ${instrumentType}`, () => {
          const instrument = randomInstrumentStatus({
            instrumentStatus: InstrumentStatus.Alert,
            connected: true,
            instrument: randomInstrumentDto({
              instrumentType,
            }),
          });

          cy.intercept({ method: "GET", pathname: "**/api/device/status" }, [
            instrument,
          ]).as("instrumentStatus");

          const metadata = {
            alerts,
            instrumentType,
            instrumentName: INSTRUMENT_NAMES[instrumentType],
          };
          cy.writeFile(
            `cypress/screenshots/alertsExport.cy.ts/${instrumentType}/metadata.json`,
            JSON.stringify(metadata, null, 2)
          );

          const exportPath = `/${instrumentType}/${alertName}`;
          cy.intercept(
            { method: "GET", pathname: "**/api/instruments/alerts" },
            [
              {
                instrumentId: instrument.instrument.id,
                alerts: [
                  randomAlertDto({
                    name: alertName,
                    uniqueId: alertName,
                  }),
                ],
              },
            ]
          ).as(`instrumentAlerts-${alertName}`);

          cy.visit("/");
          cy.wait(["@instrumentStatus", `@instrumentAlerts-${alertName}`]);

          cy.get(".analyzer-status").first().click();

          // Take a screenshot
          cy.getByTestId("alert-modal-content")
            .should("be.visible")
            .screenshot(`/${exportPath}`, {
              overwrite: true,
            });

          // Gather alert content
          cy.getByTestId("alert-modal-content").then((alertModalElement) => {
            const primaryTitle = alertModalElement
              .find("[data-testid='alert-title']")
              .text();
            const secondaryTitle = alertModalElement
              .find("[data-testid='current-collection']")
              .text();
            const body = alertModalElement
              .find("[data-testid='alert-text-content']")
              .text();
            const buttons = alertModalElement
              .find("[data-testid='alert-actions-container']")
              .find(".spot-button")
              .get()
              .map((el) => el.textContent);
            const data = {
              primaryTitle,
              secondaryTitle,
              body,
              buttons,
            };
            cy.writeFile(
              `cypress/screenshots/alertsExport.cy.ts/${exportPath}.json`,
              JSON.stringify(data, null, 2)
            );
          });
        });
      }
    }
  }
});
