import type { PatientDto, PatientWithRunsDto } from "@viewpoint/api";
import { orderBy } from "lodash";

function lowerCase(it?: string) {
  return it?.toLowerCase();
}

function localeLowerCase(it?: string) {
  return it?.toLocaleLowerCase();
}

function getInRecord<K extends string, V>(record: Record<K, V>, key: K): V | undefined {
  if (key in record) {
    return record[key as K];
  }
  return undefined;
}

function filterRecord<K extends string, V>(record: Record<K, V>, pred: (entry: [K, V]) => boolean): Record<K, V> {
  return Object.fromEntries((Object.entries<V>(record) as [K, V][]).filter(pred)) as Record<K, V>;
}

function recordKeys<K extends string, V>(record: Record<K, V>): K[] {
  return Object.keys(record) as K[];
}

/**
 * Predefined sorts for patient search results.
 */
const patientSearchIterateesByQuery = {
  patientName: (p: PatientDto) => localeLowerCase(p.patientName),
  clientLastName: (p: PatientDto) => localeLowerCase(`${p.clientDto.lastName}, ${p.clientDto.firstName}`),
  clientIdentifier: (p: PatientDto) => localeLowerCase(p.clientDto.clientId),
} as const;

const patientSearchSortsOrdersByQuery = {
  patientName: "asc",
  clientLastName: "asc",
  clientIdentifier: "asc",
} as const;

const VALID_PATIENT_QUERIES_LC = new Set(Object.keys(patientSearchIterateesByQuery).map(lowerCase));

function validPatientQuery(query: string) {
  return VALID_PATIENT_QUERIES_LC.has(lowerCase(query));
}

/**
 * Sorts a list of patient search results by predefined search queries, passed by name.
 *
 * @param patients
 * @param queries
 * @returns patients sorted by the specified queries
 */
export function sortPatientSearchResultsBy(patients: PatientDto[], ...queries: string[]): PatientDto[] {
  const validQueries = new Set(queries.filter(validPatientQuery).map(lowerCase));
  const sortsObj = filterRecord(patientSearchIterateesByQuery, ([k]) => validQueries.has(lowerCase(k)));
  const sorts = Object.values(sortsObj);
  const orders = recordKeys(sortsObj).map((k) => getInRecord(patientSearchSortsOrdersByQuery, k) ?? "asc");
  return orderBy(patients, sorts, orders);
}

/**
 * Predefined sorts for patient record search results.
 */
const patientRecordSearchIterateesByQuery = {
  patientName: (pr: PatientWithRunsDto) => localeLowerCase(pr.patientDto.patientName),
  clientLastName: (pr: PatientWithRunsDto) =>
    localeLowerCase(`${pr.patientDto.clientDto.lastName}, ${pr.patientDto.clientDto.firstName}`),
  clientId: (pr: PatientWithRunsDto) => localeLowerCase(pr.patientDto.clientDto.clientId),
  daysBack: (pr: PatientWithRunsDto) => pr.runDate,
} as const;

const patientRecordSearchSortsOrdersByQuery = {
  patientName: "asc",
  clientLastName: "asc",
  clientId: "asc",
  daysBack: "desc",
} as const;

const VALID_PATIENT_RECORD_QUERIES_LC = new Set(recordKeys(patientRecordSearchIterateesByQuery).map(localeLowerCase));

function validPatientRecordQuery(query: string) {
  return VALID_PATIENT_RECORD_QUERIES_LC.has(lowerCase(query));
}

/**
 * Sorts a list of patient records by predefined search queries, passed by name.
 *
 * @param records
 * @param queries
 * @returns patient records sorted by the specified queries
 */
export function sortPatientRecordSearchResultsBy(
  records: PatientWithRunsDto[],
  ...queries: string[]
): PatientWithRunsDto[] {
  const validQueries = new Set(queries.filter(validPatientRecordQuery).map(lowerCase));
  const sortsObj = filterRecord(patientRecordSearchIterateesByQuery, ([k]) => validQueries.has(lowerCase(k)));
  const sorts = Object.values(sortsObj);
  const orders = recordKeys(sortsObj).map((k) => getInRecord(patientRecordSearchSortsOrdersByQuery, k) ?? "asc");
  return orderBy(records, sorts, orders);
}

/**
 * Predefined sorts for species-specific search results
 */
const patientSpeciesSearchIterateesByQuery = {
  patientName: (p: PatientDto) => localeLowerCase(p.patientName),
  clientLastName: (p: PatientDto) => localeLowerCase(`${p.clientDto.lastName}, ${p.clientDto.firstName}`),
  clientId: (p: PatientDto) => localeLowerCase(p.clientDto.clientId),
} as const;

const patientSpeciesSearchSortsOrdersByQuery = {
  patientName: "asc",
  clientLastName: "asc",
  clientId: "asc",
} as const;

const VALID_PATIENT_SPECIES_QUERIES_LC = new Set(Object.keys(patientSpeciesSearchIterateesByQuery).map(lowerCase));

function validPatientSpeciesQuery(query: string) {
  return VALID_PATIENT_SPECIES_QUERIES_LC.has(lowerCase(query));
}

/**
 * Sorts a list of patient records by predefined search queries, passed by name.
 *
 * @param patients
 * @param queries
 * @returns patient records sorted by the specified queries
 */
export function sortPatientSpeciesSearchResultsBy(patients: PatientDto[], ...queries: string[]): PatientDto[] {
  const validQueries = new Set(queries.filter(validPatientSpeciesQuery).map(lowerCase));
  const sortsObj = filterRecord(patientSpeciesSearchIterateesByQuery, ([k]) => validQueries.has(lowerCase(k)));
  const sorts = Object.values(sortsObj);
  const orders = recordKeys(sortsObj).map((k) => getInRecord(patientSpeciesSearchSortsOrdersByQuery, k) ?? "asc");
  return orderBy(patients, sorts, orders);
}
