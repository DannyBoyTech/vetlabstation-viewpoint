const FALSY_ENV_VALS = ["false", "0", "no"];

export function envBool(val?: string) {
  return val != null && !FALSY_ENV_VALS.includes(val.trim().toLowerCase());
}
