import dayjs from "dayjs";
import { ClientDto } from "@viewpoint/api";
import { getDefaultSettings } from "../../util/general-utils";

describe("Enter New Patient", () => {
  beforeEach(() => {
    cy.intercept({ method: "GET", pathname: "**/api/client" }, []).as(
      "getClient"
    );
    cy.intercept("POST", "**/api/patient", []).as("patient");
    cy.intercept("POST", "**/api/client", ["Id=1"]).as("client");
    cy.intercept("**/settings?**", getDefaultSettings());
    cy.intercept("GET", "**/api/species", [
      {
        id: 2,
        speciesName: "Canine",
        speciesType: "Canine",
        speciesClass: "LifeStage",
      },
      {
        id: 6,
        speciesName: "Ferret",
        speciesType: "Ferret",
        speciesClass: "Other",
      },
    ]).as("species");
    cy.intercept("GET", "**/api/species/2/breeds", [
      {
        id: 1272,
        breedName: "Catahoula",
        localeName: "US",
      },
      {
        id: 1273,
        breedName: "Swedish Valhund",
        localeName: "US",
      },
    ]);
    cy.intercept("GET", "**/api/species/2/referenceClassifications", [
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
    ]);
    cy.intercept("GET", "**/api/patient/genders", [
      {
        id: 1,
        genderName: "Male",
      },
      {
        id: 2,
        genderName: "Female",
      },
      {
        id: 3,
        genderName: "Neutered",
      },
      {
        id: 4,
        genderName: "Spayed",
      },
    ]);
  });

  it("allows user to add a new patient", () => {
    cy.visit("/addPatient");
    cy.getByTestId("patient-input").type("Scooby");
    cy.getByTestId("client-last-name-input").type("Doo");
    cy.getByTestId("client-first-name-input").type("Julian");
    cy.getByTestId("client-id-input").type("001");
    cy.getByTestId("species-select").select("Canine");
    cy.getByTestId("breed-select").select("Catahoula");
    cy.getByTestId("gender-select").select("Male");
    cy.getByTestId("last-known-weight-input").type("20");
    cy.getByTestId("lifestage-select").select("Adult Canine");

    cy.getByTestId("age-month-input").type("12");
    cy.getByTestId("age-date-input").type("18");
    cy.getByTestId("age-year-input").type("2020");
    cy.getByTestId("age-approximate-checkbox").should("not.be.checked");
    cy.getByTestId("next-button").click();
    cy.wait("@patient")
      .its("request.body")
      .should("deep.equal", {
        "@class": "com.idexx.labstation.core.dto.input.PatientSaveEditDto",
        birthDateCalculated: false,
        breedDto: {
          id: 1272,
        },
        genderDto: {
          id: 1,
        },
        clientDto: {},
        lastKnownRefClassDto: {
          id: 3,
        },
        birthDate: "2020-12-18",
        patientName: "Scooby",
        speciesDto: {
          id: 2,
        },
        lastKnownWeight: "20",
      });
  });

  it("allows user to add a new patient and approximate the DOB", () => {
    cy.visit("/addPatient");
    cy.getByTestId("patient-input").type("Scooby");
    cy.getByTestId("client-last-name-input").type("Doo");
    cy.getByTestId("client-first-name-input").type("Julian");
    cy.getByTestId("client-id-input").type("001");
    cy.getByTestId("species-select").select("Canine");
    cy.getByTestId("breed-select").select("Catahoula");
    cy.getByTestId("gender-select").select("Male");
    cy.getByTestId("last-known-weight-input").type("20");
    cy.getByTestId("lifestage-select").select("Adult Canine");
    cy.getByTestId("age-input").type("20");
    cy.getByTestId("age-approximate-checkbox").should("be.checked");
    cy.getByTestId("age-category-select").select("Years");
    cy.getByTestId("next-button").click();
    cy.wait("@patient")
      .its("request.body")
      .should("deep.equal", {
        "@class": "com.idexx.labstation.core.dto.input.PatientSaveEditDto",
        ageIsApproximate: true,
        birthDateCalculated: true,
        birthDate: dayjs().subtract(20, "years").format("YYYY-MM-DD"),
        patientName: "Scooby",
        lastKnownWeight: "20",
        breedDto: {
          id: 1272,
        },
        clientDto: {},
        genderDto: {
          id: 1,
        },
        lastKnownRefClassDto: {
          id: 3,
        },
        speciesDto: {
          id: 2,
        },
      });
  });

  it("does not enable the next button until appropriate fields are entered", () => {
    cy.visit("/addPatient");
    cy.getByTestId("next-button").should("be.disabled");

    cy.getByTestId("patient-input").type("Scooby");
    cy.getByTestId("next-button").should("be.disabled");
    cy.getByTestId("client-id-input").type("001");
    cy.getByTestId("next-button").should("be.disabled");
    cy.getByTestId("species-select").select("Canine");
    cy.getByTestId("next-button").should("be.disabled");
    cy.getByTestId("lifestage-select").select("Adult Canine");
    cy.getByTestId("next-button").should("be.enabled");

    cy.visit("/addpatient");
    cy.getByTestId("next-button").should("be.disabled");

    // "Other" species don't have a life stage to select
    cy.getByTestId("patient-input").type("Scooby");
    cy.getByTestId("client-id-input").type("001");
    cy.getByTestId("species-select").select("Ferret");

    cy.getByTestId("next-button").should("be.enabled");
  });

  it("displays client selection drop down if there are any matches", () => {
    const expectedClients: ClientDto[] = [
      {
        id: 1,
        clientId: "C123",
        lastName: "Jones",
        firstName: "James",
      },
      {
        id: 2,
        clientId: "C1234",
        lastName: "Reynolds",
        firstName: "John",
      },
      {
        id: 3,
        clientId: "C1230001",
        lastName: "Smith",
        firstName: "Robert",
      },
    ];
    cy.intercept("GET", "**/api/client?clientIdentifier=*", expectedClients).as(
      "matched-clients"
    );

    cy.visit("/addPatient");
    cy.getByTestId("client-match-container", { timeout: 0 }).should(
      "not.exist"
    );
    cy.getByTestId("client-id-input").type("C123");
    cy.wait("@matched-clients");
    cy.getByTestId("client-match-container").should("be.visible");

    cy.contains("Jones, James (C123)").should("be.visible");
    cy.contains("Reynolds, John (C1234)").should("be.visible");
    cy.contains("Smith, Robert (C1230001)").should("be.visible");

    cy.getByTestId("client-last-name-input").should("be.empty");
    cy.getByTestId("client-first-name-input").should("be.empty");

    // Select one of the clients, the fields should fill in with that client's details
    cy.contains("Reynolds, John (C1234)").click();

    cy.getByTestId("client-last-name-input").should("have.value", "Reynolds");
    cy.getByTestId("client-first-name-input").should("have.value", "John");

    cy.get('[data-testid="client-match-container"]', { timeout: 0 }).should(
      "not.exist"
    );
  });

  it("should initially focus patient name input with keyboard visible", () => {
    cy.visit("/analyzeSample");

    cy.getByTestId("add-new-button").click();

    cy.getByTestId("patient-input").should("be.focused");
    cy.getByTestId("keyboard").should("be.visible");
  });

  it("should persist typed information on patient search into add new patient", () => {
    cy.visit("/analyzeSample");

    cy.getByTestId("patient-name-input").type("Scooby");
    cy.getByTestId("last-name-input").type("Doo");
    cy.getByTestId("client-id-input").type("001");

    //anti-flake: wait for location change before interacting
    cy.location("search").should((search) => {
      expect(search).match(/^[?]/);
      expect(search).not.match(/undefined/);
    });

    cy.getByTestId("add-new-button").click();

    cy.getByTestId("patient-input").should("have.value", "Scooby");
    cy.getByTestId("client-last-name-input").should("have.value", "Doo");
    cy.getByTestId("client-id-input").should("have.value", "001");
  });
});
