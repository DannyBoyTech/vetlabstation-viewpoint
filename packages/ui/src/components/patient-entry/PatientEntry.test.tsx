import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BreedDto,
  ClientDto,
  GenderDto,
  PatientWeightUnitsEnum,
  RefClassDto,
  ReferenceClassType,
  SettingTypeEnum,
  SpeciesDto,
  SpeciesType,
} from "@viewpoint/api";
import { screen, waitFor } from "@testing-library/react";
import { PatientEntry, TestId as PatientTestId } from "./PatientEntry";
import { TestId as AgeTestId } from "./AgeInput";
import { TestId as DobTestId } from "./DateOfBirthFields";
import { render } from "../../../test-utils/test-utils";
import { server } from "../../../test-utils/mock-server";
import { rest } from "msw";

vi.mock("react-router", async (importOriginal) => ({
  ...((await importOriginal()) as any),
}));

describe("patient entry component", () => {
  beforeEach(() => {
    mockDisplaySettings();
    mockFetchSpecies();
    mockFetchBreeds();
    mockFetchRefClasses();
    mockFetchGenders();
    mockFetchCalculatedRefClass();
    mockClientMatches();
  });

  it("does not display species dropdown until patient name and client ID are entered with no matching results", async () => {
    const { rerender } = render(
      <PatientEntry onPatientChanged={vi.fn()} onClientChanged={vi.fn()} />
    );

    // Verify species drop down isn't displayed since no client ID/Patient name is available
    expect(
      await screen.queryByTestId("species-select")
    ).not.toBeInTheDocument();

    // Return an empty array from client search to indicate no matches were found
    mockClientMatches([]);

    rerender(
      <PatientEntry
        onPatientChanged={vi.fn()}
        onClientChanged={vi.fn()}
        client={{ clientId: "Client ID" }}
        patient={{ patientName: "Patient Name" }}
      />
    );

    // Verify it's there now (debouncing in play so need to wait a few ms)
    await waitFor(async () =>
      expect(
        await screen.findByTestId(PatientTestId.Species)
      ).toBeInTheDocument()
    );
  });

  it("displays breed, sex, lastKnownWeight, life stage, age and DOB fields for species with speciesClass LIFESTAGE", async () => {
    render(
      <PatientEntry
        onPatientChanged={vi.fn()}
        onClientChanged={vi.fn()}
        client={{ clientId: "1" }}
        clientAlreadyConfirmed
        patient={{ patientName: "patient", speciesDto: { id: 1 } }}
      />
    );

    expect(await screen.findByTestId(PatientTestId.Breeds)).toBeInTheDocument();
    expect(await screen.findByTestId(PatientTestId.Gender)).toBeInTheDocument();
    expect(
      await screen.findByTestId(PatientTestId.LastKnownWeight)
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(PatientTestId.Lifestage)
    ).toBeInTheDocument();
    expect(await screen.findByTestId(AgeTestId.Age)).toBeInTheDocument();
    expect(
      await screen.findByTestId(AgeTestId.AgeCategory)
    ).toBeInTheDocument();
    expect(await screen.findByTestId(DobTestId.Month)).toBeInTheDocument();
    expect(await screen.findByTestId(DobTestId.Date)).toBeInTheDocument();
    expect(await screen.findByTestId(DobTestId.Year)).toBeInTheDocument();
  });

  it("only displays type selection for species with class TYPE", async () => {
    const speciesDto = {
      id: 1,
      speciesName: SpeciesType.Avian,
      speciesClass: ReferenceClassType.Type,
    };
    mockFetchSpecies([speciesDto]);
    render(
      <PatientEntry
        clientAlreadyConfirmed
        patient={{ patientName: "p", speciesDto }}
        client={{ clientId: "c" }}
        onPatientChanged={vi.fn()}
        onClientChanged={vi.fn()}
      />
    );
    expect(
      await screen.findByTestId(PatientTestId.Lifestage)
    ).toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.Breeds)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.Gender)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.LastKnownWeight)
    ).not.toBeInTheDocument();
    expect(await screen.queryByTestId(AgeTestId.Age)).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(AgeTestId.AgeCategory)
    ).not.toBeInTheDocument();
    expect(await screen.queryByTestId(DobTestId.Month)).not.toBeInTheDocument();
    expect(await screen.queryByTestId(DobTestId.Date)).not.toBeInTheDocument();
    expect(await screen.queryByTestId(DobTestId.Year)).not.toBeInTheDocument();
  });

  it("does not display any additional fields for species of class OTHER", async () => {
    const speciesDto = {
      id: 1,
      speciesName: SpeciesType.Ferret,
      speciesClass: ReferenceClassType.Other,
    };
    mockFetchSpecies([speciesDto]);
    render(
      <PatientEntry
        clientAlreadyConfirmed
        patient={{ patientName: "p", speciesDto }}
        client={{ clientId: "c" }}
        onPatientChanged={vi.fn()}
        onClientChanged={vi.fn()}
      />
    );
    expect(
      await screen.queryByTestId(PatientTestId.Lifestage)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.Breeds)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.Gender)
    ).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.LastKnownWeight)
    ).not.toBeInTheDocument();
    expect(await screen.queryByTestId(AgeTestId.Age)).not.toBeInTheDocument();
    expect(
      await screen.queryByTestId(AgeTestId.AgeCategory)
    ).not.toBeInTheDocument();
    expect(await screen.queryByTestId(DobTestId.Month)).not.toBeInTheDocument();
    expect(await screen.queryByTestId(DobTestId.Date)).not.toBeInTheDocument();
    expect(await screen.queryByTestId(DobTestId.Year)).not.toBeInTheDocument();
  });

  it("does not render sex when displayGender is marked false", async () => {
    mockDisplaySettings({ [SettingTypeEnum.DISPLAY_PATIENT_GENDER]: "false" });
    const speciesDto = {
      id: 1,
      speciesName: SpeciesType.Canine,
      speciesClass: ReferenceClassType.LifeStage,
    };
    mockFetchSpecies([speciesDto]);
    render(
      <PatientEntry
        clientAlreadyConfirmed
        patient={{ patientName: "p", speciesDto }}
        client={{ clientId: "c" }}
        onPatientChanged={vi.fn()}
        onClientChanged={vi.fn()}
      />
    );

    expect(
      await screen.queryByTestId(PatientTestId.Gender)
    ).not.toBeInTheDocument();
    expect(await screen.findByTestId(PatientTestId.Breeds)).toBeInTheDocument();
    expect(
      await screen.findByTestId(PatientTestId.LastKnownWeight)
    ).toBeInTheDocument();
  });

  it("does not render breed when displayBreed is marked false", async () => {
    mockDisplaySettings({ [SettingTypeEnum.DISPLAY_PATIENT_BREED]: "false" });
    const speciesDto = {
      id: 1,
      speciesName: SpeciesType.Canine,
      speciesClass: ReferenceClassType.LifeStage,
    };
    mockFetchSpecies([speciesDto]);
    render(
      <PatientEntry
        clientAlreadyConfirmed
        patient={{ patientName: "p", speciesDto }}
        client={{ clientId: "c" }}
        onPatientChanged={vi.fn()}
        onClientChanged={vi.fn()}
      />
    );
    expect(await screen.findByTestId(PatientTestId.Gender)).toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.Breeds)
    ).not.toBeInTheDocument();
    expect(
      await screen.findByTestId(PatientTestId.LastKnownWeight)
    ).toBeInTheDocument();
  });

  it("does not render lastKnownWeight when displayWeight is marked false", async () => {
    mockDisplaySettings({ [SettingTypeEnum.DISPLAY_PATIENT_WEIGHT]: "false" });
    const speciesDto = {
      id: 1,
      speciesName: SpeciesType.Canine,
      speciesClass: ReferenceClassType.LifeStage,
    };
    mockFetchSpecies([speciesDto]);
    render(
      <PatientEntry
        clientAlreadyConfirmed
        patient={{ patientName: "p", speciesDto }}
        client={{ clientId: "c" }}
        onPatientChanged={vi.fn()}
        onClientChanged={vi.fn()}
      />
    );

    expect(await screen.findByTestId(PatientTestId.Gender)).toBeInTheDocument();
    expect(await screen.findByTestId(PatientTestId.Breeds)).toBeInTheDocument();
    expect(
      await screen.queryByTestId(PatientTestId.LastKnownWeight)
    ).not.toBeInTheDocument();
  });
});

