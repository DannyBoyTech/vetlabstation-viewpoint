import {
  randomInstrumentDto,
  randomInstrumentRun,
  randomInstrumentStatus,
  randomLabRequest,
  randomQualityControlBarcodeDto,
  randomQualityControlBarcodeSetDto,
  randomQualityControlDto,
  randomQualityControlRunRecordDto,
} from "@viewpoint/test-utils";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  QualityControlBarcodeSetStatus,
  QualityControlBarcodeStatus,
  QualityControlRunDto,
  QcLotDto,
} from "@viewpoint/api";
import dayjs from "dayjs";

const svdxInstrument: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.SediVueDx,
  }),
});

const qcDto = randomQualityControlDto({
  id: 1,
  instrumentType: InstrumentType.SediVueDx,
  lotNumber: "160051",
  enabled: true,
  canRun: true,
  fluidType: 1,
  dateExpires: Date.now() + 600000,
} as QcLotDto);

const qcDto2 = randomQualityControlDto({
  id: 2,
  instrumentType: InstrumentType.SediVueDx,
  lotNumber: "160052",
  enabled: true,
  canRun: true,
  fluidType: 2,
  dateExpires: Date.now() + 300000,
} as QcLotDto);

const excludedQc = randomLabRequest({
  instrumentRunDtos: [
    randomInstrumentRun({
      instrumentId: svdxInstrument.instrument.id,
      qualityControl: qcDto,
      excludeTrendingReason: "Excluded QC test",
      excludableFromTrending: true,
    } as QualityControlRunDto),
  ],
});

const runRecords = [
  randomQualityControlRunRecordDto({
    instrumentId: svdxInstrument.instrument.id,
    instrumentType: InstrumentType.SediVueDx,
    qualityControl: qcDto,
    instrumentSerialNumber: "SVDX02urised0",
  }),
  randomQualityControlRunRecordDto({
    instrumentId: svdxInstrument.instrument.id,
    instrumentType: InstrumentType.SediVueDx,
    qualityControl: qcDto,
    instrumentSerialNumber: "SVDX02urised0",
  }),
  randomQualityControlRunRecordDto({
    instrumentId: svdxInstrument.instrument.id,
    instrumentType: InstrumentType.SediVueDx,
    qualityControl: qcDto,
    instrumentSerialNumber: "SVDX02urised0",
  }),
];

const sediVueLots = [qcDto, qcDto2];

