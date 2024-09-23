// eslint-disable
/**
 *
 * @export
 */
export const COLLECTION_FORMATS = {
  csv: ",",
  ssv: " ",
  tsv: "\t",
  pipes: "|",
};

export enum InstrumentType {
  LaserCyte = "LASERCYTE",
  VetTest = "VETTEST",
  AutoReader = "AUTOREADER",
  SnapReader = "SNAPREADER",
  VetLyte = "VETLYTE",
  VetStat = "VETSTAT",
  UAAnalyzer = "UA_ANALYZER",
  UriSysDx = "URISYS_DX",
  SNAP = "SNAP",
  CatalystDx = "CATALYST_DX",
  SNAPshotDx = "SNAPSHOT_DX",
  CoagDx = "COAG_DX",
  ProCyteDx = "CRIMSON",
  LaserCyteDx = "LASERCYTE_DX",
  SNAPPro = "SNAPPRO",
  CatalystOne = "CATONE",
  SediVueDx = "URISED",
  ManualUA = "MANUAL_UA",
  ManualCRP = "MANUAL_CRP",
  ProCyteOne = "ACADIA_DX",
  InterlinkPims = "INTERLINK_PIMS",
  SerialPims = "SERIAL_PIMS",
  Theia = "THEIA",
  Tensei = "TENSEI",
}

export enum ServiceCategory {
  Hematology = "Hematology",
  Chemistry = "Chemistry",
  Urinalysis = "Urinalysis",
  Endocrinology = "Endocrinology",
  Serology = "Serology",
  SNAP = "SNAP",
  TherapeuticsToxicology = "TherapeuticsToxicology",
  Microbiology = "Microbiology",
  Parasitology = "Parasitology",
  MolecularDiagnostics = "MolecularDiagnostics",
  Pathology = "Pathology",
  Radiology = "Radiology",
  Other = "Other",
  Cancelled = "Cancelled",
}

export const RawInstrumentRunStatus = {
  Alert: "ALERT",
  At_Instrument: "AT_INSTRUMENT",
  Cancelled: "CANCELLED",
  Complete: "COMPLETE",
  Partial: "PARTIAL",
  Pending: "PENDING",
  Requires_User_Input: "REQUIRES_USER_INPUT",
  Running: "RUNNING",
  NoStatus: "NO_STATUS",
  Timer_Complete: "TIMER_COMPLETE",
  Complete_On_Instrument: "COMPLETE_ON_INSTRUMENT",
} as const;

export type RawInstrumentRunStatus =
  (typeof RawInstrumentRunStatus)[keyof typeof RawInstrumentRunStatus];

export const AdditionalRunStatus = {
  Awaiting_Manual_Entry: "AWAITING_MANUAL_ENTRY",
} as const;

export const InstrumentRunStatus = {
  ...RawInstrumentRunStatus,
  ...AdditionalRunStatus,
} as const;

export type InstrumentRunStatus =
  (typeof InstrumentRunStatus)[keyof typeof InstrumentRunStatus];

export enum SampleTypeEnum {
  SERUMPLASMA = "SERUMPLASMA",
  PLASMA = "PLASMA",
  SERUM = "SERUM",
  WHOLEBLOOD = "WHOLEBLOOD",
  FECAL = "FECAL",
  URINE = "URINE",
  QUALITYCONTROL = "QUALITYCONTROL",
  ABDOMINAL = "ABDOMINAL",
  SYNOVIAL = "SYNOVIAL",
  CEREBROSPINAL = "CEREBROSPINAL",
  THORACIC = "THORACIC",
  OTHER = "OTHER",
  UNKNOWN = "UNKNOWN",
  CSF = "CSF",
  EAR_SWAB = "EAR_SWAB",
  FNA = "FNA",
  BLOOD = "BLOOD",
}

export enum TestingReason {
  WELLNESS_TESTING = "WELLNESS_TESTING",
  SICK_TESTING = "SICK_TESTING",
  MONITORING = "MONITORING",
  PREANESTHESIA = "PREANESTHESIA",
  NONE_GIVEN = "NONE_GIVEN",
}

export enum RunConfiguration {
  DILUTION = "DILUTION",
  SAMPLE_TYPE = "SAMPLE_TYPE",
  UPC = "UPC",
  BACTERIA_REFLEX = "BACTERIA_REFLEX",
}

export enum QualifierTypeEnum {
  NONE = "NONE",
  EQUALITY = "EQUALITY",
  GREATERTHAN = "GREATER_THAN",
  LESSTHAN = "LESS_THAN",
  NOTCALCULATED = "NOT_CALCULATED",
  APPROXIMATE = "APPROXIMATE",
  NOTSET = "NOT_SET",
  SUSPECT = "SUSPECT",
  SUSPECTAUTOREADER = "SUSPECT_AUTOREADER",
  PENDING = "PENDING",
}

export enum SnapResultTypeEnum {
  HEARTWORM_NEGATIVE = "HEARTWORM_NEGATIVE",
  HEARTWORM_WEAK_POSITIVE = "HEARTWORM_WEAK_POSITIVE",
  HEARTWORM_STRONG_POSITIVE = "HEARTWORM_STRONG_POSITIVE",
  CANINE_3DX_NEGATIVE = "CANINE_3DX_NEGATIVE",
  CANINE_3DX_HEARTWORM_POSITIVE = "CANINE_3DX_HEARTWORM_POSITIVE",
  CANINE_3DX_ECANIS_POSITIVE = "CANINE_3DX_ECANIS_POSITIVE",
  CANINE_3DX_LYME_POSITIVE = "CANINE_3DX_LYME_POSITIVE",
  CANINE_3DX_ECANIS_HEARTWORM_POSITIVE = "CANINE_3DX_ECANIS_HEARTWORM_POSITIVE",
  CANINE_3DX_ECANIS_LYME_POSITIVE = "CANINE_3DX_ECANIS_LYME_POSITIVE",
  CANINE_3DX_LYME_HEARTWORM_POSITIVE = "CANINE_3DX_LYME_HEARTWORM_POSITIVE",
  CANINE_3DX_ECANIS_LYME_HEARTWORM_POSITIVE = "CANINE_3DX_ECANIS_LYME_HEARTWORM_POSITIVE",
  CANINE_4DX_NEGATIVE = "CANINE_4DX_NEGATIVE",
  CANINE_4DX_APHAG_BBURG_POSITIVE = "CANINE_4DX_APHAG_BBURG_POSITIVE",
  CANINE_4DX_APHAG_ECANIS_BBURG_POSITIVE = "CANINE_4DX_APHAG_ECANIS_BBURG_POSITIVE",
  CANINE_4DX_APHAG_ECANIS_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_APHAG_ECANIS_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_APHAG_ECANIS_HEARTWORM_POSITIVE = "CANINE_4DX_APHAG_ECANIS_HEARTWORM_POSITIVE",
  CANINE_4DX_APHAG_ECANIS_POSITIVE = "CANINE_4DX_APHAG_ECANIS_POSITIVE",
  CANINE_4DX_APHAG_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_APHAG_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_APHAG_HEARTWORM_POSITIVE = "CANINE_4DX_APHAG_HEARTWORM_POSITIVE",
  CANINE_4DX_APHAG_POSITIVE = "CANINE_4DX_APHAG_POSITIVE",
  CANINE_4DX_BBURG_POSITIVE = "CANINE_4DX_BBURG_POSITIVE",
  CANINE_4DX_ECANIS_BBURG_POSITIVE = "CANINE_4DX_ECANIS_BBURG_POSITIVE",
  CANINE_4DX_ECANIS_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_ECANIS_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_ECANIS_HEARTWORM_POSITIVE = "CANINE_4DX_ECANIS_HEARTWORM_POSITIVE",
  CANINE_4DX_ECANIS_POSITIVE = "CANINE_4DX_ECANIS_POSITIVE",
  CANINE_4DX_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_HEARTWORM_POSITIVE = "CANINE_4DX_HEARTWORM_POSITIVE",
  CANINE_4DX_PLUS_NEGATIVE = "CANINE_4DX_PLUS_NEGATIVE",
  CANINE_4DX_PLUS_ANAPL_BBURG_POSITIVE = "CANINE_4DX_PLUS_ANAPL_BBURG_POSITIVE",
  CANINE_4DX_PLUS_ANAPL_EHRLI_BBURG_POSITIVE = "CANINE_4DX_PLUS_ANAPL_EHRLI_BBURG_POSITIVE",
  CANINE_4DX_PLUS_ANAPL_EHRLI_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_PLUS_ANAPL_EHRLI_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_PLUS_ANAPL_EHRLI_HEARTWORM_POSITIVE = "CANINE_4DX_PLUS_ANAPL_EHRLI_HEARTWORM_POSITIVE",
  CANINE_4DX_PLUS_ANAPL_EHRLI_POSITIVE = "CANINE_4DX_PLUS_ANAPL_EHRLI_POSITIVE",
  CANINE_4DX_PLUS_ANAPL_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_PLUS_ANAPL_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_PLUS_ANAPL_HEARTWORM_POSITIVE = "CANINE_4DX_PLUS_ANAPL_HEARTWORM_POSITIVE",
  CANINE_4DX_PLUS_ANAPL_POSITIVE = "CANINE_4DX_PLUS_ANAPL_POSITIVE",
  CANINE_4DX_PLUS_BBURG_POSITIVE = "CANINE_4DX_PLUS_BBURG_POSITIVE",
  CANINE_4DX_PLUS_EHRLI_BBURG_POSITIVE = "CANINE_4DX_PLUS_EHRLI_BBURG_POSITIVE",
  CANINE_4DX_PLUS_EHRLI_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_PLUS_EHRLI_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_PLUS_EHRLI_HEARTWORM_POSITIVE = "CANINE_4DX_PLUS_EHRLI_HEARTWORM_POSITIVE",
  CANINE_4DX_PLUS_EHRLI_POSITIVE = "CANINE_4DX_PLUS_EHRLI_POSITIVE",
  CANINE_4DX_PLUS_HEARTWORM_BBURG_POSITIVE = "CANINE_4DX_PLUS_HEARTWORM_BBURG_POSITIVE",
  CANINE_4DX_PLUS_HEARTWORM_POSITIVE = "CANINE_4DX_PLUS_HEARTWORM_POSITIVE",
  CANINE_LEISHMANIA_NEGATIVE = "CANINE_LEISHMANIA_NEGATIVE",
  CANINE_LEISHMANIA_POSITIVE = "CANINE_LEISHMANIA_POSITIVE",
  CANINE_PARVO_NEGATIVE = "CANINE_PARVO_NEGATIVE",
  CANINE_PARVO_POSITIVE = "CANINE_PARVO_POSITIVE",
  CANINE_LEPTO_NEGATIVE = "CANINE_LEPTO_NEGATIVE",
  CANINE_LEPTO_POSITIVE = "CANINE_LEPTO_POSITIVE",
  GIARDIA_NEGATIVE = "GIARDIA_NEGATIVE",
  GIARDIA_POSITIVE = "GIARDIA_POSITIVE",
  FELINE_COMBO_NEGATIVE = "FELINE_COMBO_NEGATIVE",
  FELINE_COMBO_FIV_POSITIVE = "FELINE_COMBO_FIV_POSITIVE",
  FELINE_COMBO_FELV_POSITIVE = "FELINE_COMBO_FELV_POSITIVE",
  FELINE_COMBO_FIV_FELV_POSITIVE = "FELINE_COMBO_FIV_FELV_POSITIVE",
  FELINE_FELV_NEGATIVE = "FELINE_FELV_NEGATIVE",
  FELINE_FELV_POSITIVE = "FELINE_FELV_POSITIVE",
  FELINE_TRIPLE_NEGATIVE = "FELINE_TRIPLE_NEGATIVE",
  FELINE_TRIPLE_HEARTWORM_POSITIVE = "FELINE_TRIPLE_HEARTWORM_POSITIVE",
  FELINE_TRIPLE_FIV_POSITIVE = "FELINE_TRIPLE_FIV_POSITIVE",
  FELINE_TRIPLE_FELV_POSITIVE = "FELINE_TRIPLE_FELV_POSITIVE",
  FELINE_TRIPLE_FIV_HEARTWORM_POSITIVE = "FELINE_TRIPLE_FIV_HEARTWORM_POSITIVE",
  FELINE_TRIPLE_FELV_HEARTWORM_POSITIVE = "FELINE_TRIPLE_FELV_HEARTWORM_POSITIVE",
  FELINE_TRIPLE_FELV_FIV_POSITIVE = "FELINE_TRIPLE_FELV_FIV_POSITIVE",
  FELINE_TRIPLE_FELV_FIV_HEARTWORM_POSITIVE = "FELINE_TRIPLE_FELV_FIV_HEARTWORM_POSITIVE",
  FELINE_FPL_NORMAL = "FELINE_FPL_NORMAL",
  FELINE_FPL_ABNORMAL = "FELINE_FPL_ABNORMAL",
  EQUINE_FOAL_IGG_400_POSITIVE = "EQUINE_FOAL_IGG_400_POSITIVE",
  EQUINE_FOAL_IGG_400_800_POSITIVE = "EQUINE_FOAL_IGG_400_800_POSITIVE",
  EQUINE_FOAL_IGG_800_POSITIVE = "EQUINE_FOAL_IGG_800_POSITIVE",
  CANINE_CPL_NORMAL = "CANINE_CPL_NORMAL",
  CANINE_CPL_ABNORMAL = "CANINE_CPL_ABNORMAL",
  FELINE_FBNP_NORMAL = "FELINE_FBNP_NORMAL",
  FELINE_FBNP_ABNORMAL = "FELINE_FBNP_ABNORMAL",
  FECAL_NEGATIVE = "FECAL_NEGATIVE",
  FECAL_HOOK_POSITIVE = "FECAL_HOOK_POSITIVE",
  FECAL_ROUND_POSITIVE = "FECAL_ROUND_POSITIVE",
  FECAL_WHIP_POSITIVE = "FECAL_WHIP_POSITIVE",
  FECAL_HOOK_ROUND_POSITIVE = "FECAL_HOOK_ROUND_POSITIVE",
  FECAL_HOOK_WHIP_POSITIVE = "FECAL_HOOK_WHIP_POSITIVE",
  FECAL_ROUND_WHIP_POSITIVE = "FECAL_ROUND_WHIP_POSITIVE",
  FECAL_HOOK_ROUND_WHIP_POSITIVE = "FECAL_HOOK_ROUND_WHIP_POSITIVE",
  CANINE_ANGIO_DETECT_POSITIVE = "CANINE_ANGIO_DETECT_POSITIVE",
  CANINE_ANGIO_DETECT_NEGATIVE = "CANINE_ANGIO_DETECT_NEGATIVE",
  CANINE_LEISHMANIA2SPOT_POSITIVE = "CANINE_LEISHMANIA2SPOT_POSITIVE",
  CANINE_LEISHMANIA2SPOT_NEGATIVE = "CANINE_LEISHMANIA2SPOT_NEGATIVE",
  CANINE_LEISH_4DX_NEGATIVE = "CANINE_LEISH_4DX_NEGATIVE",
  CANINE_LEISH_4DX_ANAPL_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_ANAPL_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_ANAPL_EHRLI_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_ANAPL_EHRLI_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_ANAPL_EHRLI_HEARTWORM_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_ANAPL_EHRLI_HEARTWORM_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_ANAPL_EHRLI_HEARTWORM_POSITIVE = "CANINE_LEISH_4DX_ANAPL_EHRLI_HEARTWORM_POSITIVE",
  CANINE_LEISH_4DX_ANAPL_EHRLI_POSITIVE = "CANINE_LEISH_4DX_ANAPL_EHRLI_POSITIVE",
  CANINE_LEISH_4DX_ANAPL_HEARTWORM_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_ANAPL_HEARTWORM_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_ANAPL_HEARTWORM_POSITIVE = "CANINE_LEISH_4DX_ANAPL_HEARTWORM_POSITIVE",
  CANINE_LEISH_4DX_ANAPL_POSITIVE = "CANINE_LEISH_4DX_ANAPL_POSITIVE",
  CANINE_LEISH_4DX_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_EHRLI_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_EHRLI_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_EHRLI_HEARTWORM_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_EHRLI_HEARTWORM_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_EHRLI_HEARTWORM_POSITIVE = "CANINE_LEISH_4DX_EHRLI_HEARTWORM_POSITIVE",
  CANINE_LEISH_4DX_EHRLI_POSITIVE = "CANINE_LEISH_4DX_EHRLI_POSITIVE",
  CANINE_LEISH_4DX_HEARTWORM_LEISHMANIA_POSITIVE = "CANINE_LEISH_4DX_HEARTWORM_LEISHMANIA_POSITIVE",
  CANINE_LEISH_4DX_HEARTWORM_POSITIVE = "CANINE_LEISH_4DX_HEARTWORM_POSITIVE",
}

