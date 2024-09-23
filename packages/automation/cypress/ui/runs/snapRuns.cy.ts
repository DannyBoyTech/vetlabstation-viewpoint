import {
  interceptGlobalRequests,
  interceptRequestsForSelectInstruments,
} from "../../util/default-intercepts";
import {
  ExecuteLabRequestDto,
  InstrumentStatus,
  InstrumentType,
  SettingTypeEnum,
  SnapDeviceDto,
} from "@viewpoint/api";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
} from "@viewpoint/test-utils";

describe("SNAP runs", () => {
  const snapInstrumentStatus = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.SNAP,
      instrumentSerialNumber: "SNAP",
      supportedRunConfigurations: [],
      manualEntry: true,
    }),
  });

  const originalLeishmaniaDevice: SnapDeviceDto = {
    snapDeviceId: 1,
    settingType: SettingTypeEnum.SNAP_CANINELEISHMANIA,
    displayNamePropertyKey: "Instrument.Snap.Canine.Leishmania",
    snapResultTypes: [],
  };

  const twoSpotLeishmaniaDevice: SnapDeviceDto = {
    snapDeviceId: 2,
    settingType: SettingTypeEnum.SNAP_CANINELEISHMANIA2SPOT,
    displayNamePropertyKey: "Instrument.Snap.Canine.Leishmania2Spot",
    snapResultTypes: [],
  };

  const fourDxPlusDevice: SnapDeviceDto = {
    instrumentDto: snapInstrumentStatus.instrument,
    snapDeviceId: 1,
    displayNamePropertyKey: "Instrument.Snap.Canine.4DxPlus",
    snapResultTypes: [],
    settingType: SettingTypeEnum.SNAP_CANINE4DXPLUS,
  };
  const parvoDevice: SnapDeviceDto = {
    instrumentDto: snapInstrumentStatus.instrument,
    snapDeviceId: 2,
    displayNamePropertyKey: "Instrument.Snap.Canine.Parvo",
    snapResultTypes: [],
    settingType: SettingTypeEnum.SNAP_CANINEPARVO,
  };
  const cplDevice: SnapDeviceDto = {
    instrumentDto: snapInstrumentStatus.instrument,
    snapDeviceId: 3,
    displayNamePropertyKey: "Instrument.Snap.Canine.cPL",
    snapResultTypes: [],
    settingType: SettingTypeEnum.SNAP_CANINECPL,
  };

  beforeEach(() => {
    interceptGlobalRequests();
  });

  it("allows user to submit SNAP tests", () => {
    const interceptData = interceptRequestsForSelectInstruments({
      instruments: [snapInstrumentStatus],
      snapDevices: [fourDxPlusDevice, parvoDevice, cplDevice],
    });
    cy.intercept("POST", "**/api/labRequest", {}).as("submitLabRequest");
    cy.visit("/labRequest/build?patientId=1");

    cy.getByTestId(
      `selectable-analyzer-${snapInstrumentStatus.instrument.instrumentSerialNumber}`
    ).click();
    cy.contains("Select a SNAP Test").click();

    // Select parvo and cpl (force: true is required because the actual SPOT checkbox input is 0x0 pixels)
    cy.getByTestId("snap-checkbox-device-2").check({ force: true });
    cy.getByTestId("snap-checkbox-device-3").check({ force: true });

    cy.getByTestId("run-button").click();

    cy.wait("@submitLabRequest")
      .its("request.body")
      .should("deep.equal", {
        weight: "",
        requisitionId: "",
        patientId: interceptData.patient.id,
        refClassId: interceptData.referenceClassifications[0].id,
        testingReasons: [],
        instrumentRunDtos: [
          {
            instrumentId: snapInstrumentStatus.instrument.id,
            snapDeviceId: parvoDevice.snapDeviceId,
            runQueueId: 1,
            instrumentRunConfigurations: [],
          },
          {
            instrumentId: snapInstrumentStatus.instrument.id,
            snapDeviceId: cplDevice.snapDeviceId,
            runQueueId: 2,
            instrumentRunConfigurations: [],
          },
        ],
      } as ExecuteLabRequestDto);
    cy.location("pathname").should("eq", "/");
  });

  it("asks the user to confirm the Leishmania SNAP type if both are available", () => {
    const data = interceptRequestsForSelectInstruments({
      instruments: [snapInstrumentStatus],
      snapDevices: [originalLeishmaniaDevice, twoSpotLeishmaniaDevice],
    });
    cy.visit(`/labRequest/build?patientId=${data.patient.id}`);
    cy.getByTestId("selectable-analyzer-SNAP").click();
    // Choose the first leishmania
    cy.getByTestId("snap-checkbox-device-1")
      .as("originalLeishmania")
      .click({ force: true });
    cy.getByTestId("global-confirm-modal")
      .should("be.visible")
      // Tells the user how many spots are in their test -- in this case, 3 for the original
      .contains("Your test has 3 blue spots in the results window");
    cy.getByTestId("done-button").click();
    cy.get("@originalLeishmania").should("be.checked");

    // Choose the second leishmania
    cy.getByTestId("snap-checkbox-device-2")
      .as("twoSpotLeishmania")
      .click({ force: true });
    cy.getByTestId("global-confirm-modal")
      .should("be.visible")
      // 2 spots for the new test
      .contains("Your test only has 2 blue spots in the results window");
    cy.getByTestId("later-button").click();
    cy.get("@twoSpotLeishmania").should("not.be.checked");
  });

  it("asks the user to confirm the original Leishmania SNAP type even if it's the only one available", () => {
    const data = interceptRequestsForSelectInstruments({
      instruments: [snapInstrumentStatus],
      snapDevices: [originalLeishmaniaDevice],
    });
    cy.visit(`/labRequest/build?patientId=${data.patient.id}`);
    cy.getByTestId("selectable-analyzer-SNAP").click();
    // Choose the first leishmania
    cy.getByTestId("snap-checkbox-device-1")
      .as("originalLeishmania")
      .click({ force: true });
    cy.getByTestId("global-confirm-modal")
      .should("be.visible")
      // Tells the user how many spots are in their test -- in this case, 3 for the original
      .contains("Your test has 3 blue spots in the results window");
    cy.getByTestId("done-button").click();
    cy.get("@originalLeishmania").should("be.checked");
  });

  it("does not ask the user to confirm if only the 2-spot leishmania test is available", () => {
    const data = interceptRequestsForSelectInstruments({
      instruments: [snapInstrumentStatus],
      snapDevices: [twoSpotLeishmaniaDevice],
    });
    cy.visit(`/labRequest/build?patientId=${data.patient.id}`);
    cy.getByTestId("selectable-analyzer-SNAP").click();
    // Choose the first leishmania
    cy.getByTestId("snap-checkbox-device-2")
      .as("twoSpotLeishmania")
      .click({ force: true });
    cy.getByTestId("global-confirm-modal").should("not.exist");
    cy.get("@twoSpotLeishmania").should("be.checked");
  });

  it("hides SNAP card if no SNAP tests are available for the patient", () => {
    const catOne = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
      }),
    });
    const snap = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.SNAP,
      }),
    });
    const { patient } = interceptRequestsForSelectInstruments({
      instruments: [catOne, snap],
      snapDevices: [],
    });
    cy.visit(`/labRequest/build?patientId=${patient.id}`);
    cy.getByTestId(
      `selectable-analyzer-${catOne.instrument.instrumentSerialNumber}`
    ).should("be.visible");
    cy.getByTestId(
      `selectable-analyzer-${snap.instrument.instrumentSerialNumber}`
    ).should("not.exist");
  });

  it("disables run button if snap card is selected but no tests are selected", () => {
    const catOneInstrument = randomInstrumentStatus({
      connected: true,
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({
        supportedRunConfigurations: [],
        instrumentType: InstrumentType.CatalystOne,
        runnable: true,
        manualEntry: false,
      }),
    });
    interceptRequestsForSelectInstruments({
      instruments: [snapInstrumentStatus, catOneInstrument],
      snapDevices: [fourDxPlusDevice, parvoDevice, cplDevice],
    });
    cy.visit("/labRequest/build?patientId=1");
    // Select a regular analyzer
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();
    //Run button should be enabled
    cy.getByTestId("run-button").should("be.enabled");

    // Open the SNAP card but don't select a SNAP instrument
    cy.getByTestId(
      `selectable-analyzer-${snapInstrumentStatus.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("run-button").should("be.disabled");
    // Select a SNAP test, run button should be enabled again
    cy.getByTestId("snap-checkbox-device-2").check({ force: true });
    cy.getByTestId("run-button").should("be.enabled");
  });
});
