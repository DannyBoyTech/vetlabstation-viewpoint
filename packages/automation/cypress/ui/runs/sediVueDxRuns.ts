import {
  randomInstrumentDto,
  randomInstrumentStatus,
  randomPatientDto,
} from "@viewpoint/test-utils";
import {
  DilutionTypeEnum,
  InstrumentStatus,
  InstrumentType,
  ReferenceClassType,
  RunConfiguration,
  SampleTypeEnum,
  SpeciesType,
  TestProtocolEnum,
} from "@viewpoint/api";
import {
  interceptRequestsForHomeScreen,
  interceptRequestsForSelectInstruments,
  SelectInstrumentsData,
} from "../../util/default-intercepts";

describe("sediVue Dx runs", () => {
  let interceptData: SelectInstrumentsData;
  const sediVueInstrument = randomInstrumentStatus({
    connected: true,
    instrumentStatus: InstrumentStatus.Ready,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.SediVueDx,
      supportedRunConfigurations: [
        RunConfiguration.BACTERIA_REFLEX,
        RunConfiguration.DILUTION,
        RunConfiguration.SAMPLE_TYPE,
      ],
    }),
  });

  beforeEach(() => {
    interceptRequestsForHomeScreen();
    interceptData = interceptRequestsForSelectInstruments({
      instruments: [sediVueInstrument],
      defaultRunConfigs: {
        [sediVueInstrument.instrument.instrumentSerialNumber]: {
          dilution: 1,
          dilutionType: DilutionTypeEnum.NOTDEFINED,
          sampleTypeId: 1,
        },
      },
      dilutionConfigs: {
        [InstrumentType.SediVueDx]: {
          [DilutionTypeEnum.AUTOMATIC]: [1, 2, 3],
          defaultType: DilutionTypeEnum.AUTOMATIC,
        },
      },
      sampleTypes: {
        [InstrumentType.SediVueDx]: {
          unknown: [],
          [2]: [
            {
              id: 1,
              name: SampleTypeEnum.URINE,
            },
            {
              id: 2,
              name: SampleTypeEnum.SYNOVIAL,
            },
            {
              id: 3,
              name: SampleTypeEnum.ABDOMINAL,
            },
          ],
        },
      },
    });
    cy.intercept("POST", "**/api/labRequest", {}).as("submitLabRequest");
  });

  it("allows user to run bacteria reflex if provided run configs are available", () => {
    cy.visit("/labRequest/build?patientId=1");
    cy.wait(interceptData.aliases.instruments);
    cy.wait(interceptData.aliases.defaultRunConfigs);

    // Select the analyzer, UPC and Dilution buttons should be present
    cy.getByTestId(
      `selectable-analyzer-${sediVueInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("sample-type-select").select("Urine");
    cy.getByTestId("run-config-toggle-label-BACTERIA_REFLEX").click();
    cy.getByTestId("run-button").click();

    // Confirm run config for dilution is set
    cy.wait("@submitLabRequest")
      .its("request.body.instrumentRunDtos")
      .its(0)
      .its("instrumentRunConfigurations")
      .should("deep.equal", [
        {
          dilution: 1,
          dilutionType: DilutionTypeEnum.NOTDEFINED,
          testProtocol: TestProtocolEnum.BACTERIALREFLEX,
          sampleTypeId: 1,
        },
      ]);

    cy.location("pathname").should("eq", "/");
  });

  it("should show 'Fluid Type Not Validated' warning for svdx when not running a supported species", () => {
    const nonSupportedPatient = randomPatientDto({
      speciesDto: {
        id: 10,
        speciesName: SpeciesType.Tortoise,
        speciesClass: ReferenceClassType.Other,
      },
    });
    cy.intercept(
      { pathname: "**/api/patient/*", method: "GET" },
      nonSupportedPatient
    );

    cy.visit("/labRequest/build?patientId=1");
    cy.wait(interceptData.aliases.instruments);
    cy.wait(interceptData.aliases.defaultRunConfigs);

    cy.getByTestId(
      `selectable-analyzer-${sediVueInstrument.instrument.instrumentSerialNumber}`
    )
      .as("svdxInstrument")
      .click();
    cy.getByTestId("sample-type-select").select("Urine");
    cy.get("@svdxInstrument").contains(
      "Fluid type has not been validated. For research purposes only."
    );
  });

  it("should show 'Fluid Type Not Validated' warning for svdx when not running a supported sample type", () => {
    cy.visit("/labRequest/build?patientId=1");
    cy.wait(interceptData.aliases.instruments);
    cy.wait(interceptData.aliases.defaultRunConfigs);

    cy.getByTestId(
      `selectable-analyzer-${sediVueInstrument.instrument.instrumentSerialNumber}`
    )
      .as("svdxInstrument")
      .click();
    cy.getByTestId("sample-type-select").select("Abdominal");
    cy.get("@svdxInstrument").contains(
      "Fluid type has not been validated. For research purposes only."
    );
  });

  it("should show SVDX dilution guide", () => {
    cy.visit("/labRequest/build?patientId=1");
    cy.wait(interceptData.aliases.instruments);
    cy.wait(interceptData.aliases.defaultRunConfigs);

    cy.getByTestId(
      `selectable-analyzer-${sediVueInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.contains("Dilution").click();
    cy.getByTestId("modal").should("be.visible");
    cy.containedWithinTestId("modal", "SediVue Dx");
    cy.containedWithinTestId("modal", "Adjust Dilution");
    cy.containedWithinTestId("modal", "part sample");
    cy.containedWithinTestId("modal", "part diluent");
    cy.containedWithinTestId("modal", "total part");
    cy.containedWithinTestId("modal", "Cancel");
    cy.containedWithinTestId("modal", "Instructions");
    cy.containedWithinTestId("modal", "Save");
    cy.contains("Instructions").click();
    cy.getByTestId("confirm-modal").should("be.visible");
    cy.containedWithinTestId(
      "confirm-modal",
      "Invert the urine sample 10 times, then immediately aspirate 1 part sample, adding it to a test tube with the selected parts of 0.9% normal saline. The number of parts saline will vary depending on your selected dilution factor. (ex. 1 part sample + 9 parts saline = dilution factor of 10)"
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Adjust the part(s) diluent to reach the desired dilution factor, then tap Run or Add Test to start the run."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Invert the diluted sample 10 times and then immediately aspirate 165 µl and dispense it into the cartridge fill port."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Press the Start button on the analyzer. A note will be added to the results indicating a dilution was performed."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Note: Diluting a urine sample may affect the pH and osmolality of the sample and lead to changes in cellular appearance and presence of crystals."
    );
    cy.containedWithinTestId("confirm-modal", "OK");
    cy.containedWithinTestId("confirm-modal", "SediVue Dx");
    cy.containedWithinTestId("confirm-modal", "Dilution Instructions");
    cy.contains("OK").click();
    cy.getByTestId("confirm-modal").should("not.exist");
  });

  it("should show SVDX bacteria confirmation guide", () => {
    cy.visit("/labRequest/build?patientId=1");
    cy.wait(interceptData.aliases.instruments);
    cy.wait(interceptData.aliases.defaultRunConfigs);

    cy.getByTestId(
      `selectable-analyzer-${sediVueInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.contains("Confirm Bacteria").click();
    cy.containedWithinTestId(
      `selectable-analyzer-${sediVueInstrument.instrument.instrumentSerialNumber}`,
      "Prepare the sample using the Bacteria Confirmation Kit, then initiate run."
    );
    cy.contains("Instructions").click();
    cy.getByTestId("confirm-modal").should("be.visible");
    cy.containedWithinTestId("confirm-modal", "SediVue Dx");
    cy.containedWithinTestId(
      "confirm-modal",
      "Bacteria Confirmation Kit Instructions"
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Use the SediVue Dx pipette to transfer 165 µL of urine from the original sample container to a new, untreated test tube -- use this tube for remaining steps."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Add 1 drop of (red) Reagent 1, then place cap on tube and invert 5 times to mix. Remove cap."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Add 1 drop of (blue) Reagent 2, then replace cap on tube and invert 5 times to mix."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Use the SediVue Dx pipette to aspirate 165 µL of the sample and reagent mixture."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Tap OK below, initiate run, then dispense the sample and reagent mixture into the SediVue Dx cartridge."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Press the Start button on SediVue Dx."
    );
    cy.containedWithinTestId(
      "confirm-modal",
      "Bacteria Confirmation Kit Instructions"
    );
    cy.getByTestId("done-button").click();
    cy.getByTestId("confirm-modal").should("not.exist");
  });
});
