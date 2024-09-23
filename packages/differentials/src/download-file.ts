/**
 * Download the given file URL retrying up to limit
 */
export async function downloadFile(
  url: URL,
  options?: { maxTries?: number; timeoutMillis?: number }
): Promise<Buffer> {
  const maxTries = options?.maxTries ?? 1;

  const abortCtrl = new AbortController();
  const timeoutObj =
    options?.timeoutMillis == null
      ? undefined
      : setTimeout(() => {
          abortCtrl.abort();
          throw Error(
            `download timed out (after ${options.timeoutMillis} milliseconds)`
          );
        }, options.timeoutMillis);
  let finalError = null;
  try {
    for (let tries = 0; tries < maxTries; tries += 1) {
      try {
        const response = await fetch(url, { signal: abortCtrl.signal });
        if (!response.ok) {
          throw new Error(
            `Failed to download file: ${response.status} ${response.statusText}`
          );
        }
        return Buffer.from(await response.arrayBuffer())!;
      } catch (e) {
        finalError = e;
      }
    }

    throw finalError;
  } finally {
    if (timeoutObj) clearTimeout(timeoutObj);
  }
}
