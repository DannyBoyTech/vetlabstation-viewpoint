import { differentialsI18nDir, differentialsI18nFilePath } from "./file-paths";
import fs from "node:fs/promises";
import {
  DifferentialByCode,
  WritableDifferentialCollection,
  isVpLocaleKey,
} from "./global";
import { HTML } from "./html-utils";

function asJson(diffsByCode: DifferentialByCode) {
  const diffs: Record<string, string> = {};

  for (const code of Object.keys(diffsByCode).sort()) {
    diffs[code] = HTML.stringify(diffsByCode[code]!);
  }

  return JSON.stringify(diffs, null, 2);
}

export async function writeI18nFiles(
  basePath: string,
  diffs: WritableDifferentialCollection
) {
  for (const vpLocale of Object.keys(diffs).filter(isVpLocaleKey)) {
    const dirPath = differentialsI18nDir(basePath, vpLocale);
    const filePath = differentialsI18nFilePath(basePath, vpLocale);
    const diffsForLocale = diffs[vpLocale];

    if (dirPath == null || filePath == null || diffsForLocale == null) continue;

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, asJson(diffsForLocale));
  }
}
