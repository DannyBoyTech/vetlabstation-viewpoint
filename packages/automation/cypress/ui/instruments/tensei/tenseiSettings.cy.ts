import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import { interceptRequestsForHomeScreen } from "../../../util/default-intercepts";

describe("tensei settings", () => {
  it("should allow/disallow navigation to Tensei settings screen based on status", () => {
    const tenseiInstrumentReady: InstrumentStatusDto = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Ready,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.Tensei,
      }),
    });
    const tenseiInstrumentBusy: InstrumentStatusDto = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Busy,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.Tensei,
      }),
    });
    const tenseiInstrumentAlert: InstrumentStatusDto = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Alert,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.Tensei,
      }),
    });
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/device/status", [tenseiInstrumentReady]);
    cy.intercept("**/api/device/*/status", tenseiInstrumentReady);
    cy.visit(`/instruments/${tenseiInstrumentReady.instrument.id}`);
    cy.get("button").contains("Settings").click();
    cy.contains("div.spot-typography__heading--level-3", "Settings");
    cy.contains("Standby");
    cy.contains("Automatically set to Standby at:");
    //Revist this assestion when standby time is hooked to the backend and new selected standby setting value updates the DB
    cy.getByTestId("twelve-hour-select-hours").should("have.value", "12");
    cy.getByTestId("twelve-hour-select-ampm").should("have.value", "AM");
    cy.getByTestId("twelve-hour-select-hours").select("10");
    cy.getByTestId("twelve-hour-select-ampm").select("PM");
    cy.get("button").contains("Back").click();
    cy.intercept("**/api/device/status", [tenseiInstrumentBusy]);
    cy.visit(`/instruments/${tenseiInstrumentBusy.instrument.id}`);
    cy.get('button[data-testid="tensei-settings-button"]').should(
      "be.disabled"
    );
    cy.intercept("**/api/device/status", [tenseiInstrumentAlert]);
    cy.visit(`/instruments/${tenseiInstrumentAlert.instrument.id}`);
    cy.get('button[data-testid="tensei-settings-button"]').should(
      "be.disabled"
    );
  });
});
