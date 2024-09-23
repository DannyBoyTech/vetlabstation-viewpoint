import { Options, responseInterceptor } from "http-proxy-middleware";
import type { IncomingMessage, ServerResponse } from "http";
import type http from "http";
import type { Logger } from "winston";
import type { OnProxyReqCallback, Request, Response } from "http-proxy-middleware/dist/types";
import type { RequestHandler } from "express";
import { adaptObject, JerseyObject } from "./data-adapters";
import { decode } from "iconv-lite";

export type VpResponseHandler<T, R = T> = (
  responseBody: T | null,
  logger: Logger,
  proxyResponse: IncomingMessage,
  request: IncomingMessage,
  response: ServerResponse
) => Promise<R> | R;

export interface ResponseInterceptorOptions {
  responseEncoding?: string;
}

export function vpResponseInterceptor<T, R = T>(
  handler: VpResponseHandler<T, R>,
  logger: Logger,
  options?: ResponseInterceptorOptions
) {
  return responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    try {
      let parsed: JerseyObject | null = null;
      const resp = decode(responseBuffer, options?.responseEncoding ?? "utf-8");
      if (resp && resp.length > 0) {
        try {
          parsed = JSON.parse(resp);
        } catch (err) {
          logger.warn(`Error in response interceptor for path "${req.url}"`, err);
        }
      }
      const adapted: T = adaptObject(parsed) as T;
      const handled = await handler(adapted, logger, proxyRes, req, res);
      if (handled != null) {
        // Update the response code/headers -- if IVLS returned something like 204 or 404 but the interceptor performed
        // some other business logic to generate a payload, we need to override the IVLS response details
        const responsePayload = JSON.stringify(handled);
        if (!res.headersSent) {
          res.statusCode = 200;
          res.statusMessage = "OK";
          res.setHeader("content-type", "application/json");
          res.setHeader("content-length", Buffer.byteLength(responsePayload));
        }
        return responsePayload;
      } else {
        return resp ?? "";
      }
    } catch (err) {
      logger?.error((err as Error)?.message, err);
      if (!res.headersSent) {
        res.statusCode = (err as ProxyError).statusCode ?? 500;
        res.statusMessage = (err as ProxyError).statusMessage ?? "Internal Server Error";
      }
      return "";
    }
  });
}

// Async handler does not work -- if we need to do async work during a request intercept, look into using a separate middleware
// See https://github.com/chimurai/http-proxy-middleware/issues/318
export type VpRequestHandler<T, R = T> = (
  requestBody: T | null,
  logger: Logger,
  proxyReq: http.ClientRequest,
  req: Request,
  res: Response
) => R;

export function vpRequestInterceptor<T, R = T>(handler: VpRequestHandler<T, R>, logger: Logger): OnProxyReqCallback {
  return (proxyReq, req, res) => {
    try {
      proxyReq.socket?.pause();
      const handled = handler(req.body ?? null, logger, proxyReq, req, res);
      if (handled) {
        const payload = JSON.stringify(handled);
        delete req.body;
        proxyReq.setHeader("Content-Length", Buffer.byteLength(payload));
        proxyReq.write(payload);
      }
      proxyReq.socket?.resume();
    } catch (err) {
      logger.error("Proxy request interceptor error", err);
      res.statusCode = (err as ProxyError).statusCode ?? 500;
      res.statusMessage = (err as ProxyError).statusMessage ?? "Internal Server Error";
      proxyReq.destroy(err as Error);
    }
  };
}

export function replaceSearchParams(url: URL, newParams: Record<string, string>) {
  for (const key of Object.keys(newParams)) {
    if (url.searchParams.has(key)) {
      url.searchParams.set(newParams[key] as string, url.searchParams.get(key)!);
      url.searchParams.delete(key);
    }
  }
}

export class ProxyError extends Error {
  readonly statusCode?: number;
  readonly statusMessage?: string;

  constructor(message: string, statusCode?: number, statusMessage?: string) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

export type VpNonProxyRequestHandler<T, R = T> = (
  requestBody: T | null,
  logger: Logger,
  req: Request,
  res: Response
) => R;

export function nonProxyRequestHandler<T, R = T>(
  handler: VpNonProxyRequestHandler<T, R>,
  logger: Logger
): RequestHandler {
  return async (req, res) => {
    try {
      const innerRes = await handler(req.body, logger, req, res);
      if (innerRes) {
        res.json(innerRes);
      } else {
        res.sendStatus(204);
      }
    } catch (err) {
      logger.error("Non proxy request handler error", err);
      if (err instanceof ProxyError) {
        const proxyError = err as ProxyError;
        res.status(proxyError.statusCode ?? 500);
        res.json({ message: proxyError.message });
      } else {
        res.sendStatus(500);
      }
    }
  };
}

export function getDefaultProxyOptions(logger: Logger, target: string): Options {
  return {
    target,
    logProvider: () => logger,
    onProxyRes: vpResponseInterceptor((body) => body, logger),
    selfHandleResponse: true,
    headers: {
      accept: "*/*",
    },
  };
}
