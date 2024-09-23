import { envBool } from "./env-bool";

const HEAP_ENV_ID = {
  production: "1599786829",
  development: "1243036980",
} as const;

const NO_HEAP_KEY = "VP_NO_HEAP";
const HEAP_ENV_KEY = "VP_HEAP_ENV";

const PROD_OS_USER = "VetStation";

export function osUser(env: typeof process.env) {
  return env.USERNAME || env.USER;
}

/**
 * Returns a heap environment id for analytics bucketing
 *
 * @param processEnv
 * @returns a heap id to use
 */
export function heapEnvId(processEnv: typeof process.env): string | undefined {
  //if heap should be disabled, return undefined
  if (envBool(processEnv[NO_HEAP_KEY])) {
    return undefined;
  }

  //if a heap id is in the environment, use that
  const providedEnvId = processEnv[HEAP_ENV_KEY];
  if (providedEnvId) {
    return providedEnvId;
  }

  //otherwise, guess where to send analytics
  //what we really want is an indicator of whether this is 'in the field' for a real customer.
  //we do not currently have something perfect like that (IVLS user activation, for instance)
  //we use the OS username because it at least we know it is running on an IVLS machine (devs
  //are unlikely to be named VetStation)
  const envId =
    osUser(processEnv) === PROD_OS_USER
      ? HEAP_ENV_ID.production
      : HEAP_ENV_ID.development;

  return envId;
}
