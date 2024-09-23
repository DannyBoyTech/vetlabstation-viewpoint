const displaySettings = {
  DISPLAY_PENDING_REQUESTS: "true",
  DISPLAY_CENSUSLIST: "true",
  DISPLAY_PATIENT_GENDER: "true",
  DISPLAY_REASON_FOR_TESTING: "false",
  DISPLAY_PATIENT_BREED: "true",
  DISPLAY_PATIENT_WEIGHT: "true",
  DISPLAY_DOCTOR_NAME: "false",
};

describe("display settings", () => {
  it("should allow user to navigate to the display settings screen", () => {
    cy.visit("/settings/display");
    cy.intercept(
      "**/settings?setting=DISPLAY_PENDING_REQUESTS&setting=DISPLAY_CENSUSLIST&setting=DISPLAY_DOCTOR_NAME&setting=DISPLAY_PATIENT_BREED&setting=DISPLAY_PATIENT_GENDER&setting=DISPLAY_PATIENT_WEIGHT&setting=DISPLAY_REASON_FOR_TESTING",
      displaySettings
    );
    cy.containedWithinTestId("display-settings-page", "Display");
    cy.containedWithinTestId("display-settings-page", "Include on Home Screen");
    cy.containedWithinTestId("display-settings-page", "Pending List");
    cy.containedWithinTestId("display-settings-page", "Census List");
    cy.containedWithinTestId(
      "display-settings-page",
      "Include in Patient and Order Details"
    );
    cy.containedWithinTestId("display-settings-page", "Doctor");
    cy.containedWithinTestId("display-settings-page", "Breed");
    cy.containedWithinTestId("display-settings-page", "Sex");
    cy.containedWithinTestId("display-settings-page", "Weight");
    cy.containedWithinTestId("display-settings-page", "Reason for Testing");
    //verify settings using intercept
    cy.get(".spot-form__checkbox-input").eq(0).should("be.checked");
    cy.get(".spot-form__checkbox-input").eq(2).should("not.be.checked");
  });
});
