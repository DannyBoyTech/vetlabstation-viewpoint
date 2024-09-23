import { IrisInstrumentDto } from "../../../util/instrument-simulator";
import { toggleFeatureFlag } from "../../../util/tasks/task-utils";
import { ResultSet } from "../../../util/instrument-simulator/Results";
import { SampleType } from "../../../util/instrument-simulator/Results";

describe("Catalyst Dx QC workflows", () => {
  let catDxInstrument: IrisInstrumentDto;
  const resultSet: ResultSet = {
    results: [{ assay: { name: "QQC" }, value: "Pass" }],
    delayAmount: 1000,
    sampleType: SampleType.QUALITY_CONTROL,
  };

  beforeEach(() => {
    cy.task("ivls:toggle-feature-flag", {
      flag: "CATALYSTDX_SMARTQC",
      enabled: true,
    });
    cy.task("iris:get-instruments", ["Catalyst Dx"]).then(([catDx]) => {
      catDxInstrument = catDx;
      cy.task("iris:set-results", [{ instrumentId: catDx.id, resultSet }]);
    });
  });

  after(() => {
    cy.task("ivls:toggle-feature-flag", {
      flag: "CATALYSTDX_SMARTQC",
      enabled: false,
    });
  });
  //Change CATALYSTDX_SMARTQC feature flag back to default state when tests are finished

  it("can run SmartQC and view results", () => {
    cy.visit("/instruments");
    cy.contains("Catalyst Dx").click();
    cy.getByTestId("cat-dx-instrument-smartqc-button").click();
    cy.contains("Run SmartQC").click();
    cy.get(".spot-toast", { timeout: 50000 }).contains("SmartQC has passed.");
    cy.getByTestId("displayed-instruments").contains("Catalyst Dx").click();
    //Navigate to Instrument Screen via CatDx icon in instrument tray
    cy.getByTestId("cat-dx-instrument-smartqc-button").click();
    cy.findAllByRole("row").eq(1).contains("Pass");
    //First entry in table (second row) should contain result "Pass"
  });
});
