import type { PatientDto, PatientWithRunsDto, RefClassDto } from "@viewpoint/api";
import { PatientApi, ReferenceClassType, SpeciesApi, SpeciesType } from "@viewpoint/api";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Request, Router } from "express";
import type { Logger } from "winston";
import dayjs from "dayjs";
import { getDefaultProxyOptions, ProxyError, vpResponseInterceptor } from "./utils/proxy-utils";
import { calculateLifestage, getRefClassType } from "./utils/lifestage-utils";
import * as url from "url";
import {
  sortPatientRecordSearchResultsBy,
  sortPatientSearchResultsBy,
  sortPatientSpeciesSearchResultsBy,
} from "./utils/query-utils";
import type { Configuration } from "@viewpoint/api";
import type { IncomingMessage } from "http";

export function createPatientAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();
  const config: Configuration = { basePath: new URL("labstation-webapp/api", upstreamTarget).toString() };
  const speciesApi = new SpeciesApi(config);
  const patientApi = new PatientApi(config);

  const defaultOptions = getDefaultProxyOptions(logger, upstreamTarget);

  router.get(
    "/labstation-webapp/api/patient",
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<PatientDto[], PatientDto[]>((response, _logger, _proxyRes, req) => {
        const patients: PatientDto[] = (response as PatientDto[]) ?? [];

        const specifiedQueries: string[] = Object.entries(url.parse(req.url ?? "", true).query)
          .filter(([_query, val]) => !!val)
          .map(([query]) => query);

        return sortPatientSearchResultsBy(patients, ...specifiedQueries);
      }, logger),
    })
  );

  router.get(
    "/labstation-webapp/api/patient/species",
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<PatientDto[], PatientDto[]>((response, _logger, _proxyRes, req) => {
        const patients: PatientDto[] = (response as PatientDto[]) ?? [];

        const specifiedQueries: string[] = Object.entries(url.parse(req.url ?? "", true).query)
          .filter(([_query, val]) => !!val)
          .map(([query]) => query);

        return sortPatientSpeciesSearchResultsBy(patients, ...specifiedQueries);
      }, logger),
    })
  );

  router.get(
    "/labstation-webapp/api/patient/history",
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<PatientWithRunsDto[], PatientWithRunsDto[]>(
        (response, _logger, _proxyRes, req) => {
          const patientRecords: PatientWithRunsDto[] = (response as PatientWithRunsDto[]) ?? [];

          const specifiedQueries: string[] = Object.entries(url.parse(req.url ?? "", true).query)
            .filter(([_query, val]) => !!val)
            .map(([query]) => query);

          return sortPatientRecordSearchResultsBy(patientRecords, ...specifiedQueries);
        },
        logger
      ),
    })
  );

  router.get(
    "/labstation-webapp/api/vp/patient/:patientId/mostRecentRefClass",
    createProxyMiddleware("/", {
      ...defaultOptions,
      pathRewrite: (path) => path.replace("/vp", ""),
      onError: (err) => logger.error("Proxy error fetching most recent ref class", err),
      onProxyRes: vpResponseInterceptor<RefClassDto, RefClassDto | undefined>(
        (responseBody, _logger, _proxyResponse, request) =>
          handleDetermineRefClassResp(responseBody, request, patientApi, speciesApi),
        logger
      ),
    })
  );
}

export const handleDetermineRefClassResp = async (
  response: RefClassDto | null,
  request: IncomingMessage,
  patientApi: PatientApi,
  speciesApi: SpeciesApi
): Promise<RefClassDto | undefined> => {
  const fullRequest = request as Request;
  const patientId = parseInt(fullRequest.params["patientId"] as string);
  if (!patientId || isNaN(patientId)) {
    throw new ProxyError(`'patientId' is required`, 400);
  }
  // Get the patient directly
  const patient = await patientApi.fetchPatient(patientId);

  if (patient) {
    // This logic exists in the JavaFx client --  it would be ideal if it lived in the server, but for now just replicate it here
    // First use last known ref class from the patient
    if (patient.lastKnownRefClassDto && patient.lastKnownRefClassDto.refClassName.toLowerCase() !== "unknown") {
      return patient.lastKnownRefClassDto;
    } else if (response) {
      // See if we can find any previous lab requests for this patient, and use the ref class from that
      return response;
    } else if (patient.speciesDto) {
      // See if we can calculate the appropriate ref class to use
      let refClassName: string | undefined = patient.speciesDto.speciesName;
      if (getRefClassType(refClassName as SpeciesType) === ReferenceClassType.LifeStage && patient.birthDate) {
        // If there's a DOB and it's a LIFESTAGE type species, try to calculate it using DOB
        refClassName = calculateLifestage(
          patient.speciesDto.speciesName as SpeciesType,
          dayjs().diff(dayjs(patient.birthDate))
        );
      } else if (patient.speciesDto.speciesName === SpeciesType.Bovine && patient.genderDto) {
        // Bovine is treated as a special case based on gender
        refClassName = calculateLifestage(
          patient.speciesDto.speciesName,
          dayjs().diff(dayjs(patient.birthDate)),
          patient.genderDto.genderName
        );
      }
      if (refClassName) {
        const refClasses = await speciesApi.getReferenceClassifications(patient.speciesDto.id);
        return refClasses?.find((refClass) => refClass.refClassName === refClassName);
      }
    }
  }
  // No match found
  return undefined;
};
