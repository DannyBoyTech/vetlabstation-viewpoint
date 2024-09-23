import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";
import {
  CrimsonPropertiesDto,
  InstrumentStatus,
  InstrumentType,
  SampleDrawerPositionEnum,
  SettingTypeEnum,
  InstrumentTimePropertyDto,
} from "@viewpoint/api";

describe("ProCyte Dx settings page", () => {
  it("shows procyte dx settings and allows updates", () => {
    const procyte = setupResponses();
    cy.visit(`/instruments/${procyte.instrument.id}/settings`);
    cy.wait(["@fetchIvlsSettings", "@fetchProCyteSettings"]);
    cy.getByTestId("pdx-settings-aspiration-sensor-toggle").should(
      "be.checked"
    );
    cy.getByTestId("pdx-settings-sample-invert-toggle").should("be.checked");
    cy.getByTestId("pdx-settings-reagent-low-toggle").should("be.checked");
    cy.getByTestId("pdx-settings-synovial-fluid-toggle").should("be.checked");
    cy.getByTestId("pdx-settings-sample-drawer-open-radio").should(
      "be.checked"
    );
    cy.getByTestId("pdx-settings-sample-drawer-closed-radio").should(
      "not.be.checked"
    );
    cy.getByTestId("twelve-hour-select-hours").should("have.value", "10");
    cy.getByTestId("twelve-hour-select-ampm").should("have.value", "AM");

    // The controls react to the user's input and re-request the new value from the server,
    // so we also have to mock that response here

    // Update 1 from each type/source (PDx toggle, IVLS toggle, IVLS time, PDx radio)
    mockProCyteSettings({ aspirationSensorEnable: false });
    cy.getByTestId("pdx-settings-aspiration-sensor-toggle").click({
      force: true,
    });
    cy.wait("@updateProCyteSettings");
    cy.wait("@fetchProCyteSettings");
    cy.getByTestId("pdx-settings-aspiration-sensor-toggle").should(
      "not.be.checked"
    );

    mockIvlsSettings({ [SettingTypeEnum.INVERT_SAMPLE_REMINDER]: "false" });
    cy.getByTestId("pdx-settings-sample-invert-toggle").click({ force: true });
    cy.wait("@updateIvlsSettings");
    cy.wait("@fetchIvlsSettings");
    cy.getByTestId("pdx-settings-sample-invert-toggle").should(
      "not.be.checked"
    );

    mockProCyteSettings({ standByTime: { hours: 0 } });
    cy.getByTestId("twelve-hour-select-hours").select("12");
    cy.wait("@updateProCyteSettings");
    cy.wait("@fetchProCyteSettings");

    mockProCyteSettings({ standByTime: { hours: 12, isPm: true } });
    cy.getByTestId("twelve-hour-select-ampm").select("PM");
    cy.wait("@updateProCyteSettings");
    cy.wait("@fetchProCyteSettings");
    cy.getByTestId("twelve-hour-select-hours").should("have.value", "12");
    cy.getByTestId("twelve-hour-select-ampm").should("have.value", "PM");

    mockProCyteSettings({
      sampleDrawerPosition: SampleDrawerPositionEnum.CLOSED,
    });
    cy.getByTestId("pdx-settings-sample-drawer-closed-radio").click({
      force: true,
    });
    cy.getByTestId("pdx-settings-sample-drawer-open-radio").should(
      "not.be.checked"
    );
    cy.getByTestId("pdx-settings-sample-drawer-closed-radio").should(
      "be.checked"
    );
  });
});

type PartialCrimsonPropertiesDto = Partial<
  Omit<CrimsonPropertiesDto, "standByTime"> & {
    standByTime?: Partial<InstrumentTimePropertyDto>;
  }
>;

function setupResponses(
  ivlsSettings?: { [key in SettingTypeEnum]?: string },
  proCyteSettings?: PartialCrimsonPropertiesDto,
  instrumentId?: number
) {
  const procyte = randomInstrumentStatus({
    instrument: randomInstrumentDto({
      id: instrumentId ?? 1,
      instrumentType: InstrumentType.ProCyteDx,
    }),
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
  });
  cy.intercept("GET", "**/api/device/status", [procyte]);
  cy.intercept("GET", "**/api/device/*/status", procyte);

  mockIvlsSettings(ivlsSettings);
  mockProCyteSettings(proCyteSettings);
  return procyte;
}

function mockIvlsSettings(ivlsSettings?: {
  [key in SettingTypeEnum]?: string;
}) {
  cy.intercept(
    { pathname: "**/api/settings", method: "GET" },
    {
      [SettingTypeEnum.INVERT_SAMPLE_REMINDER]: "true",
      [SettingTypeEnum.REAGENT_LOW_REMINDER]: "true",
      [SettingTypeEnum.PROCYTE_SYNOVIAL_FLUID_REMINDER]: "true",
      ...ivlsSettings,
    }
  ).as("fetchIvlsSettings");
  cy.intercept("POST", "**/api/settings", {}).as("updateIvlsSettings");
}

function mockProCyteSettings(proCyteSettings?: PartialCrimsonPropertiesDto) {
  cy.intercept("GET", "**/api/instrument/crimson/*/properties", {
    aspirationSensorEnable: true,
    sampleDrawerPosition: SampleDrawerPositionEnum.OPENED,
    standByTime: {
      hours: 10,
      isPm: false,
      minutes: 0,
      ...proCyteSettings?.standByTime,
    },
    ...proCyteSettings,
  } as CrimsonPropertiesDto).as("fetchProCyteSettings");

  cy.intercept("PUT", "**/api/instrument/crimson/*/properties", {}).as(
    "updateProCyteSettings"
  );
}
