import { PatientDto, ReferenceClassType, SpeciesType } from "@viewpoint/api";
import dayjs from "dayjs";
import { getDefaultSettings } from "../../util/general-utils";
import {
  randomClientDto,
  randomLabRequest,
  randomPatientDto,
} from "@viewpoint/test-utils";

const fakeLabRequest = (id: number, patient: PatientDto) => {
  return randomLabRequest({
    id,
    patientDto: patient,
  });
};

const speciesIdsByType = {
  [SpeciesType.Alpaca]: 27,
  [SpeciesType.Canine]: 2,
  [SpeciesType.Equine]: 4,
  [SpeciesType.Feline]: 3,
};

export const fakeLabRequestRecord = (labRequestId: number) => {
  return {
    labRequestId,
    labRequestDate: new Date(),
    deviceUsageMap: {
      CATONE: {
        instrumentType: "CATONE",
        usage: "USED",
        assays: [
          {
            "@class": "com.idexx.labstation.core.dto.AssayDto",
            id: 7,
            assayIdentityName: "BUN",
            sampleTypeId: 13,
            associatedDeviceId: 18,
            assayOrderAlpha: 106,
            assayOrderOrgan: 90,
            conversionFactor: null,
            precision: null,
          },
        ],
      },
    },
  };
};

const rodney = randomPatientDto({
  id: 1,
  patientName: "Rodyney",
  clientDto: randomClientDto({ lastName: "Dangerfield" }),
  speciesDto: {
    id: speciesIdsByType[SpeciesType.Alpaca],
    speciesName: SpeciesType.Alpaca,
    speciesClass: ReferenceClassType.Other,
  },
});

const bill = randomPatientDto({
  id: 2,
  patientName: "Bill",
  clientDto: randomClientDto({ lastName: "Burr" }),
  speciesDto: {
    id: speciesIdsByType[SpeciesType.Alpaca],
    speciesName: SpeciesType.Alpaca,
    speciesClass: ReferenceClassType.Other,
  },
});

const labRequest1 = fakeLabRequest(1, rodney);
const labRequest2 = fakeLabRequest(2, rodney);
const labRequest3 = fakeLabRequest(3, bill);
const labRequest4 = fakeLabRequest(4, bill);

