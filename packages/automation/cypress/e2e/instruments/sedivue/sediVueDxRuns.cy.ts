import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import { startAndRunNewLabRequest } from "../../../util/tasks/common-steps";
import { ResultSet } from "../../../util/instrument-simulator/Results";

describe("SediVue Dx run workflows", () => {
  let svdxInstrument: IrisInstrumentDto;
  const resultSet: ResultSet = {
    results: [
      {
        assay: { name: "WBC" },
        value: "1.0",
        notes: [
          {
            type: {
              qualifier: "RA",
              code: "SEMI_QUANTITATIVE_RANGE",
              arguments: ["NSOR", "0", "inc", "1.0", "inc"],
            },
          },
          {
            type: {
              use: true,
              qualifier: "RA",
              code: "SEMI_QUANTITATIVE_RANGE",
              arguments: ["1 - 5 /HPF", "1.0", "exc", "3.0", "inc"],
            },
          },
          {
            type: {
              qualifier: "RA",
              code: "SEMI_QUANTITATIVE_RANGE",
              arguments: ["6 - 20 /HPF", "3.0", "exc", "20.5", "inc"],
            },
          },
        ],
      },
    ],
    notes: [
      {
        // This is needed to let IVLS process non-urine results -- since the
        // actual result values will be suppressed, if there is no image count,
        // IVLS will just drop the results
        type: {
          qualifier: "OA",
          code: "IMAGE_COUNT",
          arguments: ["70", "70"],
        },
      },
    ],
    delayAmount: 100,
    acceptDelay: 100,
    postAcceptDelay: 100,
  };

  beforeEach(() => {
    cy.task("iris:get-instruments", ["SediVue Dx"]).then(([svdx]) => {
      svdxInstrument = svdx;
      cy.task("iris:set-results", [{ instrumentId: svdx.id, resultSet }]);
    });
  });

  it("can initiate a SediVue Dx run and view its results", () => {
    startAndRunNewLabRequest([svdxInstrument.instrumentSerialNumber]).then(
      (patientDetails) => {
        cy.getByTestId("recent-result-card")
          .contains(patientDetails.patientName)
          .click();
        cy.getByTestId("results-page-result-cell-WBC").should(
          "contain",
          "1 - 5 /HPF"
        );
        cy.getByTestIdContains("results-page-image-thumbnail")
          .should("have.length", 3)
          .should("be.visible");
      }
    );
  });

  describe("non-urine sample types", () => {
    const NON_URINE_SAMPLE_TYPES = [
      "Synovial",
      "Abdominal",
      "Thoracic",
      "CSF",
      "Other",
    ];

    for (const sampleType of NON_URINE_SAMPLE_TYPES) {
      it(`can initiate a SediVue Dx run for sample type ${sampleType} and view its results with an added disclaimer`, () => {
        startAndRunNewLabRequest([svdxInstrument.instrumentSerialNumber], {
          runConfigurationCallbacks: {
            [svdxInstrument.instrumentSerialNumber]: () => {
              cy.getByTestId("sample-type-select").select(sampleType);
              // Verify warning is shown to user
              cy.contains(
                "Fluid type has not been validated. For research purposes only."
              ).should("be.visible");
            },
          },
        }).then((patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName, { timeout: 30000 })
            .should("be.visible")
            .click();
          // Results are suppressed for non-valid sample types
          cy.getByTestId("results-page-result-cell-WBC").should("not.exist");
          // Images are still visible
          cy.getByTestIdContains("results-page-image-thumbnail")
            .should("have.length", 3)
            .should("be.visible");
          // Sample type warning added to results
          cy.contains(
            `Sample Type: ${
              sampleType === "Other" ? "Other fluid" : sampleType
            }. For research purposes only.`
          );
        });
      });
    }
  });

  it("can initiate a SediVue Dx dilution run and verify the results applied the dilution factor", () => {
    startAndRunNewLabRequest([svdxInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [svdxInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("run-config-toggle-label-DILUTION").click();
          cy.getByTestId("add-button").click(); // One click ups the dilution to 1 + 2 = 3 total parts
          cy.get(".spot-button").contains("Save").click();
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName)
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-WBC").should(
        "contain",
        "1 - 5 /HPF"
      );
      cy.contains(
        "Test results for the latest analyzer run have been multiplied by the dilution factor for a dilution of 1 in 3 total"
      ).should("be.visible");
    });
  });

  it("can initiate a SediVue Dx Bacteria Reflex run and verify the results", () => {
    const bacteriaResults: ResultSet = {
      ...resultSet,
      notes: [
        {
          type: {
            qualifier: "G",
            code: "BACTERIAL_REFLEX_RUN",
          },
        },
      ],
    };
    cy.task("iris:set-results", [
      { instrumentId: svdxInstrument.id, resultSet: bacteriaResults },
    ]);
    startAndRunNewLabRequest([svdxInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [svdxInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("run-config-toggle-label-BACTERIA_REFLEX").click();
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName)
        .should("be.visible")
        .click();

      cy.contains(
        "Bacteria results verified by SediVue Bacteria Confirmation Kit."
      ).should("be.visible");
    });
  });

  it("automatically adds manual UA to SediVue run if the option is enabled", () => {
    startAndRunNewLabRequest([svdxInstrument.instrumentSerialNumber], {
      patientName: "Patient-Without-mUA",
    });
    // Verify there is no Manual UA on the first run
    cy.containedWithinTestId("in-process-card", "Patient-Without-mUA")
      .as("firstRunCard")
      .should("be.visible")
      .contains("SediVue Dx");
    cy.get("@firstRunCard").contains("Manual UA").should("not.exist");

    // Turn on the setting
    cy.getByTestId("instrument-bar-root").contains("SediVue Dx").click();
    cy.getByTestId("svdx-settings-button").should("be.enabled").click();
    cy.getByTestId("svdx-settings-auto-add-ua-toggle")
      // Disabled by default due to the DEFAULT_E2E_SETTINGS values
      .should("not.be.checked")
      // force: true required because the actual toggle input is 0x0 by SPOT
      .check({ force: true });

    // Start a new lab request
    startAndRunNewLabRequest([svdxInstrument.instrumentSerialNumber], {
      patientName: "Patient-With-mUA",
    });

    // Verify a Manual UA was automatically added to the second run
    cy.containedWithinTestId("in-process-card", "Patient-With-mUA")
      .contains("Manual UA")
      .should("be.visible");
  });
});