function mockDisplaySettings(values?: { [key in SettingTypeEnum]?: string }) {
  server.use(
    rest.get("**/api/settings", (req, res, context) =>
      res(
        context.json({
          [SettingTypeEnum.WEIGHT_UNIT_TYPE]: PatientWeightUnitsEnum.POUNDS,
          [SettingTypeEnum.DISPLAY_PATIENT_WEIGHT]: "true",
          [SettingTypeEnum.DISPLAY_PATIENT_BREED]: "true",
          [SettingTypeEnum.DISPLAY_PATIENT_GENDER]: "true",
          ...values,
        })
      )
    )
  );
}

function mockFetchSpecies(species?: SpeciesDto[]) {
  server.use(
    rest.get("**/api/species", (req, res, context) =>
      res(
        context.json(
          species ?? [
            {
              id: 1,
              speciesClass: ReferenceClassType.LifeStage,
              speciesName: SpeciesType.Canine,
            },
          ]
        )
      )
    )
  );
}

function mockFetchBreeds(breeds?: BreedDto[]) {
  server.use(
    rest.get("**/api/species/*/breeds", (req, res, context) =>
      res(context.json(breeds ?? []))
    )
  );
}

function mockFetchRefClasses(refClasses?: RefClassDto[]) {
  server.use(
    rest.get("**/api/species/*/referenceClassifications", (req, res, context) =>
      res(context.json(refClasses ?? []))
    )
  );
}

function mockFetchGenders(genders?: GenderDto[]) {
  server.use(
    rest.get("**/api/patient/genders", (req, res, context) =>
      res(context.json(genders ?? []))
    )
  );
}

function mockFetchCalculatedRefClass(refClass?: RefClassDto) {
  server.use(
    rest.get("**/api/species/*/lifestage", (req, res, context) =>
      res(context.json(refClass))
    )
  );
}

function mockClientMatches(clients?: ClientDto[]) {
  server.use(
    rest.get("**/api/client", (req, res, context) => res(context.json(clients)))
  );
}
