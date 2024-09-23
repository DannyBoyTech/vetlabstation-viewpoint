import path from "path";
import { VpLocaleKey } from "./global";

export function differentialsI18nDir(basePath: string, vpLocale: VpLocaleKey) {
  return path.join(basePath, "packages", "ui", "public", "locales", vpLocale);
}

export function differentialsI18nFilePath(
  basePath: string,
  vpLocale: VpLocaleKey
) {
  return path.join(
    differentialsI18nDir(basePath, vpLocale),
    "differentials.json"
  );
}

export function differentialsContentDirPath(basePath: string) {
  return path.join(basePath, "packages", "ui", "public", "differentials");
}

export function differentialsContentFsPath(basePath: string, filename: string) {
  return path.join(differentialsContentDirPath(basePath), filename);
}

export function differentialsContentUrlPath(filename: string) {
  return path.join("differentials", filename);
}