describe("sediVue Dx QC", () => {
  beforeEach(() => {
    cy.intercept("**/api/device/status", [svdxInstrument]);
    cy.intercept("**/api/device/*/status", svdxInstrument);
    cy.intercept(
      { method: "GET", pathname: "**/report/urisedQualityReport" },
      []
    );
    cy.intercept(
      { method: "GET", pathname: "**/api/labRequest/1" },
      excludedQc
    );
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/qualityControl/lots",
        query: { instrumentId: svdxInstrument.instrument.id.toString() },
      },
      sediVueLots
    );
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/device/${svdxInstrument.instrument.id}/runs`,
      },
      runRecords
    );
  });
  it("should display QC lot information", () => {
    cy.intercept("**/api/device/status", [svdxInstrument]);
    cy.intercept("**/api/device/*/status", svdxInstrument);
    cy.visit(`/instruments/${svdxInstrument.instrument.id}`);
    cy.getByTestId("svdx-qc-button").click();
    cy.containedWithinTestId("header-left", "SediVue Dx Quality Control Lots");
    cy.containedWithinTestId("qc-lots-main-page", "Quality Control Lots");
    cy.containedWithinTestId("qc-lots-main-page", "Lot Number");
    cy.containedWithinTestId("qc-lots-main-page", "Level");
    cy.containedWithinTestId("qc-lots-main-page", "Expiration Date");
    cy.containedWithinTestId("qc-lots-main-page", "Most Recent Results");
    cy.containedWithinTestId("qc-lots-main-page", qcDto.lotNumber);
    cy.containedWithinTestId("qc-lots-main-page", qcDto2.lotNumber);
    cy.get('[role="cell"]')
      .eq(1)
      .should("contain.text", (qcDto as QcLotDto).fluidType);
    cy.get('[role="cell"]')
      .eq(2)
      .should("contain.text", dayjs(qcDto.dateExpires).format("M/DD/YY"));
    cy.get('[role="cell"]')
      .eq(3)
      .should("contain.text", dayjs(qcDto.mostRecentRunDate).format("M/DD/YY"));
    cy.get('[role="cell"]')
      .eq(5)
      .should("contain.text", (qcDto2 as QcLotDto).fluidType);
    cy.get('[role="cell"]')
      .eq(6)
      .should("contain.text", dayjs(qcDto2.dateExpires).format("M/DD/YY"));
    cy.get('[role="cell"]')
      .eq(7)
      .should(
        "contain.text",
        dayjs(qcDto2.mostRecentRunDate).format("M/DD/YY")
      );
    cy.get('[role="cell"]').eq(0).click();
    cy.getByTestId("run-qc-button").should("be.enabled");
    cy.getByTestId("view-all-qc-results-button").should("be.enabled");
    cy.getByTestId("add-qc-lot-button").should("be.enabled");
    cy.getByTestId("qc-back-button").should("be.enabled");
    cy.getByTestId("qc-back-button").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${svdxInstrument.instrument.id}`
    );
  });

  it("Should allow excluding a qc result from trend", () => {
    cy.visit(`/instruments/${svdxInstrument.instrument.id}`);
    cy.getByTestId("svdx-qc-button").click();
    cy.get('[role="cell"]').eq(0).click();
    cy.getByTestId("view-all-qc-results-button").click();
    cy.get('[role="cell"]').eq(0).click();
    cy.getByTestId("qc-results-exclude-checkbox").should("be.checked");
    cy.containedWithinTestId(
      "qc-results-exclude-comments-textarea",
      "Excluded QC test"
    );
  });

  it("Should allow trending qc results", () => {
    cy.visit(`/instruments/${svdxInstrument.instrument.id}`);
    cy.getByTestId("svdx-qc-button").click();
    cy.get('[role="cell"]').eq(0).click();
    cy.getByTestId("view-all-qc-results-button").click();
    cy.getByTestId("view-results-button").should("be.visible");
    cy.getByTestId("view-qc-trend-button").should("be.visible");
    cy.getByTestId("back-button").should("be.visible");
    cy.getByTestId("view-qc-trend-button").click();
    cy.getByTestId("trend-qc-modal").should("be.visible");
    cy.containedWithinTestId(
      "trend-qc-modal",
      "SediVue Dx Control Trend Report"
    );
    cy.containedWithinTestId("trend-qc-modal", "Cancel");
    cy.containedWithinTestId("trend-qc-modal", "Print");
  });

  it("should allow navigation to SediVue Dx quality control screen and add qc lots", () => {
    cy.visit(`/instruments/${svdxInstrument.instrument.id}`);
    cy.contains("Quality Control").click();
    cy.contains("Add QC Lot").click();
    cy.getByTestId("qc-lot-entry-modal").should("be.visible");

    //
    // enter invalid barcode
    //

    const invalidRes1 = randomQualityControlBarcodeSetDto({
      barcodeSetStatus: QualityControlBarcodeSetStatus.BARCODE_ERROR,
      barcodes: [
        randomQualityControlBarcodeDto({
          barcode: "11111111111111111111111",
        }),
      ],
    });

    cy.intercept("POST", "**/api/sediVue/barcodes/validate", invalidRes1);
    cy.getByTestId("barcode-input")
      .should("be.focused")
      .type("11111111111111111111111");

    cy.get("[role='alert']").should("contain.text", "Invalid barcode.");

    //
    // enter expired barcode
    //

    const invalidRes2 = randomQualityControlBarcodeSetDto({
      barcodeSetStatus: QualityControlBarcodeSetStatus.LOT_EXPIRED,
      barcodes: [
        randomQualityControlBarcodeDto({
          barcode: "22222222222222222222222",
        }),
      ],
    });

    cy.intercept("POST", "**/api/sediVue/barcodes/validate", invalidRes2);
    cy.getByTestId("barcode-input")
      .should("be.focused")
      .clear()
      .type("22222222222222222222222");

    cy.get("[role='alert']").should("contain.text", "Lot is expired.");

    // an accepted, but expired barcode
    const validBarcodeL1 = randomQualityControlBarcodeDto({
      barcode: "33333333333333333333333",
      barcodeStatus: QualityControlBarcodeStatus.ACCEPTED,
      sequenceNumber: 1,
      expired: true,
    });

    // a non-expired, accepted barcode
    const validBarcodeL2 = randomQualityControlBarcodeDto({
      barcode: "44444444444444444444444",
      barcodeStatus: QualityControlBarcodeStatus.ACCEPTED,
      sequenceNumber: 2,
      expired: false,
    });

    //
    // First, enter expired, but acceptable barcode
    //

    const validResL1 = randomQualityControlBarcodeSetDto({
      barcodeSetStatus: QualityControlBarcodeSetStatus.BARCODE_ACCEPTED,
      barcodes: [validBarcodeL1],
    });

    cy.intercept("POST", "**/api/sediVue/barcodes/validate", validResL1);
    cy.getByTestId("barcode-input")
      .should("be.focused")
      .clear()
      .type("33333333333333333333333");

    // in response, the expired barcode warning should show

    cy.getByTestId("expired-confirmation")
      .should("be.visible")
      .within(() => {
        cy.get("button:contains('Continue')").should("be.enabled").click();
      });

    cy.get("[role='alert']").should("not.be.visible");

    cy.get("button:contains('Next')").should("be.disabled");

    //
    // Enter second barcode, but this one non-expired & acceptable
    //

    const validResL2 = randomQualityControlBarcodeSetDto({
      barcodeSetStatus: QualityControlBarcodeSetStatus.BARCODE_ACCEPTED,
      barcodes: [validBarcodeL1, validBarcodeL2],
    });

    cy.intercept("POST", "**/api/sediVue/barcodes/validate", validResL2);
    cy.getByTestId("barcode-input")
      .should("be.focused")
      .clear()
      .type("44444444444444444444444");

    cy.get("[role='alert']").should("not.be.visible");

    cy.get("button:contains('Next')").should("be.enabled");

    //
    // Hit cancel to verify that lost changes warning modal shows
    //

    cy.get("button:contains('Cancel')").click();

    cy.getByTestId("cancel-confirmation").within((modal) => {
      cy.wrap(modal).should("be.visible");
      cy.get("button:contains('Close')").click();
    });

    cy.getByTestId("cancel-confirmation").should("not.exist");

    cy.intercept("POST", "**/api/sediVue/lots", {});

    cy.get("button:contains('Next')").should("be.enabled").click();

    //
    // Hitting next should save the barcode and destroy the modal
    //

    cy.getByTestId("qc-lot-entry-modal").should("not.exist");
  });
});
