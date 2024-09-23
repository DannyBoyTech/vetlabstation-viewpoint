import type { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Logger } from "winston";

const VP_PRINT_ROOT = "/labstation-webapp/api";
const PRINT_SERVER_ROOT = "";

function rewritePrintRequestPath(printReqPath: string) {
  const relativePrintReqPath = printReqPath.replace(VP_PRINT_ROOT, PRINT_SERVER_ROOT);

  //rewrite the nicely named viewpoint path to the print-service's 'obfuscated' spring-boot actuator path
  if (relativePrintReqPath.startsWith("/print-service")) {
    return relativePrintReqPath.replace("/print-service", "/_");
  }

  //the purge/jobs request seemed too ambiguous when mapped directly
  //to IVLS API namespace, so was prefixed with '/print/'
  if (relativePrintReqPath.toLowerCase() == "/print/purge/jobs") {
    return "/purge/jobs";
  }

  return relativePrintReqPath;
}

export function createPrintProxy(upstreamPrintUrl: URL, router: Router, _logger: Logger) {
  const printProxy = createProxyMiddleware("/", {
    target: upstreamPrintUrl,
    pathRewrite: rewritePrintRequestPath,
  });

  router.all(`${VP_PRINT_ROOT}/printers`, printProxy);
  router.all(`${VP_PRINT_ROOT}/print/job`, printProxy);
  router.all(`${VP_PRINT_ROOT}/print/purge/jobs`, printProxy);
  router.all(`${VP_PRINT_ROOT}/print-service/shutdown`, printProxy);
}
