import type { QualityControlDto } from "./ivls/generated/ivls-api";

export const QcLotsFilters = {
  Offsets: "Offsets",
  QualityControl: "QualityControl",
} as const;

export type QcLotsFilter = (typeof QcLotsFilters)[keyof typeof QcLotsFilters];

export interface QcLotDto extends QualityControlDto {
  controlType: string;
  level: string;
  fluidType?: number;
  isExpired?: boolean;
}
