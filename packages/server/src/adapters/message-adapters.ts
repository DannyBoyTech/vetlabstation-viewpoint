import type { Router } from "express";
import type { Logger } from "winston";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";
import { decode } from "iconv-lite";
import type { NotificationContentDto } from "@viewpoint/api";

const messageContentInterceptor = responseInterceptor(async (buffer, _proxyRes, _req, res) => {
  try {
    const notification: NotificationContentDto = JSON.parse(decode(buffer!, "utf-8"));

    if (notification == null || notification?.bytes == null) {
      throw Error("invalid response body format");
    }
    const contentBuffer = Buffer.from(notification.bytes, "base64");
    res.setHeader(
      "content-type",
      notification.contentType ?? (notification.version === "3" ? "application/pdf" : "text/html")
    );
    return contentBuffer;
  } catch (e) {
    res.statusCode = 500;
    return "";
  }
});

function createMessageAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const defaultOptions = () => ({
    logProvider: () => logger,
    target: upstreamReqUrl.toString(),
    selfHandleResponse: true,
  });

  router.get(
    "/labstation-webapp/api/notifications/:id/view",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: messageContentInterceptor,
    })
  );

  router.get(
    "/labstation-webapp/api/notifications/:id/proactiveNotification",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: messageContentInterceptor,
    })
  );

  router.get(
    "/labstation-webapp/api/notifications/:id/print",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: responseInterceptor(async (buffer, _proxyRes, _req, res) => {
        // Printable is always PDF format, but IVLS doesn't set the content-type header
        res.setHeader("content-type", "application/pdf");
        return buffer;
      }),
    })
  );
}

export { createMessageAdapterProxy };
