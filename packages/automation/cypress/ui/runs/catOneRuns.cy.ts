import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  DefaultRunConfigs,
  DilutionTypeEnum,
  InstrumentStatus,
  InstrumentType,
  RunConfiguration,
} from "@viewpoint/api";
import { viteAsset } from "../../util/general-utils";
import { interceptRequestsForSelectInstruments } from "../../util/default-intercepts";

describe("catalyst one runs", () => {
  const catOneInstrument = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.CatalystOne,
      manualEntry: false,
      runnable: true,
      supportedRunConfigurations: [
        RunConfiguration.UPC,
        RunConfiguration.DILUTION,
      ],
    }),
  });
  const runConfigs: DefaultRunConfigs = {
    [catOneInstrument.instrument.instrumentSerialNumber]: {
      dilutionType: DilutionTypeEnum.NOTDEFINED,
      dilution: 1,
    },
  };
  it("should show UPC guidance modal for catone", () => {
    interceptRequestsForSelectInstruments({
      instruments: [catOneInstrument],
      defaultRunConfigs: runConfigs,
    });
    cy.visit("/labRequest/build?patientId=1");
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("run-config-toggle-label-UPC").click();
    cy.contains("Instructions").click();
    //todo update test for entry point from icon after design change
    cy.containedWithinTestId("confirm-modal", "Catalyst One");
    cy.containedWithinTestId("confirm-modal", "UPC Instructions");
    cy.containedWithinTestId("confirm-modal", "Load pipette tips");
    cy.containedWithinTestId(
      "confirm-modal",
      "Note: Always centrifuge the urine sample to obtain supernatant urine for the UPC run"
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Load both the UPRO and UCRE slides"
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Note: Do not run any other slides or CLIPs with the UPC panel"
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Load an empty sample cup in the left dilution cup holder"
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Load a sample cup containing 300 µl of Catalyst Urine P:C Diluent in the right dilution cup holder"
    );
    cy.getByTestId("confirm-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("UpcInstructions.png"));
    cy.contains("OK").click();
    cy.getByTestId("confirm-modal").should("not.exist");
  });

  it("should show DILUTION guidance modal for catone", () => {
    interceptRequestsForSelectInstruments({
      instruments: [catOneInstrument],
      defaultRunConfigs: runConfigs,
    });
    cy.visit("/labRequest/build?patientId=1");
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("run-config-toggle-label-DILUTION").click();
    cy.contains("Instructions").click();
    cy.containedWithinTestId("confirm-modal", "Catalyst One");
    cy.containedWithinTestId(
      "confirm-modal",
      "Automated Dilution Instructions"
    );
    cy.containedWithinTestId("confirm-modal", "Load materials as shown:");
    cy.containedWithinTestId("confirm-modal", "Pipette tips");
    cy.containedWithinTestId("confirm-modal", "Undiluted sample");
    cy.containedWithinTestId("confirm-modal", "Slide(s)");
    cy.containedWithinTestId("confirm-modal", "Empty sample cup");
    cy.containedWithinTestId("confirm-modal", "300 µl saline in a sample cup");
    cy.containedWithinTestId(
      "confirm-modal",
      "Important: Do not dilute samples undergoing ammonia, phenobarbital, fructosamine, or electrolyte testing."
    );
    cy.getByTestId("confirm-modal")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("AutomatedInstructions.png"));
    cy.contains("OK").click();
    cy.getByTestId("confirm-modal").should("not.exist");
  });

  it("allows user to run a UPC if provided run configs are available", () => {
    interceptRequestsForSelectInstruments({
      instruments: [catOneInstrument],
      defaultRunConfigs: runConfigs,
    });
    cy.intercept("POST", "**/api/labRequest", {}).as("submitLabRequest");
    cy.visit("/labRequest/build?patientId=1");

    // Select the analyzer, UPC and Dilution buttons should be present
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("run-config-toggle-label-UPC").click();
    cy.getByTestId("run-button").click();

    // Confirm run config for dilution is set
    cy.wait("@submitLabRequest")
      .its("request.body.instrumentRunDtos")
      .its(0)
      .its("instrumentRunConfigurations")
      .should("deep.equal", [
        {
          dilution: 21,
          dilutionType: DilutionTypeEnum.UPCAUTOMATIC,
        },
      ]);

    cy.location("pathname").should("eq", "/");
  });
});