export enum SettingTypeEnum {
  AUTOMATICALLY_PRINT = "AUTOMATICALLY_PRINT",
  AUTO_PRINT_EXCEPTION_MANUAL_SNAP = "AUTOPRINT_EXCEPTION_MANUALSNAP",
  AUTO_PRINT_EXCEPTION_SNAPPRO = "AUTOPRINT_EXCEPTION_SNAPPRO",
  AUTO_PRINT_DIAGNOSTIC_REPORT = "AUTOPRINT_DIAGNOSTIC_REPORT",
  BACKUP_ON_EXIT = "BACKUP_ON_EXIT",
  DISPLAY_BEEP_ALERT = "DISPLAY_BEEP_ALERT",
  DISPLAY_BLINK_NEW_RESULTS = "DISPLAY_BLINK_NEW_RESULTS",
  DISPLAY_CENSUS_LIST = "DISPLAY_CENSUSLIST",
  DISPLAY_CLIENT_FIRST_NAME = "DISPLAY_CLIENT_FIRSTNAME",
  DISPLAY_CLIENT_LAST_NAME = "DISPLAY_CLIENT_LASTNAME",
  DISPLAY_DOCTOR_NAME = "DISPLAY_DOCTOR_NAME",
  DISPLAY_ENGLISH_ASSAY_NAME = "DISPLAY_ENGLISH_ASSAY_NAME",
  DISPLAY_PATIENT_BREED = "DISPLAY_PATIENT_BREED",
  DISPLAY_PATIENT_GENDER = "DISPLAY_PATIENT_GENDER",
  DISPLAY_PATIENT_WEIGHT = "DISPLAY_PATIENT_WEIGHT",
  DISPLAY_REASON_FOR_TESTING = "DISPLAY_REASON_FOR_TESTING",
  DISPLAY_PENDING_REQUESTS = "DISPLAY_PENDING_REQUESTS",
  DISPLAY_PROCYTE_INTERPRETIVE_COMMENTS = "DISPLAY_PROCYTE_INTERPRETIVE_COMMENTS",
  DISPLAY_URINALYSIS_INTERPRETIVE_COMMENTS = "DISPLAY_URINALYSIS_INTERPRETIVE_COMMENTS",
  PRINT_INVUE_IMAGES = "PRINT_INVUE_IMAGES",
  DISPLAY_RECENT_RESULTS = "DISPLAY_RECENT_RESULTS",
  DISPLAY_REQUISITION_ID = "DISPLAY_REQUISITION_ID",
  DISPLAY_ONLY_SHOW_PATIENTS_WITH_RESULTS = "DISPLAY_ONLY_SHOW_PATIENTS_WITH_RESULTS",
  DISPLAY_SHOW_ALERT = "DISPLAY_SHOW_ALERT",
  ENABLE_SCOPE_LOGGING = "ENABLE_SCOPE_LOGGING",
  ENABLE_STAT = "ENABLE_STAT",
  FIRST_BOOT = "FIRST_BOOT",
  INCLUDE_UA_PHYSICAL_EXAM = "INCLUDE_UA_PHYSICAL_EXAM",
  INCLUDE_UA_SEDIMENT_EXAM = "INCLUDE_UA_SEDIMENT_EXAM",
  PRINT_LASERCYTE_DOT_PLOTS = "PRINT_LASERCYTE_DOTPLOTS",
  PRINT_PROCYTE_DOT_PLOTS = "PRINT_PROCYTE_DOTPLOTS",
  PRINT_PROCYTE_ONE_DOT_PLOTS = "PRINT_PROCYTE_ONE_DOTPLOTS",
  PRINT_RESULT_REPORT_NATURAL_PAGE_BREAK = "PRINT_RESULT_REPORT_NATURAL_PAGEBREAK",
  REQUIRE_REQUISITION_ID = "REQUIRE_REQUISITION_ID",
  RUSSIAN_SWITCH_KEY_TOGGLED = "RUSSIAN_SWITCH_KEY_TOGGLED",
  SHUTDOWN_ON_EXIT = "SHUTDOWN_ON_EXIT",
  IVLS_UPGRADE_ATTEMPTED = "IVLS_UPGRADE_ATTEMPTED",
  IVLS_UPGRADE_SUCCESS = "IVLS_UPGRADE_SUCCESS",
  PRINT_CHINESE_REPORT = "PRINT_CHINESE_REPORT",
  DISPLAY_BEEP_ALERT_DURATION = "DISPLAY_BEEP_ALERT_DURATION",
  DISPLAY_BLINK_NEW_RESULTS_DURATION = "DISPLAY_BLINK_NEW_RESULTS_DURATION",
  PRINT_LINES_FOR_LETTERHEAD = "PRINT_LINES_FOR_LETTERHEAD",
  PRINT_NUMBER_OF_COPIES = "PRINT_NUMBER_OF_COPIES",
  CLINIC_COUNTRY = "CLINIC_COUNTRY",
  CLINIC_LANGUAGE = "CLINIC_LANGUAGE",
  LAST_VIEWED_PIMS_LIST = "LAST_VIEWED_PIMS_LIST",
  OUT_OF_RANGE_RESULTS_HIGH = "OUT_OF_RANGE_RESULTS_HIGH",
  OUT_OF_RANGE_RESULTS_LOW = "OUT_OF_RANGE_RESULTS_LOW",
  ABNORMAL_RESULT_COLOR = "ABNORMAL_RESULT_COLOR",
  DEFAULT_PRINTER = "DEFAULT_PRINTER",
  DEFAULT_PAPER_SIZE = "DEFAULT_PAPER_SIZE",
  PRINT_HEADER_LINE_1 = "PRINT_HEADER_LINE_1",
  PRINT_HEADER_LINE_2 = "PRINT_HEADER_LINE_2",
  PRINT_HEADER_LINE_3 = "PRINT_HEADER_LINE_3",
  PRINT_HEMATOLOGY_MESSAGE_CODES = "PRINT_HEMATOLOGY_MESSAGE_CODES",
  PRINT_QUALITY = "PRINT_QUALITY",
  PRINT_REPORT_HEADER_OPTION = "PRINT_REPORT_HEADER_OPTION",
  PRINT_RESULT_REPORT_FORMAT = "PRINT_RESULT_REPORT_FORMAT",
  PRINT_TEST_RESULTS_ORDER = "PRINT_TEST_RESULTS_ORDER",
  SAP_REFERENCE_NUMBER = "SAP_REFERENCE_NUMBER",
  UNIT_SYSTEM = "UNIT_SYSTEM",
  WEIGHT_UNIT_TYPE = "WEIGHT_UNIT_TYPE",
  RECEIVE_REFLAB_RESULTS = "RECEIVE_REFLAB_RESULTS",
  SHOW_GREAT_NEWS = "SHOW_GREAT_NEWS",
  BACKUP_CATALYSTDX_ACTIVITY_LOG = "BACKUP_CATALYSTDX_ACTIVITY_LOG",
  BACKUP_CATALYSTDX_DATA_LOG = "BACKUP_CATALYSTDX_DATA_LOG",
  BACKUP_CATALYSTDX_ERROR_LOG = "BACKUP_CATALYSTDX_ERROR_LOG",
  DEBUG_LC_ALERTS = "DEBUG_LC_ALERTS",
  LASERCYTE_SYNOVIAL_FLUID_REMINDER = "LASERCYTE_SYNOVIAL_FLUID_REMINDER",
  LASERCYTEDX_SYNOVIAL_FLUID_REMINDER = "LASERCYTEDX_SYNOVIAL_FLUID_REMINDER",
  INVERT_SAMPLE_REMINDER = "INVERT_SAMPLE_REMINDER",
  REAGENT_LOW_REMINDER = "REAGENT_LOW_REMINDER",
  PROCYTE_SYNOVIAL_FLUID_REMINDER = "PROCYTE_SYNOVIAL_FLUID_REMINDER",
  PROCYTE_ONE_INVERT_SAMPLE_REMINDER = "PROCYTE_ONE_INVERT_SAMPLE_REMINDER",
  SNAP_CANINE3DX = "SNAP_CANINE3DX",
  SNAP_CANINE4DX = "SNAP_CANINE4DX",
  SNAP_CANINE4DXPLUS = "SNAP_CANINE4DXPLUS",
  SNAP_CANINECPL = "SNAP_CANINECPL",
  SNAP_CANINEGIARDIA = "SNAP_CANINEGIARDIA",
  SNAP_CANINEHEARTWORM = "SNAP_CANINEHEARTWORM",
  SNAP_CANINELEISHMANIA = "SNAP_CANINELEISHMANIA",
  SNAP_CANINELEISHMANIA2SPOT = "SNAP_CANINELEISHMANIA2SPOT",
  SNAP_CANINELEPTO = "SNAP_CANINELEPTO",
  SNAP_CANINEPARVO = "SNAP_CANINEPARVO",
  SNAP_COMPLETIONBEEP = "SNAP_COMPLETIONBEEP",
  SNAP_ENABLETIMER = "SNAP_ENABLETIMER",
  SNAP_EQUINEFOALIGG = "SNAP_EQUINEFOALIGG",
  SNAP_FELINECOMBO = "SNAP_FELINECOMBO",
  SNAP_FELINECOMBOPLUS = "SNAP_FELINECOMBOPLUS",
  SNAP_FELINEFBNP = "SNAP_FELINEFBNP",
  SNAP_FELINEFELV = "SNAP_FELINEFELV",
  SNAP_FELINEFPL = "SNAP_FELINEFPL",
  SNAP_FELINEGIARDIA = "SNAP_FELINEGIARDIA",
  SNAP_FELINEHEARTWORM = "SNAP_FELINEHEARTWORM",
  SNAP_FELINEHEARTWORMRT = "SNAP_FELINEHEARTWORMRT",
  SNAP_FELINETRIPLE = "SNAP_FELINETRIPLE",
  SNAP_CANINEFECAL = "SNAP_CANINEFECAL",
  SNAP_FELINEFECAL = "SNAP_FELINEFECAL",
  SNAP_CANINEANGIODETECT = "SNAP_CANINEANGIODETECT",
  BACKUP_SNAPSHOTDX_ACTIVITY_LOG = "BACKUP_SNAPSHOTDX_ACTIVITY_LOG",
  BACKUP_SNAPSHOTDX_DATA_LOG = "BACKUP_SNAPSHOTDX_DATA_LOG",
  BACKUP_SNAPSHOTDX_ERROR_LOG = "BACKUP_SNAPSHOTDX_ERROR_LOG",
  ALERT_WARNING_DURATION = "ALERT_WARNING_DURATION",
  CATALYSTDX_QC_DATA_INTERVAL = "CATALYSTDX_QC_DATA_INTERVAL",
  INSTRUMENT_UPGRADE_NEXT_OFFER_WAIT = "INSTRUMENT_UPGRADE_NEXT_OFFER_WAIT",
  PROCYTE_COMMUNICATION_ERROR_THRESHOLD = "PROCYTE_COMMUNICATION_ERROR_THRESHOLD",
  PROCYTE_MAX_REPLACE_COUNT = "PROCYTE_MAX_REPLACE_COUNT",
  PROCYTE_REAGENT_LIMIT = "PROCYTE_REAGENT_LIMIT",
  PROCYTE_STAIN_LIMIT = "PROCYTE_STAIN_LIMIT",
  PROCYTE_SW_UPGRADE_TIMEOUT = "PROCYTE_SW_UPGRADE_TIMEOUT",
  PROCYTE_UNINTENTIONAL_OFFLINE = "PROCYTE_UNINTENTIONAL_OFFLINE",
  UDO_INTERVAL = "UDO_INTERVAL",
  INSTRUMENT_UPGRADE_POLL_INTERVAL = "INSTRUMENT_UPGRADE_POLL_INTERVAL",
  VNC_CONNECT = "VNC_CONNECT",
  URISED_IMAGE_CAPTURE_COUNT = "URISED_IMAGE_CAPTURE_COUNT",
  URISED_IMAGE_TRANSER_COUNT = "URISED_IMAGE_TRANSER_COUNT",
  URISED_INCLUDE_IMAGE_ON_REPORT = "URISED_INCLUDE_IMAGE_ON_REPORT",
  URISED_ONLY_IF_SEDIMENT_PRESENT = "URISED_ONLY_IF_SEDIMENT_PRESENT",
  MANUAL_UA_AUTO_ADD = "MANUAL_UA_AUTO_ADD",
  URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED = "URISYS_DX_SAMPLE_PREP_INSTRUCTIONS_ENABLED",
  UA_REPORTING_UNIT_TYPE = "UA_REPORTING_UNIT_TYPE",
  ESUPPORT_ENABLE_ESUPPORT = "ESUPPORT_ENABLE_ESUPPORT",
  ESUPPORT_ESUPPORT_ACTIVATED = "ESUPPORT_ESUPPORT_ACTIVATED",
  ESUPPORT_ESUPPORT_EULA_ACCEPTED = "ESUPPORT_ESUPPORT_EULA_ACCEPTED",
  ESUPPORT_RUN_ENABLE_ESUPPORT = "ESUPPORT_RUN_ENABLE_ESUPPORT",
  SMARTSERVICE_DATE = "SMARTSERVICE_DATE",
  SMARTSERVICE_UPGRADE_DATE = "SMARTSERVICE_UPGRADE_DATE",
  SMARTSERVICE_OFFLINE_TIME = "SMARTSERVICE_OFFLINE_TIME",
  SMARTSERVICE_UPGRADE_IGNORE_COUNT = "SMARTSERVICE_UPGRADE_IGNORE_COUNT",
  SMARTSERVICE_COUNTRY = "SMARTSERVICE_COUNTRY",
  SMARTSERVICE_LANGUAGE = "SMARTSERVICE_LANGUAGE",
  SMARTSERVICE_REGION = "SMARTSERVICE_REGION",
  SMARTSERVICE_UPGRADE_STATUS = "SMARTSERVICE_UPGRADE_STATUS",
  SMARTSERVICE_OFFLINE_DATE = "SMARTSERVICE_OFFLINE_DATE",
  SMARTSERVICE_SHOW_OFFLINE_NOTIFICATION_DATE = "SMARTSERVICE_SHOW_OFFLINE_NOTIFICATION_DATE",
  MC_SMARTSERVICE_OFFLINE_FLAG = "MC_SMARTSERVICE_OFFLINE_FLAG",
  MC_SMARTSERVICE_OFFLINE_WAIT_NOTIFICATION_IN_MINUTES = "MC_SMARTSERVICE_OFFLINE_WAIT_NOTIFICATION_IN_MINUTES",
  MC_SMARTSERVICE_OFFLINE_TIME = "MC_SMARTSERVICE_OFFLINE_TIME",
  MC_SMARTSERVICE_NOTIFICATION_INTERVAL = "MC_SMARTSERVICE_NOTIFICATION_INTERVAL",
  DELTA_CONTROL_MODE = "DELTA_CONTROL_MODE",
  AUTO_BACKUPS_ENABLED = "AUTO_BACKUPS_ENABLED",
  PPR_DISCONNECTION_DATE = "PPR_DISCONNECTION_DATE",
  PPR_MAX_OFFLINE_WARNING_DAYS = "PPR_MAX_OFFLINE_WARNING_DAYS",
  PPR_ENABLED = "PPR_ENABLED",
  PPR_WARNING_DISPLAYED = "PPR_WARNING_DISPLAYED",
  PPR_MONITOR_FREQUENCY = "PPR_MONITOR_FREQUENCY",
  PPR_REMIND_ME_LATER_DURATION_SECONDS = "PPR_REMIND_ME_LATER_DURATION_SECONDS",
  NIGHTLY_BACKUP_PATH = "NIGHTLY_BACKUP_PATH",
  MAX_LOCAL_BACKUPS = "MAX_LOCAL_BACKUPS",
  DATABASES_TO_BACKUP = "DATABASES_TO_BACKUP",
  PIMS_AUTOCONNECT = "PIMS_AUTOCONNECT",
  PIMS_HISTORYDATE = "PIMS_HISTORYDATE",
  PIMS_INTERLINK_GROUP_PORT = "PIMS_INTERLINK_GROUP_PORT",
  PIMS_WINDOWS_STARTUP_WAIT_PERIOD = "PIMS_WINDOWS_STARTUP_WAIT_PERIOD",
  PIMS_AGREED_TO_THIRD_PARTY_PIMS_EULA = "PIMS_AGREED_TO_THIRD_PARTY_PIMS_EULA",
  PIMS_CONNECTION_TYPE = "PIMS_CONNECTION_TYPE",
  PIMS_TRANSMIT_RESULTS = "PIMS_TRANSMIT_RESULTS",
  ROUTER_FIRMWARE_VERSION = "ROUTER_FIRMWARE_VERSION",
  ROUTER_MODEL_NUMBER = "ROUTER_MODEL_NUMBER",
  ROUTER_WAN_IP_CHOICE = "ROUTER_WAN_IP_CHOICE",
  PIMS_INTERLINK_GROUP_ADDRESS = "PIMS_INTERLINK_GROUP_ADDRESS",
  PIMS_IVLS_INTEGRATION_ID = "PIMS_IVLS_INTEGRATION_ID",
  PIMS_IVLS_INTEGRATION_NAME = "PIMS_IVLS_INTEGRATION_NAME",
  PIMS_IP_ADDRESS = "PIMS_IP_ADDRESS",
  ROUTER_PASSWORD = "ROUTER_PASSWORD",
  REFERENCE_LAB_RESULT_POLLING_INTERVAL_SECONDS = "REFERENCE_LAB_RESULT_POLLING_INTERVAL_SECONDS",
  REFERENCE_LAB_RESULT_POLLING_WINDOW_HOURS = "REFERENCE_LAB_RESULT_POLLING_WINDOW_HOURS",
  CATONE_SMARTQC_REMINDER_WEEKS = "CATONE_SMARTQC_REMINDER_WEEKS",
  CATONE_SMARTQC_REMINDER_DAY = "CATONE_SMARTQC_REMINDER_DAY",
  CATONE_SMARTQC_REMINDER_HOUR = "CATONE_SMARTQC_REMINDER_HOUR",
  CATONE_SMARTQC_NEXT_NOTIFICATION_DATE = "CATONE_SMARTQC_NEXT_NOTIFICATION_DATE",
  CATONE_SMARTQC_REMINDER_DEFERRAL_COUNT = "CATONE_SMARTQC_REMINDER_DEFERRAL_COUNT",
  CATDX_SMARTQC_REMINDER_WEEKS = "CATDX_SMARTQC_REMINDER_WEEKS",
  CATDX_SMARTQC_REMINDER_DAY = "CATDX_SMARTQC_REMINDER_DAY",
  CATDX_SMARTQC_REMINDER_HOUR = "CATDX_SMARTQC_REMINDER_HOUR",
  CATDX_SMARTQC_NEXT_NOTIFICATION_DATE = "CATDX_SMARTQC_NEXT_NOTIFICATION_DATE",
  CATDX_SMARTQC_REMINDER_DEFERRAL_COUNT = "CATDX_SMARTQC_REMINDER_DEFERRAL_COUNT",
}

export enum PatientWeightUnitsEnum {
  POUNDS = "POUNDS",
  KILOGRAMS = "KILOGRAMS",
}

export enum PatientUnitSystemEnum {
  US = "English",
  SI = "S.I.",
  FRENCH = "French",
}

export enum RequestOriginEnum {
  UNKNOWN = "UNKNOWN",
  MANUAL = "MANUAL",
  INTERLINK = "INTERLINK",
  SMARTLINK = "SMARTLINK",
  NEO = "NEO",
  DROPANDRUN = "DROP_AND_RUN",
  IHDIG = "IHDIG",
}

export enum PimsRequestStatusEnum {
  RECEIVED = "RECEIVED",
  UPDATED = "UPDATED",
  CANCELLED = "CANCELLED",
  CLAIMED = "CLAIMED",
  PROCESSED = "PROCESSED",
  INPROCESS = "IN_PROCESS",
  COMPLETED = "COMPLETED",
  CENSUSIN = "CENSUS_IN",
  CENSUSOUT = "CENSUS_OUT",
  ARCHIVED = "ARCHIVED",
}

export enum PimsRequestTypeEnum {
  CENSUS = "CENSUS",
  PENDING = "PENDING",
}

export enum InstrumentStatus {
  Ready = "READY",
  Busy = "BUSY",
  Offline = "OFFLINE",
  Standby = "STANDBY",
  Alert = "ALERT",
  Not_Ready = "NOT_READY",
  Unknown = "UNKNOWN",
  Sleep = "SLEEP",
}

export enum ManualEntryTypeEnum {
  ONLY = "UA_USG_ONLY",
  ANDCHEM = "UA_USG_AND_CHEM",
}

export enum TestProtocolEnum {
  FULLANALYSIS = "FULL_ANALYSIS",
  BACTERIALREFLEX = "BACTERIAL_REFLEX",
}

export enum MostRecentResultEnum {
  PASS = "PASS",
  OUTOFRANGE = "OUT_OF_RANGE",
}

export enum ResultEnum {
  PASS = "PASS",
  OUTOFRANGE = "OUT_OF_RANGE",
}

export enum BackupSourceEnum {
  LABSTATIONDB = "LABSTATION_DB",
  SETTINGSDB = "SETTINGS_DB",
  JACKALOPEDB = "JACKALOPE_DB",
  LCCALIBRATION = "LC_CALIBRATION",
  PDXCALIBRATION = "PDX_CALIBRATION",
}

export enum BackupSourceCategoryEnum {
  PATIENT = "PATIENT",
  SETTINGS = "SETTINGS",
  CALIBRATION = "CALIBRATION",
}

export enum FlatFileTypeEnum {
  LABSTATIONDB = "LABSTATION_DB",
  SETTINGSDB = "SETTINGS_DB",
  JACKALOPEDB = "JACKALOPE_DB",
  LCCALIBRATION = "LC_CALIBRATION",
  PDXCALIBRATION = "PDX_CALIBRATION",
}

export enum SampleDrawerPositionEnum {
  OPENED = "OPENED",
  CLOSED = "CLOSED",
}

export enum UriSysReportingUnitTypeEnum {
  ARBITRARY = "Arbitrary",
  CONVENTIONAL = "Conventional",
  SI = "SI",
  ARBITRARY_CONVENTIONAL = "ArbitraryConventional",
  ARBITRARY_SI = "ArbitrarySI",
}

export enum BarcodeStatusEnum {
  ACCEPTED = "ACCEPTED",
  CROSSCHECKSUMERROR = "CROSS_CHECKSUM_ERROR",
  LENGTHERROR = "LENGTH_ERROR",
}

export enum CurrentBarcodeStatusEnum {
  BARCODEACCEPTED = "BARCODE_ACCEPTED",
  BARCODEERROR = "BARCODE_ERROR",
  CROSSCHECKSUMERROR = "CROSS_CHECKSUM_ERROR",
  NOERRORS = "NO_ERRORS",
  INVALIDBARCODECOUNT = "INVALID_BARCODE_COUNT",
  FLUIDTYPEMISSING = "FLUID_TYPE_MISSING",
  LOTEXPIRED = "LOT_EXPIRED",
}

export enum BarcodeValidationResult {
  VALID = "VALID",
  BARCODE_ERROR = "BARCODE_ERROR",
  MAX_REPLACEMENT_REACHED = "MAX_REPLACEMENT_REACHED",
  REAGENT_EXPIRED = "REAGENT_EXPIRED",
  SUFFICIENT_VOLUME = "SUFFICIENT_VOLUME",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export enum UsageEnum {
  USED = "USED",
  UNUSED = "UNUSED",
  USEDSUPPRESSED = "USED_SUPPRESSED",
  USEDNORESULTS = "USED_NO_RESULTS",
  USEDCANCELLED = "USED_CANCELLED",
}

export enum DilutionTypeEnum {
  NOTDEFINED = "NOTDEFINED",
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
  UPCAUTOMATIC = "UPC_AUTOMATIC",
}

export enum WanIpChoiceEnum {
  UNKNOWN = "UNKNOWN",
  DYNAMIC = "DYNAMIC",
  STATIC = "STATIC",
}

export enum OrderStatusEnum {
  INPROCESS = "INPROCESS",
  COMPLETE = "COMPLETE",
  CANCELLED = "CANCELLED",
}

export enum StatusDetailEnum {
  ATLAB = "ATLAB",
  PARTIAL = "PARTIAL",
  DELAYED = "DELAYED",
}

export enum ModeEnum {
  ALL = "ALL",
  PATIENT = "PATIENT",
  CALIBRATION = "CALIBRATION",
  SETTINGS = "SETTINGS",
}

export enum VersionEnum {
  LEGACY = "LEGACY",
  JSON = "JSON",
  ARCHIVE = "ARCHIVE",
  EMERGENCYRESTORE = "EMERGENCY_RESTORE",
  CIA = "CIA",
}

export enum SmartServicePropertyUnitsEnum {
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
}

export enum WindowsEulaTypeEnum {
  ANTLR = "ANTLR",
  AOPALLIANCE = "AOPALLIANCE",
  APACHE = "APACHE",
  BOUNCYCASTLE = "BOUNCY_CASTLE",
  CDDL = "CDDL",
  CPL = "CPL",
  CPOL = "CPOL",
  CRIMSON = "CRIMSON",
  DOM4J = "DOM4J",
  ECLIPSE = "ECLIPSE",
  ERLANG = "ERLANG",
  HAMCREST = "HAMCREST",
  JSOUP = "JSOUP",
  LGPL = "LGPL",
  MOCKITO = "MOCKITO",
  MOZILLA = "MOZILLA",
  OBJENESIS = "OBJENESIS",
  ORACLEBCL = "ORACLE_BCL",
  SLF4J = "SLF4J",
  SPRINGTEMPLATE = "SPRING_TEMPLATE",
  VCPLUS = "VCPLUS",
  WINDOWS = "WINDOWS",
  WINDOWSXP = "WINDOWS_XP",
  WINDOWS7 = "WINDOWS_7",
  WINDOWS10 = "WINDOWS_10",
  WINDOWS11 = "WINDOWS_11",
  XMLPULL = "XMLPULL",
  XPP3 = "XPP3",
  XSTREAM = "XSTREAM",
  SQLSERVER2008 = "SQL_SERVER_2008",
  SQLSERVER2016 = "SQL_SERVER_2016",
  SYBASE = "SYBASE",
  TEAMDEV = "TEAMDEV",
  MIGLAYOUT = "MIG_LAYOUT",
  R7000 = "R7000",
  RABBITMQ = "RABBIT_MQ",
}

export enum TimeZoneMigrationTypeEnum {
  FULL = "FULL",
  PARTIAL = "PARTIAL",
  NONE = "NONE",
}

export enum UpgradeRouterStatusEnum {
  NOMINAL = "NOMINAL",
  AVAILABLE = "AVAILABLE",
  INITIATED = "INITIATED",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export enum DatabaseStatusEnum {
  UNKNOWN = "UNKNOWN",
  OK = "OK",
  CREATED = "CREATED",
  RESTORED = "RESTORED",
}

export enum SpeciesType {
  Unknown = "Unknown",
  Canine = "Canine",
  Feline = "Feline",
  Equine = "Equine",
  Avian = "Avian",
  Bovine = "Bovine",
  Rabbit = "Rabbit",
  Mouse = "Mouse",
  Rat = "Rat",
  Monkey = "Monkey",
  Llama = "Llama",
  Sheep = "Sheep",
  Goat = "Goat",
  Ferret = "Ferret",
  Lizard = "Lizard",
  Snake = "Snake",
  Tortoise = "Tortoise",
  Pig = "Pig",
  Other = "Other",
  Control = "Control",
  SeaTurtle = "Sea Turtle",
  MiniPig = "Mini Pig",
  Gerbil = "Gerbil",
  GuineaPig = "Guinea pig", // the p is intentionally lower case
  Alpaca = "Alpaca",
  Camel = "Camel",
  Dolphin = "Dolphin",
  Hamster = "Hamster",
}

export enum ReferenceClassType {
  LifeStage = "LifeStage", // Ref class is "lifestage" e.g. adult canine, puppy, geriatric, etc.
  Type = "Type", // Ref class is "Type", e.g. dairy cow, beef cattle, etc.
  Other = "Other", // No ref classes
}

export enum BarcodeType {
  CUVETTES = "CUVETTES",
  REAGENT = "REAGENT",
  SHEATH = "SHEATH",
  SMART_QC = "SMART_QC",
  BLOOD = "BLOOD",
  EAR_SWAB = "EAR_SWAB",
  FNA = "FNA",
}

export enum PimsConnectionType {
  NONE = "NONE",
  SERIAL = "SERIAL",
  CORNERSTONE_SERIAL = "CORNERSTONE_SERIAL",
  CORNERSTONE_NETWORK = "CORNERSTONE_NETWORK",
  NETWORK = "NETWORK",
}

export enum PimsTransmissionType {
  TRANSMIT_OFF = "TRANSMIT_OFF",
  TRANSMIT_RESULTS_ONLY = "TRANSMIT_RESULTS_ONLY",
  TRANSMIT_RESULTS_AND_REPORT = "TRANSMIT_RESULTS_AND_REPORT",
}

export enum SmartServiceStatus {
  NOT_ACTIVATED = "NOT_ACTIVATED", // EULA not accepted

