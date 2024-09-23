import {
  randomArrayOf,
  randomInstrumentResult,
  randomInstrumentRun,
  randomLabRequest,
} from "@viewpoint/test-utils";
import {
  AdditionalAssays,
  Color,
  InstrumentRunDto,
  InstrumentType,
  QualifierTypeEnum,
  ServiceCategory,
  SnapResultTypeEnum,
  InstrumentResultDto,
} from "@viewpoint/api";

describe("results page > manage results", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/patient/*/labRequestRecords", [
      {
        labRequestId: 100,
        deviceUsageMap: {},
      },
    ]);

    cy.intercept("GET", "**/api/labRequest/*/undoMergeRuns", {
      previousRunsByCurrentRunId: {},
    });
  });
  it("can be used to reassign a record to a new patient", () => {
    const labRequest = randomLabRequest({ id: 100 });
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/labRequest/${labRequest.id}`,
      },
      labRequest
    ).as("detailedResults");
    cy.visit(`labRequest/${labRequest.id}`);
    cy.wait("@detailedResults");
    cy.getByTestId("manage-results-button").click();
    cy.getByTestId("manage-results-reassign-results-card").click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/labRequest/${labRequest.id}/transfer`
    );
  });

  it("can be used to undo a merge/replace run", () => {
    const mergedResult = randomInstrumentResult({
      assayIdentityName: "uniqueAssay",
      assay: "Unique Assay",
      resultValueForDisplay: "1.01!!!",
    });
    const previousResult: InstrumentResultDto = {
      ...mergedResult,
      resultValueForDisplay: "1.99!!!",
    };
    const additionalResults = randomArrayOf({
      length: 9,
      valueFn: () => randomInstrumentResult(),
    });

    const mergedRun = randomInstrumentRun({
      instrumentResultDtos: [...additionalResults, mergedResult],
    });
    const previousRun: InstrumentRunDto = {
      ...mergedRun,
      instrumentResultDtos: [...additionalResults, previousResult],
    };

    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [mergedRun],
      containsMergedRuns: true,
    });
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/labRequest/${labRequest.id}`,
      },
      labRequest
    ).as("detailedResults");

    cy.intercept("GET", `**/api/labRequest/${labRequest.id}/undoMergeRuns`, {
      previousRunsByCurrentRunId: { [`${mergedRun.id}`]: previousRun },
    });

    cy.visit(`labRequest/${labRequest.id}`);
    cy.wait("@detailedResults");

    cy.getByTestId("manage-results-button").click();
    cy.getByTestId("manage-results-undo-merge-card").click();

    // Verify that the differing assays are bolded
    cy.contains("Unique Assay").should(
      "have.class",
      "spot-typography__font-weight--bold"
    );
    cy.contains("1.01!!!").should(
      "have.class",
      "spot-typography__font-weight--bold"
    );
    cy.contains("1.99!!!").should(
      "have.class",
      "spot-typography__font-weight--bold"
    );

    // Use merge results should be checked by default
    cy.getByTestId("undo-merge-use-merge-results-radio")
      .as("useMerge")
      .should("be.checked");
    cy.getByTestId("undo-merge-use-previous-results-radio")
      .as("usePrevious")
      .should("not.be.checked");
    // SPOT hides the actual radio button -- need to force the click
    cy.get("@usePrevious").check({ force: true });
    cy.get("@usePrevious").should("be.checked");
    cy.get("@useMerge").should("not.be.checked");

    cy.intercept("POST", `**/api/labRequest/${labRequest.id}/undoMerge`, {}).as(
      "undoMergeRequest"
    );
    cy.getByTestId("done-button").click();
    cy.wait("@undoMergeRequest");
  });

  it("does not allow editing or undoing merge results if there are no merged or editable runs", () => {
    const labRequest = randomLabRequest({ id: 100, containsMergedRuns: false });
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/labRequest/${labRequest.id}`,
      },
      labRequest
    ).as("detailedResults");
    cy.visit(`labRequest/${labRequest.id}`);
    cy.wait("@detailedResults");

    cy.getByTestId("manage-results-button").click();

    // Cypress's "be.disabled" check only works on form elements
    cy.getByTestId("manage-results-edit-results-card").should(
      "have.attr",
      "disabled",
      "disabled"
    );
    cy.getByTestId("manage-results-undo-merge-card").should(
      "have.attr",
      "disabled",
      "disabled"
    );
  });

  it("can be used to edit SNAP results", () => {
    const snapRun = randomInstrumentRun({
      instrumentType: InstrumentType.SNAP,
      serviceCategory: ServiceCategory.SNAP,
      editable: true,
      snapDeviceDto: {
        snapDeviceId: 19,
        displayNamePropertyKey: "Instrument.Snap.Canine.Lepto",
      },
      instrumentResultDtos: [
        randomInstrumentResult({
          assay: "Lepto",
          resultText: "Positive",
          qualifierType: QualifierTypeEnum.EQUALITY,
          assayIdentityName: "Lepto",
        }),
      ],
    });
    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [snapRun],
    });

    cy.intercept(
      {
        method: "GET",
        pathname: "**/api/labRequest/100",
      },
      labRequest
    ).as("detailedResults");

    cy.intercept(
      {
        pathname: `**/api/instrumentRun/${snapRun.id}/results/snap`,
        method: "PUT",
      },
      {}
    ).as("editSnapResults");

    cy.visit("labRequest/100");
    cy.wait("@detailedResults");

    cy.getByTestId("manage-results-button").should("be.enabled").click();

    cy.getByTestId("manage-results-edit-results-card").click();
    cy.getByTestId("manual-entry-slideout").should("be.visible");

    cy.getByTestId("snap-results-entry-test-name").should("have.text", "Lepto");

    cy.getByTestId("snap-dot-label-Lepto")
      .as("label")
      .should("contain.text", "Positive");
    cy.getByTestId("snap-selectable-dot-Lepto").click();
    cy.get("@label").should("contain.text", "Negative");
    cy.getByTestId("snap-results-entry-save-button").click();

    cy.wait("@editSnapResults")
      .its("request.body.snapResultType")
      .should("eq", SnapResultTypeEnum.CANINE_LEPTO_NEGATIVE);
  });

  it("can be used to edit manual UA results", () => {
    const muaRun = randomInstrumentRun({
      instrumentType: InstrumentType.ManualUA,
      serviceCategory: ServiceCategory.Urinalysis,
      editable: true,
      instrumentResultDtos: [
        randomInstrumentResult({
          assay: AdditionalAssays.Color,
          resultValueForDisplay: Color.Straw,
          qualifierType: QualifierTypeEnum.EQUALITY,
          assayIdentityName: AdditionalAssays.Color,
        }),
      ],
    });
    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [muaRun],
    });

    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");

    cy.intercept("GET", "**/api/labRequest/*/undoMergeRuns", {
      previousRunsByCurrentRunId: {},
    });

    cy.visit("labRequest/100");

    cy.wait("@detailedResult");
    cy.getByTestId("manage-results-button").should("be.enabled").click();
    cy.getByTestId("manage-results-edit-results-card").click();
    cy.getByTestId("manual-entry-slideout").should("be.visible");
  });
});
