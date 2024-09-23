import {
  AvailableSampleTypes,
  DefaultRunConfigs,
  DilutionDisplayConfig,
  DoctorDto,
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
  LabRequestRunType,
  PatientDto,
  RefClassDto,
  ReferenceClassType,
  SettingTypeEnum,
  SmartServiceStatus,
  SnapDeviceDto,
  SpeciesType,
  SupportedRunTypeValidationDto,
} from "@viewpoint/api";
import {
  randomDoctor,
  randomInstrumentDto,
  randomInstrumentStatus,
  randomPatientDto,
  randomRefClass,
} from "@viewpoint/test-utils";
import AvailableSampleTypesData from "./data/AvailableSampleTypes.json";
import DilutionDisplayConfigsData from "./data/DilutionConfigs.json";
import { getDefaultSettings } from "./general-utils";

// Intercept requests made at the global app level with safe defaults
export function interceptGlobalRequests() {
  cy.intercept("GET", "**/api/system/running", JSON.stringify(true));
  cy.intercept("GET", "**/api/boot/getBootItems", {
    isFirstBoot: false,
    restoreDto: { restorePerformed: false },
    upgradeStatusDto: { upgradeAttempted: false },
  });
  cy.intercept(
    "GET",
    "**/api/smartService/status",
    JSON.stringify(SmartServiceStatus.CONNECTED)
  );
  cy.intercept("GET", "**/api/device/awaitingApproval", []);
  cy.intercept("GET", "**/api/upgrade/status/fetch", {
    databaseStatus: "UNKNOWN",
    upgradeAttempted: false,
    upgradeSuccess: false,
  });
  cy.intercept("GET", "**/api/upgrade/upgrade_available", {});
  cy.intercept("GET", "**/events", {});
  cy.intercept({ pathname: "**/api/instruments/alerts", method: "GET" }, []);
  cy.intercept({ pathname: "**/api/notifications/counts", method: "GET" }, "0");
  cy.intercept({ pathname: "**/api/notifications", method: "GET" }, []);
  cy.intercept(
    { pathname: "**/api/serverResource/eula/smartservice", method: "GET" },
    JSON.stringify("")
  );
  cy.intercept("POST", "**/api/settings", []);
}

// Intercept requests made by the home screen with safe defaults
export function interceptRequestsForHomeScreen() {
  interceptGlobalRequests();

  cy.intercept("GET", "**/api/pims/pending", []);
  cy.intercept("GET", "**/api/pims/census", []);
  cy.intercept("GET", "**/api/labRequest/running", []);
  cy.intercept("GET", "**/api/device/status", []);
  cy.intercept({ pathname: "**/api/result/recent", method: "GET" }, []);
  cy.intercept(
    { pathname: "**/api/settings", method: "GET" },
    {
      [SettingTypeEnum.DISPLAY_PENDING_REQUESTS]: "true",
      [SettingTypeEnum.DISPLAY_CENSUS_LIST]: "true",
    }
  );
}

export interface SelectInstrumentsData {
  patient: PatientDto;
  instruments: InstrumentStatusDto[];
  referenceClassifications: RefClassDto[];
  doctors: DoctorDto[];
  sampleTypes: AvailableSampleTypes;
  dilutionConfigs: {
    [key in InstrumentType]?: DilutionDisplayConfig;
  };
  defaultRunConfigs: DefaultRunConfigs;
  settings: { [key in SettingTypeEnum]?: string };
  snapDevices: SnapDeviceDto[];
  mostRecentRefClass?: RefClassDto;
  addTestCheck: SupportedRunTypeValidationDto[];
  aliases: {
    patient: string;
    instruments: string;
    referenceClassifications: string;
    doctors: string;
    sampleTypes: string;
    dilutionConfigs: string;
    defaultRunConfigs: string;
    settings: string;
    snapDevices: string;
    mostRecentRefClass: string;
    executeLabRequestCheck: string;
    addTestCheck: string;
  };
}