  DISABLED = "DISABLED", // EULA is accepted and not enabled in DB during startup OR disabled by user later

  CONNECTED = "CONNECTED", // EULA is accepted and enabled in DB during startup, and agent has status running

  OFFLINE = "OFFLINE", // EULA is accepted and enabled in DB during startup, and agent has status not running or exception

  CONNECTING = "CONNECTING", // EULA is accepted and enabled in DB during startup, and agent started communication
}

// com.idexx.labstation.core.domain.CommentTypeQualifier
export enum TranslatedNoteType {
  DIAGNOSTIC_CONSIDERATION = "DC",
  FOOT_NOTE = "FN",
  GENERIC = "G",
}

export interface TranslatedNoteDto {
  text: string;
  type?: string;
}

export interface HashedNoteDto {
  note: string;
  type?: string;
  hashId: string;
}

/**
 *
 * @export
 * @interface AcadiaQualityControlLotDto
 */
export interface AcadiaQualityControlLotDto {
  /**
   *
   * @type {number}
   * @memberof AcadiaQualityControlLotDto
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof AcadiaQualityControlLotDto
   */
  instrumentType?: InstrumentType;
  /**
   *
   * @type {string}
   * @memberof AcadiaQualityControlLotDto
   */
  lotNumber?: string;
  /**
   *
   * @type {boolean}
   * @memberof AcadiaQualityControlLotDto
   */
  enabled?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof AcadiaQualityControlLotDto
   */
  canRun?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof AcadiaQualityControlLotDto
   */
  isExpired?: boolean;
  /**
   *
   * @type {Array<QualityControlReferenceRangeDto>}
   * @memberof AcadiaQualityControlLotDto
   */
  qcReferenceRangeDtos?: Array<QualityControlReferenceRangeDto>;
  /**
   *
   * @type {Date}
   * @memberof AcadiaQualityControlLotDto
   */
  mostRecentRunDate?: Date;
  /**
   *
   * @type {Date}
   * @memberof AcadiaQualityControlLotDto
   */
  expirationOpenDate?: Date;
  /**
   *
   * @type {string}
   * @memberof AcadiaQualityControlLotDto
   */
  mostRecentResult?: MostRecentResultEnum;
  /**
   *
   * @type {Date}
   * @memberof AcadiaQualityControlLotDto
   */
  enteredDate?: Date;
  /**
   *
   * @type {Date}
   * @memberof AcadiaQualityControlLotDto
   */
  expirationDate?: Date;
}

/**
 *
 * @export
 * @interface AcadiaQualityControlRunRecordDto
 */
export interface AcadiaQualityControlRunRecordDto {
  /**
   *
   * @type {number}
   * @memberof AcadiaQualityControlRunRecordDto
   */
  runId?: number;
  /**
   *
   * @type {Date}
   * @memberof AcadiaQualityControlRunRecordDto
   */
  runDate?: Date;
  /**
   *
   * @type {string}
   * @memberof AcadiaQualityControlRunRecordDto
   */
  result?: ResultEnum;
}

/**
 *
 * @export
 * @interface AssayDto
 */
export interface AssayDto {
  /**
   *
   * @type {number}
   * @memberof AssayDto
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof AssayDto
   */
  assayIdentityName?: string;
  /**
   *
   * @type {number}
   * @memberof AssayDto
   */
  sampleTypeId?: number;
  /**
   *
   * @type {number}
   * @memberof AssayDto
   */
  associatedDeviceId?: number;
  /**
   *
   * @type {number}
   * @memberof AssayDto
   */
  assayOrderAlpha?: number;
  /**
   *
   * @type {number}
   * @memberof AssayDto
   */
  assayOrderOrgan?: number;
  /**
   *
   * @type {number}
   * @memberof AssayDto
   */
  conversionFactor?: number;
  /**
   *
   * @type {number}
   * @memberof AssayDto
   */
  precision?: number;
}

/**
 *
 * @export
 * @interface BackupMappingDto
 */
export interface BackupMappingDto {
  /**
   *
   * @type {string}
   * @memberof BackupMappingDto
   */
  backupSource: BackupSourceEnum;
  /**
   *
   * @type {string}
   * @memberof BackupMappingDto
   */
  backupSourceCategory: BackupSourceCategoryEnum;
  /**
   *
   * @type {string}
   * @memberof BackupMappingDto
   */
  zipRelativeFile: string;
  /**
   *
   * @type {string}
   * @memberof BackupMappingDto
   */
  fileUrl?: string;
}

/**
 *
 * @export
 * @interface BackupMetadataDto
 */
export interface BackupMetadataDto {
  /**
   *
   * @type {string}
   * @memberof BackupMetadataDto
   */
  backupId: string;
  /**
   *
   * @type {string}
   * @memberof BackupMetadataDto
   */
  ivlsSoftwareVersion?: string;
  /**
   *
   * @type {string}
   * @memberof BackupMetadataDto
   */
  ivlsVersion?: string;
  /**
   *
   * @type {Date}
   * @memberof BackupMetadataDto
   */
  timestamp: number;
  /**
   *
   * @type {string}
   * @memberof BackupMetadataDto
   */
  source: string;
  /**
   *
   * @type {Array<BackupMappingDto>}
   * @memberof BackupMetadataDto
   */
  backupSources: Array<BackupMappingDto>;
}

/**
 *
 * @export
 * @interface BackupMetadataWrapperDto
 */
export interface BackupMetadataWrapperDto {
  /**
   *
   * @type {string}
   * @memberof BackupMetadataWrapperDto
   */
  metadataFilePath: string;
  /**
   *
   * @type {BackupMetadataDto}
   * @memberof BackupMetadataWrapperDto
   */
  backupMetadataDto: BackupMetadataDto;
}

/**
 *
 * @export
 * @interface BootItemsDto
 */
export interface BootItemsDto {
  /**
   *
   * @type {RestoreDto}
   * @memberof BootItemsDto
   */
  restoreDto: RestoreDto;
  /**
   *
   * @type {boolean}
   * @memberof BootItemsDto
   */
  isFirstBoot?: boolean;
  /**
   *
   * @type {UpgradeStatusDto}
   * @memberof BootItemsDto
   */
  upgradeStatusDto?: UpgradeStatusDto;
  /**
   *
   * @type {boolean}
   * @memberof BootItemsDto
   */
  timeZoneOnBoarding?: boolean;
}

/**
 *
 * @export
 * @interface BreedDto
 */
export interface BreedDto {
  /**
   *
   * @type {number}
   * @memberof BreedDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof BreedDto
   */
  breedName: string;
  /**
   *
   * @type {string}
   * @memberof BreedDto
   */
  localeName?: string;
}

/**
 *
 * @export
 * @interface CellsDto
 */
export interface CellsDto {
  /**
   *
   * @type {string}
   * @memberof CellsDto
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof CellsDto
   */
  identityName?: string;
  /**
   *
   * @type {Array<CoordinateDto>}
   * @memberof CellsDto
   */
  coordinates?: Array<CoordinateDto>;
}

/**
 *
 * @export
 * @interface ClientDto
 */
export interface ClientDto {
  /**
   *
   * @type {number}
   * @memberof ClientDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof ClientDto
   */
  firstName?: string;
  /**
   *
   * @type {string}
   * @memberof ClientDto
   */
  lastName?: string;
  /**
   *
   * @type {string}
   * @memberof ClientDto
   */
  middleName?: string;
  /**
   *
   * @type {string}
   * @memberof ClientDto
   */
  clientId: string;
  /**
   *
   * @type {string}
   * @memberof ClientDto
   */
  pimsClientId?: string;
}

/**
 *
 * @export
 * @interface ClientSaveEditDto
 */
export interface ClientSaveEditDto {
  /**
   *
   * @type {string}
   * @memberof ClientSaveEditDto
   */
  firstName?: string;
  /**
   *
   * @type {string}
   * @memberof ClientSaveEditDto
   */
  lastName?: string;
  /**
   *
   * @type {string}
   * @memberof ClientSaveEditDto
   */
  middleName?: string;
  /**
   *
   * @type {string}
   * @memberof ClientSaveEditDto
   */
  clientId: string;
  /**
   *
   * @type {string}
   * @memberof ClientSaveEditDto
   */
  pimsClientId?: string;
}

/**
 *
 * @export
 * @interface ConnectedApplicationHistoryDto
 */
export interface ConnectedApplicationHistoryDto {
  /**
   *
   * @type {Date}
   * @memberof ConnectedApplicationHistoryDto
   */
  dateSentToDxPortal?: number;
}

/**
 *
 * @export
 * @interface ConnectedDeviceHistoryDto
 */
export interface ConnectedDeviceHistoryDto {
  /**
   *
   * @type {number}
   * @memberof ConnectedDeviceHistoryDto
   */
  id?: number;
  /**
   *
   * @type {number}
   * @memberof ConnectedDeviceHistoryDto
   */
  connectedDeviceId?: number;
  /**
   *
   * @type {Date}
   * @memberof ConnectedDeviceHistoryDto
   */
  connectionStartDate?: number;
  /**
   *
   * @type {Date}
   * @memberof ConnectedDeviceHistoryDto
   */
  connectionEndDate?: number;
}

/**
 *
 * @export
 * @interface CoordinateDto
 */
export interface CoordinateDto {
  /**
   *
   * @type {number}
   * @memberof CoordinateDto
   */
  x?: number;
  /**
   *
   * @type {number}
   * @memberof CoordinateDto
   */
  y?: number;
}

/**
 *
 * @export
 * @interface CrimsonInstalledReagentDto
 */
export interface CrimsonInstalledReagentDto {
  /**
   *
   * @type {string}
   * @memberof CrimsonInstalledReagentDto
   */
  name: string;
  /**
   *
   * @type {string}
   * @memberof CrimsonInstalledReagentDto
   */
  lotNumber: string;
  /**
   *
   * @type {Date}
   * @memberof CrimsonInstalledReagentDto
   */
  changedDate: number;
  /**
   *
   * @type {number}
   * @memberof CrimsonInstalledReagentDto
   */
  daysInUse: number;
  /**
   *
   * @type {boolean}
   * @memberof CrimsonInstalledReagentDto
   */
  isInUse: boolean;
}

/**
 *
 * @export
 * @interface CrimsonPropertiesDto
 */
export interface CrimsonPropertiesDto {
  /**
   *
   * @type {InstrumentTimePropertyDto}
   * @memberof CrimsonPropertiesDto
   */
  standByTime?: InstrumentTimePropertyDto;
  /**
   *
   * @type {boolean}
   * @memberof CrimsonPropertiesDto
   */
  aspirationSensorEnable?: boolean;
  /**
   *
   * @type {string}
   * @memberof CrimsonPropertiesDto
   */
  sampleDrawerPosition?: SampleDrawerPositionEnum;
}

/**
 *
 * @export
 * @interface CrimsonQcBarcodeRequestDto
 */
export interface CrimsonQcBarcodeRequestDto {
  /**
   *
   * @type {string}
   * @memberof CrimsonQcBarcodeRequestDto
   */
  barcode: string;
}

/**
 *
 * @export
 * @interface CrimsonQcBarcodeResponseDto
 */
export interface CrimsonQcBarcodeResponseDto {
  /**
   *
   * @type {string}
   * @memberof CrimsonQcBarcodeResponseDto
   */
  barcode: string;
  /**
   *
   * @type {number}
   * @memberof CrimsonQcBarcodeResponseDto
   */
  sequenceNumber: number;
  /**
   *
   * @type {string}
   * @memberof CrimsonQcBarcodeResponseDto
   */
  barcodeStatus: BarcodeStatusEnum;
  /**
   *
   * @type {boolean}
   * @memberof CrimsonQcBarcodeResponseDto
   */
  expired: boolean;
}

/**
 *
 * @export
 * @interface CrimsonQcBarcodeSaveRequestDto
 */
export interface CrimsonQcBarcodeSaveRequestDto {
  /**
   *
   * @type {Array<CrimsonQcBarcodeRequestDto>}
   * @memberof CrimsonQcBarcodeSaveRequestDto
   */
  barcodes: Array<CrimsonQcBarcodeRequestDto>;
}

/**
 *
 * @export
 * @interface CrimsonQcBarcodeValidateRequestDto
 */
export interface CrimsonQcBarcodeValidateRequestDto {
  /**
   *
   * @type {CrimsonQcBarcodeRequestDto}
   * @memberof CrimsonQcBarcodeValidateRequestDto
   */
  currentBarcode: CrimsonQcBarcodeRequestDto;
  /**
   *
   * @type {Array<CrimsonQcBarcodeRequestDto>}
   * @memberof CrimsonQcBarcodeValidateRequestDto
   */
  approvedBarcodes: Array<CrimsonQcBarcodeRequestDto>;
}

/**
 *
 * @export
 * @interface CrimsonQcBarcodeValidateResponseDto
 */
export interface CrimsonQcBarcodeValidateResponseDto {
  /**
   *
   * @type {Array<CrimsonQcBarcodeResponseDto>}
   * @memberof CrimsonQcBarcodeValidateResponseDto
   */
  barcodes: Array<CrimsonQcBarcodeResponseDto>;
  /**
   *
   * @type {string}
   * @memberof CrimsonQcBarcodeValidateResponseDto
   */
  currentBarcodeStatus: CurrentBarcodeStatusEnum;
  /**
   *
   * @type {boolean}
   * @memberof CrimsonQcBarcodeValidateResponseDto
   */
  levelOneComplete: boolean;
  /**
   *
   * @type {boolean}
   * @memberof CrimsonQcBarcodeValidateResponseDto
   */
  levelTwoComplete: boolean;
}

/**
 *
 * @export
 * @interface CrimsonReplaceReagentDto
 */
export interface CrimsonReplaceReagentDto {
  /**
   *
   * @type {string}
   * @memberof CrimsonReplaceReagentDto
   */
  encryptedReagentBarcode: string;
  /**
   *
   * @type {string}
   * @memberof CrimsonReplaceReagentDto
   */
  alertName?: string;
}

/*Although structure of Crimson DTO's are same as Tensei DTO's and expected to be in sync in the future,
to avoid confusion creating aliases for consuming DTOs for Tensei flow.
If there is any deviation from Crimson DTOs to Tensei DTOs, then instrument specific details DTO's need to be created inplace of aliases.*/
export type TenseiQcBarcodeResponseDto = CrimsonQcBarcodeResponseDto;
export type TenseiQcBarcodeSaveRequestDto = CrimsonQcBarcodeSaveRequestDto;
export type TenseiQcBarcodeValidateRequestDto =
  CrimsonQcBarcodeValidateRequestDto;
export type TenseiQcBarcodeValidateResponseDto =
  CrimsonQcBarcodeValidateResponseDto;

/**
 * @export
 * @interface CuvetteStatusResponseDto
 */
export interface CuvetteStatusResponseDto {
  /**
   * @type {number}
   * @memberof CuvetteStatusResponseDto
   */
  instrumentId: number;

  /**
   * @type {number}
   * @memberof CuvetteStatusResponseDto
   */
  count: number;

  /**
   * @type {number}
   * @memberof CuvetteStatusResponseDto
   */
  total: number;

  /**
   * @type {string}
   * @memberof CuvetteStatusResponseDto
   */
  lotNumber?: string;

  /**
   * @type {Date}
   * @memberof CuvetteStatusResponseDto
   */
  expirationDate?: Date;

