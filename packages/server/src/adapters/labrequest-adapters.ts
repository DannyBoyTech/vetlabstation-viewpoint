import {
  Configuration,
  ConnecteddeviceApi,
  DoctorApi,
  ExecuteLabRequestDto,
  ExecutePimsRequestDto,
  InstrumentRunApi,
  LabRequestApi,
  PatientDto,
  PimsApi,
  type PimsRequestDto,
  PimsRequestTypeEnum,
  type RawPimsRequestDto,
  RunningLabRequestDto,
  SpeciesApi,
  WorkRequestStatus,
} from "@viewpoint/api";
import type { Router } from "express";
import express from "express";
import type { Logger } from "winston";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getDefaultProxyOptions, nonProxyRequestHandler, ProxyError, vpResponseInterceptor } from "./utils/proxy-utils";
import { CancelRunInstruments, CancelRunStatus } from "./utils/mapping-data";
import { adaptRunningInstrumentRunDto } from "./utils/data-adapters";
import { toIvlsDob } from "./utils/date-utils";

// These classes (RunningLabRequestDto, RunningInstrumentRunDto) do not have the Jersey discriminators, so we need to adapt them manually
export const convertIvlsRunningLabRequest = (labRequestDto: RunningLabRequestDto): RunningLabRequestDto => ({
  ...labRequestDto,
  instrumentRunDtos: labRequestDto.instrumentRunDtos
    ?.map((run) => adaptRunningInstrumentRunDto(run))
    .sort((ir1, ir2) => {
      if (ir1.instrumentId === ir2.instrumentId) {
        return (ir1.runQueueId ?? ir1.displayOrder) - (ir2.runQueueId ?? ir2.displayOrder);
      }
      return ir1.displayOrder - ir2.displayOrder;
    }),
});

export function createLabRequestAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();

  const defaultOptions = getDefaultProxyOptions(logger, upstreamTarget);

  const config: Configuration = { basePath: new URL("labstation-webapp/api", upstreamTarget).toString() };
  const ivlsLabRequestApi = new LabRequestApi(config);
  const ivlsPimsApi = new PimsApi(config);
  const ivlsDoctorApi = new DoctorApi(config);
  const ivlsSpeciesApi = new SpeciesApi(config);
  const ivlsDeviceApi = new ConnecteddeviceApi(config);
  const ivlsRunApi = new InstrumentRunApi(config);

  router.get(
    "/labstation-webapp/api/labRequest/running",
    createProxyMiddleware("/", {
      ...defaultOptions,
      pathRewrite: (_path, req) => `${req.path}/extended`,
      onProxyRes: vpResponseInterceptor<RunningLabRequestDto[], RunningLabRequestDto[]>((reqs) => {
        return (reqs ?? [])
          .map((req) => convertIvlsRunningLabRequest(req))
          .sort((lr1, lr2) => lr2.requestDate - lr1.requestDate);
      }, logger),
    })
  );

  router.get(
    "/labstation-webapp/api/labRequest/:labRequestId",
    createProxyMiddleware("/", {
      ...defaultOptions,
      pathRewrite: (_path, req) =>
        `${req.path}/detailed${
          req.query ? `?${new URLSearchParams(req.query as Record<string, string>).toString()}` : ""
        }`,
      onProxyRes: vpResponseInterceptor((req) => req, logger),
    })
  );

  router.post("/labstation-webapp/api/labRequest", express.json(), async (req, res) => {
    try {
      const labRequest: ExecuteLabRequestDto = req.body;
      logger.info(`Received request to submit a lab request: ${JSON.stringify(labRequest)}`);
      if (labRequest.refClassId == null) {
        logger.warn(
          "No ref class provided for lab request -- proceeding with request, but results will not include reference ranges."
        );
      }
      const submitted = await (labRequest.pimsRequestUUID != null
        ? submitPending(labRequest, ivlsLabRequestApi, ivlsPimsApi, ivlsDoctorApi, ivlsSpeciesApi, logger)
        : submitNew(labRequest, ivlsLabRequestApi));
      res.json(submitted);
    } catch (err) {
      logger.error("Error submitting lab request", err);
      res.status(500).send();
    }
  });

  router.post("/labstation-webapp/api/instrumentRun/:runId/cancel", express.json(), async (req, res) => {
    const runId = Number(req.params.runId);

    logger.info(`received request to cancel run ${runId}`);
    // We need the run status because pending runs can always be cancelled, and we can't use stop waiting for that because it only
    // cancels in process actions
    const run = (await ivlsLabRequestApi.runningLabRequests())
      .flatMap((lr) => lr.instrumentRunDtos)
      .find((run) => run?.id === runId);
    if (!run) {
      res.status(404).send();
      return;
    }
    const { instrumentId, instrumentType, status } = run;

    if (CancelRunStatus.includes(status) || CancelRunInstruments.includes(instrumentType)) {
      logger.info(
        `run ${runId} for instrument ${instrumentType} in status ${status} supports cancelRun issuing cancelRun request`
      );
      await ivlsRunApi.cancelRun(runId);
    } else {
      logger.info(
        `run ${runId} for instrument ${instrumentType} in status ${status} does not support cancelRun, falling back to stopWaiting request`
      );
      await ivlsDeviceApi.stopWaiting(instrumentId);
    }
    res.status(202).send();
  });

  router.get(
    "/labstation-webapp/api/labRequest/:labRequestId/workRequestStatus",
    nonProxyRequestHandler<void, Promise<Record<number, WorkRequestStatus>>>(async (_requestBody, _logger, req) => {
      // get lab request
      const lrId = parseInt(req.params["labRequestId"] as string);
      if (isNaN(lrId)) {
        throw new ProxyError(`Invalid lab request ID ${req.params["labRequestId"]}`, 400);
      }

      const labRequest = (await ivlsLabRequestApi.runningLabRequests()).find((lr) => lr.id === lrId);
      const promises = await Promise.all(
        labRequest?.instrumentRunDtos?.map(async (ir) => {
          const status = await ivlsRunApi.getWorkRequestStatus(ir.id);
          return { status, id: ir.id };
        }) ?? []
      );
      const statuses = promises.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.id]: {
            runStartable: curr.status.runStartable ?? false,
            runCancellable: curr.status.runCancelable ?? false,
          },
        }),
        {} as Record<number, WorkRequestStatus>
      );
      return statuses;
    }, logger)
  );
}

