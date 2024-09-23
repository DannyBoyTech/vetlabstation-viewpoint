import {
  Configuration,
  ConnecteddeviceApi,
  DefaultRunConfigs,
  DilutionTypeEnum,
  InstrumentDto,
  InstrumentRunConfigurationDto,
  InstrumentSampleTypes,
  InstrumentStatusDto,
  InstrumentType,
  InstrumentTypeApi,
  RunConfiguration,
  SnapDeviceApi,
  SpeciesApi,
  TestProtocolEnum,
} from "@viewpoint/api";
import type { Request, Router } from "express";
import type { Logger } from "winston";
import { createProxyMiddleware } from "http-proxy-middleware";
import { nonProxyRequestHandler, ProxyError, vpResponseInterceptor } from "./utils/proxy-utils";
import { convertSampleTypes } from "./species-adapters";
import { adaptSampleTypeSupportDto } from "./utils/data-adapters";
import { DILUTION_CONFIGS, RUNNABLE_INSTRUMENT_TYPES } from "./utils/mapping-data";

/**
 * Returns a map of value to frequency of occurrence in the given array
 * argument.
 * @param values array of values of same type
 * @returns map of value to frequency of occurrence
 */
function frequencies<T>(values: T[]): Map<T, bigint> {
  return values?.reduce((freqs, v) => {
    const freq = freqs.get(v);
    freqs.set(v, (freq ?? 0n) + 1n);
    return freqs;
  }, new Map<T, bigint>());
}

export const pluralInstrumentTypes = (statuses: InstrumentDto[]): Set<InstrumentType> => {
  const pluralTypes = [...frequencies(statuses.map((s) => s.instrumentType))]
    .filter(([_, freq]) => freq > 1)
    .reduce<Set<InstrumentType>>((set, [t]) => {
      set.add(t);
      return set;
    }, new Set<InstrumentType>());

  return pluralTypes;
};

export const removeDisplayNumberIfUniqueWithinType = (statuses: InstrumentStatusDto[]): InstrumentStatusDto[] => {
  const pluralTypes = pluralInstrumentTypes(statuses.map((s) => s.instrument));

  const newStatuses = statuses.map((s) => {
    let maybeNew = s;
    if (!pluralTypes.has(s.instrument.instrumentType)) {
      const newStatus = { ...s };
      delete newStatus.instrument.displayNumber;
      maybeNew = newStatus;
    }
    return maybeNew;
  });
  return newStatuses;
};

export function getDefaultRunConfig(
  instrument: InstrumentDto,
  sampleTypes: InstrumentSampleTypes | undefined,
  refClassId: number
): InstrumentRunConfigurationDto | undefined {
  if (instrument.supportedRunConfigurations.length > 0) {
    const config: InstrumentRunConfigurationDto = {};
    // VetTest requires dilution to be specified, but you can NOT specify dilution type
    if (instrument.supportedRunConfigurations.includes(RunConfiguration.DILUTION)) {
      if (config.dilution == null) {
        config.dilution = 1;
      }
    }
    // SediVue requires both dilution and dilution type to be specified
    if (
      instrument.supportedRunConfigurations.includes(RunConfiguration.UPC) ||
      instrument.instrumentType === InstrumentType.SediVueDx
    ) {
      if (config.dilution == null) {
        config.dilution = 1;
      }
      if (!config.dilutionType) {
        config.dilutionType = DilutionTypeEnum.NOTDEFINED;
      }
    }
    if (instrument.supportedRunConfigurations.includes(RunConfiguration.BACTERIA_REFLEX)) {
      if (!config.testProtocol) {
        config.testProtocol = TestProtocolEnum.FULLANALYSIS;
      }
    }
    // Populate default sample type if available
    if (
      typeof sampleTypes !== "undefined" &&
      typeof refClassId !== "undefined" &&
      instrument.supportedRunConfigurations.includes(RunConfiguration.SAMPLE_TYPE)
    ) {
      if (config.sampleTypeId == null) {
        config.sampleTypeId = (sampleTypes[refClassId] ?? sampleTypes.unknown)?.find((st) => st.default)?.id;
      }
    }
    return config;
  }
  return undefined;
}

const PIMS_INSTRUMENT_TYPES: readonly InstrumentType[] = [
  InstrumentType.InterlinkPims,
  InstrumentType.SerialPims,
] as const;

/**
 * Disables instrument screen support for PIMs.
 *
 * This might be better set by the ivls server, but we have to coexist w/
 * on-market client for now.
 *
 * @param status
 * @returns copy of status with pims instrument screen support disabled
 */
function disablePimsInstrumentScreenSupport(status: InstrumentStatusDto): InstrumentStatusDto {
  if (!PIMS_INSTRUMENT_TYPES.includes(status?.instrument.instrumentType)) return status;

  const instrument: InstrumentDto = { ...status.instrument, supportsInstrumentScreen: false };
  return { ...status, instrument };
}