  /**
   * @type {Date}
   * @memberof CuvetteStatusResponseDto
   */
  installationDate?: Date;
}

/**
 *
 * @export
 * @interface DeviceDto
 */
export interface DeviceDto {
  /**
   *
   * @type {number}
   * @memberof DeviceDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof DeviceDto
   */
  device: string;
  /**
   *
   * @type {string}
   * @memberof DeviceDto
   */
  deviceCode?: string;
}

/**
 *
 * @export
 * @interface DeviceTrendingDto
 */
export interface DeviceTrendingDto {
  /**
   *
   * @type {string}
   * @memberof DeviceTrendingDto
   */
  instrumentType?: InstrumentType;
  /**
   *
   * @type {Array<number>}
   * @memberof DeviceTrendingDto
   */
  assayIds?: Array<number>;
}

/**
 *
 * @export
 * @interface DeviceUsage
 */
export interface DeviceUsage {
  /**
   *
   * @type {string}
   * @memberof DeviceUsage
   */
  instrumentType: InstrumentType;
  /**
   *
   * @type {string}
   * @memberof DeviceUsage
   */
  usage: UsageEnum;
  /**
   *
   * @type {Array<AssayDto>}
   * @memberof DeviceUsage
   */
  assays: Array<AssayDto>;
}

/**
 *
 * @export
 * @interface DoctorDto
 */
export interface DoctorDto {
  /**
   *
   * @type {string}
   * @memberof DoctorDto
   */
  doctorIdentifier?: string;
  /**
   *
   * @type {string}
   * @memberof DoctorDto
   */
  firstName?: string;
  /**
   *
   * @type {string}
   * @memberof DoctorDto
   */
  middleName?: string;
  /**
   *
   * @type {string}
   * @memberof DoctorDto
   */
  lastName?: string;
  /**
   *
   * @type {boolean}
   * @memberof DoctorDto
   */
  isSuppressed: boolean;
  /**
   *
   * @type {number}
   * @memberof DoctorDto
   */
  id: number;
}

/**
 *
 * @export
 * @interface DoctorSaveEditDto
 */
export interface DoctorSaveEditDto {
  /**
   *
   * @type {string}
   * @memberof DoctorSaveEditDto
   */
  doctorIdentifier?: string;
  /**
   *
   * @type {string}
   * @memberof DoctorSaveEditDto
   */
  firstName?: string;
  /**
   *
   * @type {string}
   * @memberof DoctorSaveEditDto
   */
  middleName?: string;
  /**
   *
   * @type {string}
   * @memberof DoctorSaveEditDto
   */
  lastName?: string;
}

/**
 *
 * @export
 * @interface EventLogDto
 */
export interface EventLogDto {
  /**
   *
   * @type {number}
   * @memberof EventLogDto
   */
  id?: number;
  /**
   *
   * @type {number}
   * @memberof EventLogDto
   */
  sourceDate?: number;
  /**
   *
   * @type {number}
   * @memberof EventLogDto
   */
  targetDate?: number;
  /**
   *
   * @type {string}
   * @memberof EventLogDto
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof EventLogDto
   */
  patient?: string;
  /**
   *
   * @type {number}
   * @memberof EventLogDto
   */
  runId?: number;
  /**
   *
   * @type {string}
   * @memberof EventLogDto
   */
  defaultText?: string;
  /**
   *
   * @type {string}
   * @memberof EventLogDto
   */
  code?: string;
  /**
   *
   * @type {string}
   * @memberof EventLogDto
   */
  sourceIdentifier?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof EventLogDto
   */
  args?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof EventLogDto
   */
  localizedText?: string;
}

/**
 *
 * @export
 * @interface ExecuteInstrumentRunDto
 */
export interface ExecuteInstrumentRunDto {
  /**
   *
   * @type {number}
   * @memberof ExecuteInstrumentRunDto
   */
  instrumentId: number;
  /**
   *
   * @type {number}
   * @memberof ExecuteInstrumentRunDto
   */
  runQueueId: number;
  /**
   *
   * @type {number}
   * @memberof ExecuteInstrumentRunDto
   */
  snapDeviceId?: number;
  /**
   *
   * @type {InstrumentRunConfigurationDto}
   * @memberof ExecuteInstrumentRunDto
   */
  instrumentRunConfigurations: InstrumentRunConfigurationDto[];
}

/**
 *
 * @export
 * @interface RawExecuteLabRequestDto
 */
export interface RawExecuteLabRequestDto {
  /**
   *
   * @type {string}
   * @memberof RawExecuteLabRequestDto
   */
  requisitionId: string;
  /**
   *
   * @type {number}
   * @memberof RawExecuteLabRequestDto
   */
  patientId: number;
  /**
   *
   * @type {string}
   * @memberof RawExecuteLabRequestDto
   */
  weight: string;
  /**
   *
   * @type {Array<ExecuteInstrumentRunDto>}
   * @memberof RawExecuteLabRequestDto
   */
  instrumentRunDtos: Array<ExecuteInstrumentRunDto>;
  /**
   *
   * @type {string}
   * @memberof RawExecuteLabRequestDto
   */
  pimsRequestUUID?: string;
  /**
   *
   * @type {number}
   * @memberof RawExecuteLabRequestDto
   */
  doctorId?: number;
  /**
   *
   * @type {number}
   * @memberof RawExecuteLabRequestDto
   */
  refClassId?: number;
  /**
   *
   * @type {Array<string>}
   * @memberof RawExecuteLabRequestDto
   */
  testingReasons: Array<TestingReason>;
}

export interface ExecuteLabRequestDto extends RawExecuteLabRequestDto {
  // TODO - remove when IVLS provides endpoint for getting PIMS request by ID/UUID
  pimsRequestDto?: PimsRequestDto;
}

/**
 *
 * @export
 * @interface ExecutePimsRequestDto
 */
export interface ExecutePimsRequestDto {
  /**
   *
   * @type {PimsRequestDto}
   * @memberof ExecutePimsRequestDto
   */
  pimsRequestDto: RawPimsRequestDto;
  /**
   *
   * @type {PatientDto}
   * @memberof ExecutePimsRequestDto
   */
  patientDto?: PatientDto;
  /**
   *
   * @type {RefClassDto}
   * @memberof ExecutePimsRequestDto
   */
  refClassDto?: RefClassDto;
  /**
   *
   * @type {DoctorDto}
   * @memberof ExecutePimsRequestDto
   */
  doctorDto?: DoctorDto;
  /**
   *
   * @type {string}
   * @memberof ExecutePimsRequestDto
   */
  weight?: string;
  /**
   *
   * @type {Array<ExecuteInstrumentRunDto>}
   * @memberof ExecutePimsRequestDto
   */
  instrumentRunDtos: Array<ExecuteInstrumentRunDto>;
  /**
   *
   * @type {Array<string>}
   * @memberof ExecutePimsRequestDto
   */
  testingReasons: Array<TestingReason>;
}

/**
 *
 * @export
 * @interface ExecuteQualityControlRunResponseDto
 */
export interface ExecuteQualityControlRunResponseDto {
  /**
   *
   * @type {number}
   * @memberof ExecuteQualityControlRunResponseDto
   */
  labRequestId?: number;
  /**
   *
   * @type {number}
   * @memberof ExecuteQualityControlRunResponseDto
   */
  runId?: number;
}

/**
 *
 * @export
 * @interface FeatureFlagActivateDto
 */
export interface FeatureFlagActivateDto {
  /**
   *
   * @type {boolean}
   * @memberof FeatureFlagActivateDto
   */
  activate: boolean;
}

/**
 *
 * @export
 * @interface FlatFileDto
 */
export interface FlatFileDto {
  /**
   *
   * @type {string}
   * @memberof FlatFileDto
   */
  zipRelativeFile: string;
  /**
   *
   * @type {string}
   * @memberof FlatFileDto
   */
  flatFileType: FlatFileTypeEnum;
  /**
   *
   * @type {string}
   * @memberof FlatFileDto
   */
  fileHash?: string;
  /**
   *
   * @type {string}
   * @memberof FlatFileDto
   */
  fileUrl: string;
  /**
   *
   * @type {string}
   * @memberof FlatFileDto
   */
  backupSourceCategory: BackupSourceCategoryEnum;
}

/**
 *
 * @export
 * @interface GenderDto
 */
export interface GenderDto {
  /**
   *
   * @type {number}
   * @memberof GenderDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof GenderDto
   */
  genderName: PatientGender;
}

export enum PatientGender {
  MALE_INTACT = "Male",
  FEMALE_INTACT = "Female",
  MALE_NEUTERED = "Neutered",
  FEMALE_SPAYED = "Spayed",
  GELDING = "Gelding",
}

export enum ProCyteDxFluidType {
  REAGENT = "REAGENT", // aka "Kit"
  STAIN = "STAIN",
}

export enum SampleSubLocation {
  LEFT_EAR = "LEFT_EAR",
  RIGHT_EAR = "RIGHT_EAR",
  NOSE_NASAL_PLANUM = "NOSE_NASAL_PLANUM",
}

/**
 *
 * @export
 * @interface IhdigClientSettings
 */
export interface IhdigClientSettings {
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  ivlsId?: string;
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  serialNumber?: string;
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  environment?: string;
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  baseUrl?: string;
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  mqttEndpoint?: string;
  /**
   *
   * @type {number}
   * @memberof IhdigClientSettings
   */
  snapshotPollWaitTime?: number;
  /**
   *
   * @type {number}
   * @memberof IhdigClientSettings
   */
  eventPollWaitTime?: number;
  /**
   *
   * @type {number}
   * @memberof IhdigClientSettings
   */
  credentialRefreshOffsetSeconds?: number;
  /**
   *
   * @type {number}
   * @memberof IhdigClientSettings
   */
  minimumRefreshIntervalSeconds?: number;
  /**
   *
   * @type {number}
   * @memberof IhdigClientSettings
   */
  maximumQueuedEntityRetries?: number;
  /**
   *
   * @type {number}
   * @memberof IhdigClientSettings
   */
  deviceMetadataRefreshIntervalSeconds?: number;
  /**
   *
   * @type {boolean}
   * @memberof IhdigClientSettings
   */
  disableHttps?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof IhdigClientSettings
   */
  targetStacksAsPaths?: boolean;
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  ivlsTopic?: string;
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  connectedTopic?: string;
  /**
   *
   * @type {string}
   * @memberof IhdigClientSettings
   */
  disconnectedTopic?: string;
}

/**
 *
 * @export
 * @interface InstrumentDto
 */
export interface RawInstrumentDto {
  /**
   *
   * @type {number}
   * @memberof InstrumentDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentDto
   */
  instrumentType: InstrumentType;
  /**
   *
   * @type {string}
   * @memberof InstrumentDto
   */
  instrumentSerialNumber: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentDto
   */
  softwareVersion?: string;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentDto
   */
  suppressed?: boolean;
  /**
   *
   * @type {{ [key: string]: string; }}
   * @memberof InstrumentDto
   */
  instrumentStringProperties?: { [key: string]: string };
  /**
   *
   * @type {{ [key: string]: boolean; }}
   * @memberof InstrumentDto
   */
  instrumentBooleanProperties?: { [key: string]: boolean };
  /**
   *
   * @type {number}
   * @memberof InstrumentDto
   */
  displayNumber?: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentDto
   */
  ipAddress?: string;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentDto
   */
  supportsQueuedRuns?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentDto
   */
  supportsMultiRun?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentDto
   */
  supportsInstrumentScreen?: boolean;
  /**
   *
   * @type {number}
   * @memberof InstrumentDto
   */
  maxQueueableRuns: number;
  /**
   *
   * @type {Array<string>}
   * @memberof InstrumentDto
   */
  supportedRunConfigurations: Array<RunConfiguration>;
  /**
   *
   * @type {string}
   * @memberof InstrumentDto
   */
  displayNamePropertyKey?: string;

  displayOrder: number;
}

export interface InstrumentDto extends RawInstrumentDto {
  runnable?: boolean;
  manualEntry?: boolean;
}

/**
 *
 * @export
 * @interface InstrumentLoggingPropertyDto
 */
export interface InstrumentLoggingPropertyDto {
  /**
   *
   * @type {boolean}
   * @memberof InstrumentLoggingPropertyDto
   */
  backupActivityLog?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentLoggingPropertyDto
   */
  backupDataLog?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentLoggingPropertyDto
   */
  backupErrorLog?: boolean;
}

/**
 *
 * @export
 * @interface InstrumentResultDto
 */
export interface RawInstrumentResultDto {
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  id: number;

  testOrderId: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  resultText?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  result?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  originalResultValue?: string;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  speedBarMax?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  speedBarMin?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  referenceHigh?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  referenceLow?: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  instrumentType: InstrumentType;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  sampleType?: SampleTypeEnum;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  assayTypeId: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  assayIdentityName: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  assay: string;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  sortOrderOrgan?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  sortOrderAlpha?: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  assayUnits?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  category?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  qualifierString?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  displayCharacter: string;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentResultDto
   */
  requiresUserInput?: boolean;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  precision?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  conversion?: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  resultRangeLabel?: string;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  resultRangeOrdinal?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  resultRangeLow?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentResultDto
   */
  resultRangeHigh?: number;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentResultDto
   */
  fullyQuantitative?: boolean;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  resultValue?: string;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentResultDto
   */
  displayCategory?: boolean;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  displayKeyCategory?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  referenceRangeString?: string;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentResultDto
   */
  crimsonIndentedAssay?: boolean;
  /**
   *
   * @type {string}
   * @memberof InstrumentResultDto
   */
  outOfRangeFlag?: string;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentResultDto
   */
  outOfRangeHigh?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentResultDto
   */
  outOfRangeLow?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentResultDto
   */
  abnormal?: boolean;

  resultValueForDisplay: string;

  noteIndexes?: string[];

  translatedNotes?: Array<TranslatedNoteDto | string>;
}

export interface InstrumentResultDto
  extends Omit<RawInstrumentResultDto, "translatedNotes"> {
  qualifierType: QualifierTypeEnum;

  resultNotes?: HashedNoteDto[];
}

export interface RawTestOrderDto {
  id: number;
  sequenceNumber: number;
  testOrderUuid: string;
  earSwabRunConfigurationDto: EarSwabRunConfigurationDto;
  fnaRunConfigurationDto: FnaRunConfigurationDto;
  bloodRunConfigurationDto: BloodRunConfigurationDto;
  instrumentResultDtos: InstrumentResultDto[];
  translatedNotes?: Array<TranslatedNoteDto | string>;
}

export interface TestOrderDto extends Omit<RawTestOrderDto, "translatedNotes"> {
  testOrderNotes?: HashedNoteDto[];
}

/**
 *
 * @export
 * @interface InstrumentRunConfigurationDto
 */
export interface InstrumentRunConfigurationDto {
  /**
   *
   * @type {number}
   * @memberof InstrumentRunConfigurationDto
   */
  sampleTypeId?: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentRunConfigurationDto
   */
  dilution?: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunConfigurationDto
   */
  dilutionType?: DilutionTypeEnum;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunConfigurationDto
   */
  testProtocol?: TestProtocolEnum;

  earSwabRunConfiguration?: EarSwabRunConfigurationDto;

  fnaRunConfigurationDto?: FnaRunConfigurationDto;

  bloodRunConfigurationDto?: BloodRunConfigurationDto;

  userBarcode?: string;
}

export interface EarSwabRunConfigurationDto {
  theiaSampleLocation: `${TheiaSampleLocation}`;
  theiaSite: `${TheiaSite}`;
  theiaSubsite: `${TheiaSubsite}`;
  theiaClinicalSigns: `${TheiaClinicalSigns}`[];
}

export enum SampleSource {
  EXT_SKIN_SUBCUT = "EXT_SKIN_SUBCUT",
  BLOOD = "BLOOD",
}

export enum LesionAppearance {
  POORLY_CIRCUMSCRIBED = "POORLY_CIRCUMSCRIBED",
  WELL_CIRCUMSCRIBED = "WELL_CIRCUMSCRIBED",
  INVASIVE = "INVASIVE",
  RAISED = "RAISED",
  PEDUNCULATED = "PEDUNCULATED",
  FLAT = "FLAT",
  NODULAR = "NODULAR",
  SOFT = "SOFT",
  FIRM = "FIRM",
  SEMIFIRM = "SEMIFIRM",
  SMOOTH = "SMOOTH",
  IRREGULAR = "IRREGULAR",
  ULCERATED = "ULCERATED",
  CRUSTED = "CRUSTED",
  OOZING_WEEPING = "OOZING_WEEPING",
  FLUID_FILLED = "FLUID_FILLED",
  PRURITIC_ITCHY = "PRURITIC_ITCHY",
  PAINFUL = "PAINFUL",
  ALOPECIC = "ALOPECIC",
  HAIRED = "HAIRED",
  PART_HAIRED = "PART_HAIRED",
  RED = "RED",
  PINK = "PINK",
  PIGMENTED_BLACK = "PIGMENTED_BLACK",
  NORMAL_SKIN_COLOR = "NORMAL_SKIN_COLOR",
  MOVABLE = "MOVABLE",
  FIXED = "FIXED",
  UNKNOWN = "UNKNOWN",
}

export enum Area {
  IN_THIS_AREA = "IN_THIS_AREA",
  ELSEWHERE = "ELSEWHERE",
}

export enum RecentTravel {
  US_WEST = "US_WEST",
  US_SOUTHWEST = "US_SOUTHWEST",
  US_SOUTHEAST = "US_SOUTHEAST",
  US_NORTHEAST = "US_NORTHEAST",
  US_MIDWEST = "US_MIDWEST",
  OUTSIDE_US = "OUTSIDE_US",
}

export enum PatientLivingLocation {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  INDOOR_OUTDOOR = "INDOOR_OUTDOOR",
}

export enum Binary {
  YES = "YES",
  NO = "NO",
}

export enum LesionSizeChanging {
  GROWING = "GROWING",
  SHRINKING = "SHRINKING",
  FLUCTUATING = "FLUCTUATING",
}

export enum LesionSwelling {
  REGIONAL = "REGIONAL",
  DISTAL = "DISTAL",
  ASSOCIATED = "ASSOCIATED",
}

export enum LesionBothering {
  ITCHING = "ITCHING",
  LICKING = "LICKING",
  PAINFUL = "PAINFUL",
  LIMPING = "LIMPING",
}

export enum ResponsiveStatus {
  RESPONSIVE = "RESPONSIVE",
  NON_RESPONSIVE = "NON_RESPONSIVE",
}

export enum Symptoms {
  FEVER = "FEVER",
  GENERALIZED_LYMPHADENOPATHY = "GENERALIZED_LYMPHADENOPATHY",
  REGIONAL_LYMPHADENOPATHY = "REGIONAL_LYMPHADENOPATHY",
  LETHARGY = "LETHARGY",
  WEIGHT_LOSS = "WEIGHT_LOSS",
  INAPPETENCE_ANOREXIA = "INAPPETENCE_ANOREXIA",
}

export enum LesionDuration {
  LESS_THAN_24HOURS = "LESS_THAN_24HOURS",
  DAYS = "DAYS",
  WEEKS = "WEEKS",
  ONE_TO_SIX_MONTHS = "ONE_TO_SIX_MONTHS",
  SIX_TO_TWELVE_MONTHS = "SIX_TO_TWELVE_MONTHS",
  MORE_THAN_ONE_YEAR = "MORE_THAN_ONE_YEAR",
}

export enum LesionGrowthRate {
  SLOW = "SLOW",
  MODERATE = "MODERATE",
  RAPID = "RAPID",
}

export enum Distribution {
  SINGLE_LESION = "SINGLE_LESION",
  MULTIPLE_LESIONS = "MULTIPLE_LESIONS",
  REGIONALLY_EXTENSIVE = "REGIONALLY_EXTENSIVE",
  DIFFUSE = "DIFFUSE",
}

export enum LesionAspirateAppearance {
  CLEAR_SEROUS = "CLEAR_SEROUS",
  SEROSANGUINOUS = "SEROSANGUINOUS",
  BLOODY = "BLOODY",
  PURULENT = "PURULENT",
  WHITE = "WHITE",
  BLACK = "BLACK",
  VISCOUS_MUCINOUS = "VISCOUS_MUCINOUS",
  CHUNKY = "CHUNKY",
  GREASY = "GREASY",
}

export enum QualifierType {
  NONE = "NONE",
  EQUALITY = "EQUALITY",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  NOT_CALCULATED = "NOT_CALCULATED",
  APPROXIMATE = "APPROXIMATE",
  NOT_SET = "NOT_SET",
  SUSPECT = "SUSPECT",
  SUSPECT_AUTOREADER = "SUSPECT_AUTOREADER",
  PENDING = "PENDING",
}

export enum LesionSizeUnit {
  MM = "MM",
  CM = "CM",
  INCHES = "INCHES",
}

export interface FnaRunConfigurationDto {
  sampleSource: SampleSource;
  theiaSampleLocation: TheiaSampleLocation;
  theiaSite: TheiaSite;
  theiaSubsite: TheiaSubsite;

  circumference?: LesionAppearance;
  elevation?: LesionAppearance[];
  softness?: LesionAppearance[];
  surface?: LesionAppearance[];
  hair?: LesionAppearance;
  color?: LesionAppearance[];
  mobility?: LesionAppearance;
  other?: LesionAppearance;

  recentVaccination?: Area[];
  infection?: Area[];
  recentTravel?: RecentTravel[];
  patientLivingLocation?: PatientLivingLocation;

  recentTrauma?: Binary;
  recentNeoplasia?: Area[];
  recentSurgery?: Binary;
  lesionRecurrent?: Binary;
  lesionSizeChanging?: LesionSizeChanging;
  lesionSimilarPresent?: Binary;
  lesionSwelling?: LesionSwelling[];
  lesionBothering?: LesionBothering[];

  lesionDischarge?: Binary;
  antibioticsTreatment?: ResponsiveStatus;
  treatmentOtherResponsive?: ResponsiveStatus;
  symptoms?: Symptoms[];
  lesionDuration?: LesionDuration;
  lesionGrowthRate?: LesionGrowthRate;
  distribution?: Distribution;
  lesionAspirateAppearance?: LesionAspirateAppearance[];
  lesionSize?: number;
  lesionSizeQualifier?: QualifierType;
  lesionSizeUnit?: LesionSizeUnit;
}

export enum TheiaBloodWorkflow {
  STANDALONE = "STANDALONE",
  MANUAL = "MANUAL",
  APPEND = "APPEND",
  TOGETHER = "TOGETHER",
  AUTO = "AUTO",
}

export interface BloodRunConfigurationDto {
  workflow: TheiaBloodWorkflow;
  hematologyRunId?: number;
  hematologyInstrumentId?: number;
  hematologyRunQueueId?: number;
  rbcValue?: number;
  hctValue?: number;
  wbcValue?: number;
}

/**
 *
 * @export
 * @interface RawInstrumentRunDto
 */
export interface RawInstrumentRunDto {
  /**
   *
   * @type {SnapDeviceAltDto}
   * @memberof InstrumentRunDto
   */
  snapDeviceDto?: SnapDeviceAltDto;
  /**
   *
   * @type {number}
   * @memberof InstrumentRunDto
   */
  labRequestId: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentRunDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  uuid: string;
  /**
   *
   * @type {Date}
   * @memberof InstrumentRunDto
   */
  testDate: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentRunDto
   */
  testDateUtc: number;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentRunDto
   */
  sentToPims?: boolean;
  /**
   *
   * @type {Date}
   * @memberof InstrumentRunDto
   */
  dateSentToPims?: number;
  /**
   *
   * @type {InstrumentRunDto}
   * @memberof InstrumentRunDto
   */
  editableRun?: InstrumentRunDto;
  /**
   *
   * @type {InstrumentRunDto}
   * @memberof InstrumentRunDto
   */
  previousRun?: InstrumentRunDto;
  /**
   *
   * @type {ConnectedApplicationHistoryDto}
   * @memberof InstrumentRunDto
   */
  connectedApplicationHistoryDto?: ConnectedApplicationHistoryDto;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  status: RawInstrumentRunStatus;
  /**
   *
   * @type {number}
   * @memberof InstrumentRunDto
   */
  instrumentId: number;

  instrumentResultDtos: InstrumentResultDto[];
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  instrumentType: InstrumentType;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  deviceSerialNumber?: string;
  /**
   *
   * @type {number}
   * @memberof InstrumentRunDto
   */
  deviceId?: number;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  deviceName?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  sampleType?: SampleTypeEnum;
  /**
   *
   * @type {number}
   * @memberof InstrumentRunDto
   */
  sampleTypeId?: number;
  /**
   *
   * @type {Array<RunEditHistoryDto>}
   * @memberof InstrumentRunDto
   */
  runEditHistories?: Array<RunEditHistoryDto>;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentRunDto
   */
  isSedimentPresent?: boolean;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  redFcsFilename?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  whiteFcsFilename?: string;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  userComment?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof InstrumentRunDto
   */
  translatedNotes?: Array<TranslatedNoteDto | string>;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  manualEntryType?: ManualEntryTypeEnum;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  testProtocol?: TestProtocolEnum;
  /**
   *
   * @type {string}
   * @memberof InstrumentRunDto
   */
  jackRabbitInstrumentRunUuid?: string;

  testOrders?: TestOrderDto[];

