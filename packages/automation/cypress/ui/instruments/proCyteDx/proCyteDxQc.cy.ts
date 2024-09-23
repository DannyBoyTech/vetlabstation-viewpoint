import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  QualityControlRunDto,
} from "@viewpoint/api";
import {
  randomInstrumentRun,
  randomInstrumentStatus,
  randomLabRequest,
  randomQcLotDto,
} from "@viewpoint/test-utils";

const expBardcode = {
  barcodes: [
    {
      barcode: "93231343051080573781290616",
      sequenceNumber: 4,
      barcodeStatus: "ACCEPTED",
      expired: true,
    },
  ],
  currentBarcodeStatus: "BARCODE_ACCEPTED",
  levelOneComplete: false,
  levelTwoComplete: false,
};

const pDxReady: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: {
    id: 1,
    maxQueueableRuns: 2,
    instrumentType: InstrumentType.ProCyteDx,
    supportedRunConfigurations: [],
    instrumentSerialNumber: "001",
    displayOrder: 1,
    softwareVersion: "1.4.5",
    supportsInstrumentScreen: true,
    ipAddress: "192.168.222.153",
    instrumentStringProperties: {
      "serial.mainunit": "ProCyteDx1",
      "serial.ipu": "IPU1",
    },
  },
});

const runs = [
  {
    "@class": "com.idexx.labstation.core.dto.QualityControlRunRecordDto",
    instrumentRunId: 1,
    labRequestId: 1,
    testDate: 1682717274559,
    qualityControl: {
      "@c": ".CrimsonQualityControlLotDto",
      id: 1,
      instrumentType: "CRIMSON",
      lotNumber: "30510804",
      dateEntered: 1682699751499,
      dateExpires: 1684036800000,
      enabled: true,
      canRun: true,
      isExpired: false,
      mostRecentRunDate: null,
      level: "1",
      inGracePeriod: false,
    },
    instrumentId: 1,
    instrumentType: "CRIMSON",
    instrumentSerialNumber: "A1IPU1",
  },
];

const workRequestStatus = {
  runStartable: false,
  runCancellable: false,
};

const qcResult = [
  {
    "@c": ".CrimsonQualityControlLotDto",
    id: 1,
    instrumentType: "CRIMSON",
    lotNumber: "30510804",
    dateEntered: 1682699751499,
    dateExpires: 1684036800000,
    enabled: true,
    canRun: true,
    isExpired: false,
    mostRecentRunDate: 1683025584810,
    level: "2",
    inGracePeriod: false,
  },
];

const qualityControl = {
  labRequestId: 2,
  runId: 2,
};

const pdxQcLots = [
  {
    "@c": ".CrimsonQualityControlLotDto",
    id: 1,
    instrumentType: "CRIMSON",
    lotNumber: "30510804",
    dateEntered: 1682699751499,
    dateExpires: 1684036800000,
    enabled: true,
    canRun: true,
    isExpired: false,
  },
];

