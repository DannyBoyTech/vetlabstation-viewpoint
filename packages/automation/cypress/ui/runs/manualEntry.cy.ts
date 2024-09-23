import {
  AdditionalAssays,
  ChemistryResult,
  ChemistryTypes,
  Clarity,
  CollectionMethod,
  Color,
  InstrumentRunDto,
  InstrumentRunStatus,
  InstrumentStatus,
  InstrumentType,
  ManualEntryTypeEnum,
  ManualUAResults,
  PHValues,
  RunningLabRequestDto,
  ServiceCategory,
  SnapResultTypeEnum,
} from "@viewpoint/api";
import { interceptRequestsForHomeScreen } from "../../util/default-intercepts";
import {
  randomInstrumentDto,
  randomInstrumentStatus,
  randomLabRequest,
  randomRunningInstrumentRun,
  randomRunningLabRequest,
} from "@viewpoint/test-utils";

beforeEach(() => {
  interceptRequestsForHomeScreen();
});

describe("manual UA entry", () => {
  // Intercept instrument statuses (required for in process runs to show up)
  const INSTRUMENTS = [
    randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ManualUA,
      }),
    }),
    randomInstrumentStatus({
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
      }),
    }),
  ];

  // Intercept in process runs to return an mUA run
  const IN_PROCESS: RunningLabRequestDto[] = [
    randomRunningLabRequest({
      id: 100,
      instrumentRunDtos: [
        randomRunningInstrumentRun({
          id: 200,
          instrumentType: InstrumentType.ManualUA,
          instrumentId: INSTRUMENTS[0].instrument.id,
          serviceCategory: ServiceCategory.Urinalysis,
          status: InstrumentRunStatus.Awaiting_Manual_Entry,
          timeRemaining: undefined,
          progress: undefined,
          editable: true,
        }),
        randomRunningInstrumentRun({
          instrumentType: InstrumentType.CatalystOne,
          instrumentId: INSTRUMENTS[1].instrument.id,
          serviceCategory: ServiceCategory.Chemistry,
          status: InstrumentRunStatus.At_Instrument,
        }),
      ],
    }),
  ];

  beforeEach(() => {
    cy.intercept("GET", "**/api/manualAssays/*", [
      ...Object.values(AdditionalAssays),
      ...Object.values(ChemistryTypes),
    ]);

    cy.intercept("GET", "**/api/pims/pending", []);

    cy.intercept("GET", "**/api/device/status", INSTRUMENTS);

    cy.intercept("GET", "**/api/labRequest/running", IN_PROCESS).as(
      "in-process"
    );

    // Default to run in process, not complete
    cy.intercept("GET", "**/api/labRequest/100?", {
      ...IN_PROCESS[0],
      instrumentRunDtos: [],
    });

    // Intercept work request status to allow context actions for the run
    cy.intercept(
      "GET",
      "**/api/labRequest/*/workRequestStatus",
      IN_PROCESS[0].instrumentRunDtos.reduce((previousValue, currentValue) => ({
        ...previousValue,
        [currentValue.id]: { runStartable: true, runCancellable: true },
      }))
    ).as("work-request-status");

    cy.intercept("POST", "**/api/instrumentRun/*/cancel", {}).as("cancel-run");

    cy.visit("/");
    cy.wait("@work-request-status");
  });

  it("should show cancel modal when close button is clicked", () => {
    cy.getByTestId("status-pill").contains("Add Results").click();

    cy.contains("Close").click();
    cy.getByTestId("manual-entry-close-confirm-modal");
    cy.getByTestId("manual-entry-close-confirm-modal")
      .containedWithinTestId(
        "manual-entry-close-confirm-modal",
        "Are you sure you want to exit without saving?"
      )
      .containedWithinTestId("manual-entry-close-confirm-modal", "Close")
      .containedWithinTestId(
        "manual-entry-close-confirm-modal",
        "Discard Changes"
      )
      .containedWithinTestId("manual-entry-close-confirm-modal", "Discard");
    cy.getByTestId("manual-entry-close-confirm-modal")
      .find('[data-testid="done-button"]')
      .click();
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
    cy.getByTestId("manual-entry-slideout").should("not.exist");
  });

  it("shows cancel modal when cancel modal when cancel run button is clicked", () => {
    cy.getByTestId("status-pill").contains("Add Results").click();

    cy.getByTestId("manual-entry-slideout")
      .contains("Cancel Run")
      .should("be.visible")
      .click();

    cy.getByTestId("manual-entry-cancel-run-confirm-modal");
    cy.getByTestId("manual-entry-cancel-run-confirm-modal")
      .containedWithinTestId(
        "manual-entry-cancel-run-confirm-modal",
        "Are you sure you want to cancel this run?"
      )
      .containedWithinTestId(
        "manual-entry-cancel-run-confirm-modal",
        "Cancel Manual UA Run?"
      )
      .containedWithinTestId("manual-entry-cancel-run-confirm-modal", "No")
      .containedWithinTestId("manual-entry-cancel-run-confirm-modal", "Yes");
    cy.getByTestId("manual-entry-cancel-run-confirm-modal")
      .find('[data-testid="done-button"]')
      .click();

    cy.wait("@cancel-run");
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
    cy.getByTestId("manual-entry-slideout").should("not.exist");
  });

  it("omits chemistries not returned in the getManualAssays request", () => {
    // Remove LEU and PRO
    cy.intercept("GET", "**/api/manualAssays/*", [
      ...Object.values(AdditionalAssays),
      ...Object.values(ChemistryTypes).filter(
        (chem) => chem !== ChemistryTypes.LEU && chem !== ChemistryTypes.PRO
      ),
    ]);

    cy.getByTestId("status-pill").contains("Add Results").click();
    cy.getByTestId("manual-entry-slideout").should("be.visible");

    // Go to chemistries page
    cy.getByTestId("mua-results-next").click();

    for (const chemistry of Object.values(ChemistryTypes)) {
      const testId = `mua-chemistry-${chemistry}`;

      cy.getByTestId(testId).should(
        chemistry === ChemistryTypes.LEU || chemistry == ChemistryTypes.PRO
          ? "not.exist"
          : "be.visible"
      );
    }
  });

  it("can be used to manually enter manual UA results", () => {
    cy.intercept("GET", "**/api/labRequest/100?", IN_PROCESS[0]); // Return run as complete

    cy.getByTestId("status-pill").contains("Add Results").click();

    cy.getByTestId("manual-entry-slideout").should("be.visible");

    // verify 3 total pages
    cy.getByTestId("mua-page-marker").should("have.length", 3);

    const enteredResults = {
      [AdditionalAssays.CollectionMethod]: CollectionMethod.Catheterization,
      [AdditionalAssays.Color]: Color.PaleYellow,
      [AdditionalAssays.Clarity]: Clarity.SlightlyCloudy,
      [AdditionalAssays.SpecificGravity]: 42, // Translates to 1.042
      [AdditionalAssays.PH]: PHValues["7"],
      chemistries: {
        [ChemistryTypes.BLD]: ChemistryResult.PlusTwo,
        [ChemistryTypes.BIL]: ChemistryResult.Negative,
        [ChemistryTypes.UBG]: ChemistryResult.Normal,
        [ChemistryTypes.KET]: ChemistryResult.PlusTwo,
        [ChemistryTypes.GLU]: ChemistryResult.PlusFour,
        [ChemistryTypes.PRO]: ChemistryResult.Trace,
        [ChemistryTypes.LEU]: ChemistryResult.Negative,
      },
      comment: "This is a test comment",
    };

    // Go to the beginning
    cy.getByTestId("mua-results-back").click();
    cy.getByTestId("mua-results-back").click();

    const physicalHeader = "mua-physical-dropdown-header";
    const physicalOption = "mua-physical-dropdown-option";

    cy.getByTestId(
      `${physicalHeader}-${AdditionalAssays.CollectionMethod}`
    ).click();
    cy.getByTestId(
      `${physicalOption}-${enteredResults[AdditionalAssays.CollectionMethod]}`
    ).click();

    cy.getByTestId(`${physicalHeader}-${AdditionalAssays.Color}`).click();
    cy.getByTestId(
      `${physicalOption}-${enteredResults[AdditionalAssays.Color]}`
    ).click();

    cy.getByTestId(`${physicalHeader}-${AdditionalAssays.Clarity}`).click();
    cy.getByTestId(
      `${physicalOption}-${enteredResults[AdditionalAssays.Clarity]}`
    ).click();

    cy.getByTestId("mua-physical-sg-input").type(
      `${enteredResults[AdditionalAssays.SpecificGravity]}`
    );

    cy.getByTestId(
      `mua-physical-dropdown-option-${enteredResults[AdditionalAssays.PH]}`
    )
      .as(AdditionalAssays.PH)
      .should("have.css", "outline", "rgb(169, 170, 170) solid 1px")
      .click();

    cy.get(`@${AdditionalAssays.PH}`).should(
      "have.css",
      "outline",
      "rgb(9, 105, 217) solid 3px"
    );

    cy.getByTestId("mua-results-next").click();

    for (const chemistry of Object.keys(enteredResults.chemistries)) {
      const testId = `mua-chemistry-${chemistry}-${enteredResults.chemistries[chemistry]}`;
      cy.getByTestId(testId)
        .as(testId)
        .should("have.css", "outline", "rgb(169, 170, 170) solid 1px")
        .click();
      cy.get(`@${testId}`).should(
        "have.css",
        "outline",
        "rgb(9, 105, 217) solid 3px"
      );
    }

    cy.getByTestId("mua-results-next").click();

    cy.getByTestId("mua-result-summary-comments").type(enteredResults.comment);

    cy.intercept("PUT", "**/instrumentRun/200/results/mua").as("submitResults");
    cy.getByTestId("mua-results-next").click(); // Submit results

    const expectedResults: ManualUAResults = {
      collectionMethod: enteredResults[AdditionalAssays.CollectionMethod],
      color: enteredResults[AdditionalAssays.Color],
      clarity: enteredResults[AdditionalAssays.Clarity],
      specificGravity: parseFloat(
        `1.0${enteredResults[AdditionalAssays.SpecificGravity]}`
      ),
      sgGreaterThan: false,
      ph: enteredResults[AdditionalAssays.PH],
      comment: enteredResults.comment,
      chemistries: { ...enteredResults.chemistries },
    };

    cy.wait("@submitResults")
      .its("request.body")
      .should("deep.eq", expectedResults);
  });

  it("removes chemistries screen if run is marked as UA_USG_ONLY", () => {
    const instruments = [
      randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.ManualUA,
        }),
      }),
      randomInstrumentStatus({
        instrument: randomInstrumentDto({
          instrumentType: InstrumentType.UAAnalyzer,
        }),
      }),
    ];
    const run = randomRunningInstrumentRun({
      id: 100,
      instrumentId: instruments[0].instrument.id,
      instrumentType: InstrumentType.ManualUA,
      serviceCategory: ServiceCategory.Urinalysis,
      status: InstrumentRunStatus.Awaiting_Manual_Entry,
      timeRemaining: undefined,
      progress: undefined,
      editable: true,
      manualEntryType: ManualEntryTypeEnum.ONLY,
    });

    const uaRun = randomRunningInstrumentRun({
      id: 101,
      instrumentId: instruments[1].instrument.id,
      instrumentType: InstrumentType.UAAnalyzer,
    });

    const inProcess: RunningLabRequestDto[] = [
      randomRunningLabRequest({
        id: 100,
        instrumentRunDtos: [run, uaRun],
      }),
    ];

    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [run as InstrumentRunDto, uaRun as InstrumentRunDto],
    });

    cy.intercept("GET", "**/api/device/status", instruments);
    cy.intercept("GET", "**/labRequest/running", inProcess).as("in-process");
    cy.intercept("GET", "**/labstation-webapp/api/labRequest/100?", {
      ...labRequest,
      instrumentRunDtos: [],
    });
    cy.intercept(
      "GET",
      "**/api/labRequest/*/workRequestStatus",
      labRequest.instrumentRunDtos.reduce((previousValue, currentValue) => ({
        ...previousValue,
        [currentValue.id]: { runStartable: true, runCancellable: true },
      }))
    ).as("work-request-status");

    cy.visit("/");
    cy.wait("@in-process");

    cy.getByTestId("status-pill").contains("Add Results").click();

    cy.getByTestId("manual-entry-slideout").should("be.visible");

    // There should only be 2 total page markers
    cy.getByTestId("mua-page-marker").should("have.length", 2);

    // Click next and we should be on the summary screen
    cy.getByTestId("mua-results-next").click();
    cy.contains("Comments");
  });

  it("should display floating num pad when specific gravity input field is clicked into ", () => {
    const muaInstrument = randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Ready,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.ManualUA,
      }),
    });
    const labRequest = randomRunningLabRequest({
      instrumentRunDtos: [
        randomRunningInstrumentRun({
          instrumentId: muaInstrument.instrument.id,
          status: InstrumentRunStatus.Awaiting_Manual_Entry,
          instrumentType: InstrumentType.ManualUA,
        }),
      ],
    });
    cy.intercept("GET", "**/api/labRequest/*/workRequestStatus", {
      [labRequest.instrumentRunDtos[0].id]: {
        runStartable: true,
        runCancellable: true,
      },
    }).as("work-request-status");
    cy.intercept("GET", "**/api/device/status", [muaInstrument]);
    cy.intercept("GET", "**/labRequest/running", [labRequest]).as(
      "running-labrequests"
    );
    cy.visit("/");
    cy.wait("@running-labrequests");
    cy.getByTestId("in-process-run").contains("Manual UA").click();
    cy.getByTestId("mua-physical-sg-input").click();
    cy.getByTestId("mua-physical-sg-numpad").should("be.visible");
  });
});

