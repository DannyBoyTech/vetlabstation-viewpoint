import {
  LesionAppearance,
  TheiaSampleLocation,
  TheiaSite,
  TheiaSubsite,
} from "@viewpoint/api";
import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import {
  ResultSet,
  SampleType,
} from "../../../util/instrument-simulator/Results";
import { startAndRunNewLabRequest } from "../../../util/tasks/common-steps";

describe("inVue Dx run workflows", () => {
  let inVueInstrument: IrisInstrumentDto;
  let resultSet: ResultSet;

  beforeEach(() => {
    cy.task("ivls:toggle-theia-flags", true)
      .then(() => cy.task("iris:get-instruments", ["Theia"]))
      .then(([inVue]) => {
        inVueInstrument = inVue;
      });
    resultSet = {
      results: [{ assay: { name: "RBC" }, value: "1.0" }],
      delayAmount: 100,
    };
  });

  it("can initiate an inVue Dx FNA run and view its results", () => {
    cy.task("iris:set-results", [
      {
        instrumentId: inVueInstrument.id,
        resultSet: { ...resultSet, sampleType: SampleType.FNA },
      },
    ]);

    startAndRunNewLabRequest([inVueInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [inVueInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("sample-type-select").select(
            "FNA (Fine Needle Aspirate)"
          );

          // This workflow is likely to change in the future, but for now is required
          // to perform an FNA run on inVue Dx.
          cy.getByTestId("fna-workflow-next-button").should("be.disabled");
          cy.getByTestId(
            `theia-fna-sample-location-${TheiaSampleLocation.LEFT}`
          ).click({ force: true });
          cy.getByTestId(`theia-fna-sample-site-${TheiaSite.HEAD}`).click({
            force: true,
          });
          cy.getByTestId(
            `theia-fna-sample-subsite-${TheiaSubsite.HEAD_NASAL_PLANUM}`
          ).click({ force: true });
          cy.getByTestId("fna-workflow-next-button")
            .should("be.enabled")
            .click();

          cy.getByTestId("fna-workflow-save-early-button").should(
            "be.disabled"
          );
          cy.getByTestId(
            `theia-fna-lesion-appearance-${LesionAppearance.UNKNOWN}`
          ).click({ force: true });
          cy.getByTestId("fna-workflow-save-early-button")
            .should("be.enabled")
            .click();
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName, { timeout: 60000 })
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-RBC").should(
        "contain",
        "1.00 M/μL"
      );
    });
  });

  it("can initiate an inVue Dx Ear Swab run and view its results", () => {
    cy.task("iris:set-results", [
      {
        instrumentId: inVueInstrument.id,
        resultSet: { ...resultSet, sampleType: SampleType.EAR_SWAB },
      },
    ]);

    startAndRunNewLabRequest([inVueInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [inVueInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("sample-type-select").select("Ear Swab");
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName, { timeout: 60000 })
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-RBC").should(
        "contain",
        "1.00 M/μL"
      );
      cy.getByTestIdContains("results-page-image-thumbnail").should(
        "have.length",
        2
      );
    });
  });

  // NOTE -- As of right now, blood runs on inVue Dx requires a mock.json file
  // to exist in the C:\IDEXX\LabStation\DIQ folder on the target IVLS filesystem.
  // If you run this test and results do not appear, that is probably the issue.
  // There is currently no way to configure the mock DIQ process on IVLS remotely.
  //
  // An example mock.json file is included next to this test file.
  it("can initiate an inVue Dx Blood run and view its results", () => {
    cy.task("iris:set-results", [
      {
        instrumentId: inVueInstrument.id,
        resultSet: { ...resultSet, sampleType: SampleType.BLOOD },
      },
    ]);

    startAndRunNewLabRequest([inVueInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [inVueInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("sample-type-select").select("Blood");
          cy.getByTestId("done-button").contains("Skip").click();
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName, { timeout: 60000 })
        .should("be.visible")
        .click();
      cy.getByTestId("results-page-result-cell-RBC").should(
        "contain",
        "1.00 M/μL"
      );
      cy.getByTestIdContains("results-page-image-thumbnail").should(
        "have.length",
        4
      );
    });
  });

  it("prevents merge/replace if an inVue is being added to the run", () => {
    startAndRunNewLabRequest([inVueInstrument.instrumentSerialNumber], {
      runConfigurationCallbacks: {
        [inVueInstrument.instrumentSerialNumber]: () => {
          cy.getByTestId("sample-type-select").select("Ear Swab");
        },
      },
    }).then((patientDetails) => {
      cy.getByTestId("recent-result-card")
        .contains(patientDetails.patientName, { timeout: 60000 })
        .should("be.visible")
        .click();
      cy.get(".spot-button").contains("Add Test").click();
      cy.getByTestId(
        `selectable-analyzer-${inVueInstrument.instrumentSerialNumber}`
      ).click();
      cy.getByTestId("sample-type-select").select("Ear Swab");
      cy.get(".spot-button").contains("Add Test").click();
      cy.getByTestId("merge-button").should("not.exist");
      cy.contains(
        "Note: Merge/Replace is not an option for this run because it includes IDEXX inVue Dx."
      ).should("be.visible");
    });
  });
});
