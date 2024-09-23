import type { PimsRequestDto } from "@viewpoint/api";
import type { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Logger } from "winston";
import { getDefaultProxyOptions, vpResponseInterceptor } from "./utils/proxy-utils";

export function createPimsAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();

  const defaultOptions = getDefaultProxyOptions(logger, upstreamTarget);

  router.get(
    "/labstation-webapp/api/pims/pending",
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<PimsRequestDto[], PimsRequestDto[]>(
        (resp) => (resp ? resp.sort((pr1, pr2) => pr2.dateRequestedUtc - pr1.dateRequestedUtc) : []),
        logger
      ),
    })
  );

  router.get(
    "/labstation-webapp/api/pims/census",
    createProxyMiddleware("/", {
      ...defaultOptions,
      onProxyRes: vpResponseInterceptor<PimsRequestDto[], PimsRequestDto[]>(
        (resp) =>
          resp
            ? resp
                .sort((pr1, pr2) => pr2.dateRequestedUtc - pr1.dateRequestedUtc)
                .map((pr) => ({
                  ...pr,
                  requisitionId: undefined,
                }))
            : [],
        logger
      ),
    })
  );
}
