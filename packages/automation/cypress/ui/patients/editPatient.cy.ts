import { randomClientDto, randomPatientDto } from "@viewpoint/test-utils";
import {
  PatientWeightUnitsEnum,
  RefClassDto,
  ReferenceClassType,
  SettingTypeEnum,
  SpeciesDto,
  SpeciesType,
} from "@viewpoint/api";

const settings = {
  [SettingTypeEnum.DISPLAY_PATIENT_BREED]: "true",
  [SettingTypeEnum.DISPLAY_PATIENT_WEIGHT]: "true",
  [SettingTypeEnum.WEIGHT_UNIT_TYPE]: PatientWeightUnitsEnum.POUNDS,
  [SettingTypeEnum.DISPLAY_PATIENT_GENDER]: "true",
};

const species: SpeciesDto[] = [
  {
    id: 2,
    speciesName: SpeciesType.Canine,
    speciesClass: ReferenceClassType.LifeStage,
  },
];

const referenceClassifications: RefClassDto[] = [
  {
    id: 2,
    refClassName: "Puppy",
    refClassSubTypeCode: "L",
  },
  {
    id: 3,
    refClassName: "Adult Canine",
    refClassSubTypeCode: "L",
  },
  {
    id: 4,
    refClassName: "Geriatric Canine",
    refClassSubTypeCode: "L",
  },
];

describe("Edit patient info", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "**/species/2/referenceClassifications",
      referenceClassifications
    ).as("ref-class");

    cy.intercept(
      {
        method: "GET",
        pathname: `**/species/${referenceClassifications[1].id}`,
      },
      referenceClassifications[1]
    ).as("life-stage");

    cy.intercept("GET", "**/species", species).as("species");
    cy.intercept({ method: "GET", pathname: "**/api/settings" }, settings);
  });

  it("should allow user to edit patient from analyze sample screen", () => {
    const patient = randomPatientDto({});
    const updatedPatient = randomPatientDto({
      id: patient.id,
      clientDto: randomClientDto({ id: patient.clientDto.id }),
    });

    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
      },
      [patient]
    ).as("patient-search");
    cy.intercept("GET", `**/patient/${patient.id}`, patient);
    cy.intercept("PUT", `**/patient/${patient.id}`, {}).as("updatePatient");
    cy.intercept("PUT", `**/client/${patient.clientDto.id}`, {}).as(
      "updateClient"
    );

    cy.visit("/analyzeSample");
    cy.getByTestId("patient-name-input").type(patient.patientName);
    cy.contains(patient.clientDto.lastName).click();
    cy.getByTestId("edit-button").click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/patients/${patient.id}`);
    cy.getByTestId("client-last-name-input").type("1");
    cy.getByTestId("patient-input").type("1");
    cy.getByTestId("client-first-name-input").type("1");
    cy.getByTestId("client-id-input").type("1");
    cy.getByTestId("pims-patient-id-clear-button").should("be.enabled");
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
      },
      [updatedPatient]
    );
    cy.get(".spot-button").contains("Save").click();
    cy.wait("@updateClient");
    cy.wait("@updatePatient");
    cy.getByTestId("patient-search-results")
      .containedWithinTestId(
        "patient-search-results",
        updatedPatient.patientName
      )
      .containedWithinTestId(
        "patient-search-results",
        updatedPatient.clientDto.lastName
      )
      .containedWithinTestId(
        "patient-search-results",
        updatedPatient.clientDto.clientId
      );
  });

  it("should allow user to cancel out of an edit workflow using the cancel button", () => {
    const patient = randomPatientDto({});
    cy.intercept("GET", `**/patient/${patient.id}`, patient);
    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/patient",
      },
      [patient]
    ).as("patient-search");
    cy.visit("/analyzeSample");
    cy.getByTestId("patient-name-input").type(patient.patientName);
    cy.contains(patient.clientDto.lastName).click();
    cy.wait("@patient-search");
    cy.getByTestId("edit-button").click();
    cy.getByTestId("patient-input").type("New Name");
    cy.contains("Cancel").click();
    cy.getByTestId("cancel-changes-modal")
      .containedWithinTestId(
        "cancel-changes-modal",
        "Are you sure you want to exit without saving?"
      )
      .containedWithinTestId("cancel-changes-modal", "Close")
      .containedWithinTestId("cancel-changes-modal", "Discard Changes")
      .containedWithinTestId("cancel-changes-modal", "Discard");
    cy.getByTestId("done-button").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/analyzeSample?patientName=${
        patient.patientName
      }`
    );
  });
});
