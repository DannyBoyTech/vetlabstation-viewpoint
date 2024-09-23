import { randomPatientDto } from "@viewpoint/test-utils";
import { getDefaultSettings } from "../../util/general-utils";

describe("Analyze Sample Screen", () => {
  beforeEach(() => {
    const daisy = randomPatientDto({ patientName: "Daisy" });
    const duke = randomPatientDto({ patientName: "Duke" });
    cy.intercept("GET", "**/pims/pending", []);
    cy.intercept("GET", "**/labRequest/running", []);
    cy.intercept("GET", "**/device/status", []);
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
        query: { patientName: "d" },
      },
      [daisy, duke]
    ).as("dSearch");
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
        query: { patientName: "da" },
      },
      [daisy]
    ).as("daSearch");
  });

  it("allows user to locate a patient to run a sample", () => {
    cy.visit("/analyzeSample");
    // Input focused on nav, keyboard visible
    cy.getByTestId("patient-name-input").should("be.focused");
    cy.getByTestId("keyboard").should("be.visible");
    // Verify header
    cy.getByTestId("header-left").should("contain", "Patient Search");

    // Nav buttons disabled
    cy.getByTestId("next-button").should("be.disabled");
    cy.getByTestId("edit-button").should("be.disabled");

    cy.getByTestId("patient-name-input").type("da").wait("@daSearch");

    cy.getByTestId("patient-search-results")
      .find(".patient-search-result")
      .should((children) => {
        expect(children).to.have.length(1);
        expect(children[0]).to.contain("Daisy");
      })
      .first()
      .click();

    // Nav buttons enabled
    cy.getByTestId("next-button").should("be.enabled");
    cy.getByTestId("edit-button").should("be.enabled");
  });

  it("should show spinner after typing, then show correct data", () => {
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
        query: { patientName: "r" },
      },
      {
        body: [randomPatientDto({ patientName: "Rin Tin Tin" })],
      }
    ).as("rSearch");

    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
        query: { patientName: "delay" },
      },
      {
        body: [randomPatientDto({ patientName: "Delay" })],
        delay: 2000,
      }
    ).as("delayed");

    cy.visit("/analyzeSample");

    //prepopulate dom w/ old result to verify it doesn't wait around
    cy.getByTestId("patient-name-input").type("r").wait("@rSearch");

    cy.getByTestId("patient-name-input").clear().type("delay");

    cy.getByTestId("patient-search-results")
      .get("svg")
      .should("have.class", "icon-spinner");

    cy.wait("@delayed");

    cy.getByTestId("patient-search-results")
      .find(".patient-search-result")
      .should((children) => {
        expect(children).to.have.length(1);
        expect(children[0]).to.contain("Delay");
      });
  });

  it("should display patients in order returned from api", () => {
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
        query: { patientName: "d" },
      },
      [
        randomPatientDto({ patientName: "Daisy" }),
        randomPatientDto({ patientName: "Daisy" }),
        randomPatientDto({ patientName: "Delay" }),
        randomPatientDto({ patientName: "Duke" }),
      ]
    ).as("dSearch");

    cy.visit("/analyzeSample");

    cy.getByTestId("patient-name-input").type("d").wait("@dSearch");

    cy.getByTestId("patient-search-results")
      .find(".patient-search-result")
      .should((children) => {
        expect(children).to.have.length(4);
        expect(children[0]).to.contain("Daisy");
        expect(children[1]).to.contain("Daisy");
        expect(children[2]).to.contain("Delay");
        expect(children[3]).to.contain("Duke");
      });

    cy.getByTestId("select-results-range").should("not.exist");
  });

  it("should nav to add patient with generated patient name and client-id when stat button is pressed", () => {
    cy.intercept("**/settings?**", getDefaultSettings());
    cy.visit("/analyzeSample");

    cy.getByTestId("patient-name-input").should("be.empty");
    cy.getByTestId("last-name-input").should("be.empty");
    cy.getByTestId("client-id-input").should("be.empty");

    cy.getByTestId("stat-button").should("be.visible").click();

    cy.url().should("match", /[/]addPatient.*[?]/);

    cy.getByTestId("patient-input").should((input) => {
      expect(input.val()).to.match(/^ST\d{10}$/);
    });

    cy.getByTestId("client-id-input").should((input) => {
      expect(input.val()).to.match(/^ST\d{10}$/);
    });
  });

  describe("patient search screen", () => {
    it("should clear and disable the results date range dropdown when any other field is modified", () => {
      cy.visit("/patientSearch");
      cy.getByTestId("select-results-range").contains("Last 7 Days");

      cy.getByTestId("patient-name-input").type("fido");
      cy.getByTestId("select-results-range").contains("Select One");
      cy.getByTestId("select-results-range").should("be.disabled");
      cy.getByTestId("patient-name-input").clear();
      cy.getByTestId("select-results-range").contains("Last 7 Days");
      cy.getByTestId("select-results-range").should("not.be.disabled");

      cy.getByTestId("last-name-input").type("fido");
      cy.getByTestId("select-results-range").contains("Select One");
      cy.getByTestId("select-results-range").should("be.disabled");
      cy.getByTestId("last-name-input").clear();
      cy.getByTestId("select-results-range").contains("Last 7 Days");

      cy.getByTestId("select-results-range").select("Last 30 Days");

      cy.getByTestId("client-id-input").type("fido");
      cy.getByTestId("select-results-range").contains("Select One");
      cy.getByTestId("select-results-range").should("be.disabled");
      cy.getByTestId("client-id-input").clear();
      cy.getByTestId("select-results-range").contains("Last 30 Days");
    });

    it("should include the daysBack parameter when results date range selected", () => {
      cy.intercept("/labstation-webapp/api/patient/history*").as("patient");
      cy.visit("/patientSearch");
      cy.wait("@patient");
      cy.get("@patient")
        .its("request.url")
        .should("match", /daysBack=7/);
      cy.intercept("/labstation-webapp/api/patient/history*").as("patient2");
      cy.getByTestId("patient-name-input").type("fido");
      // The below manual wait is needed until we apply debounce effect to patient name field on patient search page
      cy.wait(1000);
      cy.wait("@patient2");
      cy.get("@patient2")
        .its("request.url")
        .should("match", /patientName=fido&clientId=&clientLastName=/);
    });
  });
});
