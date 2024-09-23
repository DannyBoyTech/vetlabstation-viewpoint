import {
  InstrumentRunStatus,
  InstrumentStatus,
  InstrumentType,
  MaintenanceProcedure,
  ReferenceClassType,
  RunningInstrumentRunDto,
  RunningLabRequestDto,
  SampleTypeEnum,
  SettingTypeEnum,
  SpeciesType,
} from "@viewpoint/api";
import { viteAsset } from "../../util/general-utils";
import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
  randomPatientDto,
  randomRunningInstrumentRun,
  randomRunningLabRequest,
} from "@viewpoint/test-utils";

describe("in process runs", () => {
  beforeEach(() => {
    interceptRequestsForHomeScreen();
  });

  it("successfully displays in process runs", () => {
    const instruments = [
      randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
      }),
      randomInstrumentDto({
        instrumentType: InstrumentType.ManualUA,
      }),
      randomInstrumentDto({
        instrumentType: InstrumentType.ProCyteOne,
      }),
    ];
    const instrumentStatuses = [
      randomInstrumentStatus({
        instrument: instruments[0],
        instrumentStatus: InstrumentStatus.Busy,
      }),
      randomInstrumentStatus({
        instrument: instruments[1],
        instrumentStatus: InstrumentStatus.Ready,
      }),
      randomInstrumentStatus({
        instrument: instruments[2],
        instrumentStatus: InstrumentStatus.Alert,
      }),
    ];
    const labRequest = randomRunningLabRequest({
      id: 1,
      patientDto: randomPatientDto({
        speciesDto: {
          speciesName: SpeciesType.Canine,
          speciesClass: ReferenceClassType.LifeStage,
          id: 1,
        },
      }),
      instrumentRunDtos: [
        randomRunningInstrumentRun({
          id: 1,
          status: InstrumentRunStatus.Running,
          instrumentId: instruments[0].id,
          timeRemaining: 5000,
          instrumentType: InstrumentType.CatalystOne,
          displayOrder: 3,
        }),
        randomRunningInstrumentRun({
          id: 2,
          status: InstrumentRunStatus.Awaiting_Manual_Entry,
          instrumentId: instruments[1].id,
          instrumentType: InstrumentType.ManualUA,
          progress: undefined,
          timeRemaining: undefined,
          displayOrder: 2,
        }),
        randomRunningInstrumentRun({
          id: 3,
          status: InstrumentRunStatus.Alert,
          instrumentId: instruments[2].id,
          timeRemaining: undefined,
          progress: 0.5,
          instrumentType: InstrumentType.ProCyteOne,
          displayOrder: 1,
        }),
      ],
    });
    cy.intercept("GET", "**/api/device/status", instrumentStatuses);
    cy.intercept("GET", "**/labRequest/running", [labRequest]).as(
      "labRequests"
    );
    cy.visit("/");
    cy.wait("@labRequests");

    cy.getByTestIdContains("in-process-run").should("have.length", 3);

    cy.getByTestId("in-process-card")
      .containedWithinTestId(
        "in-process-card",
        `${labRequest.patientDto.patientName} ${labRequest.patientDto.clientDto.lastName}`
      )
      .containedWithinTestId(
        "in-process-card",
        labRequest.patientDto.pimsPatientId
      )
      .find(`.icon-animal-canine`);

    // Sorted based on "displayOrder" field of instrument run
    cy.getByTestId("in-process-run")
      .eq(0)
      .should("contain.text", "ProCyte One")
      .find(".spot-progress-bar__value")
      .should("have.attr", "style")
      .and("include", "width: 50%");

    cy.getByTestId("in-process-run")
      .eq(0)
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("AcadiaDx.png"));

    cy.getByTestId("in-process-run")
      .eq(1)
      .should("contain.text", "Manual UA")
      .should("contain.text", "Add Results")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("ManualUA.png"));

    cy.getByTestId("in-process-run")
      .eq(2)
      .should("contain.text", "Catalyst One")
      .should("contain.text", "00:05 min")
      .find("img")
      .should("have.attr", "src")
      .and("match", viteAsset("CatOne.png"));
  });

  it("ellipsizes long patient names in the in process card", () => {
    const instrument = randomInstrumentDto({
      instrumentType: InstrumentType.CatalystOne,
    });
    const labRequest: RunningLabRequestDto = randomRunningLabRequest({
      patientDto: randomPatientDto({
        patientName:
          "This name is super long and should definitely cause ellipsis",
      }),
      instrumentRunDtos: [
        randomRunningInstrumentRun({
          instrumentId: instrument.id,
          status: InstrumentRunStatus.Running,
        }),
      ],
    });

    cy.intercept("GET", "**/api/device/status", [
      randomInstrumentStatus({ instrument }),
    ]);
    cy.intercept("GET", "**/labRequest/running", [labRequest]).as(
      "labRequests"
    );
    cy.visit("/");
    cy.wait("@labRequests");

    cy.getByTestId("in-process-card")
      .contains(
        `${labRequest.patientDto.patientName} ${labRequest.patientDto.clientDto.lastName}`
      )
      .then((patientName) => {
        const offsetWidth = patientName[0].offsetWidth;
        const scrollWidth = patientName[0].scrollWidth;
        expect(offsetWidth).to.be.lessThan(scrollWidth);
      });
  });

  describe("run actions", () => {
    it("allows user to perform actions on in process runs", () => {
      const instrument = randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      });
      const labRequest: RunningLabRequestDto = randomRunningLabRequest({
        instrumentRunDtos: [
          randomRunningInstrumentRun({
            instrumentId: instrument.id,
            instrumentType: instrument.instrumentType,
            status: InstrumentRunStatus.At_Instrument,
          }),
        ],
      });

      cy.intercept("**/api/labRequest/*/workRequestStatus", {
        [labRequest.instrumentRunDtos[0].id]: {
          runStartable: true,
          runCancelable: false,
        },
      });
      cy.intercept("GET", "**/api/device/status", [
        randomInstrumentStatus({
          instrument,
          instrumentStatus: InstrumentStatus.Busy,
          connected: true,
        }),
      ]);
      cy.intercept("GET", "**/api/instruments/*/status", {
        detail: "WAITING_FOR_SAMPLE",
      });
      cy.intercept("GET", "**/api/labRequest/running", [labRequest]).as(
        "labRequests"
      );
      cy.intercept("POST", "**/api/instrumentRun/*/execute", {}).as("startRun");
      cy.intercept("POST", "**/api/instrumentRun/*/cancel", {}).as("cancelRun");
      cy.intercept(
        { pathname: "**/api/sediVue/*/procedure/execute", method: "POST" },
        {}
      ).as("executeProcedure");
      cy.visit("/");
      cy.wait("@labRequests");

      cy.getByTestId("in-process-card")
        .first()
        .getByTestId("in-process-run")
        .first()
        .as("inProcessRun")
        .click();

      cy.getByTestId("run-action-popover")
        .should("be.visible")
        .contains("Start Run")
        .click();

      cy.wait("@startRun")
        .its("request.url")
        .should(
          "contain",
          `instrumentRun/${labRequest.instrumentRunDtos[0].id}/execute`
        );

      cy.get("@inProcessRun").click();
      cy.getByTestId("run-action-popover")
        .should("be.visible")
        .contains("Cancel Run")
        .click();

      cy.getByTestId("confirm-modal").getByTestId("done-button").click();

      cy.wait("@cancelRun")
        .its("request.url")
        .should(
          "contain",
          `instrumentRun/${labRequest.instrumentRunDtos[0].id}/cancel`
        );

      cy.get("@inProcessRun").click();
      cy.getByTestId("run-action-popover")
        .should("be.visible")
        .contains("Eject Cartridge")
        .click();

      cy.wait("@executeProcedure")
        .its("request.url")
        .should(
          "contain",
          `sediVue/${instrument.id}/procedure/execute?instrumentMaintenanceProcedure=${MaintenanceProcedure.DROP_CUVETTE}`
        );
    });

    it("shows sample type and dilution info in popover", () => {
      const instrument = randomInstrumentDto({
        instrumentType: InstrumentType.SediVueDx,
      });
      const labRequest: RunningLabRequestDto = randomRunningLabRequest({
        instrumentRunDtos: [
          randomRunningInstrumentRun({
            instrumentId: instrument.id,
            dilution: 4,
            sampleType: SampleTypeEnum.URINE,
            instrumentType: instrument.instrumentType,
            status: InstrumentRunStatus.At_Instrument,
          }),
        ],
      });

      cy.intercept("**/api/labRequest/*/workRequestStatus", {
        [labRequest.instrumentRunDtos[0].id]: {
          runStartable: true,
          runCancelable: false,
        },
      });
      cy.intercept("GET", "**/api/device/status", [
        randomInstrumentStatus({
          instrument,
          instrumentStatus: InstrumentStatus.Busy,
          connected: true,
        }),
      ]);
      cy.intercept("GET", "**/api/labRequest/running", [labRequest]).as(
        "labRequests"
      );
      cy.visit("/");
      cy.wait("@labRequests");

      cy.getByTestId("in-process-card")
        .first()
        .getByTestId("in-process-run")
        .first()
        .as("inProcessRun")
        .click();

      cy.getByTestId("run-action-popover")
        .should("be.visible")
        .should("contain.text", "Urine")
        .should("contain.text", "Dilution - 1:4");
    });
  });
});

