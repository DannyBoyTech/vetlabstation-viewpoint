import type { Router } from "express";
import type { Request } from "express";
import type { Logger } from "winston";
import type { IncomingMessage } from "http";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import path from "path";
import { vpResponseInterceptor } from "./utils/proxy-utils";
import type { DotPlotNodeDataResponse } from "@viewpoint/api";

const VP_IMAGE_API_ROOT = "/labstation-webapp/api/_images";
const JACKALOPE_API_ROOT = "/api";

export function createJackalopeAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const defaultOptions: Options = {
    target: upstreamReqUrl.toString(),
    logProvider: () => logger,
    headers: {},
    // Alter proxy URL back to Jackalope API path
    pathRewrite: (path) => path.replace(VP_IMAGE_API_ROOT, JACKALOPE_API_ROOT),
    selfHandleResponse: true,
  };

  const imageDataMiddleware = createProxyMiddleware("/", {
    ...defaultOptions,
    onProxyRes: vpResponseInterceptor<DotPlotNodeDataResponse[], DotPlotNodeDataResponse[]>(
      (response, _logger, _proxyResponse, request) =>
        response?.map((metadata) => ({
          ...metadata,
          imageUrl: getImageProxyUrl(metadata.imageUrl, request, false),
        })) ?? [],
      logger
    ),
  });

  router.get(`${VP_IMAGE_API_ROOT}/dotPlot/run/:runUuid/image`, imageDataMiddleware);

  router.use(
    VP_IMAGE_API_ROOT,
    createProxyMiddleware("/", {
      ...defaultOptions,
      selfHandleResponse: false,
    })
  );
}

export function getImageProxyUrl(imageUrl: string, request: IncomingMessage, includeDimensions: boolean): string {
  const params = (request as Request).query;
  const localImageUrl = new URL(imageUrl);
  if (includeDimensions && params["thumbnailWidth"]) {
    localImageUrl.searchParams.set("width", params["thumbnailWidth"] as string);
  }
  if (includeDimensions && params["thumbnailHeight"]) {
    localImageUrl.searchParams.set("height", params["thumbnailHeight"] as string);
  }
  // Alter URL so that it is relative and targeting this API (instead of the Jackalope API, which will cause CORS issues)
  return `/${path.relative(localImageUrl.origin, localImageUrl.toString())}`.replace(
    JACKALOPE_API_ROOT,
    VP_IMAGE_API_ROOT
  );
}
