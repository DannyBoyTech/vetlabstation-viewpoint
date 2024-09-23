import {
  AssayDto,
  AssayTypeIdentificationRequest,
  AssayTypeIdentificationRequestDto,
  CytologyImageDto,
  ManualUaResultDto,
  ManualUAResults,
  SpeciesDto,
  UriSedImageDto,
  UserInputOption,
  UserInputRequest,
  UserInputRequestDto,
  UserInputRequestSpecies,
  UserInputRequestTypes,
  WorkRequestStatus,
  WorkRequestStatusDto,
} from "@viewpoint/api";
import type { Router } from "express";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Logger } from "winston";
import { convertMuaResults } from "./utils/mua-converters";
import { vpRequestInterceptor, VpResponseHandler, vpResponseInterceptor } from "./utils/proxy-utils";
import { getImageProxyUrl } from "./jackalope-adapters";

function toOption(dto: AssayDto): UserInputOption {
  if (!dto.id) throw new Error("assay dto did not provide id");

  return {
    id: dto.id,
    key: `Assay.ListName.${dto.assayIdentityName}`,
  };
}

function toUserInputRequestSpecies(dto: SpeciesDto): UserInputRequestSpecies {
  return {
    id: dto.id,
    key: `Species.${dto.speciesName.replaceAll(" ", "_")}`,
    name: dto.speciesName,
  };
}

const UserInputRequestDtoDescriminators = {
  AssayTypeIdentificationRequest: ".AssayTypeIdentificationRequestDto",
} as const;

type UserInputRequestDtoDescriminator =
  (typeof UserInputRequestDtoDescriminators)[keyof typeof UserInputRequestDtoDescriminators];

function isUserInputRequestDtoDescriminator(obj: unknown): obj is UserInputRequestDtoDescriminator {
  if (obj == null || typeof obj !== "string") return false;

  return Object.values<string>(UserInputRequestDtoDescriminators).includes(obj);
}

function toAssayTypeIdentificationRequest(dto: AssayTypeIdentificationRequestDto): AssayTypeIdentificationRequest {
  return {
    categoryKey: dto.assayCategoryKey,
    instrumentResultId: dto.instrumentResultId,
    instrumentRunId: dto.instrumentRunId,
    labRequestId: dto.labRequestId,
    patientName: dto.patientName,
    species: dto.speciesDto ? toUserInputRequestSpecies(dto.speciesDto) : dto.speciesDto,
    type: UserInputRequestTypes.AssayTypeIdentificationRequest,
    options: (dto.assayOptions ?? []).map(toOption),
  };
}

const converterForDescriminator: Partial<
  Record<UserInputRequestDtoDescriminator, (dto: UserInputRequestDto) => UserInputRequest>
> = {
  ".AssayTypeIdentificationRequestDto": toAssayTypeIdentificationRequest,
};

function toUserInputRequest(dto: UserInputRequestDto): UserInputRequest {
  const descriminator = dto["@c"];
  if (isUserInputRequestDtoDescriminator(descriminator)) {
    const converter = converterForDescriminator[descriminator];
    if (converter) {
      return converter(dto);
    }
  }
  throw new Error("unable to convert input request");
}

const userInputRequestsHandler: VpResponseHandler<UserInputRequestDto[], UserInputRequest[]> = async (
  responseBody,
  _logger,
  proxyRes
) => {
  if (proxyRes.statusCode === 200 && responseBody) {
    return responseBody.map(toUserInputRequest);
  } else if (proxyRes.statusCode === 204) {
    return [];
  }
  throw new Error("unable to convert upstream response");
};

function toWorkRequestStatus(dto: WorkRequestStatusDto): WorkRequestStatus {
  return {
    runStartable: dto.runStartable ?? false,
    runCancellable: dto.runCancelable ?? false,
  };
}

const workRequestStatusHandler: VpResponseHandler<WorkRequestStatusDto, WorkRequestStatus> = (
  responseBody,
  _logger,
  proxyRes
) => {
  if (proxyRes.statusCode === 200 && responseBody) {
    return toWorkRequestStatus(responseBody);
  }
  throw new Error("unable to convert upstream response");
};

function createInstrumentRunAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();

  const defaultOptions = {
    logProvider: () => logger,
    target: upstreamTarget,
    selfHandleResponse: true,
  };

  router.get(
    "/labstation-webapp/api/instrumentRun/:instrumentRunId/userInputRequests",
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<UserInputRequestDto[], UserInputRequest[]>(userInputRequestsHandler, logger),
    })
  );

  router.get(
    "/labstation-webapp/api/instrumentRun/:instrumentRunId/workRequestStatus",
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<WorkRequestStatusDto, WorkRequestStatus>(workRequestStatusHandler, logger),
    })
  );

  router.post(
    "/labstation-webapp/api/instrumentRun/:runId/results/mua",
    express.json(),
    createProxyMiddleware("/", {
      ...defaultOptions,
      selfHandleResponse: false,
      onProxyReq: vpRequestInterceptor<ManualUAResults, ManualUaResultDto>(convertMuaResults, logger),
    })
  );

  router.put(
    "/labstation-webapp/api/instrumentRun/:runId/results/mua",
    express.json(),
    createProxyMiddleware("/", {
      ...defaultOptions,
      selfHandleResponse: false,
      onProxyReq: vpRequestInterceptor<ManualUAResults, ManualUaResultDto>(convertMuaResults, logger),
    })
  );

  router.get(
    "/labstation-webapp/api/sediVue/instrumentRun/:runId/images",
    express.json(),
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<UriSedImageDto[], UriSedImageDto[]>(
        (response, _logger, _proxyResponse, request) =>
          response?.map((imageData) => ({
            ...imageData,
            imageUrl: getImageProxyUrl(imageData.imageUrl, request, false),
            thumbnailImageUrl: getImageProxyUrl(imageData.thumbnailImageUrl, request, true),
          })) ?? [],
        logger
      ),
    })
  );

  router.get(
    "/labstation-webapp/api/theia/instrumentRuns/:runId/images",
    express.json(),
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<CytologyImageDto[], CytologyImageDto[]>(
        (response, _logger, _proxyResponse, request) =>
          response?.map((imageData) => ({
            ...imageData,
            imageUrl: getImageProxyUrl(imageData.imageUrl, request, false),
            thumbnailImageUrl: getImageProxyUrl(imageData.thumbnailImageUrl, request, true),
          })) ?? [],
        logger
      ),
    })
  );
}

export { isUserInputRequestDtoDescriminator, createInstrumentRunAdapterProxy };