describe("snap runs", () => {
  const instrument = randomInstrumentDto({
    instrumentType: InstrumentType.SNAP,
  });
  const run: RunningInstrumentRunDto = randomRunningInstrumentRun({
    instrumentId: instrument.id,
    instrumentType: InstrumentType.SNAP,
    status: InstrumentRunStatus.Awaiting_Manual_Entry,
    progress: undefined,
    timeRemaining: undefined,
    snapDeviceDto: {
      snapDeviceId: 1,
      displayNamePropertyKey: "Instrument.Snap.Canine.4DxPlus",
      snapDeviceTestTime: 60,
    },
  });

  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/labRequest/*/workRequestStatus", {
      [run.id]: {
        runStartable: true,
        runCancelable: false,
      },
    });
    cy.intercept("GET", "**/api/device/status", [
      randomInstrumentStatus({
        instrument,
        instrumentStatus: InstrumentStatus.Ready,
        connected: true,
      }),
    ]);

    cy.intercept(
      {
        pathname: "**/api/settings",
        method: "GET",
        query: { setting: SettingTypeEnum.SNAP_ENABLETIMER },
      },
      {
        [SettingTypeEnum.SNAP_ENABLETIMER]: "true",
      }
    );
    cy.intercept("**/api/instrumentRun/*/startSnapTimer", "").as("startTimer");
    cy.intercept("**/api/instrumentRun/*/resetSnapTimer", "").as("resetTimer");
  });

  it("enables SNAP timer run action and timer countdown functionality when the setting is enabled", () => {
    cy.intercept("**/api/labRequest/running", [
      randomRunningLabRequest({
        instrumentRunDtos: [run],
      }),
    ]);

    cy.visit("/");

    // Verify countdown timer matches total test time for the SNAP device
    cy.getByTestId("in-process-run")
      .as("snapRun")
      .should("contain.text", "4Dx Plus")
      .should("contain.text", "01:00");

    cy.get("@snapRun").click();

    cy.getByTestId("run-action-popover")
      .should("be.visible")
      .contains("Start Timer")
      .click();

    cy.get("@startTimer")
      .its("request.url")
      .should("contain", `api/instrumentRun/${run.id}/startSnapTimer`);

    cy.get("@snapRun").click();

    cy.getByTestId("run-action-popover").contains("Add Results").click();
    cy.getByTestId("manual-entry-slideout").as("slideout").should("be.visible");
    cy.getByTestId("snap-results-reset-timer").should("be.disabled");
  });

  it("shows SNAP result entry when run is clicked if SNAP timer is counting down", () => {
    cy.intercept("**/api/labRequest/running", [
      randomRunningLabRequest({
        instrumentRunDtos: [
          {
            ...run,
            status: InstrumentRunStatus.Running,
            timeRemaining: 30000,
          },
        ],
      }),
    ]);

    cy.visit("/");

    // Verify countdown timer matches total test time for the SNAP device
    cy.getByTestId("in-process-run")
      .as("snapRun")
      .should("contain.text", "4Dx Plus")
      .should("contain.text", "0:30");

    cy.get("@snapRun").click();

    cy.getByTestId("manual-entry-slideout").as("slideout").should("be.visible");

    cy.getByTestId("snap-results-reset-timer").should("be.enabled").click();

    cy.get("@resetTimer")
      .its("request.url")
      .should("contain", `api/instrumentRun/${run.id}/resetSnapTimer`);
  });

  it("does not show SNAP timer run action or timer countdown when the setting is disabled", () => {
    cy.intercept(
      {
        pathname: "**/api/settings",
        query: { setting: SettingTypeEnum.SNAP_ENABLETIMER },
        method: "GET",
      },
      {
        [SettingTypeEnum.SNAP_ENABLETIMER]: "false",
      }
    ).as("snapSettings");

    cy.intercept("**/api/labRequest/running", [
      randomRunningLabRequest({
        instrumentRunDtos: [run],
      }),
    ]);

    cy.visit("/");

    // Clicking in process run before settings has resolved will not perform any actions
    cy.wait("@snapSettings");

    // Verify countdown timer matches total test time for the SNAP device
    cy.getByTestId("in-process-run")
      .as("snapRun")
      .should("contain.text", "4Dx Plus")
      .should("not.contain.text", "01:00");

    cy.get("@snapRun").click();

    cy.getByTestId("manual-entry-slideout").as("slideout").should("be.visible");

    cy.getByTestId("snap-results-reset-timer").should("not.exist");
  });
});

