import type { PatientDto, RefClassDto } from "@viewpoint/api";
import { PatientApi, ReferenceClassType, SpeciesApi, SpeciesType } from "@viewpoint/api";
import { handleDetermineRefClassResp } from "./patient-adapters";
import { calculateLifestage } from "./utils/lifestage-utils";

vi.mock("http-proxy-middleware");
vi.mock("axios");
vi.mock("./utils/proxy-utils", async (origImport) => ({
  ...((await origImport()) as any),
  vpResponseInterceptor: vi.fn(),
}));
vi.mock("./utils/lifestage-utils", async (origImport) => ({
  ...((await origImport()) as any),
  calculateLifestage: vi.fn(),
}));

const mockCalculateLifestage = vi.mocked(calculateLifestage);

const mockPatientApi = {
  fetchPatient: vi.fn(),
} as unknown as PatientApi;

const mockSpeciesApi = {
  getReferenceClassifications: vi.fn(),
} as unknown as SpeciesApi;

describe("handleDetermineRefClassResp", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws an error if patient ID path param is not provided", async () => {
    const req = {
      params: {},
      query: {
        clientId: "123",
      },
    };
    await expect(
      handleDetermineRefClassResp(null as any, req as any, mockPatientApi, mockSpeciesApi)
    ).rejects.toThrowError(`'patientId' is required`);
  });

  it("returns lastKnownRefClass property on a matched patient", async () => {
    const expectedIndex = 3;
    const req = {
      params: {
        patientId: expectedIndex,
      },
      query: {
        clientId: expectedIndex,
      },
    };

    const proxyResponse: RefClassDto = {
      id: 10,
      refClassName: "Should not be this one",
      refClassSubTypeCode: "Nope",
    };

    const response: PatientDto = {
      id: 1,
      patientName: `Patient 1`,
      clientDto: {
        id: 1,
        clientId: `Client 1`,
      },
      speciesDto: {
        id: 1,
        speciesName: SpeciesType.Canine,
        speciesClass: ReferenceClassType.LifeStage,
      },
      lastKnownRefClassDto: {
        id: 1,
        refClassName: `Ref class 1`,
        refClassSubTypeCode: `Sub type 1`,
      },
    };

    vi.mocked(mockPatientApi.fetchPatient).mockResolvedValue(response);

    const match = await handleDetermineRefClassResp(proxyResponse, req as any, mockPatientApi, mockSpeciesApi);
    expect(match).toEqual(response.lastKnownRefClassDto);
  });

  it("returns the proxy response if matched patient does not have a lastKnownRefClassDto", async () => {
    const req = {
      params: {
        patientId: 1,
      },
      query: {
        clientId: 1,
      },
    };

    const proxyResponse: RefClassDto = {
      id: 10,
      refClassName: "This is the one",
      refClassSubTypeCode: "Nice",
    };

    const patient: PatientDto = {
      id: 1,
      patientName: `Patient 1`,
      clientDto: {
        id: 1,
        clientId: `Client 1}`,
      },
      speciesDto: {
        id: 1,
        speciesName: SpeciesType.Canine,
        speciesClass: ReferenceClassType.LifeStage,
      },
    };

    vi.mocked(mockPatientApi.fetchPatient).mockResolvedValue(patient);

    const match = await handleDetermineRefClassResp(proxyResponse, req as any, mockPatientApi, mockSpeciesApi);
    expect(match).toEqual(proxyResponse);
  });

  it("calculates the lifestage if no previous ones are available", async () => {
    const req = {
      params: {
        patientId: 1,
      },
      query: {
        clientId: 1,
      },
    };

    const patient: PatientDto = {
      id: 1,
      patientName: `Patient 1`,
      birthDate: "2021-01-01",
      clientDto: {
        id: 1,
        clientId: `Client 1}`,
      },
      speciesDto: {
        id: 1,
        speciesName: SpeciesType.Canine,
        speciesClass: ReferenceClassType.LifeStage,
      },
    };

    const refClasses: RefClassDto[] = new Array(5).fill(1).map((_v, index) => ({
      id: index,
      refClassName: `Ref Class ${index}`,
      refClassSubTypeCode: `Sub Type ${index}`,
    }));
    vi.mocked(mockPatientApi.fetchPatient).mockResolvedValue(patient);
    vi.mocked(mockSpeciesApi.getReferenceClassifications).mockResolvedValue(refClasses);

    const matchingIndex = 2;
    const matchingRefClassName = `Ref Class ${matchingIndex}`;
    mockCalculateLifestage.mockReturnValue(matchingRefClassName);

    const match = await handleDetermineRefClassResp(null, req as any, mockPatientApi, mockSpeciesApi);

    expect(match).toEqual(refClasses[matchingIndex]);
  });
});
