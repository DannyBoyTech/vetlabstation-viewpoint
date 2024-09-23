import { Configuration } from "../instrument-simulator";

let irisConfig: Configuration | undefined = undefined;
let ivlsConfig: Configuration | undefined = undefined;

export function setApiTargets(targets: {
  ivlsTarget: string;
  irisTarget: string;
}) {
  ivlsConfig = new Configuration({
    basePath: `http://${targets.ivlsTarget}/labstation-webapp/api`,
  });
  irisConfig = new Configuration({
    basePath: `http://${targets.irisTarget}/api`,
  });
}

export function getIrisConfig(): Configuration {
  if (!irisConfig) {
    throw new Error(`No configuration available for IRIS`);
  }
  return irisConfig;
}

export function getIvlsConfig(): Configuration {
  if (!ivlsConfig) {
    throw new Error(`No configuration available for IVLS`);
  }
  return ivlsConfig;
}

type ServiceMap = Map<new (config: Configuration) => unknown, unknown>;
const serviceMap: ServiceMap = new Map();

export function getIvlsApiService<T>(
  serviceConstructor: new (config: Configuration) => T
): T {
  return getApiService(serviceConstructor, getIvlsConfig()) as T;
}

export function getIrisApiService<T>(
  serviceConstructor: new (config: Configuration) => T
): T {
  return getApiService(serviceConstructor, getIrisConfig()) as T;
}

function getApiService(
  constructor: new (config: Configuration) => unknown,
  config: Configuration
): unknown {
  const existing = serviceMap.get(constructor);
  if (existing) {
    return existing;
  }
  const newItem = new constructor(config);
  serviceMap.set(constructor, newItem);
  return newItem;
}
