import {
  randomInstrumentDto,
  randomInstrumentStatus,
  randomRefClass,
} from "@viewpoint/test-utils";
import {
  AvailableSampleTypes,
  InstrumentStatus,
  InstrumentType,
  RunConfiguration,
  SampleTypeEnum,
  SettingTypeEnum,
} from "@viewpoint/api";
import { interceptRequestsForSelectInstruments } from "../../util/default-intercepts";

describe("proCyte Dx runs", () => {
  const pdxInstrument = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.ProCyteDx,
      supportedRunConfigurations: [RunConfiguration.SAMPLE_TYPE],
      manualEntry: false,
    }),
  });

  it("displays synovial fluid reminder only when setting is enabled", () => {
    const refClass = randomRefClass();
    const availableSampleTypes: AvailableSampleTypes = {
      [InstrumentType.ProCyteDx]: {
        unknown: [],
        [refClass.id]: [
          {
            id: 1,
            name: SampleTypeEnum.WHOLEBLOOD,
          },
          {
            id: 2,
            name: SampleTypeEnum.ABDOMINAL,
          },
          {
            id: 3,
            name: SampleTypeEnum.SYNOVIAL,
          },
        ],
      },
    };
    interceptRequestsForSelectInstruments({
      settings: { [SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER]: "true" },
      instruments: [pdxInstrument],
      referenceClassifications: [refClass],
      sampleTypes: availableSampleTypes,
    });

    cy.visit("/labRequest/build?patientId=1");
    cy.getByTestId(
      `selectable-analyzer-${pdxInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("sample-type-select").select(3);

    cy.getByTestId("confirm-modal")
      .should("be.visible")
      .contains("Synovial Fluid Sample Preparation");

    // Disable the setting and try again -- no modal this time
    const newData = interceptRequestsForSelectInstruments({
      settings: { [SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER]: "false" },
      instruments: [pdxInstrument],
      sampleTypes: availableSampleTypes,
    });
    cy.visit("/labRequest/build?patientId=1");
    cy.wait(newData.aliases.defaultRunConfigs);
    cy.getByTestId(
      `selectable-analyzer-${pdxInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("sample-type-select").select(3);

    cy.findByTestId("confirm-modal").should("not.exist");
  });
});
