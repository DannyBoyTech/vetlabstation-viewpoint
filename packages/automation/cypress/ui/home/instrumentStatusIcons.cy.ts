import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";
import { InstrumentStatus, InstrumentType } from "@viewpoint/api";

const instrumentStatuses = [
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    instrument: randomInstrumentDto({
      id: 1,
      instrumentType: InstrumentType.CatalystDx,
    }),
  }),
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Busy,
    instrument: randomInstrumentDto({
      id: 2,
      instrumentType: InstrumentType.ProCyteOne,
    }),
  }),
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Alert,
    instrument: randomInstrumentDto({
      id: 2,
      instrumentType: InstrumentType.ProCyteOne,
    }),
  }),
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Standby,
    instrument: randomInstrumentDto({
      id: 3,
      instrumentType: InstrumentType.ProCyteDx,
    }),
  }),
  randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Offline,
    instrument: randomInstrumentDto({
      id: 4,
      instrumentType: InstrumentType.SediVueDx,
    }),
  }),
];

describe("Instrument status icons on Home screen", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  it("successfully displays connected instruments and their statuses", () => {
    cy.intercept("**/api/device/status", instrumentStatuses);
    cy.visit("/");
    cy.containedWithinTestId("instrument-bar-root", "Catalyst Dx");
    cy.containedWithinTestId("instrument-bar-root", "ProCyte One");
    cy.containedWithinTestId("instrument-bar-root", "ProCyte Dx");
    cy.containedWithinTestId("instrument-bar-root", "SediVue Dx");
    cy.containedWithinTestId("instrument-bar-root", "Ready");
    cy.containedWithinTestId("instrument-bar-root", "Busy");
    cy.containedWithinTestId("instrument-bar-root", "Standby");
    cy.containedWithinTestId("instrument-bar-root", "Offline");
    cy.containedWithinTestId("instrument-bar-root", "Alert");
  });
});
