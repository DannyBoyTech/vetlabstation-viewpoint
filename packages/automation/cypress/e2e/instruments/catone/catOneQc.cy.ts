import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import { toggleFeatureFlag } from "../../../util/tasks/task-utils";
import { ResultSet } from "../../../util/instrument-simulator/Results";
import { SampleType } from "../../../util/instrument-simulator/Results";

describe("Catalyst One QC workflows", () => {
  let catOneInstrument: IrisInstrumentDto;
  const resultSet: ResultSet = {
    results: [{ assay: { name: "QQC" }, value: "Pass" }],
    delayAmount: 1000,
    sampleType: SampleType.QUALITY_CONTROL,
  };

  beforeEach(() => {
    cy.task("ivls:toggle-feature-flag", {
      flag: "CATONE_SMARTQC",
      enabled: true,
    });
    cy.task("iris:get-instruments", ["Catalyst One"]).then(([catOne]) => {
      catOneInstrument = catOne;
      cy.task("iris:set-results", [{ instrumentId: catOne.id, resultSet }]);
    });
  });

  after(() => {
    cy.task("ivls:toggle-feature-flag", {
      flag: "CATONE_SMARTQC",
      enabled: false,
    });
  });
  //Change CATONE_SMARTQC feature flag back to default state when tests are finished

  it("can run SmartQC and view results", () => {
    cy.visit("/instruments");
    cy.contains("Catalyst One").click();
    cy.contains("Maintenance").click();
    cy.getByTestId("smartqc-button").click();
    cy.getByTestId("run-smartqc").click();
    cy.getByTestId("catone-smartqc-cleaning-modal")
      .should("be.visible")
      .getByTestId("done-button")
      .click();
    cy.contains("SmartQC Instructions", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.get(".spot-toast", { timeout: 50000 }).contains("SmartQC has passed.");
    //check for SmartQC Instruction modal popup
    cy.getByTestId("displayed-instruments").contains("Catalyst One").click();
    //Navigate to CatOne Instrument Screen via CatOne icon in instrument tray
    cy.contains("Maintenance").click();
    cy.getByTestId("smartqc-button").click();
    cy.findByRole("table");
    cy.findAllByRole("row").eq(1).contains("Pass");
    //First entry in table (second row) should contain result "Pass"
  });
});
