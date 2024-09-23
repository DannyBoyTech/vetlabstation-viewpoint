import {
  randomAcadiaQualityControlLotDto,
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  pcoQcModalText1,
  pcoQcModalText2,
  pcoQcModalText3,
} from "../../../util/instrument-texts";
import { viteAsset } from "../../../util/general-utils";

const pcoInstrument: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.ProCyteOne,
  }),
});

describe("proCyte One QC", () => {
  it("should allow navigation to ProCyte One quality control screen and change QC", () => {
    cy.intercept("**/api/device/status", [pcoInstrument]);
    cy.intercept("**/api/device/*/status", pcoInstrument);
    cy.intercept({ method: "GET", pathname: "**/eventlog" }, []);
    cy.visit(`/instruments/${pcoInstrument.instrument.id}`);
    cy.contains("Quality Control").click();
    cy.getByTestId("header-left").containedWithinTestId(
      "header-left",
      "ProCyte One Quality Control Lots"
    );
    cy.contains("Change QC").click();
    cy.getByTestId("change-qc-modal").should("be.visible");
    cy.getByTestId("change-qc-modal")
      .containedWithinTestId(
        "change-qc-modal",
        "Replace ProCyte One SmartQC Vial"
      )
      .containedWithinTestId("change-qc-modal", "Done")
      .containedWithinTestId("change-qc-modal", "Cancel");
    cy.getByTestId("change-qc-modal").containedWithinTestId(
      "change-qc-modal",
      pcoQcModalText1
    );
    cy.getByTestId("change-qc-modal").containedWithinTestId(
      "change-qc-modal",
      pcoQcModalText2
    );
    cy.getByTestId("change-qc-modal").containedWithinTestId(
      "change-qc-modal",
      pcoQcModalText3
    );
    cy.getByTestId("change-qc-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("Acadia_qc_wiz1_img1.png"));
    cy.contains("Done").click();
    cy.getByTestId("change-qc-modal").should("not.exist");
    cy.contains("Back").click();
    cy.getByTestId("pco-maintenance-screen").should("be.visible");
  });

  it("should allow user to navigate to pco qc lots screen and view qc", () => {
    cy.intercept("**/api/device/status", [pcoInstrument]);
    cy.intercept("**/api/device/*/status", pcoInstrument);
    cy.visit(`/instruments/${pcoInstrument.instrument.id}/qc`);

    const pcoQcLots = [
      randomAcadiaQualityControlLotDto({
        instrumentType: InstrumentType.ProCyteOne,
        lotNumber: "SMARTQC456",
        isExpired: true,
        canRun: true,
      }),
    ];

    const qcRecords = [
      {
        runId: 46139,
        runDate: 1681739213638,
        result: "PASS",
      },
    ];
    cy.intercept(
      {
        method: "GET",
        pathname: `**/acadiaQualityControl/${pcoInstrument.instrument.id}/lots`,
      },
      pcoQcLots
    );
    cy.intercept(
      {
        method: "GET",
        pathname: `**/acadiaQualityControl/${pcoInstrument.instrument.id}/lot/runs`,
      },
      qcRecords
    );
    cy.containedWithinTestId("header-left", "ProCyte One Quality Control Lots");
    cy.containedWithinTestId("qc-lots-main-page", "Quality Control");
    cy.containedWithinTestId("qc-lots-main-page", "Lot Number");
    cy.containedWithinTestId("qc-lots-main-page", "Run Time");
    cy.containedWithinTestId("qc-lots-main-page", "Expiration Date");
    cy.containedWithinTestId("qc-lots-main-page", "Most Recent Results");
    cy.contains("Run QC");
    cy.contains("Change QC");
    cy.contains("View QC Results");
    cy.contains("Back");
    cy.contains("SMARTQC456").click();
    cy.contains("View QC Results").click();
    cy.containedWithinTestId("qc-results-modal", "Quality Control Records");
    cy.containedWithinTestId("qc-results-modal", "Analyzer");
    cy.containedWithinTestId("qc-results-modal", "Lot");
    cy.containedWithinTestId("qc-results-modal", "Run Time");
    cy.containedWithinTestId("qc-results-modal", "Results");
    cy.containedWithinTestId(
      "qc-results-modal",
      `ProCyte One (${pcoInstrument.instrument.instrumentSerialNumber})`
    );
    cy.containedWithinTestId("qc-results-modal", "SMARTQC456");
    cy.containedWithinTestId("qc-results-modal", "Close");
    cy.containedWithinTestId("qc-results-modal", "Print");
    cy.containedWithinTestId("qc-results-modal", "Print All");
    cy.getByTestId("qc-results-modal").contains("Close").click();
    cy.getByTestId("qc-results-modal").should("not.be.visible");
  });
});
