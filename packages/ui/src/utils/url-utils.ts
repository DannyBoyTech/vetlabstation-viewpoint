/**
 * Returns the fragment (a.k.a. hash) portion of the given URL string
 *
 * @param url
 * @returns
 */
export function urlFragment(
  url?: string | null | undefined
): string | undefined {
  if (url == null) return undefined;

  const urlFragmentMatch = url?.match(/#(.*?)$/);
  return urlFragmentMatch?.[1];
}

export const Views = {
  FIT_VERTICAL: "FitV",
  FIT_HORIZONTAL: "FitH",
  FIT_BOTH: "Fit",
} as const;
export type View = (typeof Views)[keyof typeof Views];

export interface PdfViewerOptions {
  toolbar?: boolean;
  view?: View;
  zoom?: number;
  page?: number;
  nameddest?: string;
}

/**
 * Returns a URL fragment that can control how PDFs are rendered in
 * common browsers (like Chromium).
 *
 * @param options user supplied pdf view options
 * @returns a url fragment representing those options
 */
export function pdfViewerOpts(options: PdfViewerOptions) {
  return Object.entries(options)
    .map((entry) =>
      entry[0] === "toolbar" ? [entry[0], entry[1] ? 1 : 0] : entry
    )
    .map((entry) => `${entry[0]}=${entry[1]}`)
    .join("&");
}
