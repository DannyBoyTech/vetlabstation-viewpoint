import axios from "axios";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Router } from "express";
import { getLogger } from "./logger";
import { createInstrumentAdapterProxy } from "./adapters/instrument-adapters";
import { createLabRequestAdapterProxy } from "./adapters/labrequest-adapters";
import { createPatientAdapterProxy } from "./adapters/patient-adapters";
import { createSpeciesAdapterProxy } from "./adapters/species-adapters";
import { FetchAPI, initializeApiServices } from "@viewpoint/api";
import { createSettingsAdapterProxy } from "./adapters/settings-adapters";
import { createInstrumentRunAdapterProxy } from "./adapters/instrumentrun-adapters";
import { createJackalopeAdapterProxy } from "./adapters/jackalope-adapters";
import { createReportAdapterProxy } from "./adapters/labreport-adapters";
import { createQcAdapterProxy } from "./adapters/qc-adapters";
import { getDefaultProxyOptions } from "./adapters/utils/proxy-utils";
import { createPimsAdapterProxy } from "./adapters/pims-adapters";
import { createMessageAdapterProxy } from "./adapters/message-adapters";
import { createResourceAdapters } from "./adapters/resouce-adapters";
import { createPrintProxy } from "./adapters/print-adapters";
import { createAlertAdapterProxy } from "./adapters/alert-adapters";

function createProxy(upstreamReqUrl: URL, upstreamJackalopeUrl: URL, upstreamPrintUrl: URL) {
  const logger = getLogger();

  const portableFetch: FetchAPI = async (url: string, init?: any) => {
    const response = await axios(url, {
      method: init?.method,
      headers: { "content-type": "application/json", ...init?.headers },
      params: init?.query,
      data: init?.body,
    });
    return {
      ...response,
      json: () => response.data,
    };
  };
  initializeApiServices(portableFetch);

  const upstreamTarget = upstreamReqUrl.toString();

  const router = Router();

  createAlertAdapterProxy(upstreamReqUrl, router, logger);

  createPrintProxy(upstreamPrintUrl, router, logger);

  // Intercept and adapt instrument API requests
  createInstrumentAdapterProxy(upstreamReqUrl, router, logger);

  createLabRequestAdapterProxy(upstreamReqUrl, router, logger);

  createPatientAdapterProxy(upstreamReqUrl, router, logger);

  createSpeciesAdapterProxy(upstreamReqUrl, router, logger);

  createSettingsAdapterProxy(upstreamReqUrl, router, logger);

  createInstrumentRunAdapterProxy(upstreamReqUrl, router, logger);

  createPimsAdapterProxy(upstreamReqUrl, router, logger);

  // proxy jackalope image requests to avoid CORS issues
  createJackalopeAdapterProxy(upstreamJackalopeUrl, router, logger);

  createReportAdapterProxy(upstreamReqUrl, router, logger);

  createQcAdapterProxy(upstreamReqUrl, router, logger);

  createResourceAdapters(upstreamReqUrl, router, logger);

  createMessageAdapterProxy(upstreamReqUrl, router, logger);

  //pass all other /labstation-webapp traffic upstream
  const proxyAsIs = createProxyMiddleware("/labstation-webapp/", getDefaultProxyOptions(logger, upstreamTarget));
  router.use(proxyAsIs);

  return router;
}

export { createProxy };
