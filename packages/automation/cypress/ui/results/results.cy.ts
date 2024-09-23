import {
  randomInstrumentResult,
  randomInstrumentRun,
  randomLabRequest,
  randomPatientDto,
} from "@viewpoint/test-utils";
import {
  InstrumentRunStatus,
  InstrumentType,
  LabRequestRecordDto,
  PatientWeightUnitsEnum,
  ServiceCategory,
  SettingTypeEnum,
} from "@viewpoint/api";
import dayjs from "dayjs";
import { getDefaultSettings } from "../../util/general-utils";

describe("the results page", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/patient/*/labRequestRecords", [
      {
        labRequestId: 100,
        deviceUsageMap: {},
      },
    ]);
  });

  describe("print button", () => {
    beforeEach(() => {
      cy.intercept("**/labRequestRecords", [
        {
          labRequestId: 123123,
          deviceUsageMap: {},
        },
      ]);
      cy.intercept(
        {
          method: "GET",
          pathname: "/labstation-webapp/api/labRequest/123123",
          query: { previousRunDepth: "2" },
        },
        {
          body: randomLabRequest({
            id: 123123,
            instrumentRunDtos: [
              randomInstrumentRun({
                status: InstrumentRunStatus.Complete,
                serviceCategory: ServiceCategory.Chemistry,
                instrumentType: InstrumentType.VetLyte,
                editable: false,
                instrumentResultDtos: [
                  randomInstrumentResult({
                    assay: "Na",
                    resultValueForDisplay: "1.0",
                    referenceLow: 0,
                    referenceHigh: 10,
                    outOfRangeLow: false,
                    outOfRangeHigh: false,
                  }),
                ],
              }),
            ],
          }),
        }
      ).as("fetchResult");

      cy.visit("/labRequest/123123");

      cy.wait("@fetchResult");

      cy.get("svg.icon-print").parent("button").as("printButton");

      cy.intercept(
        {
          method: "GET",
          pathname: "/labstation-webapp/api/report/labReport",
        },
        {
          delay: 150,
          statusCode: 200,
          body: new ArrayBuffer(0),
        }
      ).as("fetchResultPdf");

      cy.intercept(
        {
          method: "GET",
          pathname: "/labstation-webapp/api/printers",
        },
        {
          statusCode: 200,
          body: [
            {
              name: "printer1",
              displayName: "Printer 1",
              systemDefault: true,
            },
            {
              name: "printer2",
              displayName: "Printer Two",
              systemDefault: false,
            },
          ],
        }
      ).as("getPrinters");

      cy.intercept(
        {
          method: "GET",
          pathname: "/labstation-webapp/api/settings",
          query: { setting: "DEFAULT_PRINTER" },
        },
        {
          statusCode: 200,
          body: { DEFAULT_PRINTER: "printer1" },
        }
      ).as("getDefaultPrinterSetting");

      cy.intercept(
        {
          method: "GET",
          pathname: "/labstation-webapp/api/settings",
          query: { setting: "DEFAULT_PAPER_SIZE" },
        },
        {
          statusCode: 200,
          body: { DEFAULT_PAPER_SIZE: "LETTER" },
        }
      ).as("getDefaultPaperSize");

      cy.intercept(
        {
          method: "POST",
          pathname: "/labstation-webapp/api/print/job",
        },
        {
          statusCode: 200,
        }
      ).as("printSubmission");
    });

    it("should be disabled when clicked, enabled after print job submitted", () => {
      cy.get("@printButton").click();
      cy.get("@printButton").should("be.disabled");
      cy.wait("@printSubmission");
      cy.get("@printButton").should("be.enabled");
    });
  });

  it("displays results for a given lab request", () => {
    const runOne = randomInstrumentRun({
      status: InstrumentRunStatus.Complete,
      serviceCategory: ServiceCategory.Hematology,
      instrumentType: InstrumentType.ProCyteOne,
      editable: false,
      instrumentResultDtos: [
        randomInstrumentResult({
          assay: "WBC",
          resultValueForDisplay: "1.0",
          referenceLow: 0,
          referenceHigh: 10,
          outOfRangeLow: false,
          outOfRangeHigh: false,
        }),
        randomInstrumentResult({
          assay: "RBC",
          resultValueForDisplay: "1.0",
          referenceLow: 5,
          referenceHigh: 15,
          outOfRangeLow: true,
          outOfRangeHigh: false,
        }),
      ],
    });
    const runTwo = randomInstrumentRun({
      status: InstrumentRunStatus.Complete,
      serviceCategory: ServiceCategory.Chemistry,
      instrumentType: InstrumentType.CatalystOne,
      editable: false,
      instrumentResultDtos: [
        randomInstrumentResult({
          assay: "CREA",
          resultValueForDisplay: "10.0",
          referenceLow: 0,
          referenceHigh: 5,
          outOfRangeLow: false,
          outOfRangeHigh: true,
        }),
        randomInstrumentResult({
          assay: "BUN",
          resultValueForDisplay: "1.0",
          referenceLow: 0,
          referenceHigh: 10,
          outOfRangeLow: false,
          outOfRangeHigh: false,
        }),
      ],
    });
    const runThree = randomInstrumentRun({
      status: InstrumentRunStatus.Complete,
      serviceCategory: ServiceCategory.Chemistry,
      instrumentType: InstrumentType.VetLyte,
      editable: false,
      instrumentResultDtos: [
        randomInstrumentResult({
          assay: "Na",
          resultValueForDisplay: "1.0",
          referenceLow: 0,
          referenceHigh: 10,
          outOfRangeLow: false,
          outOfRangeHigh: false,
        }),
        randomInstrumentResult({
          assay: "K",
          resultValueForDisplay: "1.0",
          referenceLow: 0,
          referenceHigh: 10,
          outOfRangeLow: false,
          outOfRangeHigh: false,
        }),
        randomInstrumentResult({
          assay: "Cl",
          resultValueForDisplay: "1.0",
          referenceLow: 0,
          referenceHigh: 10,
          outOfRangeLow: false,
          outOfRangeHigh: false,
        }),
      ],
    });
    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [runOne, runTwo, runThree],
    });

    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");

    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    const hematologyResultsTable = cy.getByTestId("results-table-Hematology");
    hematologyResultsTable.should("be.visible");

    const chemistryResultsTable = cy.getByTestId("results-table-Chemistry");
    chemistryResultsTable.should("be.visible");

    runOne.instrumentResultDtos
      .concat(runTwo.instrumentResultDtos)
      .concat(runThree.instrumentResultDtos)
      .forEach((result) => {
        cy.getByTestId(`results-page-assay-cell-${result.assay}`)
          .should("be.visible")
          .contains(result.assay);

        cy.getByTestId(`results-page-result-cell-${result.assay}`)
          .should("be.visible")
          .should("have.text", result.resultValueForDisplay);

        if (result.outOfRangeLow || result.outOfRangeHigh) {
          cy.getByTestId(`results-page-result-cell-${result.assay}`)
            .children()
            .first()
            // Cypress only returns computed RGB value for colors: https://github.com/cypress-io/cypress/issues/2186
            .should("have.css", "background-color", "rgb(234, 40, 57)");
        }
      });
  });

  it("displays historical results when they are available", () => {
    const topRun = randomInstrumentRun({
      status: InstrumentRunStatus.Complete,
      serviceCategory: ServiceCategory.Hematology,
      instrumentType: InstrumentType.ProCyteOne,
      editable: false,
      instrumentResultDtos: [
        randomInstrumentResult({ assay: "WBC", resultValueForDisplay: "1.0" }),
        randomInstrumentResult({ assay: "HGB", resultValueForDisplay: "1.0" }),
      ],
      previousRun: randomInstrumentRun({
        status: InstrumentRunStatus.Complete,
        serviceCategory: ServiceCategory.Hematology,
        instrumentType: InstrumentType.ProCyteOne,
        editable: false,
        instrumentResultDtos: [
          randomInstrumentResult({
            assay: "WBC",
            resultValueForDisplay: "4.0 K/μL",
          }),
          randomInstrumentResult({
            assay: "RBC",
            resultValueForDisplay: "5.0 K/μL",
          }),
        ],
        previousRun: randomInstrumentRun({
          status: InstrumentRunStatus.Complete,
          serviceCategory: ServiceCategory.Hematology,
          instrumentType: InstrumentType.ProCyteOne,
          editable: false,
          instrumentResultDtos: [
            randomInstrumentResult({
              assay: "WBC",
              resultValueForDisplay: "2.0 K/μL",
            }),
            randomInstrumentResult({
              assay: "HGB",
              resultValueForDisplay: "9.0 g/dL",
            }),
            randomInstrumentResult({
              assay: "RETIC",
              resultValueForDisplay: "5.0 K/μL",
            }),
          ],
        }),
      }),
    });

    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [topRun],
    });

    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");
    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    cy.getByTestId("results-page-assay-cell-WBC").should("be.visible");
    cy.getByTestId("results-page-assay-cell-HGB").should("be.visible");

    // First historical run has WBC
    cy.getByTestId("results-page-result-cell-WBC-historical-0")
      .should("be.visible")
      .should("have.text", "4.0 K/μL");
    // Focused run does not have RBC result, so this one should not be there
    cy.getByTestId("results-page-result-cell-RBC-historical-0").should(
      "not.exist"
    );

    // Second historical run has both WBC and HGB, as well as RETIC which should be displayed
    cy.getByTestId("results-page-result-cell-WBC-historical-1")
      .should("be.visible")
      .should("have.text", "2.0 K/μL");
    cy.getByTestId("results-page-result-cell-HGB-historical-1")
      .should("be.visible")
      .should("have.text", "9.0 g/dL");
    cy.getByTestId("results-page-result-cell-RETIC-historical-1").should(
      "not.exist"
    );
  });

  it("displays details for a historical result when clicked on", () => {
    const topRun = randomInstrumentRun({
      status: InstrumentRunStatus.Complete,
      serviceCategory: ServiceCategory.Hematology,
      instrumentType: InstrumentType.ProCyteOne,
      editable: false,
      instrumentResultDtos: [
        randomInstrumentResult({
          assay: "WBC",
          resultValueForDisplay: "1.0 K/μL",
        }),
      ],
      previousRun: randomInstrumentRun({
        status: InstrumentRunStatus.Complete,
        serviceCategory: ServiceCategory.Hematology,
        instrumentType: InstrumentType.ProCyteOne,
        editable: false,
        instrumentResultDtos: [
          randomInstrumentResult({
            assay: "WBC",
            resultValueForDisplay: "5.0 K/μL",
            assayUnits: "K/μL",
            referenceRangeString: "2 - 186",
          }),
        ],
      }),
    });

    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [topRun],
    });

    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");
    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    // First historical run has WBC
    cy.getByTestId("results-page-result-cell-WBC-historical-0").click();

    cy.getByTestId(`historical-result-popover-WBC-0`)
      // be.visible does not work here with the new "collapsible" result tables,
      // since those are set to overflow: hidden and Cypress checks that an element
      // is not contained within an overflow: hidden parent, even though the actual
      // element is positioned programmatically and visible outside of the parent
      .should("exist")
      .containedWithinTestId("historical-result-popover-WBC-0", "5.0 K/μL")
      .containedWithinTestId("historical-result-popover-WBC-0", "2 - 186 K/μL");

    cy.getByTestId("historical-popover-result-cell-WBC-0")
      .should("exist")
      .should("have.text", "5.0 K/μL");
  });

  it("does not allow editing of non-editable run", () => {
    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [
        randomInstrumentRun({
          status: InstrumentRunStatus.Complete,
          instrumentType: InstrumentType.CatalystOne,
          editable: false,
        }),
      ],
    });

    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");
    cy.intercept("GET", "**/labstation-webapp/api/labRequest/100?", labRequest);
    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    cy.getByTestId("results-page-edit-results-button").should("not.exist");
  });

  it("allows navigating historical records", () => {
    const historicalRecords: LabRequestRecordDto[] = [
      {
        labRequestId: 100,
        labRequestDate: dayjs().valueOf(),
        deviceUsageMap: {},
      },
      {
        labRequestId: 99,
        labRequestDate: dayjs().subtract(1, "days").valueOf(),
        deviceUsageMap: {},
      },
    ];
    cy.intercept("**/labRequestRecords", historicalRecords);

    const lr99 = randomLabRequest({ id: 99 });
    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/99?previousRunDepth=2",
      lr99
    ).as("detailedResult");
    const lr100 = randomLabRequest({ id: 100 });
    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      lr100
    ).as("detailedResult");

    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    // Verify lab request 100 is the active one
    cy.getByTestId(`results-page-historical-tab-${100}`).should(
      "have.class",
      "spot-tabs__link--active"
    );

    // Verify 99 is not active, then click it
    cy.getByTestId(`results-page-historical-tab-${99}`)
      .should("not.have.class", "spot-tabs__link--active")
      .click();

    // Verify URL has changed to LR 99, and it is now the active tab
    cy.url().should("contain", "labRequest/99");
    cy.getByTestId(`results-page-historical-tab-${99}`).should(
      "have.class",
      "spot-tabs__link--active"
    );
  });

  it("displays categorized results", () => {
    // Results already come sorted by category from IVLS
    const categoryResults = [
      randomInstrumentResult({
        displayCategory: true,
        category: "Bacteria",
      }),
      randomInstrumentResult({
        displayCategory: true,
        category: "Bacteria",
      }),
      randomInstrumentResult({
        displayCategory: true,
        category: "Bacteria",
      }),
      randomInstrumentResult({
        displayCategory: true,
        category: "Crystals",
      }),
      randomInstrumentResult({
        displayCategory: true,
        category: "Crystals",
      }),
    ];
    // Test order ID is required to provide category per test order + assay
    categoryResults.forEach((result) => (result.testOrderId = 1));
    const labRequest = randomLabRequest({
      instrumentRunDtos: [
        randomInstrumentRun({
          status: InstrumentRunStatus.Complete,
          instrumentType: InstrumentType.CatalystDx,
          instrumentResultDtos: [
            randomInstrumentResult(),
            ...categoryResults,
            randomInstrumentResult(),
          ],
        }),
      ],
    });

    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");

    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    // First cell is the first assay's name
    cy.get(".result-table-cell")
      .nth(0)
      .contains(
        labRequest.instrumentRunDtos![0].instrumentResultDtos![0].assay
      );
    // Next 3 cells contain the results, ref range and speedbar for that assay

    // 5th cell is the first category (Bacteria) which takes up the entire row
    cy.get(".result-table-cell").nth(4).contains("Bacteria");
    // The bacteria assays are next
    cy.get(".result-table-cell").nth(5).contains(categoryResults[0].assay);
    cy.get(".result-table-cell").nth(9).contains(categoryResults[1].assay);
    cy.get(".result-table-cell").nth(13).contains(categoryResults[2].assay);

    // Next up is the crystals category
    cy.get(".result-table-cell").nth(17).contains("Crystals");
    cy.get(".result-table-cell").nth(18).contains(categoryResults[3].assay);
    cy.get(".result-table-cell").nth(22).contains(categoryResults[4].assay);

    // The last result
    cy.get(".result-table-cell")
      .nth(26)
      .contains(
        labRequest.instrumentRunDtos![0].instrumentResultDtos![6].assay
      );
  });

  it("displays the results details popover when clicked on", () => {
    const labRequest = randomLabRequest({
      id: 100,
      requestDate: 1234,
    });

    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");
    cy.intercept("**/settings?**", getDefaultSettings());
    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    cy.getByTestId("results-page-result-details-popover-button").click();

    cy.getByTestId("results-page-result-details-popover")
      .should("be.visible")
      .contains(dayjs(1234).format("M/DD/YY h:mm A"));
  });

  it("displays the doctor name and patient lastKnownWeight correctly", () => {
    let labRequest = randomLabRequest({
      id: 100,
      requestDate: 1234,
      doctorDto: {
        lastName: "",
        firstName: "Jane",
        isSuppressed: false,
        id: 1,
      },
      patientDto: {
        ...randomPatientDto(),
      },
      weight: "12",
    });
    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");
    cy.intercept("**/settings?**", getDefaultSettings());
    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    cy.getByTestId("results-page-result-details-popover-button").click();

    cy.getByTestId("results-page-result-details-popover")
      .should("be.visible")
      .contains("Jane");

    cy.getByTestId("results-page-result-details-popover").contains("lbs");

    labRequest = randomLabRequest({
      id: 100,
      requestDate: 1234,
      doctorDto: {
        lastName: "Doe",
        firstName: "Jane",
        isSuppressed: false,
        id: 1,
      },
      patientDto: {
        ...randomPatientDto(),
      },
      weight: "12",
    });
    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");

    cy.intercept("**/settings?**", {
      ...getDefaultSettings(),
      [SettingTypeEnum.WEIGHT_UNIT_TYPE]: PatientWeightUnitsEnum.KILOGRAMS,
    });

    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    cy.getByTestId("results-page-result-details-popover-button").click();

    cy.getByTestId("results-page-result-details-popover")
      .should("be.visible")
      .contains("Jane Doe");

    cy.getByTestId("results-page-result-details-popover").contains("kgs");

    labRequest = randomLabRequest({
      id: 100,
      requestDate: 1234,
      doctorDto: {
        lastName: "",
        firstName: "",
        isSuppressed: false,
        id: 1,
      },
    });
    cy.intercept(
      "GET",
      "**/labstation-webapp/api/labRequest/100?previousRunDepth=2",
      labRequest
    ).as("detailedResult");

    cy.visit("labRequest/100");
    cy.wait("@detailedResult");

    cy.getByTestId("results-page-result-details-popover-button").click();

    cy.getByTestId("results-page-result-details-popover")
      .contains("Veterinarian")
      .should("exist");
  });

  it("allows collapsing and expanding service category tables", () => {
    const hemaRun = randomInstrumentRun({
      instrumentType: InstrumentType.ProCyteOne,
      serviceCategory: ServiceCategory.Hematology,
      instrumentResultDtos: [randomInstrumentResult()],
    });
    const chemRun = randomInstrumentRun({
      instrumentType: InstrumentType.ProCyteOne,
      serviceCategory: ServiceCategory.Chemistry,
      instrumentResultDtos: [randomInstrumentResult()],
    });
    const labRequest = randomLabRequest({
      id: 100,
      instrumentRunDtos: [hemaRun, chemRun],
    });
    cy.intercept(
      {
        method: "GET",
        pathname: `**/api/labRequest/*`,
      },
      labRequest
    ).as("detailedResults");
    cy.visit(`/labRequest/${labRequest.id}`);
    cy.wait("@detailedResults");
    // Verify hema table is visible
    cy.getByTestId(`run-table-${hemaRun.id}`)
      .as("hemaRunTable")
      .should("be.visible");

    // Collapse it
    cy.getByTestId(`service-category-header-${ServiceCategory.Hematology}`)
      .as("hemaHeader")
      .click();

    // Verify it is no longer visible
    cy.get("@hemaRunTable").should("not.be.visible");

    // Verify chem table is visible
    cy.getByTestId(`run-table-${chemRun.id}`)
      .as("chemRunTable")
      .should("be.visible");

    // Collapse it
    cy.getByTestId(`service-category-header-${ServiceCategory.Chemistry}`)
      .as("chemHeader")
      .click();

    // Verify it is no longer visible
    cy.get("@chemRunTable").should("not.be.visible");

    // Expand the tables
    cy.get("@hemaHeader").click();
    cy.get("@hemaRunTable").should("be.visible");
    cy.get("@chemHeader").click();
    cy.get("@chemRunTable").should("be.visible");
  });
});
