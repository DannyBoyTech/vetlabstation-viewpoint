const CORP_HEADER_KEY = "cross-origin-resource-policy";

/**
 * Forces responses to requests matching the specified URL to include the
 * specified 'Cross-Origin-Resource-Policy' header.
 *
 * @param webRequest
 */
export function forceCorpHeader(
  urlPattern: RegExp,
  policy: "cross-origin" | "same-origin" | "same-site",
  webRequest: Electron.WebRequest
) {
  webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    if (urlPattern.test(details.url)) {
      const corpHeaderKeys: string[] = ({} = Object.keys(
        details.responseHeaders
      ).filter((it) => it.toLowerCase() === CORP_HEADER_KEY));

      corpHeaderKeys?.forEach((key) => delete responseHeaders[key]);
      responseHeaders[CORP_HEADER_KEY] = [policy];
    }

    callback({
      responseHeaders: responseHeaders,
    });
  });
}
