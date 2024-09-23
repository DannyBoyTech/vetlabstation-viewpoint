import type {
  HashedNoteDto,
  InstrumentDto,
  InstrumentResultDto,
  InstrumentRunDto,
  InstrumentTimePropertyDto,
  PatientDto,
  PimsRequestDto,
  RawInstrumentDto,
  RawInstrumentResultDto,
  RawInstrumentRunDto,
  RawPatientDto,
  RawPimsRequestDto,
  RawRunningInstrumentRunDto,
  RawSpeciesDto,
  RawTestOrderDto,
  RunningInstrumentRunDto,
  SampleTypeSupportDto,
  SpeciesDto,
  TestOrderDto,
  TranslatedNoteDto,
} from "@viewpoint/api";
import {
  InstrumentRunStatus,
  InstrumentType,
  QualifierTypeEnum,
  SampleTypeEnum,
  TranslatedNoteType,
} from "@viewpoint/api";
import { parseIvlsDob } from "./date-utils";
import { getRefClassType } from "./lifestage-utils";
import crypto from "crypto";
import { NodeHtmlMarkdown } from "node-html-markdown";
import {
  CountdownInstruments,
  DISPLAY_ORDER,
  EditableInstrumentTypes,
  fetchServiceCategory,
  getInstrumentTypeForDeviceId,
  MANUAL_ENTRY_INSTRUMENT_TYPES,
  ManualEntryInstruments,
  QualifierTypeMapping,
  RUNNABLE_INSTRUMENT_TYPES,
  WHOLE_BLOOD_INSTRUMENTS,
} from "./mapping-data";

const nhm = new NodeHtmlMarkdown();

const Adapters: Record<string, (arg: any) => any> = {
  "com.idexx.labstation.core.dto.PatientDto": adaptPatient,
  "com.idexx.labstation.core.dto.SpeciesDto": adaptSpecies,
  "com.idexx.labstation.core.dto.PimsRequestDto": adaptPimsRequest,
  "com.idexx.labstation.core.dto.InstrumentDto": adaptInstrumentDto,
  "com.idexx.labstation.core.dto.InstrumentRunDto": adaptInstrumentRunDto,
  ".QualityControlRunDto": adaptInstrumentRunDto,
  ".InstrumentRunDto": adaptInstrumentRunDto,
  "com.idexx.labstation.core.dto.RunningInstrumentRunDto": adaptRunningInstrumentRunDto,
  ".RunningInstrumentRunDto": adaptRunningInstrumentRunDto,
  "com.idexx.labstation.core.dto.InstrumentResultDto": adaptInstrumentResultDto,
  ".InstrumentResultDto": adaptInstrumentResultDto,
  "com.idexx.labstation.core.dto.TestOrderDto": adaptTestOrderDto,
  ".TestOrderDto": adaptTestOrderDto,
  "com.idexx.labstation.core.dto.SampleTypeSupportDto": adaptSampleTypeSupportDto,
  "com.idexx.labstation.core.dto.instrument.properties.InstrumentTimePropertyDto": adaptInstrumentTimePropertyDto,
} as const;

// Temporary support for 2 different IVLS API responses for notes.
// 5.20 provides notes as a simple collection of strings. 5.21 provides notes
// as a collection of TranslatedNoteDto objects.
function adaptNote(note: TranslatedNoteDto | string): HashedNoteDto {
  if (typeof note === "string") {
    return {
      note: nhm.translate(note),
      type: TranslatedNoteType.GENERIC,
      hashId: crypto.createHash("md5").update(note).digest("hex"),
    };
  } else {
    return {
      note: nhm.translate(note.text),
      type: note.type,
      hashId: crypto.createHash("md5").update(note.text).digest("hex"),
    };
  }
}

export function adaptPatient(ivlsResponse: RawPatientDto): PatientDto {
  return {
    ...ivlsResponse,
    birthDate: parseIvlsDob(ivlsResponse.birthDate),
  };
}

export function adaptSpecies(ivlsResponse: RawSpeciesDto): SpeciesDto {
  return {
    ...ivlsResponse,
    speciesClass: getRefClassType(ivlsResponse.speciesName),
  };
}

export function adaptPimsRequest(ivlsResponse: RawPimsRequestDto): PimsRequestDto {
  return {
    ...ivlsResponse,
    patientDob: parseIvlsDob(ivlsResponse.patientDob),
    dateRequestedUtc: ivlsResponse.dateRequestedUtc * 1000,
    patientSpecies: adaptSpecies(ivlsResponse.patientSpecies),
  };
}

export function adaptInstrumentDto(ivlsResponse: RawInstrumentDto): InstrumentDto {
  return {
    ...ivlsResponse,
    runnable: RUNNABLE_INSTRUMENT_TYPES.includes(ivlsResponse.instrumentType),
    manualEntry: MANUAL_ENTRY_INSTRUMENT_TYPES.includes(ivlsResponse.instrumentType),
  };
}

function adaptInstrumentRunDto(ivlsResponse: RawInstrumentRunDto): InstrumentRunDto {
  return {
    ...ivlsResponse,
    serviceCategory: fetchServiceCategory(ivlsResponse.instrumentType, ivlsResponse.sampleType),
    displayOrder: DISPLAY_ORDER[ivlsResponse.instrumentType],
    hasDotPlots: !!(ivlsResponse.whiteFcsFilename || ivlsResponse.redFcsFilename),
    editable:
      ivlsResponse.snapDeviceDto != null ||
      ivlsResponse.editableRun != null ||
      EditableInstrumentTypes.includes(ivlsResponse.instrumentType),
    runNotes: ivlsResponse.translatedNotes?.map(adaptNote),
    status:
      ManualEntryInstruments.includes(ivlsResponse.instrumentType) &&
      ivlsResponse.status === InstrumentRunStatus.Pending
        ? InstrumentRunStatus.Awaiting_Manual_Entry
        : (ivlsResponse.status as unknown as InstrumentRunStatus),
  };
}

