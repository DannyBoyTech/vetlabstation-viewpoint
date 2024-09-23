import { MockedFunction, MockedObject, vi } from "vitest";
import { fetch as _fetch } from "./fetch-utils";
import { rest } from "msw";
import { server } from "../../test-utils/mock-server";

describe("fetch-utils", () => {
  describe("fetch", () => {
    describe("delegation behavior", () => {
      beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        vi.stubGlobal("AbortController", vi.fn());
      });

      afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
      });

      let delegate: MockedFunction<typeof window.fetch>;

      beforeEach(() => {
        delegate = vi.mocked(window.fetch);

        delegate.mockImplementation(async () => {
          return { ok: true } as Response;
        });
      });

      it("should pass only standard options to fetch delegate", async () => {
        await _fetch("", {
          timeoutMillis: 234,
          method: "GET",
          headers: { one: "two" },
        });

        expect(delegate).toHaveBeenCalledTimes(1);

        expect(delegate.mock.lastCall?.[1]).toEqual(
          expect.objectContaining({ method: "GET", headers: { one: "two" } })
        );

        expect(delegate.mock.lastCall?.[1]).toEqual(
          expect.not.objectContaining({ timeoutMillis: 234 })
        );
      });

      it("should pass url to fetch delegate", async () => {
        await _fetch("https://my:3434/url");

        expect(delegate).toHaveBeenCalledTimes(1);
        expect(delegate.mock.lastCall?.[0]).toEqual("https://my:3434/url");
      });

      it("should throw on non-ok response by default", async () => {
        delegate.mockReset();
        delegate.mockImplementation(async () => {
          return { ok: false } as Response;
        });

        expect(_fetch("some/failing/req")).rejects.toThrowError();
      });

      it("should not throw on non-ok response if throwNotOk is false", async () => {
        delegate.mockReset();
        delegate.mockImplementation(async () => {
          return { ok: false } as Response;
        });

        expect(
          _fetch("some/failing/req", { throwNotOk: false })
        ).resolves.toEqual(expect.objectContaining({ ok: false }));
      });
    });

    describe("timeout behavior", () => {
      beforeEach(() => {
        server.use(
          rest.post(
            "http://example.com:1234/onesecond/delay",
            (_req, res, ctx) => {
              return res(ctx.delay(1_000), ctx.json({ data: 1234 }));
            }
          )
        );
      });

      afterEach(() => {
        server.resetHandlers();
      });

      // TODO - Native Node18 fetch function does not seem to work with our custom timeout functionality
      it.skip("should throw on timeout if set, and exceeded", async () => {
        await expect(
          _fetch("http://example.com:1234/onesecond/delay", {
            method: "POST",
            timeoutMillis: 200,
          })
        ).rejects.toThrow();
      });
    });
  });
});
