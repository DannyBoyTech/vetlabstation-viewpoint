import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  ServiceCategory,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentRun,
  randomInstrumentStatus,
  randomLabRequest,
  randomQualityControlDto,
  randomQualityControlRunRecordDto,
} from "@viewpoint/test-utils";
import dayjs from "dayjs";

const vetTestInstrument: InstrumentStatusDto = randomInstrumentStatus({
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.VetTest,
  }),
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
});

const labRequest = randomLabRequest({
  instrumentRunDtos: [
    randomInstrumentRun({
      serviceCategory: ServiceCategory.Chemistry,
    }),
  ],
});

const qcDto = randomQualityControlDto({
  instrumentType: InstrumentType.VetTest,
  lotNumber: "VetTrol",
  enabled: true,
  canRun: true,
});

const qcRuns = [
  randomQualityControlRunRecordDto({
    labRequestId: labRequest.id,
    instrumentType: InstrumentType.VetTest,
    instrumentId: vetTestInstrument.instrument.id,
    qualityControl: qcDto,
    testDate: Date.now() - 600000,
  }),
];

describe("vettest QC", () => {
  it("should allow navigation to vettest qc screen", () => {
    cy.intercept("**/device/status", [vetTestInstrument]);
    cy.intercept("**/device/*/status", vetTestInstrument);
    cy.visit(`/instruments/${vetTestInstrument.instrument.id}`);
    cy.contains("Quality Control").click();
    cy.containedWithinTestId("header-left", "VetTest Quality Control Lots");
    cy.containedWithinTestId("vettest-qc-page-main", "Quality Control Lots");
    cy.containedWithinTestId("vettest-qc-page-main", "QC Lot");
    cy.containedWithinTestId("vettest-qc-page-main", "Expiration Date");
    cy.containedWithinTestId("vettest-qc-page-main", "Most Recent Results");
    cy.containedWithinTestId("vettest-qc-page-right", "View All QC Results");
    cy.containedWithinTestId("vettest-qc-page-right", "View Lot Results");
    cy.containedWithinTestId("vettest-qc-page-right", "Back");
    cy.contains("Back").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${
        vetTestInstrument.instrument.id
      }`
    );
  });

  it("should allow performing a vettest qc run", () => {
    cy.intercept(
      {
        pathname: `**/api/labRequest/${labRequest.id}`,
      },
      labRequest
    );
    cy.intercept(
      {
        method: "GET",
        pathname: "**/qualityControl/lots",
        query: { instrumentId: vetTestInstrument.instrument.id.toString() },
      },
      [qcDto]
    );
    cy.intercept("GET", "**/api/patient/*/labRequestRecords", [
      {
        labRequestId: labRequest.id,
        deviceUsageMap: {},
      },
    ]);
    cy.intercept(
      {
        method: "GET",
        pathname: `**/device/${vetTestInstrument.instrument.id}/runs`,
      },
      qcRuns
    );
    cy.intercept("**/api/device/status", [vetTestInstrument]);
    cy.intercept("**/api/device/*/status", vetTestInstrument);
    cy.visit(`/instruments/${vetTestInstrument.instrument.id}/qc`);
    cy.containedWithinTestId("vettest-qc-page-main", "VetTrol");
    cy.containedWithinTestId(
      "vettest-qc-page-main",
      dayjs(qcDto.dateExpires).format("M/DD/YY")
    );
    cy.containedWithinTestId(
      "vettest-qc-page-main",
      dayjs(qcDto.mostRecentRunDate).format("M/DD/YY")
    );
    cy.contains("VetTrol").click();
    cy.contains("View Lot Results").click();
    cy.getByTestId("qc-results-modal").should("be.visible");
    cy.containedWithinTestId("qc-results-modal", "Quality Control Records");
    cy.containedWithinTestId("qc-results-modal", "Analyzer:");
    cy.containedWithinTestId("qc-results-modal", "Lot:");
    cy.containedWithinTestId("qc-results-modal", "Date and Time");
    cy.containedWithinTestId(
      "qc-results-modal",
      dayjs(qcRuns[0].testDate).format("M/DD/YY")
    );
    cy.containedWithinTestId("qc-results-modal", "Close");
    cy.containedWithinTestId(
      "qc-results-modal",
      `VetTest (${vetTestInstrument.instrument.instrumentSerialNumber})`
    );
    cy.containedWithinTestId("qc-results-modal", "VetTrol");
    cy.containedWithinTestId("qc-results-modal", "View Results");
    cy.get('[role="cell"]').eq(3).click();
    cy.contains("View Results").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/labRequest/${labRequest.id}`
    );
    cy.containedWithinTestId("results-table-Chemistry", "Chemistry");
    cy.containedWithinTestId(
      "results-table-Chemistry",
      dayjs(labRequest.instrumentRunDtos[0].testDate).format("M/DD/YY")
    );
  });
});
