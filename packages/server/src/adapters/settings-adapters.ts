import type { Router } from "express";
import type { Logger } from "winston";
import { createProxyMiddleware } from "http-proxy-middleware";
import { vpResponseInterceptor } from "./utils/proxy-utils";
import type { SettingDto, Settings } from "@viewpoint/api";
import type { SettingTypeEnum } from "@viewpoint/api";

export function mapSettings(settings: SettingDto[] | null): Settings {
  return (
    settings?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.settingType]: curr.settingValue,
      }),
      {} as Record<SettingTypeEnum, string | undefined>
    ) ?? {}
  );
}

export function createSettingsAdapterProxy(upstreamReqUrl: URL, router: Router, logger: Logger) {
  const upstreamTarget = upstreamReqUrl.toString();

  const defaultOptions = () => ({
    logProvider: () => logger,
    target: upstreamTarget,
    selfHandleResponse: true,
  });

  router.get(
    "/labstation-webapp/api/settings",
    createProxyMiddleware("/", {
      ...defaultOptions(),
      onProxyRes: vpResponseInterceptor<SettingDto[], Settings>(mapSettings, logger),
    })
  );
}
