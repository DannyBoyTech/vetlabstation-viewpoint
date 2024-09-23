import {
  interceptRequestsForHomeScreen,
  interceptRequestsForSelectInstruments,
  SelectInstrumentsData,
} from "../../util/default-intercepts";
import {
  randomInstrumentDto,
  randomInstrumentResult,
  randomInstrumentRun,
  randomInstrumentStatus,
  randomLabRequest,
  randomTestOrders,
} from "@viewpoint/test-utils";
import {
  ExecuteLabRequestDto,
  InstrumentStatus,
  InstrumentType,
  LabRequestRunType,
  RunConfiguration,
  SampleTypeEnum,
  ServiceCategory,
  SupportedRunTypeValidationError,
  TheiaBloodWorkflow,
} from "@viewpoint/api";
import dayjs from "dayjs";

describe("Theia runs", () => {
  let interceptData: SelectInstrumentsData = {} as SelectInstrumentsData;
  const theiaInstrument = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.Theia,
      manualEntry: false,
      runnable: true,
      supportedRunConfigurations: [RunConfiguration.SAMPLE_TYPE],
    }),
  });
  const proCyteOneInstrument = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.ProCyteOne,
      supportedRunConfigurations: [],
    }),
  });
  const proCyteDxInstrument = randomInstrumentStatus({
    instrumentStatus: InstrumentStatus.Ready,
    connected: true,
    instrument: randomInstrumentDto({
      instrumentType: InstrumentType.ProCyteDx,
      supportedRunConfigurations: [RunConfiguration.SAMPLE_TYPE],
    }),
  });
  beforeEach(() => {
    interceptData = interceptRequestsForSelectInstruments({
      instruments: [theiaInstrument, proCyteOneInstrument, proCyteDxInstrument],
      defaultRunConfigs: {}, // invue returns empty currently
    });
    interceptRequestsForHomeScreen();
  });

  it("shows warning text about inVue when IVLS determines add test is not supported due to inVue inclusion", () => {
    const originalLabRequest = randomLabRequest({
      instrumentRunDtos: [
        randomInstrumentRun({
          instrumentId: theiaInstrument.instrument.id,
          instrumentType: InstrumentType.Theia,
        }),
      ],
    });

    cy.intercept(
      { pathname: `**/api/labRequest/${originalLabRequest.id}` },
      originalLabRequest
    );
    cy.intercept("**/labRequestRecords", [
      { labRequestId: originalLabRequest.id, deviceUsageMap: {} },
    ]);

    cy.intercept(
      {
        pathname: `**/api/labRequest/${originalLabRequest.id}/addTest/validate`,
      },
      interceptData.addTestCheck.map((check) =>
        check.runType === LabRequestRunType.MERGE
          ? {
              ...check,
              supported: false,
              reasons: [SupportedRunTypeValidationError.MERGE_THEIA],
            }
          : check
      )
    );

    cy.visit(`/labRequest/build?originalLabRequestId=${originalLabRequest.id}`);

    // Verify merge is valid
    cy.getByTestId(
      `selectable-analyzer-${theiaInstrument.instrument.instrumentSerialNumber}`
    )
      .as("theiaInstrument")
      .click();
    cy.get("@theiaInstrument")
      .findByTestId("sample-type-select")
      .select("Ear Swab");
    cy.getByTestId("addTest-button").click();
    cy.getByTestId("merge-button").should("not.exist");
    cy.contains(
      "Note: Merge/Replace is not an option for this run because it includes IDEXX inVue Dx."
    ).should("be.visible");
  });

  describe("blood morphology workflow", () => {
    // Return a few results to match against
    const matchingLrOne = randomLabRequest({
      patientDto: interceptData.patient,
      instrumentRunDtos: [
        randomInstrumentRun({
          testDateUtc: dayjs().subtract(1, "hour").unix(),
          instrumentType: InstrumentType.ProCyteDx,
        }),
      ],
    });
    const matchingLrTwo = randomLabRequest({
      patientDto: interceptData.patient,
      instrumentRunDtos: [
        randomInstrumentRun({
          testDateUtc: dayjs().subtract(2, "hour").unix(),
          instrumentType: InstrumentType.ProCyteOne,
        }),
      ],
    });

    beforeEach(() => {
      const matchSuggestions = [matchingLrOne, matchingLrTwo].map((lr) => ({
        labRequestId: lr.id,
        instrumentRunId: lr.instrumentRunDtos[0].id,
        patientDto: lr.patientDto,
        instrumentType: lr.instrumentRunDtos[0].instrumentType,
        doctorDto: lr.doctorDto,
        testDateUtc: lr.instrumentRunDtos[0].testDateUtc,
      }));
      cy.intercept(
        { pathname: "**/theia/patient/*/matchSuggestions", method: "GET" },
        matchSuggestions
      );
      cy.intercept(
        { pathname: `**/api/labRequest/${matchingLrOne.id}`, method: "GET" },
        matchingLrOne
      );
      cy.intercept(
        { pathname: `**/api/labRequest/${matchingLrTwo.id}`, method: "GET" },
        matchingLrTwo
      );

      cy.visit(`/labRequest/build?patientId=${interceptData.patient.id}`);
      cy.getByTestId(
        `selectable-analyzer-${interceptData.instruments[0].instrument.instrumentSerialNumber}`
      ).as("theia-instrument");
    });

    it("prompts user to configure hematology run and skip configuration", () => {
      // Add instrument to request
      cy.get("@theia-instrument").click();
      // Choose blood
      cy.get("@theia-instrument").within(() =>
        cy.getByTestId("sample-type-select").select("Blood")
      );
      // Wait for the workflow modal
      cy.getByTestId("confirm-modal")
        .contains("Hematology and IDEXX inVue Dx")
        .should("be.visible");
      // Click skip to run plain run
      cy.getByTestId("confirm-modal")
        .getByTestId("done-button")
        .contains("Skip")
        .click();
      // Verify that run executed as STANDALONE
      cy.intercept(
        {
          pathname: `**/labstation-webapp/api/labRequest`,
          method: "POST",
        },
        (req) => {
          const executeLabRequest = req.body as ExecuteLabRequestDto;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].bloodRunConfigurationDto.workflow
          ).to.equal(TheiaBloodWorkflow.STANDALONE);
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].earSwabRunConfiguration
          ).to.be.undefined;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].fnaRunConfigurationDto
          ).to.be.undefined;
        }
      ).as("executeLabRequest");
      // Run and wait for request
      cy.getByTestId("run-button").should("be.enabled").click();
      // Wait for lab request submitted
      cy.wait("@executeLabRequest");
    });

    it("prompts user to configure hematology run and add hematology instrument", () => {
      // Add instrument to request
      cy.get("@theia-instrument").click();
      // Choose blood
      cy.get("@theia-instrument").within(() =>
        cy.getByTestId("sample-type-select").select("Blood")
      );
      // Wait for the workflow modal
      cy.getByTestId("confirm-modal")
        .contains("Hematology and IDEXX inVue Dx")
        .should("be.visible");
      // Click select
      cy.getByTestId("select-hematology-instruments")
        .contains("Select")
        .click();
      // Wait for the select hematology instruments modal
      cy.getByTestId("confirm-modal")
        .contains("Run with ProCyte")
        .should("be.visible");
      // Select 1st available analyzer
      cy.getByTestId("confirm-modal")
        .getByTestId(
          `hematology-instrument-${interceptData.instruments[1].instrument.instrumentSerialNumber}`
        )
        .click();
      // Click next
      cy.getByTestId("confirm-modal")
        .getByTestId("done-button")
        .contains("Next")
        .click();
      // Verify that run executed as TOGETHER
      cy.intercept(
        {
          pathname: `**/labstation-webapp/api/labRequest`,
          method: "POST",
        },
        (req) => {
          const executeLabRequest = req.body as ExecuteLabRequestDto;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].bloodRunConfigurationDto.workflow
          ).to.equal(TheiaBloodWorkflow.TOGETHER);
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].bloodRunConfigurationDto
              .hematologyInstrumentId
          ).to.equal(interceptData.instruments[1].instrument.id);
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].earSwabRunConfiguration
          ).to.be.undefined;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].fnaRunConfigurationDto
          ).to.be.undefined;
        }
      ).as("executeLabRequest");
      // Run and wait for request
      cy.getByTestId("run-button").should("be.enabled").click();
      // Wait for lab request submitted
      cy.wait("@executeLabRequest");
    });

    it("prompts user to configure hematology run and choose suggestion", () => {
      // Add instrument to request
      cy.get("@theia-instrument").click();
      // Choose blood
      cy.get("@theia-instrument").within(() =>
        cy.getByTestId("sample-type-select").select("Blood")
      );
      // Wait for the workflow modal
      cy.getByTestId("confirm-modal")
        .contains("Hematology and IDEXX inVue Dx")
        .should("be.visible");
      // Click select
      cy.getByTestId("import-previous-results").contains("Select").click();
      // Wait for the select hematology runs modal
      cy.getByTestId("confirm-modal")
        .contains("Import previous hematology results")
        .should("be.visible");
      // Select 1st available historical result
      cy.getByTestId("confirm-modal")
        .getByTestId(`previous-result-${matchingLrOne.id}`)
        .click();
      // Click save
      cy.getByTestId("confirm-modal")
        .getByTestId("done-button")
        .contains("Save")
        .click();
      // Verify that run executed as APPEND
      cy.intercept(
        {
          pathname: `**/labstation-webapp/api/labRequest`,
          method: "POST",
        },
        (req) => {
          const executeLabRequest = req.body as ExecuteLabRequestDto;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].bloodRunConfigurationDto.workflow
          ).to.equal(TheiaBloodWorkflow.APPEND);
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].bloodRunConfigurationDto
              .hematologyRunId
          ).to.equal(matchingLrOne.id);
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].earSwabRunConfiguration
          ).to.be.undefined;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].fnaRunConfigurationDto
          ).to.be.undefined;
        }
      ).as("executeLabRequest");
      // Run and wait for request
      cy.getByTestId("run-button").should("be.enabled").click();
      // Wait for lab request submitted
      cy.wait("@executeLabRequest");
    });

    it("prompts user to configure hematology run and enter cbc values", () => {
      // Add instrument to request
      cy.get("@theia-instrument").click();
      // Choose blood
      cy.get("@theia-instrument").within(() =>
        cy.getByTestId("sample-type-select").select("Blood")
      );
      // Wait for the workflow modal
      cy.getByTestId("confirm-modal")
        .contains("Hematology and IDEXX inVue Dx")
        .should("be.visible");
      // Click select
      cy.getByTestId("enter-cbc-values").contains("Select").click();
      // Wait for the enter cbc modal
      cy.getByTestId("confirm-modal")
        .contains("Enter CBC values")
        .should("be.visible");
      // Enter RBC value
      cy.getByTestId("confirm-modal")
        .getByTestId("enter-rbc-value")
        .type("11.11");
      // Click save
      cy.getByTestId("confirm-modal")
        .getByTestId("done-button")
        .contains("Save")
        .click();
      // Verify that run executed as MANUAL
      cy.intercept(
        {
          pathname: `**/labstation-webapp/api/labRequest`,
          method: "POST",
        },
        (req) => {
          const executeLabRequest = req.body as ExecuteLabRequestDto;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].bloodRunConfigurationDto.workflow
          ).to.equal(TheiaBloodWorkflow.MANUAL);
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].bloodRunConfigurationDto.rbcValue
          ).to.equal(11.11);
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].earSwabRunConfiguration
          ).to.be.undefined;
          expect(
            executeLabRequest.instrumentRunDtos[0]
              .instrumentRunConfigurations[0].fnaRunConfigurationDto
          ).to.be.undefined;
        }
      ).as("executeLabRequest");
      // Run and wait for request
      cy.getByTestId("run-button").should("be.enabled").click();
      // Wait for lab request submitted
      cy.wait("@executeLabRequest");
    });
  });

  describe("ear swab workflow", () => {
    beforeEach(() => {
      cy.visit(`/labRequest/build?patientId=${interceptData.patient.id}`);
      cy.getByTestId(
        `selectable-analyzer-${interceptData.instruments[0].instrument.instrumentSerialNumber}`
      ).as("theia-instrument");
    });

    it("user can click the run button without selecting optional checkbox", () => {
      // Add instrument to request
      cy.get("@theia-instrument").click();
      // Choose ear swab
      cy.get("@theia-instrument").within(() =>
        cy.getByTestId("sample-type-select").select("Ear Swab")
      );
      // click Run button
      cy.getByTestId("run-button").should("be.enabled").click();
    });

    it("user can click the run button after selecting optional checkbox", () => {
      // Add instrument to request
      cy.get("@theia-instrument").click();
      // Choose ear swab
      cy.get("@theia-instrument").within(() =>
        cy.getByTestId("sample-type-select").select("Ear Swab")
      );
      // click optional clinical signs checkbox
      cy.getByTestId("optional-clinical-signs-checkbox").check({ force: true });
      // click Run button
      cy.getByTestId("run-button").should("be.enabled").click();
    });
  });

  describe("display results for theia", () => {
    it("displays results for a given lab request", () => {
      const thiaRun = randomInstrumentRun({
        serviceCategory: ServiceCategory.Pathology,
        instrumentType: InstrumentType.Theia,
        editable: false,
        instrumentResultDtos: [
          randomInstrumentResult({
            assay: "BACc_CYT",
            resultValue: "2",
            resultText: "2+",
            resultValueForDisplay: "2+",
          }),
          randomInstrumentResult({
            assay: "YEA_CYT",
            resultValue: "3-4",
            resultText: "3-4+",
            resultValueForDisplay: "3-4+",
          }),
          randomInstrumentResult({
            assay: "BACc_CYT",
            resultValue: "2",
            resultValueForDisplay: "2+",
          }),
          randomInstrumentResult({
            assay: "YEA_CYT",
            resultValue: "3-4",
            resultValueForDisplay: "3-4+",
          }),
        ],
        testOrders: [
          randomTestOrders({
            sequenceNumber: 0,
            earSwabRunConfigurationDto: {
              theiaClinicalSigns: null,
              theiaSampleLocation: "LEFT",
              theiaSite: "EAR",
              theiaSubsite: "INDETERMINATE",
            },
            instrumentResultDtos: [
              randomInstrumentResult({
                assay: "BACc_CYT",
                resultValue: "2",
                resultText: "2+",
                resultValueForDisplay: "2+",
                sampleType: SampleTypeEnum.EAR_SWAB,
              }),
              randomInstrumentResult({
                assay: "YEA_CYT",
                resultValue: "3-4",
                resultText: "3-4+",
                resultValueForDisplay: "3-4+",
                sampleType: SampleTypeEnum.EAR_SWAB,
              }),
            ],
          }),
          randomTestOrders({
            sequenceNumber: 1,
            earSwabRunConfigurationDto: {
              theiaClinicalSigns: null,
              theiaSampleLocation: "RIGHT",
              theiaSite: "EAR",
              theiaSubsite: "INDETERMINATE",
            },
            instrumentResultDtos: [
              randomInstrumentResult({
                assay: "BACc_CYT",
                resultValue: "2",
                resultValueForDisplay: "2+",
                sampleType: SampleTypeEnum.EAR_SWAB,
              }),
              randomInstrumentResult({
                assay: "YEA_CYT",
                resultValue: "3-4",
                resultValueForDisplay: "3-4+",
                sampleType: SampleTypeEnum.EAR_SWAB,
              }),
            ],
          }),
        ],
        runNotes: [
          {
            note: "Cocci: Moderate coccoid-shaped bacteria present.",
            hashId: "eb9bc8d4fd8fe863913d22cd6b13d7f3",
          },
          {
            note: "Yeast, Cocci: Consistent with normal flora.",
            hashId: "35e15f426a0106823df45a623801f18a",
          },
        ],
      });

      const labRequest = randomLabRequest({
        id: 100,
        instrumentRunDtos: [thiaRun],
      });
      cy.intercept("**/labRequestRecords", [
        { labRequestId: labRequest.id, deviceUsageMap: {} },
      ]);

      cy.intercept(
        "GET",
        "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
        labRequest
      ).as("detailedResult");
      cy.intercept("**/labRequestRecords", [
        { labRequestId: labRequest.id, deviceUsageMap: {} },
      ]);

      cy.visit("labRequest/100");
      cy.wait("@detailedResult");

      const hematologyResultsTable = cy.getByTestId("results-table-Pathology");
      hematologyResultsTable.should("be.visible");

      thiaRun.instrumentResultDtos.forEach((result) => {
        cy.getByTestId(`results-page-result-cell-${result.assay}`)
          .should("be.visible")
          // .should("have.text", `${result.resultValueForDisplay}`)
          .contains(result.resultValueForDisplay);
      });
    });
  });
});
