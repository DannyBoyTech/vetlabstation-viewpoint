import {
  DotPlotNodeDataResponse,
  InstrumentRunStatus,
  InstrumentType,
  ReferenceClassType,
  ServiceCategory,
  SpeciesType,
  DotPlotApiLegendItem,
  ScattergramType,
} from "@viewpoint/api";
import faker from "faker";
import dayjs from "dayjs";
import {
  randomInstrumentRun,
  randomLabRequest,
  randomPatientDto,
} from "@viewpoint/test-utils";

describe("dot plot results", () => {
  before(() => {
    cy.intercept("**/api/device/status", []);
    cy.intercept("GET", "**/api/patient/*/labRequestRecords", [
      {
        labRequestId: 100,
        deviceUsageMap: {},
      },
    ]);
  });

  it("includes dot plot thumbnail image, normal reference and legend when available", () => {
    const uuid = faker.datatype.uuid();
    const labRequest = randomLabRequest({
      id: 100,
      patientDto: randomPatientDto({
        speciesDto: {
          speciesName: SpeciesType.Canine,
          speciesClass: ReferenceClassType.LifeStage,
          id: 2,
        },
      }),
      instrumentRunDtos: [
        randomInstrumentRun({
          uuid,
          hasDotPlots: true,
          serviceCategory: ServiceCategory.Hematology,
          instrumentType: InstrumentType.ProCyteOne,
          status: InstrumentRunStatus.Complete,
        }),
      ],
    });

    cy.intercept(
      {
        pathname: "**/api/labRequest/100",
      },
      labRequest
    ).as("detailedResult");

    const rbcUuid = faker.datatype.uuid();
    const wbcUuid = faker.datatype.uuid();
    const imageData: Partial<DotPlotNodeDataResponse>[] = [
      generateDotPlotData({ uuid: rbcUuid, scattergramType: "RBC" }),
      generateDotPlotData({ uuid: wbcUuid, scattergramType: "WBC" }),
    ];

    cy.intercept(
      { pathname: `**/_images/dotPlot/run/${uuid}/image` },
      imageData
    ).as("imageData");

    cy.intercept("**/dot-plots/images/PROCYTE_CANINE_RBC.png", {
      fixture: "dot-plots/images/PROCYTE_CANINE_RBC.png",
    });
    cy.intercept("**/dot-plots/images/PROCYTE_CANINE_WBC.png", {
      fixture: "dot-plots/images/PROCYTE_CANINE_WBC.png",
    });

    cy.visit("labRequest/100");
    cy.wait("@detailedResult");
    cy.wait("@imageData");

    // Check the patient graphs have loaded
    checkImageLoaded("dot-plot-RBC-graph");
    checkImageLoaded("dot-plot-WBC-graph");
    // Check that the reference graphs have loaded
    checkImageLoaded("dot-plot-RBC-reference-graph");
    checkImageLoaded("dot-plot-WBC-graph");

    // Check the axis labels
    cy.containedWithinTestId(
      "dot-plot-RBC-graph",
      "Size"
    ).containedWithinTestId("dot-plot-RBC-graph", "Complexity");
    cy.containedWithinTestId(
      "dot-plot-WBC-graph",
      "Size"
    ).containedWithinTestId("dot-plot-WBC-graph", "Complexity");

    // Check the legends are available and appropriately colored
    [...imageData[0].legend, ...imageData[1].legend].forEach((legendItem) => {
      cy.getByTestId(`dot-plot-legend-icon-${legendItem.type}`)
        .should("exist")
        .should("have.css", "background-color")
        .and("be.colored", legendItem.color);
    });

    // Open the modal for RBC
    cy.getByTestId("dot-plot-RBC-graph").click();
    cy.getByTestId("dot-plot-modal").should("be.visible");
    cy.containedWithinTestId("dot-plot-modal", "RBC Run");
    cy.containedWithinTestId(
      "dot-plot-modal",
      dayjs(imageData[0].dateCreated).format("MMM DD, YYYY")
    );

    // Verify the image is loaded
    checkImageLoaded("dot-plot-modal-RBC-graph");
    // Check the axis labels
    cy.containedWithinTestId(
      "dot-plot-modal-RBC-graph",
      "Size"
    ).containedWithinTestId("dot-plot-modal-RBC-graph", "Complexity");

    // Close the modal
    cy.getByTestId("dot-plot-modal")
      .find(".spot-modal__header-cancel-button")
      .click();
    cy.getByTestId("dot-plot-modal").should("not.be.visible");

    // Open the modal for WBC
    cy.getByTestId("dot-plot-WBC-graph").click();
    cy.getByTestId("dot-plot-modal").should("be.visible");
    cy.containedWithinTestId("dot-plot-modal", "WBC Run");
    cy.containedWithinTestId(
      "dot-plot-modal",
      dayjs(imageData[1].dateCreated).format("MMM DD, YYYY")
    );

    // Verify the image is loaded
    checkImageLoaded("dot-plot-modal-WBC-graph");
    // Check the axis labels
    cy.containedWithinTestId(
      "dot-plot-modal-WBC-graph",
      "Size"
    ).containedWithinTestId("dot-plot-modal-WBC-graph", "Complexity");
  });
});

function checkImageLoaded(testId: string) {
  cy.getByTestId(testId)
    .should("exist")
    .get("img")
    .should("be.visible")
    .and(($img) => expect($img[0].naturalWidth).to.be.greaterThan(0));
}

function generateDotPlotData(
  provided: Partial<DotPlotNodeDataResponse>
): Partial<DotPlotNodeDataResponse> {
  const uuid = provided?.uuid ?? faker.datatype.uuid();
  const scattergramType = provided?.scattergramType ?? "RBC";
  return {
    uuid,
    scattergramType,
    axisY: "SIZE",
    axisX: "COMPLEXITY",
    legend: LEGENDS[provided?.scattergramType ?? "RBC"],
    imageUrl: `http://localhost:6006/dot-plots/images/PROCYTE_CANINE_${scattergramType}.png`,
    dateCreated: Date.now(),
    sampleType: "WHOLEBLOOD",
    ...provided,
  };
}

const LEGENDS: Record<ScattergramType, DotPlotApiLegendItem[]> = {
  RBC: [
    {
      type: "RBC",
      color: "ff0000",
      translation: "RBC",
    },
    {
      type: "RETICS",
      color: "ff00ff",
      translation: "RETICS",
    },
    {
      type: "WBC",
      color: "00c0c0",
      translation: "WBC",
    },
    {
      type: "PLT",
      color: "0000ff",
      translation: "PLT",
    },
    {
      type: "RBC_FRAG",
      color: "ff8080",
      translation: "RBC Frags",
    },
  ],
  WBC: [
    {
      type: "EOS",
      color: "00ff00",
      translation: "EOS",
    },
    {
      type: "NEU",
      color: "c595e3",
      translation: "NEU",
    },
    {
      type: "URBC",
      color: "ff8040",
      translation: "URBC",
    },
    {
      type: "PLT_AGG",
      color: "99ccff",
      translation: "PLT AGG",
    },
    {
      type: "MONO",
      color: "ff0000",
      translation: "MONO",
    },
    {
      type: "LYM",
      color: "0000ff",
      translation: "LYM",
    },
  ],
};
