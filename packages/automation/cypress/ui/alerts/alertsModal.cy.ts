import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";
import {
  randomAlertDto,
  randomInstrumentAlertDto,
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  InstrumentStatus,
  InstrumentType,
  CatalystDxAlerts,
} from "@viewpoint/api";

describe("alerts modal", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  describe("access", () => {
    const catOneInstrument = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Alert,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
      }),
    });
    const pcoInstrument = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Alert,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
    });
    const instruments = [catOneInstrument, pcoInstrument];

    beforeEach(() => {
      cy.intercept(
        "**/api/instruments/alerts",
        instruments.map((is) =>
          randomInstrumentAlertDto({ instrumentId: is.instrument.id })
        )
      ).as("instrumentAlerts");
      cy.intercept("**/api/device/status", instruments).as("instrumentStatus");
      cy.visit("/");

      cy.wait(["@instrumentStatus", "@instrumentAlerts"]);
    });

    it("can be accessed from the instruments bar on the home screen", () => {
      cy.getByTestId("instrument-bar-root").contains("Alert").click();
      cy.getByTestId("alert-modal-content").should("be.visible");
    });

    it("can be accessed from the header", () => {
      cy.getByTestId("alerted-instrument-pill").first().click();

      cy.getByTestId("alert-modal-content").should("be.visible");
    });

    it("allows user to choose different instrument alerts within the alert modal", () => {
      // Open the CatOne instrument alerts
      cy.getByTestId("instrument-bar-root").contains("ProCyte One").click();
      cy.getByTestId("alert-modal-content").as("modal").should("be.visible");

      // PCO is selected because that's the one we clicked to open the modal
      cy.get(".spot-modal__secondary-title")
        .as("title")
        .contains("Alert | ProCyte One");
      cy.getByTestId(`alert-modal-instrument-${pcoInstrument.instrument.id}`)
        .as("pcoInstrument")
        .should("have.class", "spot-list-group__item--active");

      // CatOne is not selected
      cy.getByTestId(`alert-modal-instrument-${catOneInstrument.instrument.id}`)
        .as("catOneInstrument")
        .should("not.have.class", "spot-list-group__item--active");

      // Click the CatOne icon, now it's selected
      cy.get("@catOneInstrument")
        .click()
        .should("have.class", "spot-list-group__item--active");
      cy.get("@title").contains("Alert | Catalyst One");
    });
  });

  it("allows user to page between alerts", () => {
    const catOneInstrument = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Alert,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystDx,
      }),
    });
    const alertOne = randomAlertDto({
      name: CatalystDxAlerts.CONNECTION_TIMEOUT,
    });
    const alertTwo = randomAlertDto();
    const catOneAlerts = randomInstrumentAlertDto({
      instrumentId: catOneInstrument.instrument.id,
      alerts: [alertOne, alertTwo],
    });

    cy.intercept("**/api/device/status", [catOneInstrument]);
    cy.intercept("**/api/instruments/alerts", [catOneAlerts]);

    cy.visit("/");

    cy.getByTestId("instrument-bar-root").contains("Catalyst Dx").click();
    cy.getByTestId("alert-modal-content")
      .as("content")
      .should("be.visible")
      .get(".spot-modal__footer")
      .as("footer");

    // The first alert is mapped, second is unmapped, to show the difference when navigating

    cy.get("@content").contains(
      "The IDEXX VetLab Station is unable to communicate with the Catalyst Dx analyzer."
    );

    cy.get("@footer")
      .get("button")
      .contains("1")
      .as("pageOneButton")
      .should("have.class", "spot-paging__button--selected");

    cy.get("@footer")
      .get("button")
      .contains("2")
      .as("pageTwoButton")
      .should("not.have.class", "spot-paging__button--selected");

    cy.get("@pageTwoButton").click();
    cy.get("@content").contains("The instrument has reported an alert.");

    cy.get("@pageOneButton").should(
      "not.have.class",
      "spot-paging__button--selected"
    );
    cy.get("@pageTwoButton").should(
      "have.class",
      "spot-paging__button--selected"
    );
  });
});
