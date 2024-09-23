import type { Router } from "express";
import type { Logger } from "winston";
import { createProxyMiddleware } from "http-proxy-middleware";
import { vpResponseInterceptor } from "./utils/proxy-utils";

export function createResourceAdapters(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();

  const defaultOptions = () => ({
    logProvider: () => logger,
    target: upstreamTarget,
    selfHandleResponse: true,
  });

  router.get(
    "/labstation-webapp/resources/*",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: vpResponseInterceptor<any, any>((body) => body, logger, {
        responseEncoding: "windows-1252",
      }),
    })
  );
}
