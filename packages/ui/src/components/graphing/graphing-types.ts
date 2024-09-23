export interface GraphableData {
  data: GraphableDataPoint[];
  refHigh?: number;
  refLow?: number;
  critHigh?: number;
  critLow?: number;
  hideRefRange?: boolean;
  name?: string;
  showCannotGraphErr?: boolean;
}

export interface GraphableDataPoint {
  date: number;
  value: number;
  label: string;
  source: string;
}
