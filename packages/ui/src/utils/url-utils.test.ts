import { PdfViewerOptions, pdfViewerOpts, urlFragment } from "./url-utils";

describe("url-utils", () => {
  describe("urlFragment", () => {
    it("should return undefined if argument is undefined", () => {
      expect(urlFragment(undefined)).toBeUndefined();
    });

    it("should return undefined if argument is null", () => {
      expect(urlFragment(null)).toBeUndefined();
    });

    it("should return fragment from url with fragment", () => {
      const input = "relative/url?query=true#thisisafragment";

      expect(urlFragment(input)).toEqual("thisisafragment");
    });

    it("should return undefined from url with no fragment", () => {
      const input = "relative/url";

      expect(urlFragment(input)).toBeUndefined();
    });
  });

  describe("pdfViewerOpts", () => {
    test.each<{ input: PdfViewerOptions; expected: string }>([
      {
        input: {},
        expected: "",
      },
      {
        input: { toolbar: false, view: "FitH" },
        expected: "toolbar=0&view=FitH",
      },
      {
        input: { view: "FitH", toolbar: true },
        expected: "view=FitH&toolbar=1",
      },
      {
        input: { view: "Fit", toolbar: true, nameddest: "blag" },
        expected: "view=Fit&toolbar=1&nameddest=blag",
      },
      {
        input: { page: 2 },
        expected: "page=2",
      },
      {
        input: { zoom: 14, page: 5 },
        expected: "zoom=14&page=5",
      },
    ])("pdfViewerOpts($input) -> $expected", ({ input, expected }) => {
      expect(pdfViewerOpts(input)).toBe(expected);
    });
  });
});