const pdxValidateResponseBarcode6 = {
  barcodes: [
    {
      barcode: "90231343051080431360560367",
      sequenceNumber: 1,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "91174778221322341652103410",
      sequenceNumber: 2,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "92346082060305831593020134",
      sequenceNumber: 3,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "93231343051080573781290616",
      sequenceNumber: 4,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "94384879442543671652097409",
      sequenceNumber: 5,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "95347092223421251663019181",
      sequenceNumber: 6,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
  ],
  currentBarcodeStatus: "BARCODE_ACCEPTED",
  levelOneComplete: true,
  levelTwoComplete: true,
};

const pdxValidateResponseBarcode5 = {
  barcodes: [
    {
      barcode: "90231343051080431360560367",
      sequenceNumber: 1,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "91174778221322341652103410",
      sequenceNumber: 2,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "93231343051080573781290616",
      sequenceNumber: 4,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "94384879442543671652097409",
      sequenceNumber: 5,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "95347092223421251663019181",
      sequenceNumber: 6,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
  ],
  currentBarcodeStatus: "BARCODE_ACCEPTED",
  levelOneComplete: false,
  levelTwoComplete: true,
};

const pdxValidateResponseBarcode4 = {
  barcodes: [
    {
      barcode: "90231343051080431360560367",
      sequenceNumber: 1,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "93231343051080573781290616",
      sequenceNumber: 4,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "94384879442543671652097409",
      sequenceNumber: 5,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "95347092223421251663019181",
      sequenceNumber: 6,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
  ],
  currentBarcodeStatus: "BARCODE_ACCEPTED",
  levelOneComplete: false,
  levelTwoComplete: true,
};

const pdxValidateResponseBarcode3 = {
  barcodes: [
    {
      barcode: "93231343051080573781290616",
      sequenceNumber: 4,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "94384879442543671652097409",
      sequenceNumber: 5,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "95347092223421251663019181",
      sequenceNumber: 6,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
  ],
  currentBarcodeStatus: "BARCODE_ACCEPTED",
  levelOneComplete: false,
  levelTwoComplete: true,
};

const pdxValidateResponseBarcode2 = {
  barcodes: [
    {
      barcode: "93231343051080573781290616",
      sequenceNumber: 4,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
    {
      barcode: "94384879442543671652097409",
      sequenceNumber: 5,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
  ],
  currentBarcodeStatus: "BARCODE_ACCEPTED",
  levelOneComplete: false,
  levelTwoComplete: false,
};
const pdxValidateResponseBarcode1 = {
  barcodes: [
    {
      barcode: "93231343051080573781290616",
      sequenceNumber: 4,
      barcodeStatus: "ACCEPTED",
      expired: false,
    },
  ],
  currentBarcodeStatus: "BARCODE_ACCEPTED",
  levelOneComplete: false,
  levelTwoComplete: false,
};

describe("Instruments screen", () => {
  beforeEach(() => {
    cy.intercept("**/api/device/status", [pDxReady]);
    cy.intercept("**/api/device/*/status", pDxReady);
    cy.intercept("GET", "**/api/instruments/**/status", status);
    cy.intercept(
      "**/report/crimsonQualityReport?instrumentId=1&qualityControlId=1"
    ).as("trend-endpoint");
  });
  it("should allow navigation to ProCyte Dx quality control screen and view qc table", () => {
    cy.visit("/instruments/1");
    cy.contains("Quality Control").click();
    cy.containedWithinTestId("qc-lots-main-page", "Quality Control Lots");
    cy.containedWithinTestId("qc-lots-main-page", "Lot Number");
    cy.containedWithinTestId("qc-lots-main-page", "Level");
    cy.containedWithinTestId("qc-lots-main-page", "Expiration Date");
    cy.containedWithinTestId("qc-lots-main-page", "Most Recent Results");
    cy.containedWithinTestId("qc-page-right", "Run QC");
    cy.containedWithinTestId("qc-page-right", "View QC Results");
    cy.containedWithinTestId("qc-page-right", "Add QC Lot");
    cy.containedWithinTestId("qc-page-right", "View QC Lot Information");
    cy.containedWithinTestId("qc-page-right", "Back");
    cy.contains("Back").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/instruments/1`);
  });
  it("should allow navigation to ProCyte Dx quality control screen and add qc lots", () => {
    cy.visit("/instruments/1");
    cy.contains("Quality Control").click();
    cy.contains("Add QC Lot").click();
    //Verify modal
    cy.getByTestId("pdx-lot-entry-modal").should("be.visible");
    //verify alert when an invalid barcode is enterred
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "93231343051080573781290613"
    );
    cy.get('[role="alert"]').should(
      "contain.text",
      "The bar code entered is invalid."
    );
    cy.getByTestId("pdx-qc-lot-barcode-input").clear();
    cy.intercept(
      "PUT",
      "**/proCyte/qc/barcodes/validate",
      pdxValidateResponseBarcode1
    );
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "93231343051080573781290616"
    );
    cy.getByTestId("pdx-qc-lot-barcode-status-4").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept(
      "PUT",
      "**/proCyte/qc/barcodes/validate",
      pdxValidateResponseBarcode2
    );
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "94384879442543671652097409"
    );
    cy.getByTestId("pdx-qc-lot-barcode-status-5").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept(
      "PUT",
      "**/proCyte/qc/barcodes/validate",
      pdxValidateResponseBarcode3
    );
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "95347092223421251663019181"
    );
    cy.getByTestId("pdx-qc-lot-barcode-status-6").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept(
      "PUT",
      "**/proCyte/qc/barcodes/validate",
      pdxValidateResponseBarcode4
    );
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "90231343051080431360560367"
    );
    cy.getByTestId("pdx-qc-lot-barcode-status-1").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept(
      "PUT",
      "**/proCyte/qc/barcodes/validate",
      pdxValidateResponseBarcode5
    );
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "91174778221322341652103410"
    );
    cy.getByTestId("pdx-qc-lot-barcode-status-2").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept(
      "PUT",
      "**/proCyte/qc/barcodes/validate",
      pdxValidateResponseBarcode6
    );
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "92346082060305831593020134"
    );
    cy.getByTestId("pdx-qc-lot-barcode-status-3").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept("**/proCyte/qc/barcodes/save", {});
    cy.getByTestId("done-button").should("be.enabled").click();
  });

  it("should allow active lots and lots expired within grace period to be run", () => {
    const proCyteDxQcLots = [
      randomQcLotDto({
        //non-expired lot
        instrumentType: InstrumentType.ProCyteDx,
        lotNumber: "11111112",
        level: "2",
        isExpired: false,
        canRun: true,
      }),
      randomQcLotDto({
        //non-expired lot
        instrumentType: InstrumentType.ProCyteDx,
        lotNumber: "11111111",
        level: "1",
        isExpired: false,
        canRun: true,
      }),
      randomQcLotDto({
        //expired but runable (within grace period)
        instrumentType: InstrumentType.ProCyteDx,
        lotNumber: "22222222",
        level: "2",
        isExpired: true,
        canRun: true,
      }),
      randomQcLotDto({
        //expired but runable (within grace period)
        instrumentType: InstrumentType.ProCyteDx,
        lotNumber: "22222221",
        level: "1",
        isExpired: true,
        canRun: true,
      }),
      randomQcLotDto({
        //expired beyond grace period
        instrumentType: InstrumentType.ProCyteDx,
        lotNumber: "33333332",
        level: "2",
        isExpired: true,
        canRun: false,
      }),
      randomQcLotDto({
        //expired beyond grace period
        instrumentType: InstrumentType.ProCyteDx,
        lotNumber: "33333331",
        level: "1",
        isExpired: true,
        canRun: false,
      }),
    ];
    cy.intercept(
      {
        method: "GET",
        pathname: "**/qualityControl/lots",
        query: {
          instrumentId: "1",
          instrumentType: "CRIMSON",
        },
      },
      proCyteDxQcLots
    );
    cy.visit(`/instruments/1/qc`);
    cy.contains("11111111").click();
    cy.getByTestId("run-qc-button").should("be.enabled");
    //'Run QC' button should be enabled for non-expired lots
    cy.contains("22222222").click();
    cy.getByTestId("run-qc-button").should("be.enabled");
    //'Run QC' button should be enabled for expired lots within grace period
    cy.contains("33333331").click();
    cy.getByTestId("run-qc-button").should("not.be.enabled");
    //'Run QC' button should not be enabled for expired lots beyond grace period
  });
  it("should allow navigation to ProCyte Dx quality control screen and perform qc run", () => {
    cy.visit("/instruments/1");
    cy.intercept(
      "GET",
      "**/qualityControl/lots?instrumentId=1&instrumentType=CRIMSON",
      pdxQcLots
    );
    cy.contains("Quality Control").click();
    cy.contains("30510804").click();
    cy.contains("Run QC").click();
    cy.getByTestId("pdx-run-qc-modal").should("be.visible");
    cy.containedWithinTestId("pdx-run-qc-modal", "Run ProCyte Dx QC");
    cy.containedWithinTestId("pdx-run-qc-modal", "Cancel");
    cy.containedWithinTestId("pdx-run-qc-modal", "Next");
    cy.containedWithinTestId("pdx-run-qc-modal", "Lot:");
    cy.containedWithinTestId("pdx-run-qc-modal", "Level");
    cy.containedWithinTestId(
      "pdx-run-qc-modal",
      "Prepare QC sample and start run"
    );
    cy.getByTestId("pdx-run-qc-step-1").should("be.visible");
    cy.getByTestId("pdx-run-qc-step-2").should("be.visible");
    cy.intercept("POST", "**/qualityControl", qualityControl);
    cy.intercept("GET", "**/device/1/runs?");
    cy.contains("Next").click();
    cy.intercept("GET", "**/device/1/runs?");
    cy.intercept(
      "GET",
      "**/instrumentRun/1/workRequestStatus",
      workRequestStatus
    );
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
  });

  it("should allow navigation to ProCyte Dx quality control screen and view qc run result", () => {
    cy.intercept(
      "GET",
      "**/qualityControl/lots?instrumentId=1&instrumentType=CRIMSON",
      qcResult
    );
    cy.intercept("GET", "**/device/1/runs?qualityControlId=1", runs);
    cy.visit("/instruments/1");
    cy.contains("Quality Control").click();
    cy.contains("30510804").click();
    cy.contains("View QC Results").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/1/qc/1/results`
    );
  });
  it("should allow navigation to ProCyte Dx quality control screen and view qc result trending screen", () => {
    cy.intercept(
      "GET",
      "**/qualityControl/lots?instrumentId=1&instrumentType=CRIMSON",
      qcResult
    );
    cy.intercept("GET", "**/device/1/runs?qualityControlId=1", runs);
    const qcRun: QualityControlRunDto = {
      ...randomInstrumentRun(),
      excludeTrendingReason: undefined,
    } as unknown as QualityControlRunDto;
    cy.intercept(
      "GET",
      { pathname: "**/api/labRequest/15" },
      randomLabRequest({ instrumentRunDtos: [qcRun] })
    );
    cy.visit("/instruments/1");
    cy.contains("Quality Control").click();
    cy.contains("30510804").click();
    cy.contains("View QC Results").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/1/qc/1/results`
    );
    cy.containedWithinTestId("header-left", "ProCyte Dx Quality Control Lots");
    cy.containedWithinTestId("qc-lots-main-page", "Analyzer:");
    cy.containedWithinTestId("qc-lots-main-page", "Control:");
    cy.containedWithinTestId("qc-lots-main-page", "Lot:");
    cy.containedWithinTestId("qc-lots-main-page", "ProCyte Dx (001)");
    cy.containedWithinTestId("qc-lots-main-page", "Level 2");
    cy.containedWithinTestId("qc-lots-main-page", "30510804");
    cy.containedWithinTestId("qc-lots-main-page", "Date and Time");
    cy.getByTestId("qc-results-comments").should("not.be.visible");
    cy.contains("4/28/23").click();
    cy.getByTestId("qc-results-comments").should("be.visible");
    cy.containedWithinTestId("qc-lots-main-page", "Exclude from QC trend data");
    cy.getByTestId("qc-results-comments").should("be.visible");
    cy.containedWithinTestId("qc-results-page-right", "View Results");
    cy.containedWithinTestId("qc-results-page-right", "Trend All QC");
    cy.containedWithinTestId("qc-results-page-right", "Back");
    cy.getByTestId("back-button").should("be.enabled");
    cy.getByTestId("view-results-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/labRequest/1`);
  });

  it("should allow navigation to ProCyte Dx quality control screen and initiate a trend procedure", () => {
    cy.intercept(
      "GET",
      "**/qualityControl/lots?instrumentId=1&instrumentType=CRIMSON",
      qcResult
    );
    cy.intercept("GET", "**/device/1/runs?qualityControlId=1", runs);
    cy.visit("/instruments/1");
    cy.contains("Quality Control").click();
    cy.contains("30510804").click();
    cy.contains("View QC Results").click();
    cy.contains("Trend All QC").click();
    cy.wait("@trend-endpoint");
  });

  it("should show warning modal on attempt to enter expired qc lot", () => {
    cy.intercept("GET", "**/device/1/runs?qualityControlId=1", runs);
    cy.visit("/instruments/1");
    cy.contains("Quality Control").click();
    cy.getByTestId("add-qc-lot-button").click();
    cy.intercept("PUT", "**/proCyte/qc/barcodes/validate", expBardcode);
    cy.getByTestId("pdx-qc-lot-barcode-input").type(
      "93231343051080573781290616"
    );
    cy.getByTestId("pdx-qc-lot-expired-confirm-modal").should("be.visible");
    cy.containedWithinTestId(
      "pdx-qc-lot-expired-confirm-modal",
      "ProCyte Dx Quality Control"
    );
    cy.containedWithinTestId(
      "pdx-qc-lot-expired-confirm-modal",
      "This Quality Control lot has expired."
    );
    cy.containedWithinTestId(
      "pdx-qc-lot-expired-confirm-modal",
      "Expired controls may return inaccurate results."
    );
    cy.containedWithinTestId("pdx-qc-lot-expired-confirm-modal", "Cancel");
    cy.containedWithinTestId("pdx-qc-lot-expired-confirm-modal", "Continue");
  });
});
