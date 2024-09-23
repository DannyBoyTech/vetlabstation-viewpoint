import {
  PimsRequestTypeEnum,
  ReferenceClassType,
  SpeciesType,
  PendingPimsRequestMatchDto,
} from "@viewpoint/api";
import { getDefaultSettings, getRandomValue } from "../../util/general-utils";
import {
  interceptRequestsForHomeScreen,
  interceptRequestsForSelectInstruments,
} from "../../util/default-intercepts";
import {
  randomDoctor,
  randomDouble,
  randomLabRequest,
  randomNumericString,
  randomPimsRequestDto,
  randomRefClass,
} from "@viewpoint/test-utils";

describe("home page pending list", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  it("successfully displays pending requests", () => {
    const pendingRequests = new Array(5).fill(1).map((_v, index) =>
      randomPimsRequestDto({
        pimsRequestType: PimsRequestTypeEnum.PENDING,
        patientName: `Patient-${index}`,
        pimsPatientId: `PIMSID-${index}`,
        clientFirstName: `First-${index}`,
        clientLastName: `Last-${index}`,
        patientSpecies: {
          id: 1,
          speciesName: getRandomValue([
            SpeciesType.Canine,
            SpeciesType.Feline,
            SpeciesType.Equine,
          ]),
          speciesClass: ReferenceClassType.LifeStage,
        },
        pimsServiceRequests: [
          { profileName: "Service 1" },
          { profileName: "Service 2" },
        ],
      })
    );
    cy.intercept("GET", "**/pims/pending", pendingRequests).as(
      "pendingRequests"
    );
    cy.visit("/");
    cy.wait("@pendingRequests");

    for (const pendingRequest of pendingRequests) {
      const expectedServicesString = pendingRequest.pimsServiceRequests
        .map((service) => service.profileName)
        .join(", ");
      // Find the request's top level component
      cy.getByTestId("pending-list-item")
        // Use the selector arg to keep the pending list item as the selected item to query off of
        .containedWithinTestId(
          "pending-list-item",
          `${pendingRequest.patientName} ${pendingRequest.clientLastName}`
        )
        .containedWithinTestId(
          "pending-list-item",
          pendingRequest.pimsPatientId
        )
        .containedWithinTestId(
          "pending-list-item",
          `${pendingRequest.requisitionId} | ${expectedServicesString}`
        )
        .find(
          `.icon-animal-${pendingRequest.patientSpecies.speciesName.toLowerCase()}`
        );
    }
  });

  it("successfully allows searching pending requests by patient name", () => {
    const pendingRequests = [
      randomPimsRequestDto({
        patientName: "Snoop",
        pimsPatientId: "ab01e",
        clientFirstName: "Jagger",
        clientLastName: "Charles",
      }),
      randomPimsRequestDto({
        patientName: "Chulo",
        pimsPatientId: "qcc41",
        clientFirstName: "Viper",
        clientLastName: "Smith",
      }),
      randomPimsRequestDto({
        patientName: "Ayo",
        pimsPatientId: "e3csa",
        clientFirstName: "Clifton",
        clientLastName: "Silas",
      }),
    ];
    cy.intercept("GET", "**/pims/pending", pendingRequests).as(
      "pendingRequests"
    );
    cy.visit("/");
    cy.wait("@pendingRequests");
    cy.getByTestId("pending-pims-search-button").click();
    //search by first name
    cy.getByTestId("pending-pims-search-input").type("Snoop");
    cy.getByTestId("pending-list-item").should("have.length", 1);
    //search by last name
    cy.getByTestId("pending-pims-search-input").clear();
    cy.getByTestId("pending-pims-search-input").type("Charles");
    cy.getByTestId("pending-list-item").should("have.length", 1);
    //search by first and last name
    cy.getByTestId("pending-pims-search-input").clear();
    cy.getByTestId("pending-pims-search-input").type("Snoop Charles");
    cy.getByTestId("pending-list-item").should("have.length", 1);
  });

  it("brings user to the add test screen when running a PIMS request that has a matching lab request", () => {
    const pendingRequest = randomPimsRequestDto({
      pimsRequestType: PimsRequestTypeEnum.PENDING,
    });
    cy.intercept("GET", "**/pims/pending", [pendingRequest]).as(
      "pendingRequests"
    );
    const matchedLabRequest = randomLabRequest({
      doctorDto: randomDoctor(),
      refClassDto: randomRefClass(),
      weight: randomDouble({ minIncl: 10, maxExcl: 100 }).toFixed(2),
    });
    const matchData: PendingPimsRequestMatchDto = {
      doctorDto: matchedLabRequest.doctorDto,
      existingLabRequest: matchedLabRequest,
      patientDto: matchedLabRequest.patientDto,
      pimsRequestDto: pendingRequest,
      weight: matchedLabRequest.weight,
      matchSuggestions: [],
    };
    cy.intercept("**/api/pims/pending/*/match", matchData);
    cy.intercept(
      { pathname: `**/api/labRequest/${matchedLabRequest.id}` },
      matchedLabRequest
    );

    interceptRequestsForSelectInstruments({
      doctors: [matchData.doctorDto],
      settings: { ...getDefaultSettings(), DISPLAY_PENDING_REQUESTS: "true" },
    });

    cy.visit("/");
    cy.wait("@pendingRequests");

    cy.getByTestId("pending-list-item").click();

    cy.getByTestId("addTest-button").should("be.visible");
    cy.getByTestId("test-order").should(
      "have.text",
      pendingRequest.pimsServiceRequests
        .map((psr) => psr.profileName)
        .join(", ")
    );

    cy.getByTestId("requisition-id-input")
      .should("be.disabled")
      .should("have.value", pendingRequest.requisitionId);
    cy.getByTestId("ref-class-select")
      .should("be.disabled")
      .should("have.value", matchedLabRequest.refClassDto.id);
    cy.getByTestId("doctor-input")
      .should("be.disabled")
      .should("have.value", matchedLabRequest.doctorDto.id);
    cy.getByTestId("last-known-weight-input")
      .should("be.disabled")
      .should("have.value", parseFloat(matchedLabRequest.weight).toString());
  });
});
