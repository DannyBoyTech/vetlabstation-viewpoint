import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";

const inVueDxInstrumentStatus: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.Theia,
  }),
});
describe("inVue Dx instrument screen", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/settings",
      },
      {}
    );
    cy.intercept("**/api/device/status", [inVueDxInstrumentStatus]);
    cy.intercept(
      `**/api/device/${inVueDxInstrumentStatus.instrument.id}/status`,
      inVueDxInstrumentStatus
    );
  });

  it("provides access to inVue instrument functionality", () => {
    cy.visit(`/instruments/${inVueDxInstrumentStatus.instrument.id}`);

    cy.getByTestId("invuedx-instruments-screen")
      .should("exist")
      .should("be.visible")
      .should("contain.text", "Maintenance")
      .should("contain.text", "Quality Control")
      .should("contain.text", "Settings")
      .should("contain.text", "Power Down")
      .should("contain.text", inVueDxInstrumentStatus.instrument.ipAddress)
      .should(
        "contain.text",
        inVueDxInstrumentStatus.instrument.softwareVersion
      )
      .should(
        "contain.text",
        inVueDxInstrumentStatus.instrument.instrumentSerialNumber
      );
  });

  it("provides access to the inVue maintenance page", () => {
    cy.visit(
      `/instruments/${inVueDxInstrumentStatus.instrument.id}/maintenance`
    );

    cy.getByTestId("invuedx-maintenance-screen")
      .should("exist")
      .should("be.visible")
      .should("contain.text", "Maintenance 1")
      .should("contain.text", "Maintenance 2")
      .should("contain.text", "Maintenance 3")
      .should("contain.text", "Maintenance 4")
      .should("contain.text", "Maintenance 5")
      .should("contain.text", "Maintenance 6")
      .should("contain.text", "Back");
  });
});
