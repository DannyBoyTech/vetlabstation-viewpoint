import type { Router } from "express";
import axios from "axios";
import PDFMerger from "pdf-merger-js";
import type { Logger } from "winston";
import express from "express";
import { asyncHandler } from "../express-utils";

async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<Buffer> {
  const merger = new PDFMerger();

  for (const pdfBuffer of pdfBuffers) {
    await merger.add(pdfBuffer);
  }

  return await merger.saveAsBuffer();
}

function createReportAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  async function fetchLabReport(labRequestId: number): Promise<Buffer> {
    const res = await axios.get(`${upstreamReqUrl}labstation-webapp/api/report/labReport`, {
      timeout: 45_000,
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
      params: {
        labRequestId,
      },
    });
    return res.data;
  }

  async function fetchLabReportWithImageData(labRequestId: number, body: Record<string, string[]>): Promise<Buffer> {
    const res = await axios.post(`${upstreamReqUrl}labstation-webapp/api/report/labReportWithImageData`, body, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
      params: {
        labRequestId,
      },
    });
    return res.data;
  }

  async function fetchAcadiaQualityReport(body: any): Promise<Buffer> {
    const res = await axios.post(`${upstreamReqUrl}labstation-webapp/api/report/acadiaQualityReport`, body, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
    });
    return res.data;
  }

  async function fetchCatDxSmartQCReport(body: any): Promise<Buffer> {
    const res = await axios.post(`${upstreamReqUrl}labstation-webapp/api/report/catalystDxSmartQCReport`, body, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
    });
    return res.data;
  }

  async function fetchCatOneSmartQCReport(body: any): Promise<Buffer> {
    const res = await axios.post(`${upstreamReqUrl}labstation-webapp/api/report/catOneSmartQCReport`, body, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
    });
    return res.data;
  }

  router.get(
    "/labstation-webapp/api/report/labReport",
    asyncHandler(async (req, res) => {
      logger.debug(`fetch labreport`);
      const reqIdQueryVal = req.query["labRequestId"];

      logger.debug(`fetch labreport for labRequestId ${JSON.stringify(reqIdQueryVal)}`);

      let labRequestIds: number[] = [];

      if (typeof reqIdQueryVal === "string") {
        labRequestIds = reqIdQueryVal
          .split(",")
          .map(Number)
          .filter((it) => !isNaN(it));
      } else if (Array.isArray(reqIdQueryVal)) {
        labRequestIds = reqIdQueryVal.map(Number).filter((it) => !isNaN(it));
      }

      if (labRequestIds.length === 0) {
        res.status(404).send();
      } else {
        logger.debug(`fetching lab reports for labRequestIds=${JSON.stringify(labRequestIds)} concurrently`);
        const reports = await Promise.all(labRequestIds.map(fetchLabReport));
        logger.debug(`merging lab reports`);
        const mergedReports = await mergePdfs(reports);
        logger.debug(`lab reports merged successfully`);
        res.contentType("application/pdf").status(200).end(mergedReports);
      }
    })
  );

  router.post(
    "/labstation-webapp/api/report/labReportWithImageData",
    express.json({ limit: "10mb" }),
    asyncHandler(async (req, res) => {
      logger.debug(`fetch labreport with image data`);
      const reqIdQueryVal = req.query["labRequestId"];

      logger.debug(`fetch labreport with image data for labRequestId=${reqIdQueryVal}`);

      const report = await fetchLabReportWithImageData(Number(reqIdQueryVal), req.body);
      res.contentType("application/pdf").status(200).end(report);
    })
  );

  router.get(
    "/labstation-webapp/api/report/acadiaQualityReport",
    asyncHandler(async (req, res) => {
      const instrumentId = req.query["instrumentId"];
      const instrumentSerialNumber = req.query["instrumentSerialNumber"];
      const lotNumber = req.query["lotNumber"];
      const runIds = req.query["runIds"];

      const body = {
        instrumentId: parseInt(instrumentId as string),
        instrumentSerialNumber,
        lotNumber,
        "@class": "com.idexx.labstation.core.dto.report.AcadiaSmartQCReportRequest",
        runIds: (runIds as string)?.split(",")?.map(Number),
      };

      const report = await fetchAcadiaQualityReport(body);
      res.contentType("application/pdf").status(200).end(report);
    })
  );

  router.get(
    "/labstation-webapp/api/report/catalystDxSmartQCReport",
    asyncHandler(async (req, res) => {
      const instrumentId = req.query["instrumentId"];
      const instrumentSerialNumber = req.query["instrumentSerialNumber"];
      const runId = req.query["runId"];

      const body = {
        instrumentId: parseInt(instrumentId as string),
        instrumentSerialNumber,
        "@class": "com.idexx.labstation.core.dto.report.SmartQCReportRequest",
        runId: Number(runId),
      };

      const report = await fetchCatDxSmartQCReport(body);
      res.contentType("application/pdf").status(200).end(report);
    })
  );

  router.get(
    "/labstation-webapp/api/report/catOneSmartQCReport",
    asyncHandler(async (req, res) => {
      const instrumentId = req.query["instrumentId"];
      const instrumentSerialNumber = req.query["instrumentSerialNumber"];
      const runId = req.query["runId"];

      const body = {
        instrumentId: parseInt(instrumentId as string),
        instrumentSerialNumber,
        "@class": "com.idexx.labstation.core.dto.report.SmartQCReportRequest",
        runId: Number(runId),
      };

      const report = await fetchCatOneSmartQCReport(body);
      res.contentType("application/pdf").status(200).end(report);
    })
  );

  router.get(
    "/labstation-webapp/api/report/crimsonQualityReport",
    asyncHandler(async (req, res) => {
      const urlPath = upstreamReqUrl + req.path.replace(/^\/+/, "");

      logger.debug(`fetching procyte dx qc report for ${JSON.stringify(req.query)}`);

      const { status, headers, data } = await axios.get(urlPath, {
        params: req.query,
        headers: { Accept: "application/pdf" },
        responseType: "arraybuffer",
      });
      res.status(status);
      res.set(headers);
      res.contentType("application/pdf").status(200).end(data);
    })
  );

  router.get(
    "/labstation-webapp/api/report/urisedQualityReport",
    asyncHandler(async (req, res) => {
      const urlPath = upstreamReqUrl + req.path.replace(/^\/+/, "");

      logger.debug(`fetching sediVue dx qc report for ${JSON.stringify(req.query)}`);

      const { status, headers, data } = await axios.get(urlPath, {
        params: req.query,
        headers: { Accept: "application/pdf" },
        responseType: "arraybuffer",
      });
      res.status(status);
      res.set(headers);
      res.contentType("application/pdf").status(200).end(data);
    })
  );

  router.get(
    "/labstation-webapp/api/report/snapLogReport",
    asyncHandler(async (req, res) => {
      const urlPath = upstreamReqUrl + req.path.replace(/^\/+/, "");

      logger.debug(`fetching snap log report for ${JSON.stringify(req.query)}`);

      const { status, headers, data } = await axios.get(urlPath, {
        params: req.query,
        headers: { Accept: "application/pdf" },
        responseType: "arraybuffer",
      });
      res.status(status);
      res.set(headers);
      res.contentType("application/pdf").status(200).end(data);
    })
  );

  router.get(
    "/labstation-webapp/api/report/snapSummaryReport",
    asyncHandler(async (req, res) => {
      const urlPath = upstreamReqUrl + req.path.replace(/^\/+/, "");

      logger.debug(`fetching snap summary report for ${JSON.stringify(req.query)}`);

      const { status, headers, data } = await axios.get(urlPath, {
        params: req.query,
        headers: { Accept: "application/pdf" },
        responseType: "arraybuffer",
      });
      res.status(status);
      res.set(headers);
      res.contentType("application/pdf").status(200).end(data);
    })
  );
}

export { createReportAdapterProxy };
