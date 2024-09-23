import {
  randomCatalystQualityControlDto,
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import dayjs from "dayjs";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";

const catDxQcLots = [
  randomCatalystQualityControlDto({
    instrumentType: InstrumentType.CatalystDx,
    lotNumber: "H3378",
    enabled: true,
    canRun: true,
    controlType: "Adv-Control",
  }),
];
const catDxReady: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    id: 1,
    instrumentType: InstrumentType.CatalystDx,
    instrumentSerialNumber: "CAT001",
    supportsInstrumentScreen: true,
  }),
});

describe("cat dx QC", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept(
      {
        method: "GET",
        pathname: "**/qualityControl/catalyst/lots",
        query: { instrumentId: "1", instrumentType: InstrumentType.CatalystDx },
      },
      catDxQcLots
    );

    cy.intercept("POST", "**/qualityControl", catDxQcLots);

    cy.intercept("GET", "**/device/1/runs?", []);

    cy.intercept("**/api/device/status", [catDxReady]);
    cy.intercept("**/api/device/*/status", catDxReady);
  });

  it("should allow user to run QC and be returned to home screen", () => {
    cy.visit("/instruments/1");
    cy.contains("Quality Control").click();
    cy.containedWithinTestId("qc-lots-main-page", "QC Lot");
    cy.containedWithinTestId("qc-lots-main-page", "QC Type");
    cy.containedWithinTestId("qc-lots-main-page", "Expiration Date");
    cy.containedWithinTestId("qc-lots-main-page", "Most Recent Results");
    cy.containedWithinTestId("qc-lots-main-page", "Quality Control Lots");
    cy.contains("H3378").click();
    cy.containedWithinTestId("catalyst-qc-page-right", "Run QC");
    cy.containedWithinTestId("catalyst-qc-page-right", "View All QC Results");
    cy.containedWithinTestId("catalyst-qc-page-right", "View Lot Results");
    cy.containedWithinTestId(
      "catalyst-qc-page-right",
      "View QC Lot Information"
    );
    cy.containedWithinTestId("catalyst-qc-page-right", "Back");
    cy.contains("Run QC").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow viewing of QC results and show default text if no results", () => {
    cy.visit("/instruments/1/qc");
    cy.contains("H3378").click();
    cy.contains("View All QC Results").click();
    cy.containedWithinTestId("qc-results-modal", "Quality Control Records");
    cy.containedWithinTestId("qc-results-modal", "Analyzer:");
    cy.containedWithinTestId("qc-results-modal", "Control:");
    cy.containedWithinTestId("qc-results-modal", "Lot:");
    cy.containedWithinTestId("qc-results-modal", "No results are available");
    cy.containedWithinTestId("qc-results-modal", "Date and Time");
    cy.containedWithinTestId("qc-results-modal", "Close");
    cy.containedWithinTestId("qc-results-modal", "View Results");
  });

  it("should allow viewing of QC lot information", () => {
    cy.visit("/instruments/1/qc");
    cy.contains("H3378").click();
    cy.contains("View QC Lot Information").click();
    cy.containedWithinTestId("modal", "Catalyst Dx QC Lot Information");
    cy.containedWithinTestId("modal", "Lot:");
    cy.getByTestId("lotNumber").should("contain", catDxQcLots[0].lotNumber);
    cy.containedWithinTestId("modal", "QC Type:");
    cy.getByTestId("qcType").should("contain", catDxQcLots[0].controlType);
    cy.containedWithinTestId("modal", "Expiration:");
    cy.getByTestId("expirationDate").should(
      "contain",
      dayjs(catDxQcLots[0].dateExpires).format("M/DD/YY")
    );
    cy.containedWithinTestId("modal", "Calibration Version:");
    cy.getByTestId("calibrationVersion").should(
      "contain",
      catDxQcLots[0].calibrationVersion
    );
    cy.containedWithinTestId("modal", "Test");
    cy.containedWithinTestId("modal", "Expected Range");

    for (const range of catDxQcLots[0].qcReferenceRangeDtos) {
      cy.getByTestId("refRangeTable")
        .get("tr")
        .should("contain", range.assayDto.assayIdentityName)
        .and("contain", `${range.low} - ${range.high}`);
    }
  });
});
