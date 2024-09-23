import { SettingTypeEnum } from "@viewpoint/api";

export const getRandomValue = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface WaitFor {
  timeoutMs?: number;
  intervalMs?: number;
  throwOnFailure?: boolean;
}

export async function waitFor<T = void>(
  runner: () => Promise<T>,
  args: WaitFor = { timeoutMs: 30000, intervalMs: 500, throwOnFailure: true }
) {
  let retVal: T | undefined = undefined;
  let lastError: any = undefined;
  const start = Date.now();
  while (
    typeof retVal === "undefined" &&
    Date.now() < start + (args.timeoutMs ?? 30000)
  ) {
    try {
      retVal = await runner();
      if (typeof retVal === "undefined") {
        await wait(args.intervalMs ?? 500);
      }
    } catch (err) {
      lastError = err;
    }
  }
  if ((lastError || typeof retVal === "undefined") && args.throwOnFailure) {
    throw lastError ?? new Error(`Timed out waiting for response`);
  }
  return retVal;
}

export const getDefaultSettings = () => ({
  [SettingTypeEnum.DISPLAY_PATIENT_WEIGHT]: "true",
  [SettingTypeEnum.DISPLAY_PATIENT_GENDER]: "true",
  [SettingTypeEnum.DISPLAY_PATIENT_BREED]: "true",
  [SettingTypeEnum.REQUIRE_REQUISITION_ID]: "false",
  [SettingTypeEnum.DISPLAY_REQUISITION_ID]: "true",
  [SettingTypeEnum.DISPLAY_DOCTOR_NAME]: "true",
  [SettingTypeEnum.WEIGHT_UNIT_TYPE]: "POUNDS",
});

/**
 * Returns a regex pattern string that would match the vite asset generated for the given filename.
 *
 * This function returns a pattern that is really most useful when anchored to
 * the beginning and end of a surrounging pattern, so you probably don't want
 * to use it directly.
 *
 * @param filename
 * @returns pattern string
 * @see viteAsset
 * @see viteAssetCssUrl
 */
function viteAssetPatternSrc(filename: string) {
  const lastDotIdx = filename.lastIndexOf(".");

  let pattern = `data:.*?;base64,.*?|.*?${filename}`;

  if (lastDotIdx > 0 && lastDotIdx < filename.length) {
    const nameMinusExt = filename.slice(0, lastDotIdx);
    const ext = filename.slice(lastDotIdx + 1);

    pattern = `data:.*?;base64,.*?|.*?${nameMinusExt}(.{9})?.${ext}`;
  }

  return pattern;
}

/**
 * Expects a filename without a leading path, and returns a regular expression
 * that will match a vite asset before and after vite processes it.
 *
 * This can be useful for matching src attributes in tests.
 */
export function viteAsset(filename: string) {
  return new RegExp(`^${viteAssetPatternSrc(filename)}$`);
}

/**
 *
 * Expects a filename without a leading path, and returns a regular expression
 * that will match a CSS url pointing to a vite asset before and after vite processes it.
 *
 * This can be useful for matching CSS `url(...)` attributes in tests.
 */
export function viteAssetCssUrl(filename: string) {
  return new RegExp(
    `url[(]\s*["']?${viteAssetPatternSrc(filename)}['"]?\s*[)]`
  );
}
