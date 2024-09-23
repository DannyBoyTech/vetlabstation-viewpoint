import { startAndRunNewLabRequest } from "../../util/tasks/common-steps";
import { ResultSet } from "../../util/instrument-simulator/Results";

describe("ProCyte One results", () => {
  it("should allow performing hematology pco run and see complete results", () => {
    cy.task("iris:get-instruments", ["Acadia Dx"]).then(([pCo]) => {
      const pCoResultSet: ResultSet = {
        results: [
          { assay: { name: "RBC" }, value: "6.28" },
          { assay: { name: "HCT" }, value: "41.8" },
          { assay: { name: "HGB" }, value: "16.9" },
          { assay: { name: "MCV" }, value: "66.6" },
          { assay: { name: "MCH" }, value: "23.2" },
          { assay: { name: "MCHC" }, value: "34.9" },
          { assay: { name: "RDW" }, value: "17.4" },
          { assay: { name: "%RETIC" }, value: "0.6" },
          { assay: { name: "RETIC" }, value: "37.7" },
          { assay: { name: "WBC" }, value: "9.02" },
          { assay: { name: "%NEU" }, value: "77.9" },
          { assay: { name: "%LYM" }, value: "11.5" },
          { assay: { name: "%MONO" }, value: "5.1" },
          { assay: { name: "%EOS" }, value: "5.2" },
          { assay: { name: "%BASO" }, value: "0.4" },
          { assay: { name: "NEU" }, value: "5.46" },
          { assay: { name: "LYM" }, value: "3.12" },
          { assay: { name: "MONO" }, value: "0.36" },
          { assay: { name: "EOS" }, value: "0.37" },
          { assay: { name: "BASO" }, value: "0.03" },
          { assay: { name: "PLT" }, value: "264" },
          { assay: { name: "PDW" }, value: "14.0" },
          { assay: { name: "MPV" }, value: "16.0" },
          { assay: { name: "PCT" }, value: "0.34" },
        ],
        delayAmount: 250,
      };
      cy.task("iris:set-results", [
        { instrumentId: pCo.id, resultSet: pCoResultSet },
      ]);
      startAndRunNewLabRequest([pCo.instrumentSerialNumber]).then(
        (patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName, { timeout: 30000 })
            .should("be.visible")
            .click();
          cy.contains("RBC").should("exist");
          cy.contains("HCT").should("exist");
          cy.contains("HGB").should("exist");
          cy.contains("MCV").should("exist");
          cy.contains("MCH").should("exist");
          cy.contains("MCHC").should("exist");
          cy.contains("RDW").should("exist");
          cy.contains("%RETIC").should("exist");
          cy.contains("RETIC").should("exist");
          cy.contains("WBC").should("exist");
          cy.contains("%NEU").should("exist");
          cy.contains("%LYM").should("exist");
          cy.contains("%MONO").should("exist");
          cy.contains("%EOS").should("exist");
          cy.contains("%BASO").should("exist");
          cy.contains("NEU").should("exist");
          cy.contains("LYM").should("exist");
          cy.contains("MONO").should("exist");
          cy.contains("EOS").should("exist");
          cy.contains("BASO").should("exist");
          cy.contains("PLT").should("exist");
          cy.contains("MPV").should("exist");
          cy.contains("PCT").should("exist");
          cy.getByTestId("results-page-result-cell-RBC").should(
            "contain",
            "6.28 M/μL"
          );
          cy.getByTestId("results-page-result-cell-HCT").should(
            "contain",
            "41.8 %"
          );
          cy.getByTestId("results-page-result-cell-HGB").should(
            "contain",
            "16.9 g/dL"
          );
          cy.getByTestId("results-page-result-cell-MCV").should(
            "contain",
            "66.6 fL"
          );
          cy.getByTestId("results-page-result-cell-MCH").should(
            "contain",
            "23.2 pg"
          );
          cy.getByTestId("results-page-result-cell-MCHC").should(
            "contain",
            "34.9 g/dL"
          );
          cy.getByTestId("results-page-result-cell-RDW").should(
            "contain",
            "17.4 %"
          );
          cy.getByTestId("results-page-result-cell-%RETIC").should(
            "contain",
            "0.6 %"
          );
          cy.getByTestId("results-page-result-cell-RETIC").should(
            "contain",
            "37.7 K/μL"
          );
          cy.getByTestId("results-page-result-cell-WBC").should(
            "contain",
            "9.02 K/μL"
          );
          cy.getByTestId("results-page-result-cell-%NEU").should(
            "contain",
            "77.9 %"
          );
          cy.getByTestId("results-page-result-cell-%LYM").should(
            "contain",
            "11.5 %"
          );
          cy.getByTestId("results-page-result-cell-%MONO").should(
            "contain",
            "5.1 %"
          );
          cy.getByTestId("results-page-result-cell-%EOS").should(
            "contain",
            "5.2 %"
          );
          cy.getByTestId("results-page-result-cell-%BASO").should(
            "contain",
            "0.4 %"
          );
          cy.getByTestId("results-page-result-cell-NEU").should(
            "contain",
            "5.46 K/μL"
          );
          cy.getByTestId("results-page-result-cell-LYM").should(
            "contain",
            "3.12 K/μL"
          );
          cy.getByTestId("results-page-result-cell-MONO").should(
            "contain",
            "0.36 K/μL"
          );
          cy.getByTestId("results-page-result-cell-EOS").should(
            "contain",
            "0.37 K/μL"
          );
          cy.getByTestId("results-page-result-cell-BASO").should(
            "contain",
            "0.03 K/μL"
          );
          cy.getByTestId("results-page-result-cell-PLT").should(
            "contain",
            "264 K/μL"
          );
          cy.getByTestId("results-page-result-cell-MPV").should(
            "contain",
            "16.0 fL"
          );
          cy.getByTestId("results-page-result-cell-PCT").should(
            "contain",
            "0.34 %"
          );
          cy.getByTestId("dot-plot-legend-icon-RBC").should("exist");
          cy.getByTestId("dot-plot-legend-icon-RETICS").should("exist");
          cy.getByTestId("dot-plot-legend-icon-PLT").should("exist");
          cy.getByTestId("dot-plot-legend-icon-RBC_FRAG").should("exist");
          cy.getByTestId("dot-plot-legend-icon-WBC").should("exist");
          cy.getByTestId("dot-plot-legend-icon-NEU").should("exist");
          cy.getByTestId("dot-plot-legend-icon-LYM").should("exist");
          cy.getByTestId("dot-plot-legend-icon-EOS").should("exist");
          cy.getByTestId("dot-plot-legend-icon-BASO").should("exist");
          cy.getByTestId("dot-plot-RBC-graph").should("exist");
          cy.getByTestId("dot-plot-WBC-graph").should("exist");
        }
      );
    });
  });
});