export function interceptRequestsForSelectInstruments(
  values: Partial<SelectInstrumentsData> = {}
): SelectInstrumentsData {
  const patient =
    values.patient ??
    randomPatientDto({
      speciesDto: {
        speciesName: SpeciesType.Canine,
        speciesClass: ReferenceClassType.LifeStage,
        id: 2,
      },
    });
  const instruments = values.instruments ?? [
    randomInstrumentStatus({
      instrumentStatus: InstrumentStatus.Ready,
      connected: true,
      instrument: randomInstrumentDto({
        instrumentType: InstrumentType.CatalystOne,
        manualEntry: false,
        runnable: true,
      }),
    }),
  ];
  const referenceClassifications = values.referenceClassifications ?? [
    randomRefClass(),
  ];
  const doctors = values.doctors ?? [randomDoctor()];
  const sampleTypes =
    values.sampleTypes ?? (AvailableSampleTypesData as AvailableSampleTypes);
  const dilutionConfigs =
    values.dilutionConfigs ??
    (DilutionDisplayConfigsData as {
      [key in InstrumentType]?: DilutionDisplayConfig;
    });
  const defaultRunConfigs = values.defaultRunConfigs ?? {};
  const settings = values.settings ?? getDefaultSettings();
  const mostRecentRefClass = referenceClassifications[0];

  const snapDevices = values.snapDevices ?? [];

  const addTestCheck: SupportedRunTypeValidationDto[] = values.addTestCheck ?? [
    {
      runType: LabRequestRunType.MERGE,
      supported: true,
      reasons: [],
    },
    {
      runType: LabRequestRunType.APPEND,
      supported: true,
      reasons: [],
    },
    {
      runType: LabRequestRunType.NEW,
      supported: true,
      reasons: [],
    },
  ];

  const aliases: SelectInstrumentsData["aliases"] = {
    patient: "getPatient",
    instruments: "availableInstruments",
    referenceClassifications: "refClasses",
    doctors: "getDoctors",
    sampleTypes: "availableSampleTypes",
    dilutionConfigs: "dilutionConfigs",
    defaultRunConfigs: "defaultRunConfigs",
    settings: "selectInstrumentsSettings",
    snapDevices: "snapDevices",
    mostRecentRefClass: "mostRecentRefClass",
    executeLabRequestCheck: "executeLabRequestCheck",
    addTestCheck: "addTestCheck",
    ...(values.aliases ?? {}),
  };

  interceptGlobalRequests();

  cy.intercept({ pathname: `**/api/patient/*`, method: "GET" }, patient).as(
    aliases.patient
  );
  cy.intercept(
    { pathname: "**/api/device/status", method: "GET" },
    instruments
  ).as(aliases.instruments);

  instruments.forEach((is) =>
    cy.intercept(
      { pathname: `**/api/device/${is.instrument.id}/status`, method: "GET" },
      is
    )
  );
  cy.intercept(
    {
      pathname: `**/api/species/*/referenceClassifications`,
      method: "GET",
    },
    referenceClassifications
  ).as(aliases.referenceClassifications);

  cy.intercept({ pathname: "**/api/doctor", method: "GET" }, doctors).as(
    aliases.doctors
  );

  cy.intercept(
    {
      pathname: `**/api/species/*/sampleTypes`,
      method: "GET",
    },
    sampleTypes
  ).as(aliases.sampleTypes);
  cy.intercept(
    { pathname: `**/api/device/dilutionConfigs`, method: "GET" },
    dilutionConfigs
  ).as(aliases.dilutionConfigs);
  cy.intercept(
    {
      pathname: `**/api/device/runConfigs`,
      method: "GET",
    },
    defaultRunConfigs
  ).as(aliases.defaultRunConfigs);
  cy.intercept(
    {
      pathname: `**/api/settings`,
      method: "GET",
    },
    settings
  ).as(aliases.settings);
  cy.intercept(
    {
      pathname: `**/api/vp/patient/*/mostRecentRefClass`,
      method: "GET",
    },
    mostRecentRefClass
  ).as(aliases.mostRecentRefClass);
  cy.intercept(
    {
      pathname: `**/api/snapDevice/species/*/devices`,
      method: "GET",
    },
    snapDevices
  ).as(aliases.snapDevices);
  cy.intercept(
    {
      pathname: "**/api/labRequest/*/addTest/validate",
      method: "POST",
    },
    addTestCheck
  ).as(aliases.addTestCheck);

  cy.intercept(
    { pathname: "**/api/instruments/hematology/*/reminders", method: "GET" },
    []
  );

  return {
    patient,
    instruments,
    referenceClassifications,
    doctors,
    sampleTypes,
    dilutionConfigs,
    defaultRunConfigs,
    settings,
    mostRecentRefClass,
    snapDevices,
    addTestCheck,
    aliases: Object.keys(aliases).reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: `@${aliases[curr]}`,
      }),
      {} as SelectInstrumentsData["aliases"]
    ),
  };
}