export function createInstrumentAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();
  const config: Configuration = { basePath: new URL("labstation-webapp/api", upstreamTarget).toString() };

  const instrumentTypeApi = new InstrumentTypeApi(config);
  const snapDeviceApi = new SnapDeviceApi(config);
  const speciesApi = new SpeciesApi(config);
  const connectedDeviceApi = new ConnecteddeviceApi(config);

  const defaultOptions = () => ({
    logProvider: () => logger,
    target: upstreamTarget,
    selfHandleResponse: true,
  });

  // Get just the LaserCyte devices -- these are filtered out of the normal
  // instrument status requests, as LaserCyte is not supported in ViewPoint.
  // This endpoint can be used to determine whether a customer has a LaserCyte
  // so that ViewPoint can't take appropriate action (notify, flip back to FX client, etc.)
  router.get(
    "/labstation-webapp/api/device/laserCyte",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      pathRewrite: () => "/labstation-webapp/api/device/status",
      onProxyRes: vpResponseInterceptor<InstrumentStatusDto[], InstrumentStatusDto[]>(
        (responseBody, _logger) =>
          responseBody?.filter((is) =>
            [InstrumentType.LaserCyte, InstrumentType.LaserCyteDx].includes(is.instrument.instrumentType)
          ) ?? [],
        logger
      ),
    })
  );

  router.get(
    "/labstation-webapp/api/device/status",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: vpResponseInterceptor<InstrumentStatusDto[], InstrumentStatusDto[]>(
        async (responseBody, _logger, _proxyResponse, request) => {
          const expressRequest = request as Request;
          let instruments: InstrumentStatusDto[] = responseBody ?? [];
          if (expressRequest.query["speciesId"]) {
            const { speciesId: speciesIdParam } = expressRequest.query;
            const speciesId = parseInt(speciesIdParam as string);
            if (Number.isNaN(speciesId)) {
              throw new ProxyError(`invalid speciesId ${speciesIdParam}`, 400, `invalid speciesId ${speciesIdParam}`);
            }
            const validTypesPromise = instrumentTypeApi.getTypesBySpecies(speciesId);
            const allSnapsPromise = snapDeviceApi.getSnapDevices(speciesId);

            // For each instrument, we also have to check if the SW version the instrument is on supports the species in question
            const swSupportedPromises: Promise<{ instrumentId: number; swSupported: boolean }>[] = instruments
              .filter((is) => RUNNABLE_INSTRUMENT_TYPES.includes(is.instrument.instrumentType))
              .map(async (instrument) => ({
                instrumentId: instrument.instrument.id,
                swSupported: await instrumentTypeApi.softwareSupportsSpecies(
                  instrument.instrument.instrumentType,
                  speciesId,
                  instrument.instrument.softwareVersion
                ),
              }));

            // Map all these requests to a collection of promises and execute concurrently so it doesn't take forever
            const [validTypes, supportedSnaps, ...swSupportedTypesResp] = await Promise.all([
              validTypesPromise,
              allSnapsPromise,
              ...swSupportedPromises,
            ]);
            const swSupportedTypes = swSupportedTypesResp
              .filter((resp) => resp.swSupported)
              .map((resp) => resp.instrumentId);

            instruments = instruments.filter(
              ({ instrument }) =>
                // Always include SNAP if there are SNAP devices available for this species
                (instrument.instrumentType === InstrumentType.SNAP && supportedSnaps.length > 0) ||
                // Instrument must be runnable (excludes PIMS, etc.)
                (instrument.runnable &&
                  // Instrument must be applicable to the species
                  validTypes.includes(instrument.instrumentType) &&
                  // Instrument's SW version must support this species
                  swSupportedTypes.includes(instrument.id))
            );
          }
          return removeDisplayNumberIfUniqueWithinType(
            instruments.map(disablePimsInstrumentScreenSupport).filter(
              (is) =>
                // Don't show LaserCyte to customers until it is supported
                ![InstrumentType.LaserCyte, InstrumentType.LaserCyteDx].includes(is.instrument.instrumentType)
            )
          );
        },
        logger
      ),
    })
  );

  router.get(
    "/labstation-webapp/api/device/runConfigs",
    nonProxyRequestHandler(async (_body, _logger, req) => {
      const speciesId: number = parseInt(req.query["speciesId"] as string);
      const refClassId: number = parseInt(req.query["refClassId"] as string);

      if (Number.isNaN(speciesId)) {
        throw new ProxyError(`invalid speciesId: ${speciesId}`, 400);
      }

      const getSampleTypes = async () =>
        convertSampleTypes((await speciesApi.getSampleTypes(speciesId)).map(adaptSampleTypeSupportDto));
      const getInstruments = async () => await connectedDeviceApi.fetchConnectedDeviceStatuses();

      const [availableSampleTypes, availableInstruments] = await Promise.all([getSampleTypes(), getInstruments()]);
      return availableInstruments?.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.instrument.instrumentSerialNumber]: getDefaultRunConfig(
            curr.instrument,
            availableSampleTypes?.[curr.instrument.instrumentType as unknown as InstrumentType],
            refClassId
          ),
        }),
        {} as DefaultRunConfigs
      );
    }, logger)
  );

  router.get("/labstation-webapp/api/device/dilutionConfigs", async (_req, res) => {
    res.json(DILUTION_CONFIGS);
  });
}