export function adaptRunningInstrumentRunDto({
  progress,
  ...ivlsResponse
}: RawRunningInstrumentRunDto): RunningInstrumentRunDto {
  return {
    ...ivlsResponse,
    serviceCategory: fetchServiceCategory(ivlsResponse.instrumentType, ivlsResponse.sampleType),
    displayOrder: DISPLAY_ORDER[ivlsResponse.instrumentType],
    hasDotPlots: !!(
      (ivlsResponse as InstrumentRunDto).whiteFcsFilename || (ivlsResponse as InstrumentRunDto).redFcsFilename
    ),
    editable: ivlsResponse.snapDeviceDto != null || EditableInstrumentTypes.includes(ivlsResponse.instrumentType),
    status:
      ManualEntryInstruments.includes(ivlsResponse.instrumentType) &&
      ivlsResponse.status === InstrumentRunStatus.Pending
        ? InstrumentRunStatus.Awaiting_Manual_Entry
        : (ivlsResponse.status as unknown as InstrumentRunStatus),
    progress: !!progress && !CountdownInstruments.includes(ivlsResponse.instrumentType) ? progress / 100 : undefined,
    timeRemaining:
      !!progress && CountdownInstruments.includes(ivlsResponse.instrumentType) ? progress * 1000 : undefined,
  };
}

export function adaptSampleTypeSupportDto(sampleType: SampleTypeSupportDto): SampleTypeSupportDto {
  return {
    ...sampleType,
    sampleTypeDto: {
      ...sampleType.sampleTypeDto,
      default: isDefaultSampleType(sampleType),
    },
  };
}

export function adaptInstrumentTimePropertyDto(time: InstrumentTimePropertyDto): InstrumentTimePropertyDto {
  // Incoming time from IVLS is 12 hour, but IVLS expects 24 hour on updates.
  // Adapt all incoming times to 24 hour here in the adapter.
  let hour = time.hours;
  if (hour === 12 && !time.isPm) {
    hour = 0;
  } else if (hour < 12 && time.isPm) {
    hour += 12;
  }
  return {
    ...time,
    hours: hour,
  };
}

function isDefaultSampleType(sampleType: SampleTypeSupportDto): boolean {
  const instrumentType = getInstrumentTypeForDeviceId(sampleType.deviceDto.id);
  if (instrumentType != null) {
    if (instrumentType === InstrumentType.SediVueDx) {
      return sampleType.sampleTypeDto.name === SampleTypeEnum.URINE;
    } else if (WHOLE_BLOOD_INSTRUMENTS.includes(instrumentType)) {
      return sampleType.sampleTypeDto.name === SampleTypeEnum.WHOLEBLOOD;
    }
  }
  return false;
}

/**
 * The following regular expression attempts to reliably parse HTML tags, which is generally a Bad Idea.
 * This was created to prevent data corruption encountered while using a simpler regex.
 *
 * Ideally, we should lobby to remove HTML from the API field rather than contiue to do this.
 *
 * As for the pattern, it matches html tags, either self closing or paired. It accounts for attributes as well.
 * The idea is to make an effort to ensure we are actually looking at an HTML tag before stripping it.
 */
const htmlElems =
  /<[a-zA-Z][a-zA-Z0-9]*(?:\s+[a-zA-Z][a-zA-Z0-9]*(?:=(?:'[^']*'|"[^"]*"))?)*\s*[/]>|<([a-zA-Z][a-zA-Z0-9]*)(?:\s+[a-zA-Z][a-zA-Z0-9]*(?:=(?:'[^']*'|"[^"]*"))?)*\s*>.*?<[/]\1>/gs;

function adaptInstrumentResultDto(ivlsResponse: RawInstrumentResultDto): InstrumentResultDto {
  return {
    ...ivlsResponse,
    qualifierType: QualifierTypeMapping[ivlsResponse.displayCharacter] ?? QualifierTypeEnum.NONE,
    resultValueForDisplay: ivlsResponse.resultValueForDisplay?.replaceAll(htmlElems, ""),
    resultNotes: ivlsResponse.translatedNotes?.map(adaptNote),
  };
}

function adaptTestOrderDto(ivlsResponse: RawTestOrderDto): TestOrderDto {
  return {
    ...ivlsResponse,
    testOrderNotes: ivlsResponse.translatedNotes?.map(adaptNote),
  };
}

export interface JerseyObject {
  "@class"?: string;
  "@c"?: string;
}

export function adaptObject(resp: JerseyObject | JerseyObject[] | null): unknown {
  if (Array.isArray(resp)) {
    return (resp as JerseyObject[]).map((obj) => adaptObject(obj));
  } else if (typeof resp === "object") {
    const identifier = resp?.["@class"] ?? resp?.["@c"];
    const adapted = identifier != null && Adapters[identifier] != null ? Adapters[identifier]!(resp) : resp;
    for (const key in adapted) {
      if (adapted.hasOwnProperty(key) && (typeof adapted[key] === "object" || Array.isArray(adapted[key]))) {
        adapted[key] = adaptObject(adapted[key]);
      }
    }

    return adapted;
  }
  return resp;
}