  instrumentRunConfigurations?: InstrumentRunConfigurationDto[];
}

export interface InstrumentRunDto
  extends Omit<RawInstrumentRunDto, "status" | "translatedNotes"> {
  serviceCategory: ServiceCategory;
  status: InstrumentRunStatus;
  displayOrder: number;
  hasDotPlots: boolean;
  editable: boolean;
  runNotes?: HashedNoteDto[];
}

/**
 *
 * @export
 * @interface InstrumentStatusDto
 */
export interface InstrumentStatusDto {
  /**
   *
   * @type {InstrumentDto}
   * @memberof InstrumentStatusDto
   */
  instrument: InstrumentDto;
  /**
   *
   * @type {string}
   * @memberof InstrumentStatusDto
   */
  instrumentStatus: InstrumentStatus;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentStatusDto
   */
  connected: boolean;
}

export interface SnapProInstrumentStatusDto extends InstrumentStatusDto {
  patientName?: string;
  /**
   * @type {Date}
   */
  lastConnectedDate?: number;
  instrumentIconStyle?: string;
  instrumentStatusImageKey?: string;
}

export interface SnapProInstrumentUpdateDto {
  instrumentId: number;
  softwareVersion?: string;
}

/**
 *
 * @export
 * @interface InstrumentTimePropertyDto
 */
export interface InstrumentTimePropertyDto {
  /**
   *
   * @type {number}
   * @memberof InstrumentTimePropertyDto
   */
  hours: number;
  /**
   *
   * @type {number}
   * @memberof InstrumentTimePropertyDto
   */
  minutes: number;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentTimePropertyDto
   */
  isPm: boolean;
}

/**
 *
 * @export
 * @interface InstrumentUpgradeNotificationDto
 */
export interface InstrumentUpgradeNotificationDto {
  /**
   *
   * @type {string}
   * @memberof InstrumentUpgradeNotificationDto
   */
  newVersion: string;
  /**
   *
   * @type {boolean}
   * @memberof InstrumentUpgradeNotificationDto
   */
  upgradeLetter?: boolean;
}

export enum RouterType {
  BUFFALO_WIRELESS = "BUFFALO_WIRELESS",
  LINKSYS = "LINKSYS",
  NETGEAR = "NETGEAR",
}

/**
 *
 * @export
 * @interface IvlsRouterDto
 */
export interface IvlsRouterDto {
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  routerType?: RouterType;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  modelName?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  smartServiceModelName?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  ipAddress?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  localIpAddress?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  defaultLocalIpAddress?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  gateway?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  primaryDnsServer?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  subnetMask?: string;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  wanIpChoice?: WanIpChoiceEnum;
  /**
   *
   * @type {Array<string>}
   * @memberof IvlsRouterDto
   */
  wanIpChoices?: Array<WanIpChoiceEnum>;
  /**
   *
   * @type {boolean}
   * @memberof IvlsRouterDto
   */
  wireless?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof IvlsRouterDto
   */
  wirelessEnabled?: boolean;
  /**
   *
   * @type {string}
   * @memberof IvlsRouterDto
   */
  wirelessPassphrase?: string;
}

export interface IvlsWiredRouterConfigDto {
  wanIpChoice: WanIpChoiceEnum;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  primaryDnsServer: string;
  localIpAddress: string;
  applyIdexxDefaults: boolean;
}

export interface IvlsWirelessRouterConfigDto {
  wirelessEnabled: boolean;
  wirelessPassphrase: string;
  passwordGenerated: boolean;
}

/**
 *
 * @export
 * @interface LabRequestDto
 */
export interface LabRequestDto {
  /**
   *
   * @type {number}
   * @memberof LabRequestDto
   */
  id: number;
  /**
   *
   * @type {PatientDto}
   * @memberof LabRequestDto
   */
  patientDto: PatientDto;
  /**
   *
   * @type {RefClassDto}
   * @memberof LabRequestDto
   */
  refClassDto?: RefClassDto;
  /**
   *
   * @type {DoctorDto}
   * @memberof LabRequestDto
   */
  doctorDto?: DoctorDto;
  /**
   *
   * @type {Date}
   * @memberof LabRequestDto
   */
  requestDate: number;
  /**
   *
   * @type {Array<InstrumentRunDto>}
   * @memberof LabRequestDto
   */
  instrumentRunDtos?: Array<InstrumentRunDto>;
  /**
   *
   * @type {string}
   * @memberof LabRequestDto
   */
  requisitionId?: string;
  /**
   *
   * @type {string}
   * @memberof LabRequestDto
   */
  weight?: string;
  /**
   *
   * @type {number}
   * @memberof LabRequestDto
   */
  weightRawValue?: number;
  /**
   *
   * @type {string}
   * @memberof LabRequestDto
   */
  universallyUniqueLabRequestId?: string;
  /**
   *
   * @type {boolean}
   * @memberof LabRequestDto
   */
  containsMergedRuns: boolean;
  /**
   *
   * @type {boolean}
   * @memberof LabRequestDto
   */
  containsManualUaResults: boolean;
  /**
   *
   * @type {string}
   * @memberof LabRequestDto
   */
  requestOrigin?: RequestOriginEnum;
  /**
   *
   * @type {string}
   * @memberof LabRequestDto
   */
  pimsRequestUUID?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof LabRequestDto
   */
  testingReasons?: Array<TestingReason>;
  /**
   *
   * @type {boolean}
   * @memberof LabRequestDto
   */
  qualityControl?: boolean;
  /**
   *
   * @type {InstrumentRunDto}
   * @memberof LabRequestDto
   */
  firstRun?: InstrumentRunDto;
  /**
   *
   * @type {string}
   * @memberof LabRequestDto
   */
  profileDescription?: string;
}

/**
 *
 * @export
 * @interface LabRequestRecordDto
 */
export interface LabRequestRecordDto {
  /**
   *
   * @type {number}
   * @memberof LabRequestRecordDto
   */
  labRequestId: number;
  /**
   *
   * @type {Date}
   * @memberof LabRequestRecordDto
   */
  labRequestDate: number;
  /**
   *
   * @type {{ [key: string]: DeviceUsage; }}
   * @memberof LabRequestRecordDto
   */
  deviceUsageMap: { [key in InstrumentType]?: DeviceUsage };
}

/**
 *
 * @export
 * @interface LaserCytePropertiesDto
 */
export interface LaserCytePropertiesDto {
  /**
   *
   * @type {InstrumentTimePropertyDto}
   * @memberof LaserCytePropertiesDto
   */
  periodicCleanTime?: InstrumentTimePropertyDto;
}

/**
 *
 * @export
 * @interface ManualCrpResultDto
 */
export interface ManualCrpResultDto {
  /**
   *
   * @type {string}
   * @memberof ManualCrpResultDto
   */
  resultValue: string;
  /**
   *
   * @type {string}
   * @memberof ManualCrpResultDto
   */
  qualifierType: QualifierTypeEnum;
  /**
   *
   * @type {boolean}
   * @memberof ManualCrpResultDto
   */
  edit?: boolean;
}

/**
 *
 * @export
 * @interface ManualUaResultDto
 */
export interface ManualUaResultDto {
  /**
   *
   * @type {{ [key: string]: ResultDto; }}
   * @memberof ManualUaResultDto
   */
  resultMap?: { [key: string]: ResultDto };
  /**
   *
   * @type {string}
   * @memberof ManualUaResultDto
   */
  comment?: string;
}

export type MatchTypes =
  | "patient"
  | "species"
  | "clientFirstName"
  | "clientLastName"
  | "breed"
  | "gender"
  | "age";

/**
 *
 * @export
 * @interface MatchSuggestionDto
 */
export interface MatchSuggestionDto {
  /**
   *
   * @type {PatientDto}
   * @memberof MatchSuggestionDto
   */
  patientDto: PatientDto;
  /**
   *
   * @type {number}
   * @memberof MatchSuggestionDto
   */
  score?: number;
  /**
   *
   * @memberof MatchSuggestionDto
   */
  comparisonMap: Record<MatchTypes, Record<string, boolean>>;
}

/**
 *
 * @export
 * @interface NotificationContentDto
 */
export interface NotificationContentDto {
  /**
   *
   * @type {string}
   * @memberof NotificationContentDto
   */
  version: string;
  /**
   *
   * @type {string}
   * @memberof NotificationContentDto
   */
  bytes: string;
  /**
   *
   * @type {string}
   * @memberof NotificationContentDto
   */
  encoding: string;

  contentType: string;
}

/**
 *
 * @export
 * @interface OffsetsDto
 */
export interface OffsetsDto {
  /**
   *
   * @type {string}
   * @memberof OffsetsDto
   */
  controlType: string;
  /**
   *
   * @type {string}
   * @memberof OffsetsDto
   */
  lotNumber: string;
  /**
   *
   * @type {string}
   * @memberof OffsetsDto
   */
  calibrationVersion: string;
  /**
   *
   * @type {number}
   * @memberof OffsetsDto
   */
  expirationDate: number;
}

/**
 *
 * @export
 * @interface PatientDto
 */
export interface PatientDto {
  /**
   *
   * @type {number}
   * @memberof PatientDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof PatientDto
   */
  patientName: string;
  /**
   *
   * @type {string}
   * @memberof PatientDto
   */
  birthDate?: string;
  /**
   *
   * @type {boolean}
   * @memberof PatientDto
   */
  statIndicator?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof PatientDto
   */
  controlIndicator?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof PatientDto
   */
  ageIsApproximate?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof PatientDto
   */
  birthDateCalculated?: boolean;
  /**
   *
   * @type {string}
   * @memberof PatientDto
   */
  pimsPatientId?: string;
  /**
   *
   * @type {string}
   * @memberof PatientDto
   */
  lastKnownWeight?: string;
  /**
   *
   * @type {ClientDto}
   * @memberof PatientDto
   */
  clientDto: ClientDto;
  /**
   *
   * @type {SpeciesDto}
   * @memberof PatientDto
   */
  speciesDto: SpeciesDto;
  /**
   *
   * @type {GenderDto}
   * @memberof PatientDto
   */
  genderDto?: GenderDto;
  /**
   *
   * @type {BreedDto}
   * @memberof PatientDto
   */
  breedDto?: BreedDto;
  /**
   *
   * @type {RefClassDto}
   * @memberof PatientDto
   */
  lastKnownRefClassDto?: RefClassDto;
}

export interface RawPatientDto extends Omit<PatientDto, "birthDate"> {
  birthDate?: number[];
}

export interface PatientWithRunsDto {
  patientDto: PatientDto;
  runDate: number;
}

/**
 *
 * @export
 * @interface PatientMatchConstantsDto
 */
export interface PatientMatchConstantsDto {
  /**
   *
   * @type {number}
   * @memberof PatientMatchConstantsDto
   */
  dateDistancePenalty?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchConstantsDto
   */
  genderStatusMismatchPenalty?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchConstantsDto
   */
  minimumPatientNameScore?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchConstantsDto
   */
  minimumSuggestionScore?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchConstantsDto
   */
  minimumAutoMatchScore?: number;
}

/**
 *
 * @export
 * @interface PatientMatchFieldWeightsDto
 */
export interface PatientMatchFieldWeightsDto {
  /**
   *
   * @type {number}
   * @memberof PatientMatchFieldWeightsDto
   */
  patientNameWeight?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchFieldWeightsDto
   */
  clientFirstNameWeight?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchFieldWeightsDto
   */
  clientLastNameWeight?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchFieldWeightsDto
   */
  speciesWeight?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchFieldWeightsDto
   */
  breedWeight?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchFieldWeightsDto
   */
  genderWeight?: number;
  /**
   *
   * @type {number}
   * @memberof PatientMatchFieldWeightsDto
   */
  birthDateWeight?: number;
}

/**
 *
 * @export
 * @interface PatientMatchProfileDto
 */
export interface PatientMatchProfileDto {
  /**
   *
   * @type {number}
   * @memberof PatientMatchProfileDto
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof PatientMatchProfileDto
   */
  profileName?: string;
  /**
   *
   * @type {PatientMatchConstantsDto}
   * @memberof PatientMatchProfileDto
   */
  constantsDto?: PatientMatchConstantsDto;
  /**
   *
   * @type {PatientMatchFieldWeightsDto}
   * @memberof PatientMatchProfileDto
   */
  fieldWeightsDto?: PatientMatchFieldWeightsDto;
}

/**
 *
 * @export
 * @interface PatientSaveEditDto
 */
export interface PatientSaveEditDto {
  /**
   *
   * @type {string}
   * @memberof PatientSaveEditDto
   */
  patientName: string;
  /**
   *
   * @type {string}
   * @memberof PatientSaveEditDto
   */
  birthDate?: string;
  /**
   *
   * @type {boolean}
   * @memberof PatientSaveEditDto
   */
  statIndicator?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof PatientSaveEditDto
   */
  ageIsApproximate?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof PatientSaveEditDto
   */
  birthDateCalculated?: boolean;
  /**
   *
   * @type {string}
   * @memberof PatientSaveEditDto
   */
  pimsPatientId?: string;
  /**
   *
   * @type {string}
   * @memberof PatientSaveEditDto
   */
  lastKnownWeight?: string;
  /**
   *
   * @type {WrappedIdClientDto}
   * @memberof PatientSaveEditDto
   */
  clientDto: WrappedIdClientDto;
  /**
   *
   * @type {WrappedIdSpeciesDto}
   * @memberof PatientSaveEditDto
   */
  speciesDto: WrappedIdSpeciesDto;
  /**
   *
   * @type {WrappedIdGenderDto}
   * @memberof PatientSaveEditDto
   */
  genderDto?: WrappedIdGenderDto;
  /**
   *
   * @type {WrappedIdBreedDto}
   * @memberof PatientSaveEditDto
   */
  breedDto?: WrappedIdBreedDto;
  /**
   *
   * @type {WrappedIdRefClassDto}
   * @memberof PatientSaveEditDto
   */
  lastKnownRefClassDto?: WrappedIdRefClassDto;
}

/**
 *
 * @export
 * @interface PatientWeightDto
 */
export interface PatientWeightDto {
  /**
   *
   * @type {string}
   * @memberof PatientWeightDto
   */
  weightInLbs?: string;
  /**
   *
   * @type {string}
   * @memberof PatientWeightDto
   */
  weightInLocale?: string;
}

/**
 *
 * @export
 * @interface PendingPimsRequestMatchDto
 */
export interface PendingPimsRequestMatchDto {
  /**
   *
   * @type {PimsRequestDto}
   * @memberof PendingPimsRequestMatchDto
   */
  pimsRequestDto: PimsRequestDto;
  /**
   *
   * @type {PatientDto}
   * @memberof PendingPimsRequestMatchDto
   */
  patientDto?: PatientDto;
  /**
   *
   * @type {DoctorDto}
   * @memberof PendingPimsRequestMatchDto
   */
  doctorDto?: DoctorDto;
  /**
   *
   * @type {LabRequestDto}
   * @memberof PendingPimsRequestMatchDto
   */
  existingLabRequest?: LabRequestDto;
  /**
   *
   * @type {Array<MatchSuggestionDto>}
   * @memberof PendingPimsRequestMatchDto
   */
  matchSuggestions: Array<MatchSuggestionDto>;
  /**
   *
   * @type {string}
   * @memberof PendingPimsRequestMatchDto
   */
  weight: string;
  /**
   *
   * @type {RefClassDto}
   * @memberof PendingPimsRequestMatchDto
   */
  refClassDto?: RefClassDto;
  /**
   *
   * @type {string}
   * @memberof PendingPimsRequestMatchDto
   */
  profileDescription?: string;
}

/**
 *
 * @export
 * @interface PimsRequestDto
 */
export interface PimsRequestDto {
  /**
   *
   * @type {number}
   * @memberof PimsRequestDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  pimsRequestUUID: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  sourceId?: string;
  /**
   *
   * @type {number}
   * @memberof PimsRequestDto
   */
  dateRequestedUtc: number;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  requisitionId?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  pimsPatientId: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  patientName: string;
  /**
   *
   * @type {SpeciesDto}
   * @memberof PimsRequestDto
   */
  patientSpecies: SpeciesDto;
  /**
   *
   * @type {GenderDto}
   * @memberof PimsRequestDto
   */
  patientGender?: GenderDto;
  /**
   *
   * @type {BreedDto}
   * @memberof PimsRequestDto
   */
  patientBreed?: BreedDto;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  patientDob?: string;
  /**
   *
   * @type {number}
   * @memberof PimsRequestDto
   */
  patientWeight?: number;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  patientWeightUnits?: PatientWeightUnitsEnum;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  clientFirstName?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  clientLastName?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  doctorFirstName?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  doctorLastName?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  pimsClientId?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  reasonForVisit?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  requestOrigin?: RequestOriginEnum;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  requisitionIdOrigin?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  patientIdOrigin?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  pimsRequestStatus?: PimsRequestStatusEnum;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  pimsRequestType?: PimsRequestTypeEnum;
  /**
   *
   * @type {Array<PimsServiceRequestDto>}
   * @memberof PimsRequestDto
   */
  pimsServiceRequests?: Array<PimsServiceRequestDto>;
  /**
   *
   * @type {Array<PimsServiceRequestDto>}
   * @memberof PimsRequestDto
   */
  serviceRequestsAdded?: Array<PimsServiceRequestDto>;
  /**
   *
   * @type {Array<PimsServiceRequestDto>}
   * @memberof PimsRequestDto
   */
  serviceRequestsDeleted?: Array<PimsServiceRequestDto>;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  hash?: string;
  /**
   *
   * @type {number}
   * @memberof PimsRequestDto
   */
  sequence?: number;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  trackingId?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  pimsApplicationId?: string;
  /**
   *
   * @type {string}
   * @memberof PimsRequestDto
   */
  pimsIntegrationName?: string;
}

export interface RawPimsRequestDto
  extends Omit<PimsRequestDto, "patientDob" | "patientSpecies"> {
  patientDob?: number[];
  patientSpecies: RawSpeciesDto;
}

/**
 *
 * @export
 * @interface PimsServiceRequestDto
 */
export interface PimsServiceRequestDto {
  /**
   *
   * @type {string}
   * @memberof PimsServiceRequestDto
   */
  profileName?: string;
  /**
   *
   * @type {number}
   * @memberof PimsServiceRequestDto
   */
  profileId?: number;
  /**
   *
   * @type {number}
   * @memberof PimsServiceRequestDto
   */
  sequenceNumber?: number;
}

/**
 *
 * @export
 * @interface QualityControlDto
 */
export interface QualityControlDto {
  /**
   *
   * @type {number}
   * @memberof QualityControlDto
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof QualityControlDto
   */
  instrumentType?: InstrumentType;
  /**
   *
   * @type {string}
   * @memberof QualityControlDto
   */
  lotNumber?: string;
  /**
   *
   * @type {boolean}
   * @memberof QualityControlDto
   */
  enabled?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof QualityControlDto
   */
  canRun?: boolean;
  /**
   *
   * @type {Array<QualityControlReferenceRangeDto>}
   * @memberof QualityControlDto
   */
  qcReferenceRangeDtos?: Array<QualityControlReferenceRangeDto>;
  /**
   *
   * @type {number}
   * @memberof QualityControlDto
   */
  mostRecentRunDate?: number;
  /**
   *
   * @type {number}
   * @memberof QualityControlDto
   */
  dateEntered?: number;
  /**
   *
   * @type {number}
   * @memberof QualityControlDto
   */
  dateExpires?: number;
  /**
   *
   * @type {boolean}
   * @memberof QualityControlDto
   */
  isSmartQc?: boolean;
}

export interface QualityControlRunDto extends InstrumentRunDto {
  qualityControl: QualityControlDto;
  excludeTrendingReason?: string;
  excludableFromTrending: boolean;
  instrumentDisplayNumber: number;
}

/**
 *
 * @export
 * @interface QualityControlReferenceRangeDto
 */
export interface QualityControlReferenceRangeDto {
  /**
   *
   * @type {AssayDto}
   * @memberof QualityControlReferenceRangeDto
   */
  assayDto?: AssayDto;
  /**
   *
   * @type {string}
   * @memberof QualityControlReferenceRangeDto
   */
  veryLow?: string;
  /**
   *
   * @type {number}
   * @memberof QualityControlReferenceRangeDto
   */
  veryLowFloat?: number;
  /**
   *
   * @type {string}
   * @memberof QualityControlReferenceRangeDto
   */
  low?: string;
  /**
   *
   * @type {number}
   * @memberof QualityControlReferenceRangeDto
   */
  lowFloat?: number;
  /**
   *
   * @type {string}
   * @memberof QualityControlReferenceRangeDto
   */
  high?: string;
  /**
   *
   * @type {number}
   * @memberof QualityControlReferenceRangeDto
   */
  highFloat?: number;
  /**
   *
   * @type {string}
   * @memberof QualityControlReferenceRangeDto
   */
  veryHigh?: string;
  /**
   *
   * @type {number}
   * @memberof QualityControlReferenceRangeDto
   */
  veryHighFloat?: number;
  /**
   *
   * @type {string}
   * @memberof QualityControlReferenceRangeDto
   */
  slideLotNumber?: string;
  /**
   *
   * @type {string}
   * @memberof QualityControlReferenceRangeDto
   */
  target?: string;
}

/**
 *
 * @export
 * @interface QualityControlRunRecordDto
 */
export interface QualityControlRunRecordDto {
  /**
   *
   * @type {number}
   * @memberof QualityControlRunRecordDto
   */
  labRequestId: number;
  /**
   *
   * @type {Date}
   * @memberof QualityControlRunRecordDto
   */
  testDate: number;
  /**
   *
   * @type {QualityControlDto}
   * @memberof QualityControlRunRecordDto
   */
  qualityControl: QualityControlDto;
  /**
   *
   * @type {number}
   * @memberof QualityControlRunRecordDto
   */
  instrumentId: number;
  /**
   *
   * @type {string}
   * @memberof QualityControlRunRecordDto
   */
  instrumentType: InstrumentType;
  /**
   *
   * @type {string}
   * @memberof QualityControlRunRecordDto
   */
  instrumentSerialNumber: string;
}

/**
 *
 * @export
 * @interface QualityControlRunRequestDto
 */
export interface QualityControlRunRequestDto {
  /**
   *
   * @type {number}
   * @memberof QualityControlRunRequestDto
   */
  instrumentId?: number;
  /**
   *
   * @type {QualityControlDto}
   * @memberof QualityControlRunRequestDto
   */
  qualityControl?: QualityControlDto;
}

/**
 *
 * @export
 * @interface RecentResultDto
 */
export interface RecentResultDto {
  /**
   *
   * @type {number}
   * @memberof RecentResultDto
   */
  labRequestId: number;
  /**
   *
   * @type {string}
   * @memberof RecentResultDto
   */
  patientName: string;
  /**
   *
   * @type {string}
   * @memberof RecentResultDto
   */
  pimsPatientId?: string;
  /**
   * @type {number}
   * @memberof RecentResultDto
   */
  speciesId: number;
  /**
   * @type {string}
   * @memberof RecentResultDto
   */
  speciesName: SpeciesType;
  /**
   *
   * @type {string}
   * @memberof RecentResultDto
   */
  clientLastName?: string;
  /**
   *
   * @type {string}
   * @memberof RecentResultDto
   */
  clientFirstName?: string;
  /**
   *
   * @type {string}
   * @memberof RecentResultDto
   */
  clientId: string;

  doctorLastName?: string;

  doctorFirstName?: string;
  /**
   *
   * @type {Date}
   * @memberof RecentResultDto
   */
  dateRequested: number;
  mostRecentRunDate: number;
  /**
   *
   * @type {Array<string>}
   * @memberof RecentResultDto
   */
  testTypes: Array<string>;
  /**
   *
   * @type {boolean}
   * @memberof RecentResultDto
   */
  controlPatient: boolean;

