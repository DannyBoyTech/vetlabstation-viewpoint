import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
  randomQcLotDto,
  randomQualityControlRunRecordDto,
} from "@viewpoint/test-utils";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";

const expBarcode = {
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

const tenseiInstrument: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.Tensei,
    instrumentStringProperties: {
      "serial.mainunit": "Tensei1",
      "serial.ipu": "IPU1",
    },
  }),
});
const runs = [
  randomQualityControlRunRecordDto({
    instrumentId: tenseiInstrument.instrument.id,
    instrumentType: InstrumentType.Tensei,
  }),
];

describe("tensei QC", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/device/status", [tenseiInstrument]);
    cy.intercept("**/api/device/*/status", tenseiInstrument);
  });

  it("should allow navigation to Tensei quality control screen and view qc table", () => {
    cy.visit(`/instruments/${tenseiInstrument.instrument.id}`);
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
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${
        tenseiInstrument.instrument.id
      }`
    );
  });

  it("should allow navigation to Tensei quality control screen and add qc lots", () => {
    const barcodes = [
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
    ];
    cy.visit(`/instruments/${tenseiInstrument.instrument.id}`);
    cy.contains("Quality Control").click();
    cy.contains("Add QC Lot").click();
    //Verify modal
    cy.getByTestId("tensei-lot-entry-modal").should("be.visible");
    //verify alert when an invalid barcode is enterred
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "93231343051080573781290613"
    );
    cy.get('[role="alert"]').should(
      "contain.text",
      "The bar code entered is invalid."
    );
    cy.getByTestId("tensei-qc-lot-barcode-input").clear();
    cy.intercept("PUT", "**/tensei/qc/barcodes/validate", {
      barcodes: barcodes.slice(0, 1),
      currentBarcodeStatus: "BARCODE_ACCEPTED",
      levelOneComplete: false,
      levelTwoComplete: false,
    });
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "93231343051080573781290616"
    );
    cy.getByTestId("tensei-qc-lot-barcode-status-4").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept("PUT", "**/tensei/qc/barcodes/validate", {
      barcodes: barcodes.slice(0, 2),
      currentBarcodeStatus: "BARCODE_ACCEPTED",
      levelOneComplete: false,
      levelTwoComplete: false,
    });
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "94384879442543671652097409"
    );
    cy.getByTestId("tensei-qc-lot-barcode-status-5").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept("PUT", "**/tensei/qc/barcodes/validate", {
      barcodes: barcodes.slice(0, 3),
      currentBarcodeStatus: "BARCODE_ACCEPTED",
      levelOneComplete: true,
      levelTwoComplete: false,
    });
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "95347092223421251663019181"
    );
    cy.getByTestId("tensei-qc-lot-barcode-status-6").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept("PUT", "**/tensei/qc/barcodes/validate", {
      barcodes: barcodes.slice(0, 4),
      currentBarcodeStatus: "BARCODE_ACCEPTED",
      levelOneComplete: true,
      levelTwoComplete: false,
    });
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "90231343051080431360560367"
    );
    cy.getByTestId("tensei-qc-lot-barcode-status-1").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept("PUT", "**/tensei/qc/barcodes/validate", {
      barcodes: barcodes.slice(0, 5),
      currentBarcodeStatus: "BARCODE_ACCEPTED",
      levelOneComplete: true,
      levelTwoComplete: false,
    });
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "91174778221322341652103410"
    );
    cy.getByTestId("tensei-qc-lot-barcode-status-2").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept("PUT", "**/tensei/qc/barcodes/validate", {
      barcodes: barcodes.slice(0, 6),
      currentBarcodeStatus: "BARCODE_ACCEPTED",
      levelOneComplete: true,
      levelTwoComplete: true,
    });
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "92346082060305831593020134"
    );
    cy.getByTestId("tensei-qc-lot-barcode-status-3").should(
      "have.text",
      "Bar code accepted"
    );
    cy.intercept("**/tensei/qc/barcodes/save", {});
    cy.getByTestId("done-button").should("be.enabled").click();
  });

  it("should show warning modal on attempt to enter expired qc lot", () => {
    cy.intercept(
      "GET",
      `**/device/${tenseiInstrument.instrument.id}/runs?qualityControlId=1`,
      runs
    );
    cy.visit(`/instruments/${tenseiInstrument.instrument.id}`);
    cy.contains("Quality Control").click();
    cy.getByTestId("add-qc-lot-button").click();
    cy.intercept("PUT", "**/tensei/qc/barcodes/validate", expBarcode);
    cy.getByTestId("tensei-qc-lot-barcode-input").type(
      "93231343051080573781290616"
    );
    cy.getByTestId("tensei-qc-lot-expired-confirm-modal").should("be.visible");
    cy.containedWithinTestId(
      "tensei-qc-lot-expired-confirm-modal",
      "IDEXX ProCyte Dx Quality Control"
    );
    cy.containedWithinTestId(
      "tensei-qc-lot-expired-confirm-modal",
      "This Quality Control lot has expired."
    );
    cy.containedWithinTestId(
      "tensei-qc-lot-expired-confirm-modal",
      "Expired controls may return inaccurate results."
    );
    cy.containedWithinTestId("tensei-qc-lot-expired-confirm-modal", "Cancel");
    cy.containedWithinTestId("tensei-qc-lot-expired-confirm-modal", "Continue");
  });

  it("should allow active lots and lots expired within grace period to be run", () => {
    const tenseiQcLots = [
      randomQcLotDto({
        //non-expired lot
        instrumentType: InstrumentType.Tensei,
        lotNumber: "11111111",
        level: "2",
        isExpired: false,
        canRun: true,
      }),
      randomQcLotDto({
        //expired but runable (within grace period)
        instrumentType: InstrumentType.Tensei,
        lotNumber: "22222222",
        level: "2",
        isExpired: true,
        canRun: true,
      }),
      randomQcLotDto({
        //expired beyond grace period
        instrumentType: InstrumentType.Tensei,
        lotNumber: "33333333",
        level: "2",
        isExpired: true,
        canRun: false,
      }),
    ];
    cy.intercept(
      {
        method: "GET",
        pathname: "**/qualityControl/lots",
        query: {
          instrumentId: tenseiInstrument.instrument.id.toString(),
          instrumentType: "TENSEI",
        },
      },
      tenseiQcLots
    );
    cy.visit(`/instruments/${tenseiInstrument.instrument.id}/qc`);
    cy.contains("11111111").click();
    cy.getByTestId("run-qc-button").should("be.enabled");
    //'Run QC' button should be enabled for non-expired lots
    cy.contains("22222222").click();
    cy.getByTestId("run-qc-button").should("be.enabled");
    //'Run QC' button should be enabled for expired lots within grace period
    cy.contains("33333333").click();
    cy.getByTestId("run-qc-button").should("not.be.enabled");
    //'Run QC' button should not be enabled for expired lots beyond grace period
  });
});
