import type { SettingTypeEnum } from "./ivls/generated/ivls-api";
export interface Id {
  id: number;
}

export type Settings = { [key in SettingTypeEnum]?: string | undefined };
