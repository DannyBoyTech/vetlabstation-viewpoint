import { randomDoctor } from "@viewpoint/test-utils";
const doctor = [randomDoctor()];

const doctorForDelete = [
  {
    "@class": "com.idexx.labstation.core.dto.DoctorDto",
    doctorIdentifier: "",
    firstName: "Dudley",
    middleName: "",
    lastName: "Dolittle",
    isSuppressed: false,
    id: 1,
  },
];

beforeEach(() => {
  cy.intercept("GET", "**/api/doctor", doctor).as("doctor");
});

describe("Practice info", () => {
  it("should allow navigation to practice info screen ", () => {
    cy.visit("/settings/practice_info");
    cy.containedWithinTestId("practice-info-main", "Practice Info");
    cy.containedWithinTestId("practice-info-main", "IDEXX Account Number");
    cy.containedWithinTestId("practice-info-main", "Doctor");
    cy.containedWithinTestId("practice-info-main", "New");
    cy.containedWithinTestId("practice-info-main", "Edit");
    cy.containedWithinTestId("practice-info-main", "Delete");
    //verify button actionability
    cy.getByTestId("add-doctor-button").should("be.enabled");
    cy.getByTestId("edit-doctor-button").should("be.disabled");
    cy.getByTestId("delete-doctor-button").should("be.disabled");
    //Verify existing doctor(s) display(s)
    cy.wait("@doctor").its("response.body").should("deep.equal", doctor);
    cy.getByTestId("account-number-button").click();
    cy.containedWithinTestId("header-left", "IDEXX Account Number");
  });

  it("should allow navigation to account number screen ", () => {
    cy.visit("/settings/practice_info");
    cy.getByTestId("account-number-button").click();
    cy.containedWithinTestId("header-left", "IDEXX Account Number");
    cy.containedWithinTestId(
      "account-number-main",
      "Please enter your IDEXX account number"
    );
    cy.getByTestId("save-button").should("not.be.enabled");
    cy.getByTestId("save-button").should("be.visible");
    cy.getByTestId("cancel-button").should("be.visible");
    cy.getByTestId("account-number-input").type("123456789");
    cy.getByTestId("save-button").should("be.enabled");
    cy.getByTestId("cancel-button").should("be.enabled");
    cy.getByTestId("cancel-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/settings/practice_info`);
  });

  it("should allow navigation to practice info screen and add a new doctor ", () => {
    cy.visit("/settings/practice_info");
    cy.getByTestId("add-doctor-button").click();
    cy.containedWithinTestId("header-left", "Doctor's Name");
    cy.containedWithinTestId("add-doctor-main", "Enter the doctor's name");
    cy.containedWithinTestId("add-doctor-main", "First Name");
    cy.containedWithinTestId("add-doctor-main", "Last Name");
    cy.getByTestId("add-doctor").should("not.be.enabled");
    cy.getByTestId("doctor-first-name").type("Jerkyll");
    cy.getByTestId("doctor-last-name").type("Hyde");
    cy.getByTestId("add-doctor").should("be.visible");
    cy.getByTestId("cancel-add-doctor").should("be.visible");
    cy.getByTestId("add-doctor").should("be.enabled");
    cy.getByTestId("cancel-add-doctor").should("be.enabled");
    cy.getByTestId("add-doctor").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/settings/practice_info`);
  });

  it("should allow navigation to practice info screen and initiate a deletion for an existing doctor ", () => {
    cy.intercept("**/api/doctor", doctorForDelete);
    cy.visit("/settings/practice_info");
    cy.contains("Dolittle").click();
    cy.getByTestId("delete-doctor-button").click();
    cy.getByTestId("confirm-delete-doctor-modal").should("be.visible");
    cy.containedWithinTestId("confirm-delete-doctor-modal", "Delete Doctor");
    cy.containedWithinTestId(
      "confirm-delete-doctor-modal",
      "Are you sure you want to delete this doctor from the list?"
    );
    cy.getByTestId("later-button").should("be.visible");
    cy.getByTestId("done-button").should("be.visible");
    cy.getByTestId("later-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/settings/practice_info`);
  });

  it("should allow navigation to practice info screen and initiate editing an existing doctor ", () => {
    cy.intercept("**/api/doctor", doctorForDelete);
    cy.visit("/settings/practice_info");
    cy.contains("Dolittle").click();
    cy.getByTestId("edit-doctor-button").click();
    cy.url().should(
      "eq",
      `${
        Cypress.config().baseUrl
      }/settings/practice_info/1/edit?firstName=Dudley&lastName=Dolittle`
    );
    cy.containedWithinTestId("edit-doctor-main", "Enter the doctor's name");
    cy.containedWithinTestId("edit-doctor-main", "First Name");
    cy.containedWithinTestId("edit-doctor-main", "Last Name");
    cy.getByTestId("save-edit-doctor").should("be.visible");
    cy.getByTestId("save-edit-doctor").should("be.enabled");
    cy.getByTestId("cancel-edit-doctor").should("be.enabled");
    cy.getByTestId("cancel-edit-doctor").should("be.visible");
    cy.getByTestId("cancel-edit-doctor").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/settings/practice_info`);
  });
});
