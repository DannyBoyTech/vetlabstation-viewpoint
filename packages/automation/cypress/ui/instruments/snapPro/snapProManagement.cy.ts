import {
  InstrumentStatus,
  SnapProInstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomSnapProInstrumentStatus,
} from "@viewpoint/test-utils";
import { viteAsset } from "../../../util/general-utils";
import dayjs from "dayjs";

const snapProReady: SnapProInstrumentStatusDto = randomSnapProInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.SNAPPro,
  }),
});
const snapProStandby: SnapProInstrumentStatusDto =
  randomSnapProInstrumentStatus({
    instrumentStatus: InstrumentStatus.Standby,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.SNAPPro,
    }),
  });
const snapReady = [snapProReady];

const snapStandby = [snapProStandby];

describe("SNAP Pro instrument screen", () => {
  it("shows instrument information for Ready SNAP Pro", () => {
    const id = snapProReady.instrument.id;
    cy.intercept("GET", "**/api/device/status", [snapProReady]);
    cy.intercept("GET", "**/api/device/*/status", snapProReady);
    cy.intercept("GET", "**/api/device/snap/status", snapReady);
    cy.visit("/instruments/");
    cy.contains("SNAP Pro").click({ force: true });
    cy.getByTestId(`snap-pro-instrument-${id}`)
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("SNAPPro_empty.png"));
    cy.getByTestId(`snap-pro-instrument-${id}`).click();
    cy.containedWithinTestId(`snap-pro-instrument-${id}`, "Serial Number");
    cy.containedWithinTestId(`snap-pro-instrument-${id}`, "Software Version");
    cy.containedWithinTestId(`snap-pro-instrument-${id}`, "Last Connected");
    cy.getByTestId(`snap-pro-instrument-${id}`)
      .should("contain", snapProReady.instrument.instrumentSerialNumber)
      .and("contain", snapProReady.instrument.softwareVersion)
      .and(
        "contain",
        dayjs(snapProReady.lastConnectedDate).format("M/DD/YY h:mm A")
      );
    cy.containedWithinTestId(`snap-pro-instrument-${id}`, "Ready");
    cy.getByTestId("snap-pro-remove-instrument-button").should("be.disabled");
  });

  it("allows removal of standby SNAP Pro", () => {
    cy.visit("/instruments/");
    cy.intercept("GET", "**/api/device/status", [snapProStandby]);
    cy.intercept("GET", "**/api/device/*/status", snapProStandby);
    cy.intercept("GET", "**/api/device/snap/status", snapStandby);
    cy.intercept(
      "POST",
      `**/api/device/${snapProStandby.instrument.id}/suppress`
    ).as("remove");
    cy.contains("SNAP Pro").click({ force: true });
    cy.getByTestId(
      `snap-pro-instrument-${snapProStandby.instrument.id}`
    ).click();
    cy.getByTestId("snap-pro-remove-instrument-button").should("be.enabled");
    cy.getByTestId("snap-pro-remove-instrument-button").click();
    cy.wait("@remove");
  });
});
