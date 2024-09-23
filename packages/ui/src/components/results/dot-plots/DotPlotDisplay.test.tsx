import { describe, it } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import { DotPlotDisplay, TestId } from "./DotPlotDisplay";
import {
  DotPlotNodeDataResponse,
  InstrumentType,
  SampleTypeEnum,
  SpeciesType,
} from "@viewpoint/api";
import { screen } from "@testing-library/react";

const LC_SPECIES = [SpeciesType.Canine, SpeciesType.Feline, SpeciesType.Equine];
const LCDX_SPECIES = [
  SpeciesType.Canine,
  SpeciesType.Feline,
  SpeciesType.Equine,
];
const PCO_SPECIES = [
  SpeciesType.Canine,
  SpeciesType.Feline,
  SpeciesType.Equine,
];
const PCDX_SPECIES = [
  SpeciesType.Alpaca,
  SpeciesType.Bovine,
  SpeciesType.Camel,
  SpeciesType.Canine,
  SpeciesType.Dolphin,
  SpeciesType.Equine,
  SpeciesType.Feline,
  SpeciesType.Ferret,
  SpeciesType.Gerbil,
  SpeciesType.Goat,
  SpeciesType.GuineaPig,
  SpeciesType.Hamster,
  SpeciesType.Llama,
  SpeciesType.MiniPig,
  SpeciesType.Pig,
  SpeciesType.Rabbit,
  SpeciesType.Sheep,
];

describe("reference images", () => {
  it("reference images are included for wholeblood sample", async () => {
    expect(await renderAndQuery()).toBeInTheDocument();
  });

  it("does not include reference image for non-wholeblood samples", async () => {
    expect(
      await renderAndQuery({ sampleType: SampleTypeEnum.SYNOVIAL })
    ).not.toBeInTheDocument();
  });

  const ValidCases = [
    ...LC_SPECIES.map((sp) => ({
      instrumentType: InstrumentType.LaserCyte,
      speciesType: sp,
    })),
    ...LCDX_SPECIES.map((sp) => ({
      instrumentType: InstrumentType.LaserCyteDx,
      speciesType: sp,
    })),
    ...PCO_SPECIES.map((sp) => ({
      instrumentType: InstrumentType.ProCyteOne,
      speciesType: sp,
    })),
    ...PCDX_SPECIES.map((sp) => ({
      instrumentType: InstrumentType.ProCyteDx,
      speciesType: sp,
    })),
  ] as const;

  it.each(ValidCases)(
    "instrument type $instrumentType and species type $speciesType show a reference dot plot",
    async ({ instrumentType, speciesType }) => {
      expect(
        await renderAndQuery({ instrumentType, speciesType })
      ).toBeInTheDocument();
    }
  );

  const InvalidCases = [
    ...Object.values(SpeciesType)
      .filter((sp) => !LC_SPECIES.includes(sp))
      .map((sp) => ({
        instrumentType: InstrumentType.LaserCyte,
        speciesType: sp,
      })),
    ...Object.values(SpeciesType)
      .filter((sp) => !LCDX_SPECIES.includes(sp))
      .map((sp) => ({
        instrumentType: InstrumentType.LaserCyteDx,
        speciesType: sp,
      })),
    ...Object.values(SpeciesType)
      .filter((sp) => !PCO_SPECIES.includes(sp))
      .map((sp) => ({
        instrumentType: InstrumentType.ProCyteOne,
        speciesType: sp,
      })),
    ...Object.values(SpeciesType)
      .filter((sp) => !PCDX_SPECIES.includes(sp))
      .map((sp) => ({
        instrumentType: InstrumentType.ProCyteDx,
        speciesType: sp,
      })),
  ] as const;

  it.each(InvalidCases)(
    "instrument type $instrumentType and species type $speciesType do not show a reference dot plot",
    async ({ instrumentType, speciesType }) => {
      expect(
        await renderAndQuery({ instrumentType, speciesType })
      ).not.toBeInTheDocument();
    }
  );
});

async function renderAndQuery({
  instrumentType = InstrumentType.ProCyteOne,
  speciesType = SpeciesType.Canine,
  sampleType = SampleTypeEnum.WHOLEBLOOD,
} = {}) {
  const metadata: Partial<DotPlotNodeDataResponse> = {
    scattergramType: "RBC",
    sampleType: sampleType,
    axisX: "COMPLEXITY",
    axisY: "SIZE",
    legend: [],
  };
  render(
    <DotPlotDisplay
      onClickImage={() => {}}
      metadata={metadata as DotPlotNodeDataResponse}
      instrumentType={instrumentType}
      speciesType={speciesType}
    />
  );
  return await screen.queryByTestId(TestId.ReferenceGraph("RBC"));
}
