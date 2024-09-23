import { startAndRunNewLabRequest } from "../../util/tasks/common-steps";
import { ResultSet } from "../../util/instrument-simulator/Results";

describe("SNAPshot Dx results", () => {
  it("should allow performing a bile preprandial labrequest and see results", () => {
    cy.task("iris:get-instruments", ["SnapShot Dx"]).then(([ssdx]) => {
      const bile01resultSet: ResultSet = {
        results: [{ assay: { name: "BILE01" }, value: "15" }],
        delayAmount: 250,
      };
      cy.task("iris:set-results", [
        { instrumentId: ssdx.id, resultSet: bile01resultSet },
      ]);
      startAndRunNewLabRequest([ssdx.instrumentSerialNumber]).then(
        (patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName)
            .click();
          cy.contains("Bile acids (Preprandial)").should("exist");
          cy.get(".result-table-cell")
            .eq(0)
            .should("contain.text", "Bile acids (Preprandial)");
          cy.get(".result-table-cell")
            .eq(1)
            .should("contain.text", "15 μmol/L");
          cy.getByTestId(
            `run-table-${patientDetails.labRequest.instrumentRunDtos[0].id}`
          ).should("contain", "Preprandial (Fasting)");
        }
      );
    });
  });

  it("should allow performing a bile postprandial labrequest and see results", () => {
    cy.task("iris:get-instruments", ["SnapShot Dx"]).then(([ssdx]) => {
      const bile02resultSet: ResultSet = {
        results: [{ assay: { name: "BILE02" }, value: "12" }],
        delayAmount: 250,
      };
      cy.task("iris:set-results", [
        { instrumentId: ssdx.id, resultSet: bile02resultSet },
      ]);
      startAndRunNewLabRequest([ssdx.instrumentSerialNumber]).then(
        (patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName)
            .click();
          cy.contains("Bile acids (Postprandial)").should("exist");
          cy.get(".result-table-cell")
            .eq(0)
            .should("contain.text", "Bile acids (Postprandial)");
          cy.get(".result-table-cell")
            .eq(1)
            .should("contain.text", "12 μmol/L");
          cy.getByTestId(
            `run-table-${patientDetails.labRequest.instrumentRunDtos[0].id}`
          ).should("contain", "Postprandial");
        }
      );
    });
  });

  it("should allow performing a bile (other) labrequest and see results", () => {
    cy.task("iris:get-instruments", ["SnapShot Dx"]).then(([ssdx]) => {
      const bile03resultSet: ResultSet = {
        results: [{ assay: { name: "BILE03" }, value: "13" }],
        delayAmount: 250,
      };
      cy.task("iris:set-results", [
        { instrumentId: ssdx.id, resultSet: bile03resultSet },
      ]);
      startAndRunNewLabRequest([ssdx.instrumentSerialNumber]).then(
        (patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName)
            .click();
          cy.contains("Bile acids (Other)").should("exist");
          cy.get(".result-table-cell")
            .eq(1)
            .should("contain.text", "13 μmol/L");
        }
      );
    });
  });

  it("should allow performing a ssdx cortisol labrequest and see results", () => {
    cy.task("iris:get-instruments", ["SnapShot Dx"]).then(([ssdx]) => {
      const ssdxCortResultSet: ResultSet = {
        results: [{ assay: { name: "CORT05" }, value: "39" }],
        delayAmount: 250,
      };
      cy.task("iris:set-results", [
        { instrumentId: ssdx.id, resultSet: ssdxCortResultSet },
      ]);
      startAndRunNewLabRequest([ssdx.instrumentSerialNumber]).then(
        (patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName)
            .click();
          cy.contains("CORT 8 hour post high").should("exist");
          cy.get(".result-table-cell")
            .eq(1)
            .should("contain.text", "39.0 μg/dL");
        }
      );
    });
  });

  it("should allow performing a ssdx T4 labrequest and see results", () => {
    cy.task("iris:get-instruments", ["SnapShot Dx"]).then(([ssdx]) => {
      const ssdxT4ResultSet: ResultSet = {
        results: [{ assay: { name: "T4PLUS" }, value: "Normal" }],
        delayAmount: 250,
      };
      cy.task("iris:set-results", [
        { instrumentId: ssdx.id, resultSet: ssdxT4ResultSet },
      ]);
      startAndRunNewLabRequest([ssdx.instrumentSerialNumber]).then(
        (patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName)
            .click();
          cy.contains("TT4").should("exist");
          cy.get(".result-table-cell").eq(1).should("contain.text", "Normal");
        }
      );
    });
  });

  it("should allow performing a ssdx cPL labrequest and see results", () => {
    cy.task("iris:get-instruments", ["SnapShot Dx"]).then(([ssdx]) => {
      const ssdxCplResultSet: ResultSet = {
        results: [{ assay: { name: "cPL" }, value: "Normal" }],
        delayAmount: 250,
      };
      cy.task("iris:set-results", [
        { instrumentId: ssdx.id, resultSet: ssdxCplResultSet },
      ]);
      startAndRunNewLabRequest([ssdx.instrumentSerialNumber]).then(
        (patientDetails) => {
          cy.getByTestId("recent-result-card")
            .contains(patientDetails.patientName)
            .click();
          cy.contains("cPL").should("exist");
          cy.get(".result-table-cell").eq(1).should("contain.text", "Normal");
        }
      );
    });
  });
});