  instrumentTypes: Array<InstrumentType>;
}

/**
 *
 * @export
 * @interface RefClassDto
 */
export interface RefClassDto {
  /**
   *
   * @type {number}
   * @memberof RefClassDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof RefClassDto
   */
  refClassName: string;
  /**
   *
   * @type {string}
   * @memberof RefClassDto
   */
  refClassSubTypeCode: string;
}

/**
 *
 * @export
 * @interface RefLabResultDto
 */
export interface RefLabResultDto {
  /**
   *
   * @type {string}
   * @memberof RefLabResultDto
   */
  accessionId?: string;
  /**
   *
   * @type {string}
   * @memberof RefLabResultDto
   */
  resultId?: string;
  /**
   *
   * @type {string}
   * @memberof RefLabResultDto
   */
  patientName?: string;
  /**
   *
   * @type {string}
   * @memberof RefLabResultDto
   */
  clientLastName?: string;
  /**
   *
   * @type {string}
   * @memberof RefLabResultDto
   */
  vetName?: string;
  /**
   *
   * @type {string}
   * @memberof RefLabResultDto
   */
  orderStatus?: OrderStatusEnum;
  /**
   *
   * @type {string}
   * @memberof RefLabResultDto
   */
  statusDetail?: StatusDetailEnum;
  /**
   *
   * @type {Date}
   * @memberof RefLabResultDto
   */
  orderedDate?: Date;
  /**
   *
   * @type {Date}
   * @memberof RefLabResultDto
   */
  updatedDate?: Date;
  /**
   *
   * @type {Array<string>}
   * @memberof RefLabResultDto
   */
  testTypes?: Array<string>;
  /**
   *
   * @type {Date}
   * @memberof RefLabResultDto
   */
  dateRequested?: Date;
  /**
   *
   * @type {boolean}
   * @memberof RefLabResultDto
   */
  delayed?: boolean;
}

/**
 *
 * @export
 * @interface RegistrationKeyMissionPayload
 */
export interface RegistrationKeyMissionPayload {
  /**
   *
   * @type {string}
   * @memberof RegistrationKeyMissionPayload
   */
  ivlsId?: string;
  /**
   *
   * @type {string}
   * @memberof RegistrationKeyMissionPayload
   */
  serialNumber?: string;
  /**
   *
   * @type {string}
   * @memberof RegistrationKeyMissionPayload
   */
  registrationKeyUrl?: string;
}

/**
 *
 * @export
 * @interface RemovableDriveDto
 */
export interface RemovableDriveDto {
  /**
   *
   * @type {string}
   * @memberof RemovableDriveDto
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof RemovableDriveDto
   */
  label: string;
  /**
   *
   * @type {string}
   * @memberof RemovableDriveDto
   */
  serialNumber: string;
  /**
   *
   * @type {number}
   * @memberof RemovableDriveDto
   */
  capacity: number;
  /**
   *
   * @type {number}
   * @memberof RemovableDriveDto
   */
  freeSpace: number;
}

/**
 *
 * @export
 * @interface RestoreDto
 */
export interface RestoreDto {
  /**
   *
   * @type {string}
   * @memberof RestoreDto
   */
  mode?: ModeEnum;
  /**
   *
   * @type {string}
   * @memberof RestoreDto
   */
  version?: string;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  restorePerformed?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  restorePatientDataSuccess?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  restoreSettingsDataSuccess?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  restoreProCyteCalibrationSuccess?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  proCyteCalibrationDataPresent?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  restoreLaserCyteCalibrationSuccess?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  laserCyteCalibrationDataPresent?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof RestoreDto
   */
  restoreContentDataSuccess?: boolean;
  /**
   *
   * @type {string}
   * @memberof RestoreDto
   */
  restoreContentDatabaseName?: string;
  /**
   *
   * @type {string}
   * @memberof RestoreDto
   */
  defaultPrinter?: string;
}

/**
 *
 * @export
 * @interface RestoreFileDto
 */
export interface RestoreFileDto {
  /**
   *
   * @type {Date}
   * @memberof RestoreFileDto
   */
  fileDate: number;
  /**
   *
   * @type {string}
   * @memberof RestoreFileDto
   */
  fileName: string;
  /**
   *
   * @type {string}
   * @memberof RestoreFileDto
   */
  version: VersionEnum;
}

/**
 *
 * @export
 * @interface ResultDto
 */
export interface ResultDto {
  /**
   *
   * @type {string}
   * @memberof ResultDto
   */
  assay?: string;
  /**
   *
   * @type {string}
   * @memberof ResultDto
   */
  value?: string;
  /**
   *
   * @type {string}
   * @memberof ResultDto
   */
  qualifier?: QualifierTypeEnum;
  /**
   *
   * @type {boolean}
   * @memberof ResultDto
   */
  suppress?: boolean;
}

/**
 *
 * @export
 * @interface ResultsTrendingDto
 */
export interface ResultsTrendingDto {
  /**
   *
   * @type {Array<number>}
   * @memberof ResultsTrendingDto
   */
  labRequestIdList?: Array<number>;
  /**
   *
   * @type {Array<DeviceTrendingDto>}
   * @memberof ResultsTrendingDto
   */
  deviceTrendingDtoList?: Array<DeviceTrendingDto>;
}

/**
 *
 * @export
 * @interface RunEditHistoryDto
 */
export interface RunEditHistoryDto {
  /**
   *
   * @type {number}
   * @memberof RunEditHistoryDto
   */
  id?: number;
  /**
   *
   * @type {number}
   * @memberof RunEditHistoryDto
   */
  instrumentRunId?: number;
  /**
   *
   * @type {Date}
   * @memberof RunEditHistoryDto
   */
  editDate?: number;
  /**
   *
   * @type {string}
   * @memberof RunEditHistoryDto
   */
  userId?: string;
  /**
   *
   * @type {string}
   * @memberof RunEditHistoryDto
   */
  comment?: string;
}

/**
 *
 * @export
 * @interface RunResultInterface
 */
export interface RunResultInterface {
  /**
   *
   * @type {string}
   * @memberof RunResultInterface
   */
  runResult?: string;
  /**
   *
   * @type {string}
   * @memberof RunResultInterface
   */
  runResultText?: string;
  /**
   *
   * @type {string}
   * @memberof RunResultInterface
   */
  runAssayIdentity?: string;
  /**
   *
   * @type {string}
   * @memberof RunResultInterface
   */
  runQualifierType?: QualifierTypeEnum;
}

/**
 *
 * @export
 * @interface RawRunningInstrumentRunDto
 */
export interface RawRunningInstrumentRunDto {
  /**
   *
   * @type {number}
   * @memberof RunningInstrumentRunDto
   */
  id: number;
  /**
   *
   * @type {number}
   * @memberof RunningInstrumentRunDto
   */
  instrumentId: number;
  /**
   *
   * @type {string}
   * @memberof RunningInstrumentRunDto
   */
  instrumentType: InstrumentType;
  /**
   *
   * @type {number}
   * @memberof RunningInstrumentRunDto
   */
  labRequestId?: number;
  /**
   *
   * @type {SnapDeviceAltDto}
   * @memberof RunningInstrumentRunDto
   */
  snapDeviceDto?: SnapDeviceAltDto;
  /**
   *
   * @type {number}
   * @memberof RunningInstrumentRunDto
   */
  dilution?: number;
  /**
   *
   * @type {string}
   * @memberof RunningInstrumentRunDto
   */
  sampleType?: SampleTypeEnum;
  /**
   *
   * @type {number}
   * @memberof RunningInstrumentRunDto
   */
  runQueueId?: number;
  /**
   *
   * @type {number}
   * @memberof RunningInstrumentRunDto
   */
  progress?: number;
  /**
   *
   * @type {string}
   * @memberof RunningInstrumentRunDto
   */
  manualEntryType?: ManualEntryTypeEnum;
  /**
   *
   * @type {Date}
   * @memberof RunningInstrumentRunDto
   */
  testDate: number;
  /**
   *
   * @type {string}
   * @memberof RunningInstrumentRunDto
   */
  status: InstrumentRunStatus;
  /**
   *
   * @type {string}
   * @memberof RunningInstrumentRunDto
   */
  debugString?: string;

  instrumentRunConfigurations?: InstrumentRunConfigurationDto[];
}

export interface RunningInstrumentRunDto extends RawRunningInstrumentRunDto {
  serviceCategory: ServiceCategory;
  status: InstrumentRunStatus;
  displayOrder: number;
  hasDotPlots: boolean;
  editable: boolean;

  timeRemaining?: number;
}

/**
 *
 * @export
 * @interface RunningLabRequestDto
 */
export interface RunningLabRequestDto {
  /**
   *
   * @type {number}
   * @memberof RunningLabRequestDto
   */
  id: number;
  /**
   *
   * @type {PatientDto}
   * @memberof RunningLabRequestDto
   */
  patientDto: PatientDto;
  /**
   *
   * @type {number}
   * @memberof RunningLabRequestDto
   */
  requestDate: number;
  /**
   *
   * @type {RefClassDto}
   * @memberof RunningLabRequestDto
   */
  refClassDto?: RefClassDto;
  /**
   *
   * @type {string}
   * @memberof RunningLabRequestDto
   */
  weight?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof RunningLabRequestDto
   */
  profileTests?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof RunningLabRequestDto
   */
  profileDescription?: string;
  /**
   *
   * @type {Array<RunningInstrumentRunDto>}
   * @memberof RunningLabRequestDto
   */
  instrumentRunDtos?: Array<RunningInstrumentRunDto>;
  /**
   *
   * @type {RunningInstrumentRunDto}
   * @memberof RunningLabRequestDto
   */
  firstRun?: RunningInstrumentRunDto;
}

/**
 *
 * @export
 * @interface SampleTypeDto
 */
export interface RawSampleTypeDto {
  /**
   *
   * @type {number}
   * @memberof SampleTypeDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof SampleTypeDto
   */
  name: SampleTypeEnum;
}

export interface SampleTypeDto extends RawSampleTypeDto {
  default?: boolean;
}

/**
 *
 * @export
 * @interface SampleTypeSupportDto
 */
export interface SampleTypeSupportDto {
  /**
   *
   * @type {number}
   * @memberof SampleTypeSupportDto
   */
  id: number;
  /**
   *
   * @type {number}
   * @memberof SampleTypeSupportDto
   */
  sortOrder?: number;
  /**
   *
   * @type {SampleTypeDto}
   * @memberof SampleTypeSupportDto
   */
  sampleTypeDto: SampleTypeDto;
  /**
   *
   * @type {DeviceDto}
   * @memberof SampleTypeSupportDto
   */
  deviceDto: DeviceDto;
  /**
   *
   * @type {RefClassDto}
   * @memberof SampleTypeSupportDto
   */
  refClassDto: RefClassDto;
}

/**
 *
 * @export
 * @interface SettingDto
 */
export interface SettingDto {
  /**
   *
   * @type {string}
   * @memberof SettingDto
   */
  settingType: SettingTypeEnum;
  /**
   *
   * @type {string}
   * @memberof SettingDto
   */
  settingValue?: string;
}

/**
 *
 * @export
 * @interface SmartServiceApiConfigurationDto
 */
export interface SmartServiceApiConfigurationDto {
  /**
   *
   * @type {boolean}
   * @memberof SmartServiceApiConfigurationDto
   */
  enableAutoBackups?: boolean;
}

/**
 *
 * @export
 * @interface SmartServiceEulaDto
 */
export interface SmartServiceEulaDto {
  /**
   *
   * @type {Array<string>}
   * @memberof SmartServiceEulaDto
   */
  report: Array<string>;
  /**
   *
   * @type {string}
   * @memberof SmartServiceEulaDto
   */
  agreementCountry: string;
  /**
   *
   * @type {string}
   * @memberof SmartServiceEulaDto
   */
  agreementLanguage: string;
  /**
   *
   * @type {string}
   * @memberof SmartServiceEulaDto
   */
  agreementRegion: string;
}

/**
 *
 * @export
 * @interface SmartServicePropertiesDto
 */
export interface SmartServicePropertiesDto {
  /**
   *
   * @type {Array<SmartServicePropertyDto>}
   * @memberof SmartServicePropertiesDto
   */
  properties: Array<SmartServicePropertyDto>;
}

/**
 *
 * @export
 * @interface SmartServicePropertyDto
 */
export interface SmartServicePropertyDto {
  /**
   *
   * @type {string}
   * @memberof SmartServicePropertyDto
   */
  name: string;
  /**
   *
   * @type {string}
   * @memberof SmartServicePropertyDto
   */
  value: string;
  /**
   *
   * @type {string}
   * @memberof SmartServicePropertyDto
   */
  units?: SmartServicePropertyUnitsEnum;
  /**
   *
   * @type {string}
   * @memberof SmartServicePropertyDto
   */
  group?: string;
}

/**
 *
 * @export
 * @interface SnapDeviceAltDto
 */
export interface SnapDeviceAltDto {
  /**
   *
   * @type {number}
   * @memberof SnapDeviceAltDto
   */
  snapDeviceId: number;
  /**
   *
   * @type {string}
   * @memberof SnapDeviceAltDto
   */
  displayNamePropertyKey?: string;
  /**
   *
   * @type {string}
   * @memberof SnapDeviceAltDto
   */
  resultInfoPropertyKey?: string;
  /**
   *
   * @type {number}
   * @memberof SnapDeviceAltDto
   */
  snapDeviceTestTime?: number;
  /**
   *
   * @type {Array<string>}
   * @memberof SnapDeviceAltDto
   */
  snapResultTypes?: Array<SnapResultTypeEnum>;
  /**
   *
   * @type {string}
   * @memberof SnapDeviceAltDto
   */
  snapDeviceName?: string;
}

/**
 *
 * @export
 * @interface SnapDeviceDto
 */
export interface SnapDeviceDto {
  /**
   *
   * @type {InstrumentDto}
   * @memberof SnapDeviceDto
   */
  instrumentDto?: InstrumentDto;
  /**
   *
   * @type {number}
   * @memberof SnapDeviceDto
   */
  snapDeviceId: number;
  /**
   *
   * @type {string}
   * @memberof SnapDeviceDto
   */
  displayNamePropertyKey: string;
  /**
   *
   * @type {string}
   * @memberof SnapDeviceDto
   */
  resultInfoPropertyKey?: string;
  /**
   *
   * @type {number}
   * @memberof SnapDeviceDto
   */
  snapDeviceTestTime?: number;
  /**
   *
   * @type {Array<string>}
   * @memberof SnapDeviceDto
   */
  snapResultTypes: Array<SnapResultTypeEnum>;
  /**
   *
   * @type {string}
   * @memberof SnapDeviceDto
   */
  settingType: SettingTypeEnum;
}

/**
 *
 * @export
 * @interface SpeciesDto
 */
export interface SpeciesDto {
  /**
   *
   * @type {number}
   * @memberof SpeciesDto
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof SpeciesDto
   */
  speciesName: SpeciesType;

  speciesClass: ReferenceClassType;
}

export type RawSpeciesDto = Omit<SpeciesDto, "speciesClass">;

/**
 *
 * @export
 * @interface SuggestionDialogCreateNewPatientDto
 */
export interface SuggestionDialogCreateNewPatientDto {
  /**
   *
   * @type {string}
   * @memberof SuggestionDialogCreateNewPatientDto
   */
  pimsRequestUUID?: string;
}

/**
 *
 * @export
 * @interface SuggestionDialogShownDto
 */
export interface SuggestionDialogShownDto {
  /**
   *
   * @type {string}
   * @memberof SuggestionDialogShownDto
   */
  pimsRequestUUID?: string;
  /**
   *
   * @type {Array<number>}
   * @memberof SuggestionDialogShownDto
   */
  suggestedPatientIds?: Array<number>;
  /**
   *
   * @type {number}
   * @memberof SuggestionDialogShownDto
   */
  totalSuggestedPatients?: number;
}

/**
 *
 * @export
 * @interface SuggestionDialogUserMatchDto
 */
export interface SuggestionDialogUserMatchDto {
  /**
   *
   * @type {string}
   * @memberof SuggestionDialogUserMatchDto
   */
  pimsRequestUUID?: string;
  /**
   *
   * @type {number}
   * @memberof SuggestionDialogUserMatchDto
   */
  patientId?: number;
}

/**
 *
 * @export
 * @interface SystemDto
 */
export interface SystemDto {
  /**
   *
   * @type {string}
   * @memberof SystemDto
   */
  windowsEulaType?: WindowsEulaTypeEnum;
  /**
   *
   * @type {string}
   * @memberof SystemDto
   */
  ipAddress?: string;
  /**
   *
   * @type {string}
   * @memberof SystemDto
   */
  serialNumber?: string;
}

/**
 *
 * @export
 * @interface TimeConfigurationDto
 */
export interface TimeConfigurationDto {
  /**
   *
   * @type {string}
   * @memberof TimeConfigurationDto
   */
  timeZoneId: string;
  /**
   *
   * @type {boolean}
   * @memberof TimeConfigurationDto
   */
  dstEnabled: boolean;
  /**
   *
   * @type {string}
   * @memberof TimeConfigurationDto
   */
  migrationType: TimeZoneMigrationTypeEnum;
  /**
   *
   * @type {number[]}
   * @memberof TimeConfigurationDto
   */
  localDateTime?: number[];
}

/**
 *
 * @export
 * @interface UndoMergeRunsDto
 */
export interface UndoMergeRunsDto {
  /**
   *
   * @type {{ [key: string]: InstrumentRunDto; }}
   * @memberof UndoMergeRunsDto
   */
  previousRunsByCurrentRunId: { [key: string]: InstrumentRunDto };
}

/**
 *
 * @export
 * @interface UpgradeAvailableDto
 */
export interface UpgradeAvailableDto {
  /**
   *
   * @type {boolean}
   * @memberof UpgradeAvailableDto
   */
  validUpgrade?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UpgradeAvailableDto
   */
  shutdownRequired?: boolean;
  /**
   *
   * @type {string}
   * @memberof UpgradeAvailableDto
   */
  version?: string;
}

/**
 *
 * @export
 * @interface UpgradeLetterDto
 */
export interface UpgradeLetterDto {
  /**
   *
   * @type {Array<string>}
   * @memberof UpgradeLetterDto
   */
  content?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof UpgradeLetterDto
   */
  path?: string;
}

/**
 *
 * @export
 * @interface UpgradePropertiesDto
 */
export interface UpgradePropertiesDto {
  /**
   *
   * @type {boolean}
   * @memberof UpgradePropertiesDto
   */
  valid?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UpgradePropertiesDto
   */
  notificationPackagePresent?: boolean;
}

/**
 *
 * @export
 * @interface UpgradeRequestDto
 */
export interface UpgradeRequestDto {
  /**
   *
   * @type {string}
   * @memberof UpgradeRequestDto
   */
  usbCopyId: string;
  /**
   *
   * @type {boolean}
   * @memberof UpgradeRequestDto
   */
  isRead: boolean;
  /**
   *
   * @type {string}
   * @memberof UpgradeRequestDto
   */
  path?: string;
}

/**
 *
 * @export
 * @interface UpgradeResultDto
 */
export interface UpgradeResultDto {
  /**
   *
   * @type {boolean}
   * @memberof UpgradeResultDto
   */
  validUpgrade?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UpgradeResultDto
   */
  shutdownRequired?: boolean;
}

/**
 *
 * @export
 * @interface UpgradeRouterStatusDto
 */
export interface UpgradeRouterStatusDto {
  /**
   *
   * @type {string}
   * @memberof UpgradeRouterStatusDto
   */
  status?: UpgradeRouterStatusEnum;
}

/**
 *
 * @export
 * @interface UpgradeStatusDto
 */
export interface UpgradeStatusDto {
  /**
   *
   * @type {boolean}
   * @memberof UpgradeStatusDto
   */
  upgradeAttempted?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UpgradeStatusDto
   */
  upgradeSuccess?: boolean;
  /**
   *
   * @type {string}
   * @memberof UpgradeStatusDto
   */
  databaseStatus?: DatabaseStatusEnum;
}

/**
 *
 * @export
 * @interface ImageDto
 */
export interface ImageDto {
  /**
   *
   * @type {string}
   * @memberof ImageDto
   */
  imageUuid: string;
  /**
   *
   * @type {number}
   * @memberof ImageDto
   */
  index: number;
  /**
   *
   * @type {string}
   * @memberof ImageDto
   */
  imageUrl: string;

  thumbnailImageUrl: string;
}

/**
 *
 * @export
 * @interface UriSedImageDto
 */
export interface UriSedImageDto extends ImageDto {
  /**
   *
   * @type {number}
   * @memberof UriSedImageDto
   */
  referenceId?: number;
  /**
   *
   * @type {Array<CellsDto>}
   * @memberof UriSedImageDto
   */
  cells?: Array<CellsDto>;
  /**
   *
   * @type {boolean}
   * @memberof UriSedImageDto
   */
  markedForPermanentRecordByInstrument?: boolean;
  /**
   *
   * @type {number}
   * @memberof UriSedImageDto
   */
  markedForPermanentRecordByInstrumentOrder?: number;
  /**
   *
   * @type {boolean}
   * @memberof UriSedImageDto
   */
  markedForPermanentRecordByUser?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UriSedImageDto
   */
  markedForReviewByInstrument?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UriSedImageDto
   */
  markedForPermanentRecord?: boolean;
}

/**
 *
 * @export
 * @interface CytologyImageDto
 */
export interface CytologyImageDto extends ImageDto {
  /**
   *
   * @type {string}
   * @memberof CytologyImageDto
   */
  imageTitle?: string;
  /**
   *
   * @type {string}
   * @memberof CytologyImageDto
   */
  runChamber?: string;
  /**
   * Array of metadata describing annotations to be drawn over individual objects identified within the image
   * @type {Array<CytologyImageObjectDto>}
   * @memberof CytologyImageDto
   */
  imageObjects?: Array<CytologyImageObjectDto>;
}

/**
 *
 * @export
 * @interface CytologyImageObjectDto
 */
export interface CytologyImageObjectDto {
  /**
   * Identifier used in determining label text shown with an image object
   * @type {string}
   * @memberof CytologyImageObjectDto
   */
  labelIdentifier?: string;
  /**
   * X-axis coordinate marking the center of the object relative to the top left of the image, i.e. (0,0).
   * @type {number}
   * @memberof CytologyImageObjectDto
   */
  centerX?: number;
  /**
   * Y-axis coordinate marking the center of the object relative to the top left of the image, i.e. (0,0).
   * @type {number}
   * @memberof CytologyImageObjectDto
   */
  centerY?: number;
  /**
   * X-axis coordinate marking the top left corner of a box around the image object relative to the top left of the image, i.e. (0,0).
   * @type {number}
   * @memberof CytologyImageObjectDto
   */
  boundingBoxOriginX?: number;
  /**
   * Y-axis coordinate marking the top left corner of a box around the image object relative to the top left of the image, i.e. (0,0).
   * @type {number}
   * @memberof CytologyImageObjectDto
   */
  boundingBoxOriginY?: number;
  /**
   * Width of the bounding box to be drawn in the positive X direction starting from the boxes origin coordinate.
   * @type {number}
   * @memberof CytologyImageObjectDto
   */
  boundingBoxWidth?: number;
  /**
   * Height of the bounding box to be drawn in the negative Y direction starting from the boxes origin coordinate.
   * @type {number}
   * @memberof CytologyImageObjectDto
   */
  boundingBoxHeight?: number;
}

/**
 *
 * @export
 * @interface UsbUpgradeCopyResultDto
 */
export interface UsbUpgradeCopyResultDto {
  /**
   *
   * @type {boolean}
   * @memberof UsbUpgradeCopyResultDto
   */
  validUpgrade?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UsbUpgradeCopyResultDto
   */
  restartRequired?: boolean;
  /**
   *
   * @type {string}
   * @memberof UsbUpgradeCopyResultDto
   */
  copyId?: string;
  /**
   *
   * @type {string}
   * @memberof UsbUpgradeCopyResultDto
   */
  usbId?: string;
}

/**
 *
 * @export
 * @interface UserEnteredSnapResultDto
 */
export interface UserEnteredSnapResultDto {
  /**
   *
   * @type {boolean}
   * @memberof UserEnteredSnapResultDto
   */
  suppressed?: boolean;
  /**
   *
   * @type {string}
   * @memberof UserEnteredSnapResultDto
   */
  userId?: string;
  /**
   *
   * @type {string}
   * @memberof UserEnteredSnapResultDto
   */
  userComment?: string;
  /**
   *
   * @type {string}
   * @memberof UserEnteredSnapResultDto
   */
  snapResultType?: SnapResultTypeEnum;
}

/**
 *
 * @export
 * @interface UserInputRequestDto
 */
export interface UserInputRequestDto {
  /**
   * jersey-generated type descriminator
   * @type {string}
   * @memberof UserInputRequestDto
   */
  ["@c"]?: string;

