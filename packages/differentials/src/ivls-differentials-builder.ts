import betterSqlite from "better-sqlite3";
import { Service, Summary, readServices, readSummaries } from "./csv-utils";
import { loadFromZip } from "./zip-utils";
import { JSDOM } from "jsdom";
import { HTML } from "./html-utils";

const createTables = (db: betterSqlite.Database) =>
  db.transaction(() => {
    db.prepare(
      `CREATE TABLE services (
        "ID" TEXT,
        "CODE" TEXT,
        "CONTEXTID" TEXT,
        "SERVICETYPECODE" TEXT
      )`
    ).run();

    db.prepare(
      `CREATE TABLE summaries (
        "ANALYTE_ID" TEXT,
        "LOCALE_CD" TEXT,
        "INTERPRETATION_CMNT" TEXT
      )`
    ).run();
  })();

const createViews = (db: betterSqlite.Database) =>
  db.transaction(() => {
    db.prepare(
      `create view true_en_summaries as
        select
          ANALYTE_ID,
          LOCALE_CD,
          INTERPRETATION_CMNT
        from summaries
        where
          LOCALE_CD = 'en_US'
      `
    ).run();

    db.prepare(
      `create view default_en_summaries as 
        select
          ANALYTE_ID,
          'en_US' as LOCALE_CD,
          INTERPRETATION_CMNT
        from summaries
        where
          LOCALE_CD = ''
      `
    ).run();

    db.prepare(
      `create view non_en_summaries as 
        select
          ANALYTE_ID,
          LOCALE_CD,
          INTERPRETATION_CMNT
        from summaries
        where
          LOCALE_CD not in ('en_US','')
      `
    ).run();

    db.prepare(
      `create view en_summaries as 
        select
          *
        from true_en_summaries
        union all
        select
          *
        from default_en_summaries d
        where ANALYTE_ID not in (
          select ANALYTE_ID from true_en_summaries t
        )
      `
    ).run();

    db.prepare(
      `create view i18n_summaries as 
        select * from en_summaries
        union all
        select * from non_en_summaries
      `
    ).run();

    db.prepare(
      `create view ivls_tests as
        select distinct
          *
        from services
        where
          CONTEXTID=999
          and
          SERVICETYPECODE='TEST'
    `
    ).run();

    db.prepare(
      `create view ivls_i18n_summaries as
        select
          sm.ANALYTE_ID,
          t.CODE,
          sm.LOCALE_CD,
          sm.INTERPRETATION_CMNT
        from
        ivls_tests t
        join i18n_summaries sm on sm.ANALYTE_ID = t.ID
      `
    ).run();
  })();

const insertServices = (db: betterSqlite.Database, services: Service[]) =>
  db.transaction(() => {
    const serviceInsertStmt = db.prepare(
      `INSERT INTO services (ID, CODE, CONTEXTID, SERVICETYPECODE)
        VALUES (?, ?, ?, ?)
      `
    );
    services.forEach((service) => {
      serviceInsertStmt.run(
        service.ID,
        service.CODE,
        service.CONTEXTID,
        service.SERVICETYPECODE
      );
    });
  })();

const insertSummaries = (db: betterSqlite.Database, summaries: Summary[]) =>
  db.transaction(() => {
    const summaryInsertStmt = db.prepare(
      `INSERT INTO summaries (ANALYTE_ID, LOCALE_CD, INTERPRETATION_CMNT)
            VALUES (?, ?, ?)
        `
    );
    summaries.forEach((summary) => {
      summaryInsertStmt.run(
        summary.ANALYTE_ID,
        summary.LOCALE_CD,
        summary.INTERPRETATION_CMNT
      );
    });
  })();

function createDb(
  services: Service[],
  summaries: Summary[],
  filename: string = ":memory:"
) {
  const db = new betterSqlite(filename);
  db.pragma("journal_mode = WAL");

  createTables(db);
  createViews(db);

  insertServices(db, services);
  insertSummaries(db, summaries);

  return db;
}

const REQUIRED_CSV_FILES = {
  SERVICES: "GL_Service.csv",
  SUMMARIES: "GL_InterpretiveSummaries.csv",
} as const;

async function createDifferentialsDb(dxdExportZipFile: string) {
  const requiredFileNames = Object.values(REQUIRED_CSV_FILES);

  const glFiles = await loadFromZip(dxdExportZipFile, requiredFileNames);

  const allServices = readServices(glFiles[REQUIRED_CSV_FILES.SERVICES]!);
  const allSummaries = readSummaries(glFiles[REQUIRED_CSV_FILES.SUMMARIES]!);

  return createDb(allServices, allSummaries);
}

export interface I18nDifferentialDbRow {
  ANALYTE_ID: string;
  CODE: string;
  LOCALE_CD: string;
  INTERPRETATION_CMNT: string;
}

export interface Differential {
  analyteId: string;
  code: string;
  locale: string;
  content: JSDOM;
}

export type I18nDifferentialsByLocaleAndCode = Record<
  string,
  Record<string, Differential>
>;

function buildDifferential(row: I18nDifferentialDbRow) {
  return {
    analyteId: row.ANALYTE_ID,
    code: row.CODE,
    locale: row.LOCALE_CD,
    content: HTML.parse(row.INTERPRETATION_CMNT),
  };
}

export async function* generateDifferentials(dxdExportZipFile: string) {
  const db = await createDifferentialsDb(dxdExportZipFile);

  const ivlsDifferentialsStmt = db.prepare(`
    select 
    *
    from ivls_i18n_summaries
    order by LOCALE_CD, ANALYTE_ID
  `);

  for (const diffRow of ivlsDifferentialsStmt.iterate() as IterableIterator<I18nDifferentialDbRow>) {
    yield buildDifferential(diffRow);
  }
}
