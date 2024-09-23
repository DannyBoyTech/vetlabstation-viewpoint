import { interceptGlobalRequests } from "../../../util/default-intercepts";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { InstrumentStatus, InstrumentType, BarcodeType } from "@viewpoint/api";

describe("inVue Dx diagnostics", () => {
  const instrumentStatus = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.Theia,
    }),
  });

  beforeEach(() => {
    interceptGlobalRequests();
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/device/${instrumentStatus.instrument.id}/status`,
      },
      instrumentStatus
    );
    cy.intercept("GET", "**/api/theia/barcodes/types", [
      BarcodeType.BLOOD,
      BarcodeType.EAR_SWAB,
      BarcodeType.FNA,
    ]).as("barcodeTypes");

    cy.intercept(
      "PUT",
      `**/api/instrument/${instrumentStatus.instrument.id}/barcode`,
      { isValid: true }
    ).as("validateBarcode");
  });

  for (const barcodeType of [
    BarcodeType.BLOOD,
    BarcodeType.EAR_SWAB,
    BarcodeType.FNA,
  ]) {
    it(`allows user to manually enter lot number for ${barcodeType} consumables`, () => {
      cy.visit(`/instruments/${instrumentStatus.instrument.id}/lotEntry`);
      cy.wait("@barcodeTypes");
      cy.getByTestId(`lot-consumable-radio-${barcodeType}`).click({
        force: true,
      });
      cy.getByTestId("invue-lot-entry-next-button")
        .as("nextButton")
        .should("be.disabled");
      cy.getByTestId("lot-entry-input").type("12345");
      cy.get("@nextButton").should("be.enabled").click();
      cy.wait("@validateBarcode").its("request.body").should("deep.equal", {
        barcode: "12345",
        barcodeType: barcodeType,
      });

      cy.get(".spot-message").contains(
        "The consumable is ready for the next run."
      );
    });
  }

  it("shows available consumable types based on response from IVLS", () => {
    cy.intercept("GET", "**/api/theia/barcodes/types", [BarcodeType.BLOOD]);
    cy.visit(`/instruments/${instrumentStatus.instrument.id}/lotEntry`);
    cy.getByTestId(`lot-consumable-radio-${BarcodeType.BLOOD}`).should("exist");
    cy.getByTestId(`lot-consumable-radio-${BarcodeType.FNA}`).should(
      "not.exist"
    );
    cy.getByTestId(`lot-consumable-radio-${BarcodeType.EAR_SWAB}`).should(
      "not.exist"
    );
  });

  it("shows an error message if IVLS returns invalid response for barcode", () => {
    cy.visit(`/instruments/${instrumentStatus.instrument.id}/lotEntry`);
    cy.wait("@barcodeTypes");
    cy.getByTestId(`lot-consumable-radio-${BarcodeType.BLOOD}`).click({
      force: true,
    });
    cy.getByTestId("lot-entry-input").type("12345");
    cy.intercept(
      "PUT",
      `**/api/instrument/${instrumentStatus.instrument.id}/barcode`,
      { isValid: false }
    ).as("validateBarcode");
    cy.getByTestId("invue-lot-entry-next-button").click();
    cy.getByTestId("error-message").should(
      "contain",
      "The number entered was invalid. Please try again."
    );
  });
});