  /**
   *
   * @type {number}
   * @memberof UserInputRequestDto
   */
  labRequestId?: number;
  /**
   *
   * @type {number}
   * @memberof UserInputRequestDto
   */
  instrumentRunId?: number;
  /**
   *
   * @type {number}
   * @memberof UserInputRequestDto
   */
  instrumentResultId?: number;
  /**
   *
   * @type {string}
   * @memberof UserInputRequestDto
   */
  patientName?: string;
  /**
   *
   * @type {SpeciesDto}
   * @memberof UserInputRequestDto
   */
  speciesDto?: SpeciesDto;
}

/**
 *
 * @export
 * @interface VcpActivationRequestDto
 */
export interface VcpActivationRequestDto {
  /**
   *
   * @type {string}
   * @memberof VcpActivationRequestDto
   */
  username: string;
  /**
   *
   * @type {string}
   * @memberof VcpActivationRequestDto
   */
  password: string;
}

/**
 *
 * @export
 * @interface VcpConfigurationDto
 */
export interface VcpConfigurationDto {
  /**
   *
   * @type {boolean}
   * @memberof VcpConfigurationDto
   */
  vcpActivated?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof VcpConfigurationDto
   */
  dxPortalEnabled?: boolean;
}

/**
 *
 * @export
 * @interface WorkRequestStatusDto
 */
export interface WorkRequestStatusDto {
  /**
   *
   * @type {boolean}
   * @memberof WorkRequestStatusDto
   */
  runStartable?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof WorkRequestStatusDto
   */
  runCancelable?: boolean;
}

/**
 *
 * @export
 * @interface WrappedIdBreedDto
 */
export interface WrappedIdBreedDto {
  /**
   *
   * @type {number}
   * @memberof WrappedIdBreedDto
   */
  id: number;
}

/**
 *
 * @export
 * @interface WrappedIdClientDto
 */
export interface WrappedIdClientDto {
  /**
   *
   * @type {number}
   * @memberof WrappedIdClientDto
   */
  id: number;
}

/**
 *
 * @export
 * @interface WrappedIdGenderDto
 */
export interface WrappedIdGenderDto {
  /**
   *
   * @type {number}
   * @memberof WrappedIdGenderDto
   */
  id: number;
}

/**
 *
 * @export
 * @interface WrappedIdRefClassDto
 */
export interface WrappedIdRefClassDto {
  /**
   *
   * @type {number}
   * @memberof WrappedIdRefClassDto
   */
  id: number;
}

/**
 *
 * @export
 * @interface WrappedIdSpeciesDto
 */
export interface WrappedIdSpeciesDto {
  /**
   *
   * @type {number}
   * @memberof WrappedIdSpeciesDto
   */
  id: number;
}

export interface LocationDto {
  countryCode: string;
  countryName: string;
}

export interface TimeZoneDto {
  timeZoneId: string;
  displayName: string;
  shortName: string;
  cityName: string;
  offset: number;
}

export interface CatalystQualityControlLotDto extends QualityControlDto {
  calibrationVersion: string;
  controlType: string;
}

export interface BarcodeValidationRequestDto {
  barcodeType: BarcodeType;
  barcode: string;
}

export interface BarcodeValidationResponseDto {
  isValid: boolean;
  comment: BarcodeValidationReason | null;
}

export interface TheiaMatchingRunResultDto {
  instrumentRunId: number;
  labRequestId: number;
  instrumentType: InstrumentType;
  testDateUtc: number;
  patientDto: PatientDto;
  doctorDto?: DoctorDto;
}

export enum BarcodeValidationReason {
  VALID = "VALID",
  CHECKSUM_FAILURE = "CHECKSUM_FAILURE",
  INVALID_LENGTH = "INVALID_LENGTH",
  LOT_EXPIRED = "LOT_EXPIRED",
  LOT_CONSUMED = "LOT_CONSUMED",
}

export interface InstrumentMaintenanceResultDto {
  instrument: InstrumentDto;
  maintenanceType: MaintenanceProcedure;
  result: MaintenanceResult;
}

export interface InstrumentMaintenanceRequestDto {
  maintenanceType: MaintenanceProcedure;
  parameters?: Record<string, string>;
}

export enum ProgressType {
  PERCENT_COMPLETE = "PERCENT_COMPLETE",
  TIME_REMAINING = "TIME_REMAINING",
}

export interface ProgressDto {
  instrumentId: number;
  progress: number;
  progressType: ProgressType;
}

export enum MaintenanceProcedure {
  GENERAL_CLEAN = "GENERAL_CLEAN",
  OPTICS_CALIBRATION = "OPTICS_CALIBRATION",
  DROP_CUVETTE = "DROP_CUVETTE",
  INITIALIZE = "INITIALIZE",
  OFFSETS = "OFFSETS",
  SHUTDOWN = "SHUTDOWN",
  RESTART = "RESTART",
  FULL_SYSTEM_PRIME = "FULL_SYSTEM_PRIME",
  FLOW_CELL_SOAK = "FLOW_CELL_SOAK",
  DRAIN_MIX_CHAMBERS = "DRAIN_MIX_CHAMBERS",
  SYSTEM_FLUSH = "SYSTEM_FLUSH",
  PRIME_REAGENT = "PRIME_REAGENT",
  PRIME_SHEATH = "PRIME_SHEATH",
  REPLACE_REAGENT = "REPLACE_REAGENT",
  REPLACE_SHEATH = "REPLACE_SHEATH",
  REPLACE_OBC = "REPLACE_OBC",
  BLEACH_CLEAN = "BLEACH_CLEAN",
  OPTIMIZE = "OPTIMIZE",
  MAINTENANCE_1 = "MAINTENANCE_1",
  MAINTENANCE_2 = "MAINTENANCE_2",
  MAINTENANCE_3 = "MAINTENANCE_3",
  MAINTENANCE_4 = "MAINTENANCE_4",
  MAINTENANCE_5 = "MAINTENANCE_5",
  MAINTENANCE_6 = "MAINTENANCE_6",
}

export enum MaintenanceProcedureCode {
  GENERAL_CLEAN = "GeneralClean",
  OPTICS_CALIBRATION = "OpticsCalibration",
  DROP_CUVETTE = "DropCuvette",
  INITIALIZE = "Initialize",
  OFFSETS = "Offsets",
  SHUTDOWN = "Shutdown",
  RESTART = "Restart",
  FULL_SYSTEM_PRIME = "FullSystemPrime",
  FLOW_CELL_SOAK = "FullCellSoak",
  DRAIN_MIX_CHAMBERS = "DrainMixChambers",
  SYSTEM_FLUSH = "SystemFlush",
  PRIME_REAGENT = "PrimeReagent",
  PRIME_SHEATH = "PrimeSheath",
  REPLACE_REAGENT = "ReplaceReagent",
  REPLACE_SHEATH = "ReplaceSheath",
  REPLACE_OBC = "ReplaceObc",
  BLEACH_CLEAN = "BleachClean",
  OPTIMIZE = "Optimize",
  MAINTENANCE_1 = "Maintenance1",
  MAINTENANCE_2 = "Maintenance2",
  MAINTENANCE_3 = "Maintenance3",
  MAINTENANCE_4 = "Maintenance4",
  MAINTENANCE_5 = "Maintenance5",
  MAINTENANCE_6 = "Maintenance6",
}

export enum MaintenanceResult {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum SmartQCResult {
  PASS = "PASS",
  OUT_OF_RANGE = "OUT_OF_RANGE",
}

export interface SmartQCResultDto {
  instrumentId: number;
  result: SmartQCResult;
  notify: boolean;
}

export enum CalibrationResult {
  PASS = "PASS",
  FAIL = "FAIL",
}

export interface CalibrationResultDto {
  instrumentId: number;
  result: CalibrationResult;
}

export enum InstrumentWaitingReason {
  MonthlyRinse = "MonthlyRinse",
  FlowcellRinse = "FlowcellRinse",
  WasteChamberRinse = "WasteChamberRinse",
}

export enum UpgradeMedium {
  USB = "USB",
  CD = "CD",
  SMART_SERVICE = "SMART_SERVICE",
}

export enum ResultColor {
  BLACK = "Black",
  BLUE = "Blue",
  RED = "Red",
  GREEN = "Green",
}

export enum TestResultsOrder {
  ORGAN_CELL_TYPE = "OrganCellType",
  STANDARD = "Standard",
}

export enum ResultReportFormat {
  ENHANCED = "Enhanced",
  STANDARD = "Standard",
}

export enum HematologyCodes {
  FULL_TEXT = "FullText",
  SHORT = "Short",
}

export enum ReportHeaderOptions {
  PRINT_HEADER = "PrintHeader",
  NO_HEADER = "NoHeader",
  LEAVE_HEADER_SPACE = "LeaveHeaderSpace",
}

export enum VcpActivationResult {
  SUCCESS = "SUCCESS",
  INVALID_USER_PASSWORD = "INVALID_USER_PASSWORD",
  NOT_REACHABLE = "NOT_REACHABLE",
}

export enum PaperSize {
  LETTER = "LETTER",
  A4 = "A4",
  LEGAL = "LEGAL",
}

export function isPaperSize(obj: unknown): obj is PaperSize {
  return (
    obj != null &&
    typeof obj === "string" &&
    Object.values(PaperSize).includes(obj as PaperSize)
  );
}

export enum RestoreSource {
  CD = "CD",
  FILESYSTEM = "FILESYSTEM",
  USB = "USB",
  SMARTSERVICE = "SMARTSERVICE",
}

export enum RestoreValidationResponse {
  VALID = "VALID",
  FUTURE_SOFTWARE = "FUTURE_SOFTWARE",
  MISSING_METADATA = "MISSING_METADATA",
}

export interface InstrumentAlertDto {
  instrumentId: number;
  alerts: AlertDto[];
}

export interface AlertDto {
  name: string;
  uniqueId: string;
  args?: Record<string, unknown>;
}

export interface RestoreRequestDto {
  backupId: string;
  callbackUrl: string;
}

export enum LabRequestRunType {
  NEW = "NEW",
  MERGE = "MERGE",
  APPEND = "APPEND",
  VIRTUAL = "VIRTUAL",
}

export enum ProCyteDxProcedure {
  SETTING_SEQUENCE_REQUEST = "SETTING_SEQUENCE_REQUEST",
  AUTO_RINSE_REQUEST = "AUTO_RINSE_REQUEST",
  DRAIN_RBC_ISOLATION_CHAMBER_REQUEST = "DRAIN_RBC_ISOLATION_CHAMBER_REQUEST",
  DRAIN_REACTION_CHAMBER_REQUEST = "DRAIN_REACTION_CHAMBER_REQUEST",
  RINSE_FLOWCELL_REQUEST = "RINSE_FLOWCELL_REQUEST",
  RINSE_WASTE_CHAMBER_REQUEST = "RINSE_WASTE_CHAMBER_REQUEST",
  MONTHLY_RINSE_REQUEST = "MONTHLY_RINSE_REQUEST",
  DRAIN_WASTE_FLUID_REQUEST = "DRAIN_WASTE_FLUID_REQUEST",
  AIR_PUMP_REQUEST = "AIR_PUMP_REQUEST",
  ASPIRATION_UNIT_MOTOR_REQUEST = "ASPIRATION_UNIT_MOTOR_REQUEST",
  SHEATH_MOTOR_REQUEST = "SHEATH_MOTOR_REQUEST",
  TUBE_HOLDER_MOTOR_REQUEST = "TUBE_HOLDER_MOTOR_REQUEST",
  WB_MOTOR_REQUEST = "WB_MOTOR_REQUEST",
  REMOVE_CLOGS_REQUEST = "REMOVE_CLOGS_REQUEST",
  PINCH_VALVE_REQUEST = "PINCH_VALVE_REQUEST",
  SHUTDOWN_FOR_SHIPPING = "SHUTDOWN_FOR_SHIPPING",
  SHUTDOWN = "SHUTDOWN",
  BACKUP = "BACKUP",
  REAGENT_STATUS_QUERY = "REAGENT_STATUS_QUERY",
}

export enum ProCyteDxReagent {
  EPK = "EPK",
  SLS = "SLS",
  FFD = "FFD",
  RED = "RED",
  RES = "RES",
  FFS = "FFS",
}

export interface CatOneConfigurationDto {
  soundLevel: "Off" | "Low" | "High";
  automaticEnterStandbyMode: "never" | "daily";
  automaticEnterStandbyTime: string;
  automaticExitStandbyMode: "never" | "daily";
  automaticExitStandbyTime: string;
}

export enum InstrumentSettingKey {
  QC_AUTORUN_DATETIME = "QC_AUTORUN_DATETIME",

  CONNECTION_TYPE = "CONNECTION_TYPE",

  PATIENT_RUN_CUVETTE_MODE = "PATIENT_RUN_CUVETTE_MODE",

  PATIENT_RUN_IMAGE_CAPTURE_COUNT = "PATIENT_RUN_IMAGE_CAPTURE_COUNT",

  PATIENT_RUN_IMAGE_TRANSFER_COUNT = "PATIENT_RUN_IMAGE_TRANSFER_COUNT",

  SPEAKER_VOLUME = "SPEAKER_VOLUME",

  K_SCALAR = "K_SCALAR",

  CL_SCALAR = "CL_SCALAR",

  NA_SCALAR = "NA_SCALAR",

  CA_OFFSET = "CA_OFFSET",

  CA_OFFSET_DATE = "CA_OFFSET_DATE",

  ALB_OFFSET = "ALB_OFFSET",

  ALB_OFFSET_DATE = "ALB_OFFSET_DATE",

  QSDMA_OFFSET = "QSDMA_OFFSET",

  QSDMA_OFFSET_DATE = "QSDMA_OFFSET_DATE",

  QSDMA_GAIN = "QSDMA_GAIN",

  QSDMA_GAIN_DATE = "QSDMA_GAIN_DATE",
}

export interface InstrumentSettingDto {
  settingKey: InstrumentSettingKey;
  value: string | number | boolean;
}

export interface InstrumentSettingResponseDto {
  instrumentId: number;
  success: boolean;
  error?: string;
  setting?: InstrumentSettingDto;
}

export enum HealthCode {
  NO_STATUS = "NO_STATUS",
  READY = "READY",
  COMMUNICATIONS_ERROR = "COMMUNICATIONS_ERROR",
  RUNNING = "RUNNING",
  NOT_READY = "NOT_READY",
  WAITING_FOR_INITIAL_SEQUENCE_REQUEST = "WAITING_FOR_INITIAL_SEQUENCE_REQUEST",
  WAITING_FOR_QUALITY_CONTROL_RUN_REQUEST = "WAITING_FOR_QUALITY_CONTROL_RUN_REQUEST",
  WAITING_FOR_RINSEWASTECHAMBER_REQUEST = "WAITING_FOR_RINSEWASTECHAMBER_REQUEST",
  WAITING_FOR_RINSE_FLOWCELL_REQUEST = "WAITING_FOR_RINSE_FLOWCELL_REQUEST",
  WAITING_FOR_MONTHLY_RINSE_REQUEST = "WAITING_FOR_MONTHLY_RINSE_REQUEST",
  SLEEP = "SLEEP",
  HALT = "HALT",
  STANDBY = "STANDBY",
  CLAIMED_READY_FROM_VETSTAT = "CLAIMED_READY_FROM_VETSTAT",
  UNCLAIMED_READY_FROM_VETSTAT = "UNCLAIMED_READY_FROM_VETSTAT",
}

export interface DetailedInstrumentStatusDto {
  instrument: InstrumentDto;
  status: HealthCode;
  detail?: string;
}

export interface ResultStatusNotificationDto {
  instrumentId: number;
  patientDto: PatientDto;
  status: "DELAYED" | "FAILED";
}

export interface ConnectionApprovalRequestDto {
  instrument: InstrumentDto;
}

export interface ConnectionApprovalRequestListDto {
  list: ConnectionApprovalRequestDto[];
}

export interface QualityControlTrendDto {
  qualityControlRunId: number;
  excludeFromTrend: boolean;
  comments?: string;
}

export interface QualityControlBarcodesDto {
  instrumentType: InstrumentType;
  currentBarcode?: string;
  preapprovedBarcodes: string[];
}

export enum QualityControlBarcodeSetStatus {
  BARCODE_ACCEPTED = "BARCODE_ACCEPTED",
  BARCODE_ERROR = "BARCODE_ERROR",
  CROSS_CHECKSUM_ERROR = "CROSS_CHECKSUM_ERROR",
  NO_ERRORS = "NO_ERRORS",
  INVALID_BARCODE_COUNT = "INVALID_BARCODE_COUNT",
  FLUID_TYPE_MISSING = "FLUID_TYPE_MISSING",
  LOT_EXPIRED = "LOT_EXPIRED",
}

export enum QualityControlBarcodeStatus {
  ACCEPTED = "ACCEPTED",
  CROSS_CHECKSUM_ERROR = "CROSS_CHECKSUM_ERROR",
  LENGTH_ERROR = "LENGTH_ERROR",
}

export enum QualityControlFluidType {
  LEVEL1 = "LEVEL1",
  LEVEL2 = "LEVEL2",
}

export enum QualityControlFluidCode {
  KOVA = "KOVA",
}

export interface QualityControlBarcodeInterpretationDto {
  fluidType: QualityControlFluidType;
  fluidCode: QualityControlFluidCode;
  lotNumber: number;
  expirationDate: number;
  rbcLow: number;
  rbcHigh: number;
  wbcLow: number;
  wbcHigh: number;
  checkDigit: number;

  fluidTypeValid: boolean;
  fluidCodeValid: boolean;
  lotNumberValid: boolean;
  expirationDateValid: boolean;
  rbcLowValid: boolean;
  rbcHighValid: boolean;
  wbcLowValid: boolean;
  wbcHighValid: boolean;
  checkDigitValid: boolean;
}

export interface QualityControlBarcodeDto {
  barcode: string;
  barcodeStatus: QualityControlBarcodeStatus;
  expired: boolean;
  sequenceNumber?: number;
  barcodeInterpretation?: QualityControlBarcodeInterpretationDto;
}

export interface QualityControlBarcodeSetDto {
  barcodes: QualityControlBarcodeDto[];
  barcodeSetStatus: QualityControlBarcodeSetStatus;
}

export interface MessageCounts {
  unreadCount: number;
  totalCount: number;
}

export enum MessageStatus {
  UNKNOWN = "UNKNOWN",
  ADDED = "ADDED",
  DELETED = "DELETED",
  READ = "MARKEDASREAD",
  UNREAD = "MARKEDASUNREAD",
}

export interface Message extends Record<string, unknown> {
  category: string;
  dateReceived: string;
  guid: string;
  languageCode: string;
  notificationId: number;
  printCount: number;
  printFile: string;
  rootDirectory: string;
  status: MessageStatus;
  subject: string;
  unread: boolean;
  proactiveNotificationPending: boolean;
  version: number;
  viewCount: number;
  viewFile: string;
  viewFileEncoding: string;
  proactiveNotificationFile?: string;
  proactiveNotificationFileEncoding?: string;
}

export enum AlertAction {
  OK = "OK",
  CANCEL = "CANCEL",
  CLOSE = "CLOSE",
  CONFIGURE = "CONFIGURE",
  REMIND_ME_LATER = "REMIND_ME_LATER",
  CONTINUE = "CONTINUE",
  CANCEL_RUN = "CANCEL_RUN",
  FINISH = "FINISH",
  PRINT = "PRINT",
  UPGRADE_SOFTWARE = "UPGRADE_SOFTWARE",
  UPGRADE_LATER = "UPGRADE_LATER",
  CLEAN = "CLEAN",
  INSTRUCTIONS = "INSTRUCTIONS",
  OPTIMIZE = "OPTIMIZE",

  // ProCyte Specific
  ASPIRATION_UNIT_MOTOR = "ASPIRATION_UNIT_MOTOR",
  AUTO_RINSE = "AUTO_RINSE",
  CHANGE_REAGENT = "CHANGE_REAGENT",
  CHANGE_STAIN = "CHANGE_STAIN",
  DRAIN_REACTION_CHAMBER = "DRAIN_REACTION_CHAMBER",
  DRAIN_WASTE_CHAMBER = "DRAIN_WASTE_CHAMBER",
  MONTHLY_RINSE = "MONTHLY_RINSE",
  PINCH_VALVE = "PINCH_VALVE",
  REMIND_ME_NEXT_RUN = "REMIND_ME_NEXT_RUN",
  REMIND_ME_WHEN_EMPTY = "REMIND_ME_WHEN_EMPTY",
  REMOVE_CLOGS = "REMOVE_CLOGS",
  RESET_AIR_PUMP = "RESET_AIR_PUMP",
  RESET_SHEATH_MOTOR = "RESET_SHEATH_MOTOR",
  RESET_WB_MOTOR = "RESET_WB_MOTOR",
  RINSE_FLOW_CELL = "RINSE_FLOW_CELL",
  START_PRIME = "START_PRIME",
  TUBE_HOLDER_MOTOR = "TUBE_HOLDER_MOTOR",
  WAKE_ON_LAN = "WAKE_ON_LAN",