describe("snap pro runs", () => {
  const instrument = randomInstrumentDto({
    instrumentType: InstrumentType.SNAPPro,
  });
  const run: RunningInstrumentRunDto = randomRunningInstrumentRun({
    instrumentId: instrument.id,
    instrumentType: InstrumentType.SNAPPro,
    status: InstrumentRunStatus.At_Instrument,
    progress: undefined,
    timeRemaining: undefined,
  });

  beforeEach(() => {
    interceptRequestsForHomeScreen();
    cy.intercept("**/api/labRequest/*/workRequestStatus", {
      [run.id]: {
        runStartable: true,
        runCancelable: true,
      },
    });
    cy.intercept("GET", "**/api/device/status", [
      randomInstrumentStatus({
        instrument,
        instrumentStatus: InstrumentStatus.Ready,
        connected: true,
      }),
    ]);
    cy.intercept(
      { pathname: "**/api/snapDevice/species/*/devices", method: "GET" },
      [
        {
          snapDeviceId: 1,
          displayNamePropertyKey: "Instrument.Snap.Canine.4Dx",
          snapResultTypes: [],
          settingType: SettingTypeEnum.SNAP_CANINE4DX,
        },
      ]
    );
  });

  it("allows user to manually enter results when work request is 'startable'", () => {
    cy.intercept("**/api/labRequest/running", [
      randomRunningLabRequest({
        instrumentRunDtos: [run],
      }),
    ]);

    cy.visit("/");

    // Click the in process run
    cy.getByTestId("in-process-run").click();

    // Click "add results" from the run actions list
    cy.getByTestId("run-action-popover").contains("Add Results").click();

    // Find the select snap modal
    cy.getByTestId("select-snap-device-modal")
      .as("selectModal")
      .should("be.visible");

    // Next button is disabled until a SNAP device is selected
    cy.get("@selectModal")
      .getByTestId("done-button")
      .as("nextButton")
      .should("be.disabled");

    // Select a SNAP device
    cy.getByTestId("select-snap-device-dropdown")
      .should("be.visible")
      .select(1);

    // Click next
    cy.get("@nextButton").should("be.enabled").click();

    // Results entry is visible
    cy.getByTestId("manual-entry-slideout").should("be.visible");
  });
});
