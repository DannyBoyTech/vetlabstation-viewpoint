import type { AlertDto } from "@viewpoint/api";
import type { Router } from "express";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";
import type { Logger } from "winston";
import { uniqBy } from "lodash";

interface AlertsContainer {
  alerts: AlertDto[];
}

function isAlertDto(it: unknown): it is AlertDto {
  const isObjWithReqProps = it != null && typeof it === "object" && "name" in it && "uniqueId" in it;
  const obj: { name: unknown; uniqueId: unknown; args?: unknown } = it as any; //not necessary in ts 4.9+
  return (
    isObjWithReqProps &&
    typeof obj.name === "string" &&
    typeof obj.uniqueId === "string" &&
    (!("args" in it) || typeof obj.args === "object")
  );
}

function isAlertsContainer(it: unknown): it is AlertsContainer {
  const isObjWithReqProps = it != null && typeof it === "object" && "alerts" in it;
  const obj: { alerts: unknown } = it as any; //not necessary in ts 4.9+
  return isObjWithReqProps && Array.isArray(obj.alerts) && obj.alerts.every(isAlertDto);
}

function isAlertsContainerArray(it: unknown): it is AlertsContainer[] {
  return it != null && Array.isArray(it) && it.every(isAlertsContainer);
}

/**
 * Returns a new copy of the passed argument with any duplicate alerts collapsed
 * into a single alert. Alerts are considered duplicates if they share a uniqueId and
 * instrumentId.
 *
 * This logic implements deduplication that used to be done by UI code in on-market
 * IVLS (see AlertPaneController#displayTabs).
 *
 * NOTE: It is assumed that any 'alerts container' passed in as an argument contains only
 * alerts for a single instrumentId
 *
 * @param alertsContainer - an object containing an array of instrument alerts named 'alerts'
 * @returns a new object with no duplicate alerts
 */
function removeDuplicateAlerts(alertsContainer: AlertsContainer): AlertsContainer {
  return {
    ...alertsContainer,
    alerts: uniqBy(alertsContainer.alerts, (it: AlertDto) => it.uniqueId),
  };
}

export function createAlertAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const defaultOptions = () => ({
    logProvider: () => logger,
    target: upstreamReqUrl.toString(),
    selfHandleResponse: true,
  });

  router.get(
    "/labstation-webapp/api/instruments/alerts",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: responseInterceptor(async (response: Buffer) => {
        try {
          const resJson = JSON.parse(response.toString());

          if (!isAlertsContainerArray(resJson)) {
            throw Error("expected array of alerts containers");
          }

          const distinctInstrumentAlerts = resJson.map(removeDuplicateAlerts);

          return JSON.stringify(distinctInstrumentAlerts);
        } catch (e) {
          logger.warn("unable to parse all instrument alerts response, passing through unchanged");
          return response;
        }
      }),
    })
  );

  router.get(
    "/labstation-webapp/api/instruments/:instrumentId/alerts",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: responseInterceptor(async (response: Buffer) => {
        try {
          const resJson = JSON.parse(response.toString());

          if (!isAlertsContainer(resJson)) {
            throw Error("expected alerts container");
          }

          const distinctInstrumentAlert = removeDuplicateAlerts(resJson);

          return JSON.stringify(distinctInstrumentAlert);
        } catch (e) {
          logger.warn("unable to parse single instrument alert response, passing through unchanged");
          return response;
        }
      }),
    })
  );
}
