import type { ISSENotifier } from "./sse-router";
import { EventIds } from "@viewpoint/api";
import { getLogger } from "./logger";
import axios from "axios";
import path from "path";

const logger = getLogger();

export function startMonitoringIvlsConnection(sse: ISSENotifier, upstreamReqUrl: URL) {
  setInterval(() => checkConnection(sse, upstreamReqUrl), 5000).unref();
}

let LAST_RESPONSE = false;

async function checkConnection(sse: ISSENotifier, upstreamReqUrl: URL) {
  let isRunning = false;
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000).unref();
    const target = path.join(upstreamReqUrl.toString(), "labstation-webapp/api/system/running");
    isRunning = (
      await axios(target, {
        timeout: 4000,
        signal: controller.signal,
      })
    ).data;
  } catch (_ignored) {
    // ignored
    isRunning = false;
  }
  if (isRunning !== LAST_RESPONSE) {
    if (isRunning) {
      logger.warn("Connection to IVLS backend restored");
    } else {
      logger.error("Lost connection to IVLS backend -- notifying client.");
    }
    LAST_RESPONSE = isRunning;
    await sse.notifyListeners(JSON.stringify({ connected: isRunning }), EventIds.IvlsConnectionStatus);
  }
}
