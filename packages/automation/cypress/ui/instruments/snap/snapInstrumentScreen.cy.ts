import {
  InstrumentStatus,
  InstrumentType,
  SettingTypeEnum,
  SpeciesType,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";

const canineSnapResponse = [
  {
    settingType: SettingTypeEnum.SNAP_CANINE4DX,
    displayNamePropertyKey: "Instrument.Snap.Canine.4Dx",
  },
  {
    settingType: SettingTypeEnum.SNAP_CANINE4DXPLUS,
    displayNamePropertyKey: "Instrument.Snap.Canine.4DxPlus",
  },
  {
    settingType: SettingTypeEnum.SNAP_CANINELEISHMANIA,
    displayNamePropertyKey: "Instrument.Snap.Canine.Leishmania",
  },
];
const felineSnapResponse = [
  {
    settingType: SettingTypeEnum.SNAP_FELINECOMBOPLUS,
    displayNamePropertyKey: "Instrument.Snap.Feline.FelineComboPlus",
  },
];
const equineSnapResponse = [
  {
    settingType: SettingTypeEnum.SNAP_EQUINEFOALIGG,
    displayNamePropertyKey: "Instrument.Snap.Equine.FoalIgG",
  },
];

const snapConfigurationResponse = {
  [SettingTypeEnum.SNAP_CANINE4DX]: "true",
  [SettingTypeEnum.SNAP_CANINE4DXPLUS]: "true",
  [SettingTypeEnum.SNAP_CANINELEISHMANIA]: "false",
  [SettingTypeEnum.SNAP_FELINECOMBOPLUS]: "true",
  [SettingTypeEnum.SNAP_EQUINEFOALIGG]: "true",
};

describe("SNAP instrument screen", () => {
  const instrumentStatusDto = randomInstrumentStatus({
    instrument: randomInstrumentDto({ instrumentType: InstrumentType.SNAP }),
    instrumentStatus: InstrumentStatus.Ready,
  });

  beforeEach(() => {
    cy.intercept("**/device/status", [instrumentStatusDto]);
    cy.intercept(
      { method: "GET", pathname: "**/api/settings" },
      snapConfigurationResponse
    );
  });

  it("shows available SNAP tests and whether they are enabled", () => {
    cy.intercept(
      {
        url: "**/api/species",
        times: 1,
      },
      [
        { id: 1, speciesName: SpeciesType.Canine },
        { id: 2, speciesName: SpeciesType.Feline },
        { id: 3, speciesName: SpeciesType.Equine },
        { id: 4, speciesName: SpeciesType.Alpaca },
      ]
    );

    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/snapDevice/species/1/devices`,
      },
      canineSnapResponse
    );
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/snapDevice/species/2/devices`,
      },
      felineSnapResponse
    );
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/snapDevice/species/3/devices`,
      },
      equineSnapResponse
    );

    cy.visit(`/instruments/${instrumentStatusDto.instrument.id}`);

    cy.getByTestId("snap-instruments-screen")
      .should("exist")
      .should("be.visible");

    cy.getByTestId("snap-tab-content-Canine")
      .should("exist")
      .should("be.visible");

    canineSnapResponse.forEach((snap) =>
      cy
        .getByTestId(`snap-checkbox-${snap.settingType}`)
        .should(
          snap.settingType === SettingTypeEnum.SNAP_CANINELEISHMANIA
            ? "not.be.checked"
            : "be.checked"
        )
    );

    cy.getByTestId("snap-tab-Feline").click();

    cy.getByTestId("snap-tab-content-Feline")
      .should("exist")
      .should("be.visible");

    felineSnapResponse.forEach((snap) =>
      cy.getByTestId(`snap-checkbox-${snap.settingType}`).should("be.checked")
    );

    cy.getByTestId("snap-tab-Equine").click();

    cy.getByTestId("snap-tab-content-Equine")
      .should("exist")
      .should("be.visible");

    equineSnapResponse.forEach((snap) =>
      cy.getByTestId(`snap-checkbox-${snap.settingType}`).should("be.checked")
    );
  });
});
