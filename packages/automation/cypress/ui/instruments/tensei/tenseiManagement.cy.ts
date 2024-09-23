import {
  DetailedInstrumentStatusDto,
  HealthCode,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";

const tenseiReady: InstrumentStatusDto = randomInstrumentStatus({
  instrumentStatus: InstrumentStatus.Ready,
  connected: true,
  instrument: randomInstrumentDto({
    instrumentType: InstrumentType.Tensei,
    instrumentStringProperties: {
      "serial.mainunit": "Tensei1",
      "serial.ipu": "IPU1",
    },
  }),
});

const detailedStatus: DetailedInstrumentStatusDto = {
  instrument: randomInstrumentDto({
    id: 1,
    instrumentType: InstrumentType.Tensei,
    suppressed: false,
    supportsInstrumentScreen: true,
  }),
  status: HealthCode.READY,
};

describe("Instruments screen", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/device/status", [tenseiReady]);
    cy.intercept("**/api/device/*/status", tenseiReady);
    cy.intercept("GET", "**/api/instruments/**/status", detailedStatus);
  });

  it("displays instrument information and buttons", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);

    cy.getByTestId("tensei-instruments-screen")
      .should("exist")
      .should("be.visible")
      .should("contain.text", "Diagnostics")
      .should("contain.text", "Quality Control")
      .should("contain.text", "Settings")
      .should("contain.text", tenseiReady.instrument.ipAddress)
      .should("contain.text", tenseiReady.instrument.softwareVersion)
      .should("contain.text", tenseiReady.instrument.instrumentSerialNumber);
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and show procedures", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.containedWithinTestId("main-content", "Rinse");
    cy.containedWithinTestId("main-content", "Auto Rinse");
    cy.containedWithinTestId("main-content", "Monthly Rinse");
    cy.containedWithinTestId("main-content", "Waste Chamber Rinse");
    cy.containedWithinTestId("main-content", "Flow Cell Rinse");
    cy.containedWithinTestId("main-content", "Drain");
    cy.containedWithinTestId("main-content", "Drain Reaction Chamber");
    cy.containedWithinTestId("main-content", "Drain RBC Isolation Chamber");
    cy.containedWithinTestId("main-content", "Drain Waste Chamber");
    cy.containedWithinTestId("main-content", "Remove/Clear");
    cy.containedWithinTestId("main-content", "Remove Clog");
    cy.containedWithinTestId("main-content", "Clear Pinch Valve");
    cy.containedWithinTestId("main-content", "Reset");
    cy.containedWithinTestId("main-content", "Reset Air Pump");
    cy.containedWithinTestId("main-content", "Reset Aspiration Motor");
    cy.containedWithinTestId("main-content", "Reset Sheath Motor");
    cy.containedWithinTestId("main-content", "Reset Tube Motor");
    cy.containedWithinTestId("main-content", "Reset WB Motor");
    cy.containedWithinTestId("main-content", "Replenish");
    cy.containedWithinTestId("main-content", "Stain");
    cy.containedWithinTestId("main-content", "Lytic Reagent");
    cy.containedWithinTestId("main-content", "Reticulocyte Diluent");
    cy.containedWithinTestId("main-content", "HGB Reagent");
    cy.containedWithinTestId("main-content", "System Diluent");
    cy.containedWithinTestId("main-content", "Initialize");
    cy.containedWithinTestId("main-content", "Start Up");
    cy.containedWithinTestId("main-content", "Ship");
    cy.containedWithinTestId("main-content", "Shut Down for Shipping");
    cy.contains("Back");
  });
  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and perform drain procedures", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Drain Reaction Chamber").click();
    cy.intercept({
      pathname: "**/maintenance/drainReactionChamber/request",
      method: "POST",
    }).as("drainReactionChamberRequest");
    cy.getByTestId("reaction-chamber-modal").should(
      "contain.text",
      "Drain Reaction Chamber"
    );
    cy.containedWithinTestId(
      "reaction-chamber-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reaction-chamber-modal", "Cancel");
    cy.containedWithinTestId("reaction-chamber-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("reaction-chamber-modal").should("not.exist");
    cy.contains("Drain Reaction Chamber").click();
    cy.get("button").contains("OK").click();
    cy.wait("@drainReactionChamberRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
    cy.visit(`/instruments/${tenseiReady.instrument.id}/diagnostics`);
    cy.contains("Drain RBC Isolation Chamber").click();
    cy.intercept({
      pathname: "**/maintenance/drainRbcIsolationChamber/request",
      method: "POST",
    }).as("drainRbcIsolationChamberRequest");
    cy.getByTestId("rbc-isolation-modal").should(
      "contain.text",
      "Drain RBC Isolation Chamber"
    );
    cy.containedWithinTestId(
      "rbc-isolation-modal",
      "This procedure will take approximately 3 minutes."
    );
    cy.containedWithinTestId("rbc-isolation-modal", "Cancel");
    cy.containedWithinTestId("rbc-isolation-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("rbc-isolation-modal").should("not.exist");
    cy.contains("Drain RBC Isolation Chamber").click();
    cy.get("button").contains("OK").click();
    cy.wait("@drainRbcIsolationChamberRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
    cy.visit(`/instruments/${tenseiReady.instrument.id}/diagnostics`);
    cy.contains("Drain Waste Chamber").click();
    cy.intercept({
      pathname: "**/maintenance/drainWasteChamber/request",
      method: "POST",
    }).as("drainWasteChamberRequest");
    cy.getByTestId("waste-chamber-modal").should(
      "contain.text",
      "Drain Waste Chamber"
    );
    cy.containedWithinTestId(
      "waste-chamber-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("waste-chamber-modal", "Cancel");
    cy.containedWithinTestId("waste-chamber-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("waste-chamber-modal").should("not.exist");
    cy.contains("Drain Waste Chamber").click();
    cy.get("button").contains("OK").click();
    cy.wait("@drainWasteChamberRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
    cy.visit(`/instruments/${tenseiReady.instrument.id}/diagnostics`);
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and clear pinch valve", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Clear Pinch Valve").click();
    cy.intercept({
      pathname: "**/maintenance/clearPinchValve/request",
      method: "POST",
    }).as("clearPinchValveRequest");
    cy.getByTestId("clear-pinch-valve-modal").should(
      "contain.text",
      "Clear Pinch Valve"
    );
    cy.containedWithinTestId(
      "clear-pinch-valve-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("clear-pinch-valve-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("clear-pinch-valve-modal").should("not.exist");
    cy.contains("Clear Pinch Valve").click();
    cy.get("button").contains("OK").click();
    cy.wait("@clearPinchValveRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and remove clog", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Remove Clog").click();
    cy.intercept({
      pathname: "**/maintenance/removeClog/request",
      method: "POST",
    }).as("removeClogRequest");
    cy.getByTestId("remove-clog-modal").should("contain.text", "Remove Clog");
    cy.containedWithinTestId(
      "remove-clog-modal",
      "This procedure will take approximately 1 minute."
    );
    cy.containedWithinTestId("remove-clog-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("remove-clog-modal").should("not.exist");
    cy.contains("Remove Clog").click();
    cy.get("button").contains("OK").click();
    cy.wait("@removeClogRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and perform an auto rinse", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Auto Rinse").click();
    cy.intercept({
      pathname: "**/maintenance/autoRinse/request",
      method: "POST",
    }).as("autoRinseRequest");
    cy.getByTestId("auto-rinse-modal").should("contain.text", "Auto Rinse");
    cy.containedWithinTestId(
      "auto-rinse-modal",
      "This procedure will take approximately 4 minutes."
    );
    cy.containedWithinTestId("auto-rinse-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("auto-rinse-modal").should("not.exist");
    cy.contains("Auto Rinse").click();
    cy.get("button").contains("OK").click();
    cy.wait("@autoRinseRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and reset air pump", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Reset Air Pump").click();
    cy.intercept({
      pathname: "**/maintenance/resetAirPump/request",
      method: "POST",
    }).as("resetAirPumpRequest");
    cy.getByTestId("reset-air-pump-modal").should(
      "contain.text",
      "Reset Air Pump"
    );
    cy.containedWithinTestId(
      "reset-air-pump-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-air-pump-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("reset-air-pump-modal").should("not.exist");
    cy.contains("Reset Air Pump").click();
    cy.get("button").contains("OK").click();
    cy.wait("@resetAirPumpRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and reset aspiration motor", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Reset Aspiration Motor").click();
    cy.intercept({
      pathname: "**/maintenance/resetAspirationMotor/request",
      method: "POST",
    }).as("resetAspirationMotorRequest");
    cy.getByTestId("reset-aspiration-motor-modal").should(
      "contain.text",
      "Reset Aspiration Motor"
    );
    cy.containedWithinTestId(
      "reset-aspiration-motor-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-aspiration-motor-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("reset-aspiration-motor-modal").should("not.exist");
    cy.contains("Reset Aspiration Motor").click();
    cy.get("button").contains("OK").click();
    cy.wait("@resetAspirationMotorRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and reset sheath motor", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Reset Sheath Motor").click();
    cy.intercept({
      pathname: "**/maintenance/resetSheathMotor/request",
      method: "POST",
    }).as("resetSheathMotorRequest");
    cy.getByTestId("reset-sheath-motor-modal").should(
      "contain.text",
      "Reset Sheath Motor"
    );
    cy.containedWithinTestId(
      "reset-sheath-motor-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-sheath-motor-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("reset-sheath-motor-modal").should("not.exist");
    cy.contains("Reset Sheath Motor").click();
    cy.get("button").contains("OK").click();
    cy.wait("@resetSheathMotorRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and reset tube motor", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Reset Tube Motor").click();
    cy.intercept({
      pathname: "**/maintenance/resetTubeMotor/request",
      method: "POST",
    }).as("resetTubeMotorRequest");
    cy.getByTestId("reset-tube-motor-modal").should(
      "contain.text",
      "Reset Tube Motor"
    );
    cy.containedWithinTestId(
      "reset-tube-motor-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-tube-motor-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("reset-tube-motor-modal").should("not.exist");
    cy.contains("Reset Tube Motor").click();
    cy.get("button").contains("OK").click();
    cy.wait("@resetTubeMotorRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and reset WB motor", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Reset WB Motor").click();
    cy.intercept({
      pathname: "**/maintenance/resetWBMotor/request",
      method: "POST",
    }).as("resetWBMotorRequest");
    cy.getByTestId("reset-wb-motor-modal").should(
      "contain.text",
      "Reset WB Motor"
    );
    cy.containedWithinTestId(
      "reset-wb-motor-modal",
      "This procedure will take less than 1 minute."
    );
    cy.containedWithinTestId("reset-wb-motor-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("reset-wb-motor-modal").should("not.exist");
    cy.contains("Reset WB Motor").click();
    cy.get("button").contains("OK").click();
    cy.wait("@resetWBMotorRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and perform an Replenish HGB Reagent procedure", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Replenish HGB Reagent").click();
    cy.getByTestId("replenish-hgb-modal").should(
      "contain.text",
      "Replenish HGB Reagent"
    );
    cy.containedWithinTestId(
      "replenish-hgb-modal",
      "This procedure will take approximately 2 minutes."
    );
    cy.containedWithinTestId("replenish-hgb-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("replenish-hgb-modal").should("not.exist");
    cy.intercept({
      pathname: "**/maintenance/replenishHGBReagent/request",
      method: "POST",
    }).as("ReplenishHGBReagentRequest");
    cy.contains("Replenish HGB Reagent").click();
    cy.get("button").contains("OK").click();
    cy.wait("@ReplenishHGBReagentRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and perform an Replenish Lytic Reagent procedure", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Replenish Lytic Reagent").click();
    cy.getByTestId("replenish-lytic-modal").should(
      "contain.text",
      "Replenish Lytic Reagent"
    );
    cy.containedWithinTestId(
      "replenish-lytic-modal",
      "This procedure will take approximately 2 minutes."
    );
    cy.containedWithinTestId("replenish-lytic-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("replenish-lytic-modal").should("not.exist");
    cy.intercept({
      pathname: "**/maintenance/replenishLyticReagent/request",
      method: "POST",
    }).as("ReplenishLyticReagentRequest");
    cy.contains("Replenish Lytic Reagent").click();
    cy.get("button").contains("OK").click();
    cy.wait("@ReplenishLyticReagentRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and perform an Replenish Reticulocyte Diluent procedure", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Replenish Reticulocyte Diluent").click();
    cy.getByTestId("replenish-reticulocyte-modal").should(
      "contain.text",
      "Replenish Reticulocyte Diluent"
    );
    cy.containedWithinTestId(
      "replenish-reticulocyte-modal",
      "This procedure will take approximately 2 minutes."
    );
    cy.containedWithinTestId("replenish-reticulocyte-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("replenish-reticulocyte-modal").should("not.exist");
    cy.intercept({
      pathname: "**/maintenance/replenishReticulocyteDiluent/request",
      method: "POST",
    }).as("ReplenishReticulocyteDiluentRequest");
    cy.contains("Replenish Reticulocyte Diluent").click();
    cy.get("button").contains("OK").click();
    cy.wait("@ReplenishReticulocyteDiluentRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and perform an Replenish Stain procedure", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Replenish Stain").click();
    cy.getByTestId("replenish-stain-modal").should(
      "contain.text",
      "Replenish Stain"
    );
    cy.containedWithinTestId(
      "replenish-stain-modal",
      "This procedure will take approximately 4 minutes."
    );
    cy.containedWithinTestId("replenish-stain-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("replenish-stain-modal").should("not.exist");
    cy.intercept({
      pathname: "**/maintenance/replenishStain/request",
      method: "POST",
    }).as("ReplenishStainRequest");
    cy.contains("Replenish Stain").click();
    cy.get("button").contains("OK").click();
    cy.wait("@ReplenishStainRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });

  it("should allow navigation to IDEXX ProCyte Dx diagnostics screen and perform an Replenish System Diluent procedure", () => {
    cy.visit(`/instruments/${tenseiReady.instrument.id}`);
    cy.get("button").contains("Diagnostics").click();
    cy.contains("Replenish System Diluent").click();
    cy.getByTestId("replenish-system-modal").should(
      "contain.text",
      "Replenish System Diluent"
    );
    cy.containedWithinTestId(
      "replenish-system-modal",
      "This procedure will take approximately 4 minutes."
    );
    cy.containedWithinTestId("replenish-system-modal", "OK");
    cy.get("button").contains("Cancel").click();
    cy.getByTestId("replenish-system-modal").should("not.exist");
    cy.intercept({
      pathname: "**/maintenance/replenishSystemDiluent/request",
      method: "POST",
    }).as("ReplenishSystemDiluentRequest");
    cy.contains("Replenish System Diluent").click();
    cy.get("button").contains("OK").click();
    cy.wait("@ReplenishSystemDiluentRequest");
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/instruments/${tenseiReady.instrument.id}/`
    );
  });
});
