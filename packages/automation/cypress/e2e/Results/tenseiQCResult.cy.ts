import { IrisInstrumentDto } from "../../util/instrument-simulator";

describe("Tensei QC Lot Information", () => {
  let tenseiInstrument: IrisInstrumentDto;
  beforeEach(() => {
    cy.task("ivls:toggle-feature-flag", {
      flag: "TENSEI_CONNECTION",
      enabled: true,
    });
    cy.task("ivls:toggle-feature-flag", {
      flag: "TENSEI_RESULTS",
      enabled: true,
    });
    cy.task("iris:get-instruments", ["Tensei"]).then(([tensei]) => {
      tenseiInstrument = tensei;
    });
  });
  const rows = [
    { name: "DIFF-X", target: "166.0", range: "146.0 - 186.0" },
    { name: "DIFF-Y", target: "103.0", range: "73.0 - 133.0" },
    { name: "MPV", target: "8.0", range: "6.0 - 10.0" },
    { name: "RBC", target: "2.20", range: "2.07 - 2.33" },
    { name: "HGB", target: "5.5", range: "5.3 - 5.7" },
    { name: "HCT", target: "18.0", range: "16.0 - 20.0" },
    { name: "MCV", target: "80.0", range: "75.0 - 85.0" },
    { name: "WBC", target: "2.90", range: "2.58 - 3.22" },
    { name: "MCHC", target: "31.0", range: "29.0 - 33.0" },
    { name: "PLT", target: "57", range: "27 - 87" },
    { name: "RBC-X", target: "23.0", range: "13.0 - 33.0" },
    { name: "RBC-Y", target: "156.0", range: "126.0 - 186.0" },
    { name: "PLT-O", target: "43.0", range: "13.0 - 73.0" },
    { name: "RBC-O", target: "2.20", range: "1.86 - 2.54" },
  ];
  it("allows user to view QC lot information in Quality Control Screen", () => {
    cy.visit("/");
    cy.getByTestId("instrument-bar-root").contains("Tensei").click();
    cy.contains("Quality Control").click();
    cy.get('button[data-testid="view-qc-lot-info-button"]').should(
      "be.disabled"
    );
    cy.contains("22222205").click();
    cy.get("button").contains("View QC Lot Information").click();
    cy.containedWithinTestId("header", "IDEXX ProCyte Dx QC Lot Information");
    cy.containedWithinTestId("lotNumber", "22222205");
    cy.containedWithinTestId("level", "2");
    cy.containedWithinTestId("expirationDate", "12/31/99");
    cy.get('table[data-testid="refRangeTable"]').within(() => {
      rows.forEach((row, index) => {
        cy.get("tr")
          .eq(index + 1)
          .within(() => {
            cy.get("td").eq(0).should("have.text", row.name);
            cy.get("td").eq(1).should("have.text", row.target);
            cy.get("td").eq(2).should("have.text", row.range);
          });
      });
    });
    cy.get("button").contains("Close").click();
    cy.get("button").contains("View QC Lot Information").click();
    cy.get("button").getByTestId("spot-modal-cancel-button").click();
  });
});