  // LaserCyte Specific
  FIND_FILTER = "FIND_FILTER",

  // CatOne Specific
  FORCE_RUN = "FORCE_RUN",
  OK_REMOVE = "OK_REMOVE",

  // Acadia Specific
  REPLACE_SHEATH = "REPLACE_SHEATH",
  REPLACE_FILTER = "REPLACE_FILTER",
  REPLACE_REAGENT = "REPLACE_REAGENT",
  REPLACE_SMART_QC = "REPLACE_SMART_QC",
  ENTER_SHEATH_BARCODE = "ENTER_SHEATH_BARCODE",
  ENTER_REAGENT_BARCODE = "ENTER_REAGENT_BARCODE",
  RUN_BLEACH_CLEAN = "RUN_BLEACH_CLEAN",

  // UriSed Specific
  REPLACE_CUVETTES = "REPLACE_CUVETTES",
  REBOOT_INSTRUMENT = "REBOOT_INSTRUMENT",
  DISMISS = "DISMISS",
  INITIALIZE = "INITIALIZE", // also used by UriSys Dx

  // UriSys Dx Specific
  CALIBRATE = "CALIBRATE",
  POWER_DOWN = "POWER_DOWN",

  CONNECT = "CONNECT",

  // inVue Dx specific
  ENTER_THEIA_BARCODE = "ENTER_THEIA_BARCODE",
}

export interface AlertActionDto {
  alert: AlertDto;
  action: AlertAction;
}

export interface Printer {
  name: string;
  displayName: string;
  systemDefault: boolean;
}

export interface PrintJob {
  job: string;
  printer?: string;
  paper: `${PaperSize}`;
  copies?: number;
  data: Blob;
}

export enum TheiaClinicalSigns {
  ITCHINESS = "ITCHINESS",
  ODOR = "ODOR",
  REDNESS = "REDNESS",
  DISCHARGE = "DISCHARGE",
  PRESENT = "PRESENT",
}

export enum TheiaSampleLocation {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum TheiaSite {
  HEAD = "HEAD",
  SUBMANDIBULAR = "SUBMANDIBULAR",
  NECK = "NECK",
  CHEST_TRUNK = "CHEST_TRUNK",
  ABDOMEN = "ABDOMEN",
  FORELIMB = "FORELIMB",
  HINDLIMB = "HINDLIMB",
  FOOT = "FOOT",
  PERINEUM_PERIANAL = "PERINEUM_PERIANAL",
  TAIL = "TAIL",
  EAR = "EAR",
}

export enum TheiaSubsite {
  HEAD_NASAL_PLANUM = "HEAD_NASAL_PLANUM",
  HEAD_NASAL_DORSAL_BRIDGE = "HEAD_NASAL_DORSAL_BRIDGE",
  HEAD_LIP_HAIRED_SKIN = "HEAD_LIP_HAIRED_SKIN",
  HEAD_LIP_MUCU_JUNCTION = "HEAD_LIP_MUCU_JUNCTION",
  HEAD_MUZZLE = "HEAD_MUZZLE",
  HEAD_CHIN = "HEAD_CHIN",
  HEAD_CHEEK = "HEAD_CHEEK",
  HEAD_TOP_OF_HEAD = "HEAD_TOP_OF_HEAD",
  HEAD_PERIOCULAR = "HEAD_PERIOCULAR",
  HEAD_EYELID = "HEAD_EYELID",
  HEAD_PINNA = "HEAD_PINNA",
  HEAD_OTHER_UNKNOWN = "HEAD_OTHER_UNKNOWN",
  SUBMANDIBULAR_SKIN_SUBCUT_LESION = "SUBMANDIBULAR_SKIN_SUBCUT_LESION",
  SUBMANDIBULAR_SALIVARY_GLAND = "SUBMANDIBULAR_SALIVARY_GLAND",
  SUBMANDIBULAR_OTHER_UNKNOWN = "SUBMANDIBULAR_OTHER_UNKNOWN",
  NECK_DORSAL = "NECK_DORSAL",
  NECK_LATERAL = "NECK_LATERAL",
  NECK_VENTRAL = "NECK_VENTRAL",
  NECK_THYROID = "NECK_THYROID",
  NECK_OTHER_UNKNOWN = "NECK_OTHER_UNKNOWN",
  CHEST_TRUNK_LATERAL = "CHEST_TRUNK_LATERAL",
  CHEST_TRUNK_VENTRAL = "CHEST_TRUNK_VENTRAL",
  CHEST_TRUNK_DORSUM = "CHEST_TRUNK_DORSUM",
  CHEST_TRUNK_MAMMARY_GLAND = "CHEST_TRUNK_MAMMARY_GLAND",
  CHEST_TRUNK_OTHER_UNKNOWN = "CHEST_TRUNK_OTHER_UNKNOWN",
  ABDOMEN_LATERAL = "ABDOMEN_LATERAL",
  ABDOMEN_VENTRAL = "ABDOMEN_VENTRAL",
  ABDOMEN_MIDLINE = "ABDOMEN_MIDLINE",
  ABDOMEN_MAMMARY_GLAND = "ABDOMEN_MAMMARY_GLAND",
  ABDOMEN_INGUINAL = "ABDOMEN_INGUINAL",
  ABDOMEN_PREPUTIAL_HAIRED_SKIN = "ABDOMEN_PREPUTIAL_HAIRED_SKIN",
  ABDOMEN_OTHER_UNKNOWN = "ABDOMEN_OTHER_UNKNOWN",
  FORELIMB_AXILLA = "FORELIMB_AXILLA",
  FORELIMB_SHOULDER = "FORELIMB_SHOULDER",
  FORELIMB_ELBOW = "FORELIMB_ELBOW",
  FORELIMB_CARPUS = "FORELIMB_CARPUS",
  FORELIMB_BRACHIUM = "FORELIMB_BRACHIUM",
  FORELIMB_ANTEBRACHIUM = "FORELIMB_ANTEBRACHIUM",
  FORELIMB_OTHER_UNKNOWN = "FORELIMB_OTHER_UNKNOWN",
  HINDLIMB_HIP = "HINDLIMB_HIP",
  HINDLIMB_THIGH = "HINDLIMB_THIGH",
  HINDLIMB_STIFLE = "HINDLIMB_STIFLE",
  HINDLIMB_TARSUS = "HINDLIMB_TARSUS",
  HINDLIMB_TIBIAL_REGION = "HINDLIMB_TIBIAL_REGION",
  HINDLIMB_OTHER_UNKNOWN = "HINDLIMB_OTHER_UNKNOWN",
  FOOT_METACARPAL_METATARSAL = "FOOT_METACARPAL_METATARSAL",
  FOOT_CARPUS_TARSUS = "FOOT_CARPUS_TARSUS",
  FOOT_DIGIT = "FOOT_DIGIT",
  FOOT_NAILBED = "FOOT_NAILBED",
  FOOT_INTERDIGITAL = "FOOT_INTERDIGITAL",
  FOOT_PAD = "FOOT_PAD",
  FOOT_OTHER_UNKNOWN = "FOOT_OTHER_UNKNOWN",
  PERINEUM_PERIANAL_PARANIAL_REGION = "PERINEUM_PERIANAL_PARANIAL_REGION",
  PERINEUM_PERIANAL_ANAL_GLAND_SAC = "PERINEUM_PERIANAL_ANAL_GLAND_SAC",
  PERINEUM_PERIANAL_PERIVULVAR = "PERINEUM_PERIANAL_PERIVULVAR",
  PERINEUM_PERIANAL_SCROTUM = "PERINEUM_PERIANAL_SCROTUM",
  PERINEUM_PERIANAL_OTHER_UNKNOWN = "PERINEUM_PERIANAL_OTHER_UNKNOWN",
  TAIL_TAIL_BASE = "TAIL_TAIL_BASE",
  TAIL_TAIL_DORSAL = "TAIL_TAIL_DORSAL",
  TAIL_TAIL_VENTRAL = "TAIL_TAIL_VENTRAL",
  TAIL_OTHER_UNKNOWN = "TAIL_OTHER_UNKNOWN",
  EAR = "EAR",
  EMPTY = "EMPTY",
  INDETERMINATE = "INDETERMINATE",
}

export enum IncludedRunsType {
  BOTH_SNAP_ONLY = "BOTH_SNAP_ONLY", // lab request contains only manual snap and snap pro runs
  MANUAL_SNAP_ONLY = "MANUAL_SNAP_ONLY", // lab request only contains manual snap runs
  NO_COMPLETE_RUNS = "NO_COMPLETE_RUNS", // lab request has no complete runs
  OTHERS = "OTHERS", // lab request has a least one non-snap/snap-pro run
  SNAP_PRO_ONLY = "SNAP_PRO_ONLY", // lab request only contains snap pro runs
}

export interface LabRequestCompleteDto {
  labRequestId: number;
  includedRunsType: `${IncludedRunsType}`;
  isQualityControl: boolean;
}

export enum InstallationStatus {
  INSERT_MEDIA = "INSERT_MEDIA",
  FILES_FOUND = "FILES_FOUND",
  FILES_NOT_FOUND = "FILES_NOT_FOUND",
  INCORRECT_FORMAT = "INCORRECT_FORMAT",
  MAIN_UNIT_ON = "MAIN_UNIT_ON",
  TRANSMISSION_ERROR_SYSTEM_CAL = "TRANSMISSION_ERROR_SYSTEM_CAL",
  TRANSMISSION_ERROR_SERIAL_NUMBER = "TRANSMISSION_ERROR_SERIAL_NUMBER",
  SUCCESS = "SUCCESS",
}

export enum FeatureFlagName {
  SNAP_PRO_FIRMWARE_POLLING = "SNAP_PRO_FIRMWARE_POLLING",
  REFERENCE_LAB = "REFERENCE_LAB",
  VC_PLUS_LOCALIZE_RESULTS = "VC_PLUS_LOCALIZE_RESULTS",
  UA_IA_GENERATE_AND_PERSIST = "UA_IA_GENERATE_AND_PERSIST",
  UA_IA_DISPLAY_AND_PRINT = "UA_IA_DISPLAY_AND_PRINT",
  UA_IA_PIMS_TRANSMIT = "UA_IA_PIMS_TRANSMIT",
  UA_IA_VCP_TRANSMIT = "UA_IA_VCP_TRANSMIT",
  UA_IA_VCP_USE_SEPARATE_FIELD = "UA_IA_VCP_USE_SEPARATE_FIELD",
  UA_ABN_COL_VCP_TRANSMIT = "UA_ABN_COL_VCP_TRANSMIT",
  IHDIG_SDK = "IHDIG_SDK",
  TENSEI_CONNECTION = "TENSEI_CONNECTION",
  TENSEI_RESULTS = "TENSEI_RESULTS",
  LEISHMANIA_2SPOT_ENABLED = "LEISHMANIA_2SPOT_ENABLED",
  LEISH_FOUR_DX_ENABLED = "LEISH_FOUR_DX_ENABLED",
  THEIA_RESULTS = "THEIA_RESULTS",
  THEIA_CONNECTION = "THEIA_CONNECTION",
  THEIA_FNA_ENABLED = "THEIA_FNA_ENABLED",
  THEIA_CANINE_EARSWAB_RESULTS = "THEIA_CANINE_EARSWAB_RESULTS",
  THEIA_FELINE_EARSWAB_RESULTS = "THEIA_FELINE_EARSWAB_RESULTS",
  THEIA_CANINE_BLOOD_RESULTS = "THEIA_CANINE_BLOOD_RESULTS",
  THEIA_FELINE_BLOOD_RESULTS = "THEIA_FELINE_BLOOD_RESULTS",
  THEIA_CANINE_EARSWAB_ENABLED = "THEIA_CANINE_EARSWAB_ENABLED",
  THEIA_FELINE_EARSWAB_ENABLED = "THEIA_FELINE_EARSWAB_ENABLED",
  THEIA_CANINE_BLOOD_ENABLED = "THEIA_CANINE_BLOOD_ENABLED",
  THEIA_FELINE_BLOOD_ENABLED = "THEIA_FELINE_BLOOD_ENABLED",
  CATONE_SMARTQC = "CATONE_SMARTQC",
  CATALYSTDX_SMARTQC = "CATALYSTDX_SMARTQC",
  VIEWPOINT_AWARENESS_POPUP = "VIEWPOINT_AWARENESS_POPUP",
  THEIA_BARCODE_ENTRY_ENABLED = "THEIA_BARCODE_ENTRY_ENABLED",
}

export interface SmartQCRunRecordDto {
  runId: number;
  runDate: Date;
  result: SmartQCResult;
}

export interface SupportedRunTypeValidationDto {
  runType: LabRequestRunType;
  supported: boolean;
  reasons?: SupportedRunTypeValidationError[];
}

export enum SupportedRunTypeValidationError {
  MERGE_THEIA = "MERGE_THEIA",
  MERGE_NON_UNIQUE_RUNS = "MERGE_NON_UNIQUE_RUNS",
  MERGE_LAB_REQUEST_ACTIVE = "MERGE_LAB_REQUEST_ACTIVE",
}

export interface BackgroundCheckDto {
  assayName: string;
  value: number;
  highLimit?: number;
  units?: string;
  precision?: number;
}

export interface GraphDataDto {
  assayIdentityName: string;
  critHigh: number;
  critLow: number;
  refHigh: number;
  refLow: number;
  points: GraphDataPointDto[];
}

export interface GraphDataPointDto {
  runId: number;
  resultId: number;
  date: number;
  value: number;
  label: string;
  source: InstrumentType;
  critHigh: number;
  critLow: number;
  refHigh: number;
  refLow: number;
}

export interface CatalystSmartQcReminderDto {
  instrumentType: InstrumentType.CatalystOne | InstrumentType.CatalystDx;
  deferralCount: number;
}

export interface ViewPointActivationStatusDto {
  enabled: boolean;
}

/**
 *
 * @export
 * @interface LaserCyteProcedureDto
 */
export interface LaserCyteProcedureDto {
  /**
   *
   * @type {string}
   * @memberof LaserCyteProcedureDto
   */
  command?: LaserCyteProcedureDto.CommandEnum;
  /**
   *
   * @type {string}
   * @memberof LaserCyteProcedureDto
   */
  parameter?: string;
}

/**
 * @export
 * @namespace LaserCyteProcedureDto
 */
export namespace LaserCyteProcedureDto {
  /**
   * @export
   * @enum {string}
   */
  export enum CommandEnum {
    RUNSAMPLE = <any>"RUN_SAMPLE",
    STARTUP = <any>"STARTUP",
    SHORTCLEAN = <any>"SHORT_CLEAN",
    PERIODICCLEAN = <any>"PERIODIC_CLEAN",
    ENABLEANDGOHOME = <any>"ENABLE_AND_GO_HOME",
    HOMEALL = <any>"HOME_ALL",
    BUBBLEFLUSH = <any>"BUBBLE_FLUSH",
    SHEATHCAPACITANCE = <any>"SHEATH_CAPACITANCE",
    WASTECAPACITANCE = <any>"WASTE_CAPACITANCE",
    IGNOREWASTEBOTTLEFULL = <any>"IGNORE_WASTE_BOTTLE_FULL",
    READTEMPERATURE = <any>"READ_TEMPERATURE",
    TESTVIALBLOCK = <any>"TEST_VIAL_BLOCK",
    VIALBLOCKREADINGS = <any>"VIAL_BLOCK_READINGS",
    ENABLEBACKGROUND = <any>"ENABLE_BACKGROUND",
    DISABLEBACKGROUND = <any>"DISABLE_BACKGROUND",
    READBARCODESLOT0 = <any>"READ_BARCODE_SLOT_0",
    READBARCODESLOT1 = <any>"READ_BARCODE_SLOT_1",
    READBARCODESLOT2 = <any>"READ_BARCODE_SLOT_2",
    READBARCODESLOT3 = <any>"READ_BARCODE_SLOT_3",
    CLOSEVALVE = <any>"CLOSE_VALVE",
    OPENVALVE = <any>"OPEN_VALVE",
    SHUTDOWNSHIPPINGSTEP1 = <any>"SHUT_DOWN_SHIPPING_STEP_1",
    SHUTDOWNSHIPPINGSTEP2 = <any>"SHUT_DOWN_SHIPPING_STEP_2",
    PRIME = <any>"PRIME",
    OPTIMIZE = <any>"OPTIMIZE",
    CANCELOPTIMIZE = <any>"CANCEL_OPTIMIZE",
    MANUALFGA = <any>"MANUAL_FGA",
    REPLACEFILTER = <any>"REPLACE_FILTER",
    BLEACHCLEAN = <any>"BLEACH_CLEAN",
    BLEACHPRIME = <any>"BLEACH_PRIME",
    NONE = <any>"NONE",
  }
}

/**
 *
 * @export
 * @interface NotificationCountDto
 */
export interface NotificationCountDto {
  /**
   *
   * @type {number}
   * @memberof NotificationCountDto
   */
  unreadCount?: number;
  /**
   *
   * @type {number}
   * @memberof NotificationCountDto
   */
  totalCount?: number;
}

export interface InstrumentStartupResponseDto {
  /**
   *
   * @type {boolean}
   * @memberof InstrumentStartupResponseDto
   */
  inProcess?: boolean;
}

/**
 *
 * @export
 * @interface PimsXmlMessageDto
 */
export interface PimsXmlMessageDto {
  /**
   *
   * @type {string}
   * @memberof PimsXmlMessageDto
   */
  path: string;
  /**
   *
   * @type {string}
   * @memberof PimsXmlMessageDto
   */
  xml: string;
}

/**
 *
 * @export
 * @interface UriSysDxQualityControlRunRecordDto
 */
export interface UriSysDxQualityControlRunRecordDto {
  /**
   *
   * @type {number}
   * @memberof UriSysDxQualityControlRunRecordDto
   */
  runId?: number;
  /**
   *
   * @type {number}
   * @memberof UriSysDxQualityControlRunRecordDto
   */
  runDate?: number;
  /**
   *
   * @type {string}
   * @memberof UriSysDxQualityControlRunRecordDto
   */
  result?: UriSysDxQualityControlRunRecordDto.ResultEnum;
}

/**
 * @export
 * @namespace UriSysDxQualityControlRunRecordDto
 */
export namespace UriSysDxQualityControlRunRecordDto {
  /**
   * @export
   * @enum {string}
   */
  export enum ResultEnum {
    PASS = <any>"PASS",
    FAIL = <any>"FAIL",
  }
}

/**
 *
 * @export
 * @interface WizardDataDto
 */
export interface WizardDataDto {
  /**
   *
   * @type {number}
   * @memberof WizardDataDto
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof WizardDataDto
   */
  wizardType?: WizardDataDto.WizardTypeEnum;
  /**
   *
   * @type {Date}
   * @memberof WizardDataDto
   */
  wizardExpirationDate?: Date;
  /**
   *
   * @type {boolean}
   * @memberof WizardDataDto
   */
  advanceStepContext?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof WizardDataDto
   */
  restoreAfterReboot?: boolean;
  /**
   *
   * @type {WizardDataModel}
   * @memberof WizardDataDto
   */
  wizardDataModel?: WizardDataModel;
}

/**
 *
 * @export
 * @interface WizardDataModel
 */
export interface WizardDataModel {
  /**
   *
   * @type {number}
   * @memberof WizardDataModel
   */
  currentStepIndex?: number;
  /**
   *
   * @type {Date}
   * @memberof WizardDataModel
   */
  wizardExpirationDate?: Date;
}

/**
 * @export
 * @namespace WizardDataDto
 */
export namespace WizardDataDto {
  /**
   * @export
   * @enum {string}
   */
  export enum WizardTypeEnum {
    CATONECLEANING = <any>"CAT_ONE_CLEANING",
    CATONEOPTICSCALIBRATION = <any>"CAT_ONE_OPTICS_CALIBRATION",
    CATONEOFFSETS = <any>"CAT_ONE_OFFSETS",
    CATONEQCVETTROL = <any>"CAT_ONE_QC_VETTROL",
    CATONEQCPHBR = <any>"CAT_ONE_QC_PHBR",
    CATONEQCUPRO = <any>"CAT_ONE_QC_UPRO",
    CATONEQCADV = <any>"CAT_ONE_QC_ADV",
    PREPAREVETTROL = <any>"PREPARE_VETTROL",
    ACADIAREPLACESHEATH = <any>"ACADIA_REPLACE_SHEATH",
    ACADIAREPLACEFILTER = <any>"ACADIA_REPLACE_FILTER",
    ACADIAREPLACEREAGENT = <any>"ACADIA_REPLACE_REAGENT",
    ACADIAREPLACEQC = <any>"ACADIA_REPLACE_QC",
    URISEDFULLDOORCLEANING = <any>"URISED_FULL_DOOR_CLEANING",
    URISEDHALFDOORCLEANING = <any>"URISED_HALF_DOOR_CLEANING",
    URISEDINITIALIZE = <any>"URISED_INITIALIZE",
    PDXSHUTDOWNFORSHIPPING = <any>"PDX_SHUTDOWN_FOR_SHIPPING",
    VETTESTRUNINSTRUCTIONS = <any>"VETTEST_RUN_INSTRUCTIONS",
    LASERCYTEREPLACEFILTERINSTRUCTIONS = <any>(
      "LASERCYTE_REPLACE_FILTER_INSTRUCTIONS"
    ),
    LASERCYTEREPLACEFILTERFINDMYFILTER = <any>(
      "LASERCYTE_REPLACE_FILTER_FIND_MY_FILTER"
    ),
  }
}

/**
 *
 * @export
 * @interface CdDriveStatusDto
 */
export interface CdDriveStatusDto {
  /**
   *
   * @type {string}
   * @memberof CdDriveStatusDto
   */
  driveLetter?: string;
  /**
   *
   * @type {string}
   * @memberof CdDriveStatusDto
   */
  mediaState?: string;
}

export interface PracticeInfo {
  sapId?: string;
}
