import { InstrumentType } from "@viewpoint/api";
import {
  PDxBarcodes,
  SediVueBarcodes,
  TenseiBarcodes,
} from "../data/qc-barcodes";

// Ideally tests would be responsible for seeding this data and then removing
// it when the test completes, but there is currently no way to remove this data
// from IVLS, and it is global for a given instrument type. Rather than having
// tests create a bunch of duplicates, just seed a known set of test QC data here.
export function seedQCData() {
  cy.task("ivls:save-barcodes", {
    instrumentType: InstrumentType.Tensei,
    barcodes: TenseiBarcodes,
  });
  cy.task("ivls:save-barcodes", {
    instrumentType: InstrumentType.ProCyteDx,
    barcodes: PDxBarcodes,
  });
  cy.task("ivls:save-barcodes", {
    instrumentType: InstrumentType.SediVueDx,
    barcodes: SediVueBarcodes,
  });
}

export function seedDataForE2ETests() {
  return seedQCData();
}
