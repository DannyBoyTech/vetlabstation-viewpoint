import type { Request, Router } from "express";
import type { Logger } from "winston";
import type { QualityControlRunRecordDto, QualityControlRunRequestDto } from "@viewpoint/api";
import { vpRequestInterceptor, vpResponseInterceptor } from "./utils/proxy-utils";
import { createProxyMiddleware } from "http-proxy-middleware";
import express from "express";

export function createQcAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();

  const defaultOptions = () => ({
    logProvider: () => logger,
    target: upstreamTarget,
    selfHandleResponse: true,
  });

  // IVLS does not actually return the runs filtered by the QC ID. Do that filtering here manually.
  router.get(
    "/labstation-webapp/api/device/:instrumentId/runs",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      pathRewrite: (path, req) =>
        req.query["qualityControlId"] == null
          ? path.split("?")[0]!
          : `/labstation-webapp/api/device/${req.params["instrumentId"]}/${req.query["qualityControlId"]}/runs`,
      onProxyRes: vpResponseInterceptor<QualityControlRunRecordDto[], QualityControlRunRecordDto[]>(
        (runRecords, _log, _res, req) =>
          runRecords?.filter(
            (record) =>
              (req as Request).query["qualityControlId"] == null ||
              `${record.qualityControl?.id}` === (req as Request).query["qualityControlId"]
          ) ?? [],
        logger
      ),
    })
  );

  router.post(
    "/labstation-webapp/api/qualityControl",
    express.json(),
    createProxyMiddleware("/", {
      ...defaultOptions(),

      selfHandleResponse: false,

      onProxyReq: vpRequestInterceptor<QualityControlRunRequestDto, QualityControlRunRequestDto & { "@class": string }>(
        (runQcReq) => ({
          "@class": "com.idexx.labstation.core.dto.QualityControlRunRequestDto",
          ...runQcReq,
        }),
        logger
      ),
    })
  );
}
