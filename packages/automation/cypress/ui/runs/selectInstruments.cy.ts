import {
  DilutionTypeEnum,
  InstrumentStatus,
  InstrumentType,
  LabRequestRunType,
  ReferenceClassType,
  RunConfiguration,
  SettingTypeEnum,
  SnapDeviceDto,
  SpeciesType,
  SupportedRunTypeValidationError,
} from "@viewpoint/api";
import { getDefaultSettings, viteAsset } from "../../util/general-utils";
import {
  randomInstrumentDto,
  randomInstrumentRun,
  randomInstrumentStatus,
  randomLabRequest,
  randomPatientDto,
  randomPimsRequestDto,
} from "@viewpoint/test-utils";
import {
  interceptRequestsForHomeScreen,
  interceptRequestsForSelectInstruments,
  SelectInstrumentsData,
} from "../../util/default-intercepts";

describe("select instruments screen", () => {
  let interceptData: SelectInstrumentsData = {} as SelectInstrumentsData;
  const catOneInstrument = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.CatalystOne,
      manualEntry: false,
      runnable: true,
      supportedRunConfigurations: [],
    }),
  });

  const snapInstrument = randomInstrumentStatus({
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.SNAP,
      supportedRunConfigurations: [],
    }),
    instrumentStatus: InstrumentStatus.Ready,
  });

  beforeEach(() => {
    interceptRequestsForHomeScreen();
    interceptData = interceptRequestsForSelectInstruments({
      instruments: [catOneInstrument, snapInstrument],
    });
    cy.intercept("POST", "**/api/labRequest", {}).as("submitLabRequest");
  });

  it("displays supported instruments and allows selection", () => {
    cy.visit("/labRequest/build?patientId=1");
    cy.wait(interceptData.aliases.patient);
    cy.wait(interceptData.aliases.instruments);

    // CatOne icon should be there but not selected
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    )
      .as("catOneInstrument")
      .should("be.visible");
    cy.getByTestId("selectable-analyzer-delete-icon").should("not.exist");

    // Select it
    cy.get("@catOneInstrument").click();
    // Remove icon is now visible -- click it to unselect it
    cy.getByTestId("selectable-analyzer-delete-icon")
      .should("be.visible")
      .click();
    cy.getByTestId("selectable-analyzer-delete-icon").should("not.exist");
  });

  it("navigates back via history when back button is clicked", () => {
    cy.visit("/");
    cy.visit("/labRequest/build?patientId=1");
    cy.getByTestId("back-button").click();
    cy.location("pathname").should("equal", "/");
  });

  it("disables run button if requisition ID is empty but setting is marked as required", () => {
    cy.intercept(
      { pathname: "**/api/settings", method: "GET" },
      {
        ...getDefaultSettings(),
        [SettingTypeEnum.REQUIRE_REQUISITION_ID]: "true",
      }
    );
    cy.visit("/labRequest/build?patientId=1");
    cy.wait("@availableInstruments");
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();

    cy.getByTestId("run-button").should("be.disabled");
    cy.getByTestId("requisition-id-input").type("REQ123");
    cy.getByTestId("run-button").should("be.enabled");
  });

  it("disables run button if ref class is not selected", () => {
    // In the real world, the only way to get to the select instruments screen without a valid ref class to auto select
    // is via a PIMS request with no birthdate.
    const pimsRequest = randomPimsRequestDto({ pimsRequestUUID: "1" });
    const patient = randomPatientDto({
      id: 38,
      patientName: "Snoopy",
      speciesDto: {
        id: 2,
        speciesName: SpeciesType.Canine,
        speciesClass: ReferenceClassType.LifeStage,
      },
    });

    // Intercept the Pending request to return the PIMS Request
    cy.intercept({ pathname: "**/api/pims/pending", method: "GET" }, [
      pimsRequest,
    ]);

    // PIMS patient auto match endpoint, required for running from PIMS request
    cy.intercept(
      { pathname: "**/api/pims/pending/*/match", method: "POST" },
      {
        patientDto: patient,
      }
    );
    cy.intercept({ pathname: `**/api/patient/${patient.id}` }, patient);
    // Don't return an auto select ref class
    cy.intercept(
      { pathname: "**/api/vp/patient/*/mostRecentRefClass", method: "GET" },
      ""
    );
    cy.visit(`/labRequest/build?pimsRequestId=1&patientId=${patient.id}`);
    cy.wait(interceptData.aliases.instruments);

    // Select an instrument
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();

    // Run button is disabled until a ref class is selected
    cy.getByTestId("run-button").should("be.disabled");
    cy.getByTestId("ref-class-select").select("Adult Canine");
    cy.getByTestId("run-button").should("be.enabled");
  });

  it("should provide visibility to selected instruments before a run", () => {
    cy.visit("/labRequest/build?patientId=1");

    cy.getByTestId(
      `selectable-analyzer-${interceptData.instruments[0].instrument.instrumentSerialNumber}`
    )
      .as("CatOne")
      .click();

    cy.getByTestId("selected-instrument-indicator")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("CatOne.png"));

    cy.contains("Run").should("be.enabled");
  });

  it("should provide visibility to instruments that require additional selections before a run", () => {
    const availableSnaps: SnapDeviceDto[] = [
      {
        instrumentDto: snapInstrument.instrument,
        snapDeviceId: 1,
        displayNamePropertyKey: "Instrument.Snap.Canine.4DxPlus",
        snapResultTypes: [],
        settingType: SettingTypeEnum.SNAP_CANINE4DXPLUS,
      },
    ];
    cy.intercept("**/snapDevice/species/*/devices**", availableSnaps).as(
      "snap-test-type"
    );
    cy.visit("/labRequest/build?patientId=1");
    cy.wait("@snap-test-type");
    //Select a SNAP without specifying a SNAP test
    cy.getByTestId(
      `selectable-analyzer-${interceptData.instruments[1].instrument.instrumentSerialNumber}`
    )
      .as("SNAP")
      .click();

    cy.getByTestId("selected-instrument-indicator")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("SNAP.png"));

    cy.contains(".spot-button", "Run").should("not.be.enabled");
    //Select a SNAP type
    cy.contains("4Dx Plus").click();
    cy.contains(".spot-button", "Run").should("be.enabled");
  });

  it("allows user to merge/replace results", () => {
    const originalLabRequest = randomLabRequest({
      instrumentRunDtos: [
        randomInstrumentRun({
          instrumentId: catOneInstrument.instrument.id,
          instrumentType: InstrumentType.CatalystOne,
        }),
      ],
    });

    cy.intercept(
      { pathname: `**/api/labRequest/${originalLabRequest.id}` },
      originalLabRequest
    );

    cy.intercept({ pathname: "**/api/labRequest/*/isComplete" }, "true");

    cy.intercept({ pathname: "**/api/labRequest/*/merge" }, {}).as("merge");

    cy.visit(`/labRequest/build?originalLabRequestId=${originalLabRequest.id}`);

    // Verify merge is valid
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("addTest-button").click();
    cy.getByTestId("merge-button").should("be.enabled").click();

    cy.get("@merge")
      .its("request.url")
      .should("contain", `api/labRequest/${originalLabRequest.id}/merge`);
  });

  it("disables merge/replace button if user is not able to merge", () => {
    const originalLabRequest = randomLabRequest({
      instrumentRunDtos: [
        randomInstrumentRun({
          instrumentId: catOneInstrument.instrument.id,
          instrumentType: InstrumentType.CatalystOne,
        }),
      ],
    });

    cy.intercept(
      { pathname: `**/api/labRequest/${originalLabRequest.id}` },
      originalLabRequest
    );

    cy.intercept(
      {
        pathname: `**/api/labRequest/${originalLabRequest.id}/addTest/validate`,
      },
      interceptData.addTestCheck.map((check) =>
        check.runType === LabRequestRunType.MERGE
          ? {
              ...check,
              supported: false,
              reasons: [
                SupportedRunTypeValidationError.MERGE_LAB_REQUEST_ACTIVE,
              ],
            }
          : check
      )
    );

    cy.visit(`/labRequest/build?originalLabRequestId=${originalLabRequest.id}`);

    // Verify merge is valid
    cy.getByTestId(
      `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
    ).click();
    cy.getByTestId("addTest-button").click();
    cy.getByTestId("merge-button").should("not.exist");
  });

  describe("queued runs", () => {
    it("allows the user to add up to maxQueuableRuns queued runs", () => {
      const catOneInstrument = randomInstrumentStatus({
        connected: true,
        instrumentStatus: InstrumentStatus.Ready,
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.CatalystOne,
          supportedRunConfigurations: [
            RunConfiguration.DILUTION,
            RunConfiguration.UPC,
          ],
          manualEntry: false,
          runnable: true,
          maxQueueableRuns: 3,
        }),
      });
      interceptRequestsForSelectInstruments({
        instruments: [catOneInstrument],
      });

      cy.visit("/labRequest/build?patientId=1");
      cy.getByTestId(
        `selectable-analyzer-${catOneInstrument.instrument.instrumentSerialNumber}`
      )
        .as("catOneInstrument")
        .click();
      // One run has a checkmark
      cy.getByTestId("selected-instrument-indicator")
        .as("shoppingCartItem")
        .find(".icon-checkmark")
        .as("shoppingCardCheckmark")
        .should("be.visible");

      // Choose UPC for the first run
      cy.getByTestId("run-config-toggle-label-UPC").click();
      // Verify UPC info is shown
      cy.get("@catOneInstrument").should("contain.text", "UPC - 1:21");

      // Add a run
      cy.getByTestId("add-run-link").click();

      // Two runs contains a number
      cy.get("@shoppingCartItem").should("contain.text", "2");
      cy.get("@shoppingCardCheckmark").should("not.exist");

      // Verify we're on the second run tab and no dilution run config is selected
      cy.getByTestId("run-config-tab-2").should(
        "have.class",
        "spot-tabs__link--active"
      );
      cy.get("@catOneInstrument").should("not.contain.text", "UPC - 1:21");

      // Add a third run
      cy.getByTestId("add-run-link").click();
      cy.get("@shoppingCartItem").should("contain.text", "3");
      // Verify on the third tab
      cy.getByTestId("run-config-tab-3").should(
        "have.class",
        "spot-tabs__link--active"
      );
      // Add run link should be gone since we've hit the max
      cy.getByTestId("add-run-link").should("not.exist");

      // Remove the third run
      cy.getByTestId("selectable-analyzer-delete-icon").click();
      cy.get("@shoppingCartItem").should("contain.text", "2");
      cy.getByTestId("run-config-tab-3").should("not.exist");
      // Verify we're back on the second tab
      cy.getByTestId("run-config-tab-2").should(
        "have.class",
        "spot-tabs__link--active"
      );
      cy.getByTestId("add-run-link").should("be.visible");
      // Choose automatic dilution for run 2
      cy.getByTestId("run-config-toggle-label-DILUTION").click();
      cy.get(".spot-button").contains("Save").click();

      // Submit and verify 2 run requests
      cy.getByTestId("run-button").click();
      cy.wait("@submitLabRequest")
        .its("request.body.instrumentRunDtos")
        .as("runDtos")
        .should("have.length", 2);

      cy.get("@runDtos")
        .its(0)
        .its("instrumentRunConfigurations")
        .should("deep.equal", [
          {
            dilution: 21,
            dilutionType: DilutionTypeEnum.UPCAUTOMATIC,
          },
        ]);
      cy.get("@runDtos")
        .its(1)
        .its("instrumentRunConfigurations")
        .should("deep.equal", [
          {
            dilution: 2,
            dilutionType: DilutionTypeEnum.AUTOMATIC,
          },
        ]);
    });
  });
});
