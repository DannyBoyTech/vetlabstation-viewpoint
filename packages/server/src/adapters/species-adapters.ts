import type { Request, Router } from "express";
import type { Logger } from "winston";
import type {
  AvailableSampleTypes,
  BreedDto,
  RawSpeciesDto,
  RefClassDto,
  SampleTypeSupportDto,
  InstrumentType,
  PatientGender,
} from "@viewpoint/api";
import { createProxyMiddleware } from "http-proxy-middleware";
import { vpResponseInterceptor } from "./utils/proxy-utils";
import { calculateLifestage } from "./utils/lifestage-utils";
import axios from "axios";
import dayjs from "dayjs";
import { adaptSpecies } from "./utils/data-adapters";
import { INSTRUMENT_TYPE_DEVICE_IDS } from "./utils/mapping-data";

export function createSpeciesAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();

  const defaultOptions = () => ({
    logProvider: () => logger,
    target: upstreamTarget,
    selfHandleResponse: true,
  });

  router.get(
    "/labstation-webapp/api/species/:speciesId/lifestage",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      pathRewrite: (_path, req) => `/labstation-webapp/api/species/${req.params["speciesId"]}/referenceClassifications`,
      onProxyRes: vpResponseInterceptor<RefClassDto[], RefClassDto | undefined>(
        async (resp, _logger, _proxyResponse, req) => {
          const request: Request = req as Request;

          // Get the species type from the ID (annoying that we have to make a network request for this)
          const target = new URL(`labstation-webapp/api/species`, upstreamReqUrl);
          const { data }: { data: RawSpeciesDto[] } = await axios(target.toString());
          const match = data?.find((sp) => sp.id === parseInt(request.params["speciesId"] as string));
          if (!match) {
            throw new Error(`No species found for ID ${request.params["speciesId"]}`);
          }
          const species = adaptSpecies(match);

          // Get the age based on DOB
          const birthDate = dayjs(request.query["birthDate"] as string);
          if (!birthDate.isValid()) {
            throw new Error(`Invalid DOB provided: ${request.params["birthDate"]}`);
          }
          const age = Math.max(dayjs().diff(birthDate, "days"), 0);

          // Calculate lifestage or return undefined
          const lifestage = calculateLifestage(species.speciesName, age, request.params["gender"] as PatientGender);
          return resp?.find((rc) => rc.refClassName.toLowerCase() === lifestage?.toLowerCase());
        },
        logger
      ),
    })
  );

  router.get(
    "/labstation-webapp/api/species/:speciesId/breeds",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: vpResponseInterceptor<BreedDto[], BreedDto[]>(
        (resp) => resp?.filter((breed) => breed.breedName.trim().length !== 0) ?? [],
        logger
      ),
    })
  );

  router.get(
    "/labstation-webapp/api/species/:speciesId/sampleTypes",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: vpResponseInterceptor<SampleTypeSupportDto[], AvailableSampleTypes | undefined>(
        (sampleTypes) => convertSampleTypes(sampleTypes),
        logger
      ),
    })
  );
}

export function convertSampleTypes(sampleTypes: SampleTypeSupportDto[] | null): AvailableSampleTypes | undefined {
  return sampleTypes?.reduce((prev, curr) => {
    const instrumentType = Object.entries(INSTRUMENT_TYPE_DEVICE_IDS).find(
      ([_type, id]) => id === curr.deviceDto.id
    )?.[0] as unknown as InstrumentType;
    const refClassId = `${curr.refClassDto.id}`;
    // Track all available sample types to include for when user has not selected a ref class
    // This feels strange to allow them to choose a sample type without choosing a ref class if sample types are all
    // dependent on the ref class, but it is the way that the FX GUI has implemented it.
    const updatedUnknown = prev[instrumentType]?.unknown || [];
    if (!updatedUnknown.some((sampleType) => sampleType.id === curr.sampleTypeDto.id)) {
      updatedUnknown.push(curr.sampleTypeDto);
    }
    return {
      ...prev,
      [instrumentType]: {
        ...(prev[instrumentType] || {}),
        [refClassId]: [...(prev[instrumentType]?.[refClassId] || []), curr.sampleTypeDto],
        unknown: updatedUnknown,
      },
    };
  }, {} as AvailableSampleTypes);
}
