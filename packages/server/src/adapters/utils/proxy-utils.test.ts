import { replaceSearchParams, vpResponseInterceptor } from "./proxy-utils";
import type { Logger } from "winston";
import { responseInterceptor } from "http-proxy-middleware";
import type { IncomingMessage, ServerResponse } from "http";

vi.mock("http-proxy-middleware");

const mockInterceptor = vi.mocked(responseInterceptor);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("vpResponseInterceptor", () => {
  it("parses a buffer, invokes the handler and sets appropriate headers and status code", async () => {
    // User-provided handler of the parsed response
    const handler = vi.fn();
    const input = {
      test: "input-value",
    };
    const output = {
      test: "output-value",
    };
    // Pretend it modified the input
    handler.mockResolvedValue(output);

    // The actual response to the server, mocked out
    const mockServerResponse = {
      setHeader: vi.fn(),
      statusCode: 0,
      statusMessage: undefined,
    };

    // Invoke the HOF
    vpResponseInterceptor(handler, console as unknown as Logger);
    expect(mockInterceptor).toHaveBeenCalledTimes(1);
    // Pull out the actual function to test (it's wrapped by the responseInterceptor provided by http-proxy-middleware)
    const vpInterceptor = mockInterceptor.mock.calls[0]![0];

    await expect(
      vpInterceptor(
        Buffer.from(JSON.stringify(input)),
        {} as IncomingMessage,
        {} as IncomingMessage,
        mockServerResponse as unknown as ServerResponse
      )
    ).resolves.toEqual(JSON.stringify(output));

    expect(mockServerResponse.statusCode).toEqual(200);
    expect(mockServerResponse.statusMessage).toEqual("OK");
    expect(mockServerResponse.setHeader).toHaveBeenCalledWith("content-type", "application/json");
    expect(mockServerResponse.setHeader).toHaveBeenCalledWith("content-length", 23);
  });

  it("sets status code to 500 in the event of an error", async () => {
    // User-provided handler of the parsed response
    const handler = vi.fn();
    // Pretend it modified the input
    handler.mockRejectedValue(new Error("expected error"));

    // The actual response to the server, mocked out
    const mockServerResponse = {
      setHeader: vi.fn(),
      statusCode: 0,
      statusMessage: undefined,
    };

    // Invoke the HOF
    vpResponseInterceptor(handler, console as unknown as Logger);
    // Pull out the actual function to test (it's wrapped by the responseInterceptor provided by http-proxy-middleware)
    const vpInterceptor = mockInterceptor.mock.calls[0]![0];

    await expect(
      vpInterceptor(
        Buffer.from(JSON.stringify({})),
        {} as IncomingMessage,
        {} as IncomingMessage,
        mockServerResponse as unknown as ServerResponse
      )
    ).resolves.toEqual("");

    expect(mockServerResponse.setHeader).not.toHaveBeenCalled();
    expect(mockServerResponse.statusCode).toEqual(500);
    expect(mockServerResponse.statusMessage).toEqual("Internal Server Error");
  });
});

describe("replaceSearchParams", () => {
  it("updates the search param keys in a url", () => {
    const originalParams = {
      paramOne: "123",
      paramTwo: "hello there",
      paramThree: "999",
    };
    const originalUrl = new URL(`http://viewpoint.idexx.com?${new URLSearchParams(originalParams).toString()}`);

    replaceSearchParams(originalUrl, { paramOne: "newParamOne", paramTwo: "newParamTwo", paramThree: "newParamThree" });

    expect(originalUrl.searchParams.get("newParamOne")).toEqual(originalParams.paramOne);
    expect(originalUrl.searchParams.get("newParamTwo")).toEqual(originalParams.paramTwo);
    expect(originalUrl.searchParams.get("newParamThree")).toEqual(originalParams.paramThree);
    expect(originalUrl.searchParams.has("paramOne")).toBe(false);
    expect(originalUrl.searchParams.has("paramTwo")).toBe(false);
    expect(originalUrl.searchParams.has("paramThree")).toBe(false);
  });
});
