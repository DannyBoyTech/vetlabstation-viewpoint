import { parse } from "csv-parse/sync";
import assert from "node:assert";

const readCsv = (
  arrayBuffer: ArrayBuffer,
  requiredColumns?: readonly string[]
) => {
  const buffer = Buffer.from(arrayBuffer);
  const csv = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    encoding: "utf-8",
  });
  const csvColumns = Object.keys(csv[0]);
  assert(
    (requiredColumns ?? [])?.every((requiredKey) =>
      csvColumns.includes(requiredKey)
    ),
    `csv must have required columns: ${REQUIRED_SERVICE_COLUMNS} found ${csvColumns}`
  );
  return csv;
};

const REQUIRED_SERVICE_COLUMNS = [
  "ID",
  "CODE",
  "CONTEXTID",
  "SERVICETYPECODE",
] as const;

export function readServices(arrayBuffer: ArrayBuffer): Service[] {
  return readCsv(arrayBuffer, REQUIRED_SERVICE_COLUMNS);
}

const REQUIRED_SUMMARY_COLUMNS = [
  "ANALYTE_ID",
  "LOCALE_CD",
  "INTERPRETATION_CMNT",
] as const;

export type Service = {
  [key in (typeof REQUIRED_SERVICE_COLUMNS)[number]]: string;
};

export type Summary = {
  [key in (typeof REQUIRED_SUMMARY_COLUMNS)[number]]: string;
};

export function readSummaries(arrayBuffer: ArrayBuffer): Summary[] {
  return readCsv(arrayBuffer, REQUIRED_SUMMARY_COLUMNS);
}