describe("transfer results", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/settings",
      },
      getDefaultSettings()
    ).as("apiSettings");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/species",
      },
      [
        {
          "@class": "com.idexx.labstation.core.dto.SpeciesDto",
          id: 2,
          speciesName: "Canine",
          speciesType: "Canine",
          speciesClass: "LifeStage",
        },
        {
          "@class": "com.idexx.labstation.core.dto.SpeciesDto",
          id: 3,
          speciesName: "Feline",
          speciesType: "Feline",
          speciesClass: "LifeStage",
        },
        {
          "@class": "com.idexx.labstation.core.dto.SpeciesDto",
          id: 4,
          speciesName: "Equine",
          speciesType: "Equine",
          speciesClass: "LifeStage",
        },
        {
          "@class": "com.idexx.labstation.core.dto.SpeciesDto",
          id: 27,
          speciesName: "Alpaca",
          speciesType: "Alpaca",
          speciesClass: "Other",
        },
      ]
    ).as("apiSpecies");

    cy.intercept(
      {
        method: "POST",
        pathname: "/labstation-webapp/api/labRequest/1/transfer",
      },
      (req) => {
        expect(req.body).to.equal(bill.id);
        req.reply({
          statusCode: 204,
        });
      }
    ).as("transferApiCall");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/labRequest/1",
      },
      labRequest1
    ).as("labRequest1");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/labRequest/2",
      },
      labRequest2
    ).as("labRequest2");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/labRequest/3",
      },
      labRequest3
    ).as("labRequest3");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/labRequest/4",
      },
      labRequest4
    ).as("labRequest4");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/patient/species",
        query: {
          patientName: "B*",
        },
      },
      [bill]
    ).as("billPatientSearch");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/patient/*/labRequestRecords",
      },
      []
    ).as("catchallLabRequestRecords");

    cy.intercept(
      {
        method: "GET",
        pathname: "/labstation-webapp/api/device/status",
      },
      []
    ).as("deviceStatus");

    cy.visit("/labRequest/1/transfer");

    cy.getByTestId("patient-name-input").as("patientNameInput");
    cy.getByTestId("last-name-input").as("familyNameInput");
    cy.getByTestId("client-id-input").as("clientIdInput");
    cy.getByTestId("transfer-button").as("transferButton");
    cy.getByTestId("patient-search-results").as("patientSearchResults");
    cy.getByTestId("add-new-button").as("addNewPatientButton");
  });

  it("should display patient search results returned from server", () => {
    cy.get("@patientNameInput").type(bill.patientName);

    cy.wait("@billPatientSearch")
      .its("request.url")
      .should("not.contain", "daysBack")
      .should("contain", "speciesId=27");

    cy.get("@patientSearchResults")
      .find(".patient-search-result")
      .should("have.length", 1)
      .first()
      .should("contain.text", bill.patientName)
      .and("contain.text", bill.clientDto?.lastName);
  });

  describe("transfer button", () => {
    it("should not be enabled when no patient is selected", () => {
      cy.get("@patientNameInput").clear();
      cy.get("@patientSearchResults")
        .find(".patient-search-result")
        .should("have.length", 0);
      cy.get("@transferButton").should("be.visible").and("be.disabled");
    });

    it("should be enabled when patient is selected", () => {
      cy.get("@patientNameInput").type(bill.patientName);
      cy.get("@patientSearchResults")
        .find(".patient-search-result")
        .should("have.length", 1)
        .first()
        .click();

      cy.get("@transferButton").should("be.visible").and("be.enabled");
    });
  });

  describe("transfer modal", () => {
    beforeEach(() => {
      cy.get("@patientNameInput").type(bill.patientName);

      cy.get("@patientSearchResults")
        .find(".patient-search-result")
        .as("allResults");

      cy.get("@allResults").should("have.length", 1).first().as("firstResult");

      cy.get("@firstResult").click();

      cy.get("@transferButton").click();
      cy.getByTestId("confirm-modal")
        .should("contain.text", "Reassign Results")
        .as("transferModal");

      cy.getByTestId("transfer-results-detail").as("transferDetail");
      cy.getByTestId("later-button").as("cancelButton");
      cy.getByTestId("done-button").as("confirmButton");
    });

    it("should prompt user if they are sure they want to transfer to selected patient", () => {
      cy.get("@transferModal").should(
        "contain.text",
        `Are you sure you want to reassign the results below to ${bill.patientName} ${bill.clientDto?.lastName}?`
      );
    });

    it("should display a summary details for the results to be transferred", () => {
      cy.get("@transferDetail").should(
        "contain.text",
        `${rodney.patientName} ${rodney.clientDto?.lastName}`
      );

      cy.get("@transferDetail")
        .find("[data-testid='request-date']")
        .should(
          "contain.text",
          dayjs(labRequest1.requestDate).format("M/DD/YY h:mm A")
        );

      cy.get("@transferDetail")
        .find("[data-testid='instruments-section']")
        .should("contain.text", "Instruments");

      cy.get("@transferDetail")
        .find("[data-testid='veterinarian-section']")
        .should("contain.text", "Veterinarian");

      cy.get("@transferDetail")
        .find("[data-testid='requisition-section']")
        .should("contain.text", "Requisition");
    });

    describe("reassign confirm button", () => {
      it("should have label 'Reassign'", () => {
        cy.get("@confirmButton").invoke("text").should("equal", "Reassign");
      });

      it("should transfer results to selected patient when clicked", () => {
        cy.get("@confirmButton").click();
        cy.wait("@transferApiCall");
      });

      it("should navigate to latest source patient result if there are any remaining after transfer", () => {
        cy.intercept(
          {
            method: "GET",
            pathname: `/labstation-webapp/api/patient/${rodney.id}/labRequestRecords`,
          },
          [fakeLabRequestRecord(2)]
        ).as("sourcePatientRecords");

        cy.get("@confirmButton").click();

        cy.wait("@transferApiCall");

        cy.location().should("have.property", "pathname", `/labRequest/2`);

        cy.getByTestId("results-page-header").should(
          "contain.text",
          `${rodney.patientName} ${rodney.clientDto?.lastName}`
        );
      });

      it("should navigate to the transferred patient result if there are no other source patient results after transfer", () => {
        const transferredLabRequest1 = {
          ...labRequest1,
          patientDto: bill,
        };

        cy.intercept(
          {
            method: "GET",
            pathname: `/labstation-webapp/api/patient/*/labRequestRecords`,
          },
          [
            {
              labRequestId: transferredLabRequest1.id,
              deviceUsageMap: {},
            },
          ]
        ).as("patientRecords");

        cy.intercept(
          {
            method: "GET",
            pathname: "/labstation-webapp/api/labRequest/1",
          },
          transferredLabRequest1
        ).as("labRequest1");

        cy.get("@confirmButton").click();

        cy.wait("@transferApiCall");

        cy.location().should(
          "have.property",
          "pathname",
          `/labRequest/${transferredLabRequest1.id}`
        );

        cy.getByTestId("results-page-header").should(
          "contain.text",
          `${bill.patientName} ${bill.clientDto?.lastName}`
        );
      });
    });

    describe("transfer cancel button", () => {
      it("should have label 'Cancel'", () => {
        cy.get("@cancelButton").invoke("text").should("equal", "Cancel");
      });

      it("should close modal and remain on transfer page when clicked", () => {
        cy.get("@cancelButton").click();

        cy.get("@transferModal").should("not.be.visible");
        cy.location().should(
          "have.property",
          "pathname",
          `/labRequest/${labRequest1.id}/transfer`
        );
      });
    });
  });

  describe("add new patient", () => {
    const patientId = 42;
    const patientName = "Aldous";
    const patientSpeciesType = SpeciesType.Alpaca;

    const clientId = 12345678;
    const clientFamilyName = "Huxley";

    const newLinkedPatient = randomPatientDto({
      id: patientId,
      patientName,
      clientDto: randomClientDto({ id: clientId, lastName: clientFamilyName }),
      speciesDto: {
        id: speciesIdsByType[patientSpeciesType],
        speciesName: patientSpeciesType,
        speciesClass: ReferenceClassType.Other,
      },
    });

    beforeEach(() => {
      cy.intercept(
        {
          method: "GET",
          pathname: "/labstation-webapp/api/client",
        },
        []
      ).as("clientSearch");

      cy.intercept(
        {
          method: "GET",
          pathname: "/labstation-webapp/api/patient",
        },
        []
      ).as("patientSearch");

      cy.intercept(
        {
          method: "POST",
          pathname: "/labstation-webapp/api/client",
        },
        newLinkedPatient.clientDto
      ).as("clientCreate");

      cy.intercept(
        {
          method: "POST",
          pathname: "/labstation-webapp/api/patient",
        },
        newLinkedPatient
      ).as("patientCreate");

      cy.get("@addNewPatientButton")
        .should("be.visible")
        .and("be.enabled")
        .click();

      cy.location().should((location) => {
        expect(location.pathname).to.equal("/labRequest/1/transfer/addPatient");
      });

      cy.getByTestId("patient-input").as("addPatientNameInput");
      cy.getByTestId("client-last-name-input").as("addClientFamilyNameInput");
      cy.getByTestId("client-id-input").as("addClientIdInput");

      cy.getByTestId("next-button").as("addTransferButton");
      cy.getByTestId("cancel-button").as("addCancelButton");
    });

    it("should preselect species matching transfer source patient and be disabled", () => {
      cy.get("@addPatientNameInput").type(patientName);
      cy.get("@addClientFamilyNameInput").type(clientFamilyName);
      cy.get("@addClientIdInput").type(clientId.toString());

      cy.getByTestId("species-select")
        .should("be.visible")
        .and("have.value", speciesIdsByType[patientSpeciesType])
        .and("be.disabled");
    });

    it("should show enabled transfer button when patient info is entered", () => {
      cy.get("@addPatientNameInput").type(patientName);
      cy.get("@addClientFamilyNameInput").type(clientFamilyName);
      cy.get("@addClientIdInput").type(clientId.toString());

      cy.get("@addTransferButton")
        .should("contain.text", "Reassign")
        .and("be.enabled");
    });

    it("should display transfer modal on next", () => {
      cy.get("@addPatientNameInput").type(patientName);
      cy.get("@addClientFamilyNameInput").type(clientFamilyName);
      cy.get("@addClientIdInput").type(clientId.toString());

      cy.wait("@clientSearch");

      cy.get("@addTransferButton").should("be.enabled").click();

      cy.getByTestId("confirm-modal")
        .should("be.visible")
        .and("contain.text", `${patientName} ${clientFamilyName}`);
    });
  });
});