describe("manual SNAP entry", () => {
  it("can be used to enter SNAP results from an in process run", () => {
    const snapInstrument = randomInstrumentStatus({
      instrument: randomInstrumentDto({ instrumentType: InstrumentType.SNAP }),
      instrumentStatus: InstrumentStatus.Ready,
    });

    const snapRun = randomRunningInstrumentRun({
      instrumentType: InstrumentType.SNAP,
      instrumentId: snapInstrument.instrument.id,
      serviceCategory: ServiceCategory.SNAP,
      status: InstrumentRunStatus.Running,
      snapDeviceDto: {
        snapDeviceId: 19,
        displayNamePropertyKey: "Instrument.Snap.Canine.Lepto",
      },
      timeRemaining: 30000,
      progress: undefined,
      editable: true,
    });

    const inProcess: RunningLabRequestDto[] = [
      randomRunningLabRequest({
        id: 100,
        instrumentRunDtos: [snapRun],
      }),
    ];
    cy.intercept("GET", "**/pims/pending", []);
    cy.intercept("GET", "**/device/status", [snapInstrument]);
    cy.intercept("GET", "**/labRequest/running", inProcess).as("in-process");
    cy.intercept("GET", "**/api/labRequest/*/workRequestStatus", [
      {
        [snapRun.id]: {
          runStartable: true,
          runCancellable: true,
        },
      },
    ]).as("work-request-status");

    cy.intercept(`**/api/instrumentRun/${snapRun.id}/results/snap`, {}).as(
      "saveSnapResults"
    );

    cy.visit("/");
    cy.wait("@in-process");

    cy.getByTestId("in-process-run").click();

    cy.getByTestId("manual-entry-slideout").should("be.visible");

    cy.getByTestId("snap-results-entry-test-name").should("have.text", "Lepto");

    cy.getByTestId("snap-dot-label-Lepto")
      .as("label")
      .should("contain.text", "Negative");
    cy.getByTestId("snap-selectable-dot-Lepto").click();
    cy.get("@label").should("contain.text", "Positive");
    cy.getByTestId("snap-results-entry-save-button").click();

    cy.wait("@saveSnapResults")
      .its("request.body.snapResultType")
      .should("eq", SnapResultTypeEnum.CANINE_LEPTO_POSITIVE);
  });
});
