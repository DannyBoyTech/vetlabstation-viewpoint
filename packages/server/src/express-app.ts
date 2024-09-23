import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { getRequestLogger } from "./request-logger";
import { createProxy } from "./ivls-proxy";
import type Subscriber from "./amqp-subscriber";
import { SSERouter } from "./sse-router";
import { forwardClientEvents } from "./ivls-events";
import type { Config } from "./config";
import * as fs from "fs";
import path from "path";
import { getLogger } from "./logger";
import { startMonitoringIvlsConnection } from "./ivls-monitor";

const logger = getLogger();

async function createApp(config: Config, amqpSubcriber: Subscriber) {
  const app = express();

  app.use(getRequestLogger());

  //Set http cache headers for static content
  app.use((req, res, next) => {
    if (req.url.match(/^[/](?:assets|differentials)[/]/)) {
      //these content urls use cache-busting names, so we can cache more agressively
      //cache for a year and don't revalidate on page load
      res.setHeader("Cache-Control", ["max-age=31536000", "immutable"]);
    } else if (req.url.match(/^[/]fonts[/]/)) {
      //we assume font's wont change without a url change
      res.setHeader("Cache-Control", ["max-age=31536000", "immutable"]);
    }
    //all other static assets are not cached by the client because
    //express.static sets max-age=0 by default
    next();
  });

  // set security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // breaks swagger inline script, revisit later
    })
  );

  // proxy ivls requests
  app.use(createProxy(config.UPSTREAM_REQ_URL, config.UPSTREAM_JACKALOPE_URL, config.UPSTREAM_PRINT_URL));

  // parse json request body
  app.use(express.json());

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }));

  // gzip compression
  app.use(compression());

  // enable cors
  app.use(cors());

  // expose application info for IVLS reporting
  app.get("/info", (_req, res) => {
    res.send({ version: config.VP_APP_VERSION });
  });

  // publish sse to /events
  const [sseRouter, sseNotifier] = SSERouter();
  await forwardClientEvents(amqpSubcriber, sseNotifier);
  app.use("/events", sseRouter);

  // Monitor IVLS connection status, notify client if IVLS backend becomes unavailable
  startMonitoringIvlsConnection(sseNotifier, config.UPSTREAM_REQ_URL);

  // host UI if it's available
  if (fs.existsSync(config.VP_UI_PATH)) {
    app.use(express.static(config.VP_UI_PATH));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(config.VP_UI_PATH, "index.html"));
    });
  } else {
    logger.warn("Could not locate ViewPoint UI distributable");
  }

  return app;
}

export { createApp };