export async function submitNew(
  labRequest: ExecuteLabRequestDto,
  ivlsLabRequestApi: LabRequestApi
): Promise<RunningLabRequestDto> {
  const { weight, requisitionId, ...restLabRequest } = labRequest;
  const response: RunningLabRequestDto = (await ivlsLabRequestApi.executeNew({
    ...restLabRequest,
    weight: weight ?? "",
    requisitionId: requisitionId ?? "",
  })) as RunningLabRequestDto;
  return convertIvlsRunningLabRequest(response);
}

function cleanPimsRequest(pimsRequest: PimsRequestDto): RawPimsRequestDto {
  const cleanedPimsRequest: RawPimsRequestDto = { ...pimsRequest } as RawPimsRequestDto;
  cleanedPimsRequest.patientDob = toIvlsDob(pimsRequest.patientDob);
  if (pimsRequest.patientSpecies?.speciesClass != null) {
    delete (cleanedPimsRequest as any).patientSpecies.speciesClass;
  }
  return cleanedPimsRequest as RawPimsRequestDto;
}

export async function submitPending(
  labRequest: ExecuteLabRequestDto,
  ivlsLabRequestApi: LabRequestApi,
  ivlsPimsApi: PimsApi,
  ivlsDoctorApi: DoctorApi,
  ivlsSpeciesApi: SpeciesApi,
  logger: Logger
): Promise<RunningLabRequestDto> {
  if (labRequest.pimsRequestDto != null) {
    // TODO - remove when IVLS provides endpoint for getting PIMS request by ID/UUID
    const pimsRequest = cleanPimsRequest(labRequest.pimsRequestDto);
    const matchingPatient = (await ivlsPimsApi.resolveMatchingExecutePimsRequest(pimsRequest.id))
      .patientDto as PatientDto;
    if (matchingPatient != null) {
      const matchingDoctor = (await ivlsDoctorApi.fetchAll()).find((doc) => doc.id === labRequest.doctorId);
      const matchingRefClass = (await ivlsSpeciesApi.getReferenceClassifications(matchingPatient.speciesDto.id)).find(
        (refClass) => refClass.id === labRequest.refClassId
      );
      if (labRequest.refClassId != null && matchingRefClass == null) {
        logger.warn(`Could not locate matching reference class with ID "${labRequest.refClassId}" for lab request`);
      }
      if (pimsRequest.pimsRequestType === PimsRequestTypeEnum.PENDING) {
        const request: ExecutePimsRequestDto = {
          patientDto: matchingPatient,
          weight: labRequest.weight ?? "",
          instrumentRunDtos: labRequest.instrumentRunDtos,
          testingReasons: labRequest.testingReasons ?? [],
          pimsRequestDto: pimsRequest,
          doctorDto: matchingDoctor,
          refClassDto: matchingRefClass,
        };
        (request as any)["@class"] = "com.idexx.labstation.core.dto.ExecutePimsRequestDto";
        const response = (await ivlsLabRequestApi.executePending(request)) as RunningLabRequestDto;
        return convertIvlsRunningLabRequest(response);
      } else if (pimsRequest.pimsRequestType === PimsRequestTypeEnum.CENSUS) {
        const request: ExecuteLabRequestDto = {
          pimsRequestUUID: pimsRequest.pimsRequestUUID,
          patientId: matchingPatient.id,
          refClassId: matchingRefClass?.id,
          requisitionId: pimsRequest.requisitionId ?? "",
          doctorId: matchingDoctor?.id,
          weight: labRequest.weight ?? "",
          instrumentRunDtos: labRequest.instrumentRunDtos,
          testingReasons: labRequest.testingReasons ?? [],
        };
        const response = (await ivlsLabRequestApi.executeNewFromCensus(request)) as RunningLabRequestDto;
        return convertIvlsRunningLabRequest(response);
      } else {
        throw new Error(`Invalid PIMS Request type: ${pimsRequest.pimsRequestType}`);
      }
    } else {
      throw new Error(`Could not locate patient match for PIMS Request ${labRequest.pimsRequestUUID}`);
    }
  } else {
    throw new Error(`Could not locate PIMS Request ${labRequest.pimsRequestUUID} to submit lab request`);
  }
}
