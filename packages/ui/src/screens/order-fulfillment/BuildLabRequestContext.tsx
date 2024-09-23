import React, { PropsWithChildren, useCallback, useRef, useState } from "react";
import {
  AvailableSampleTypes,
  DefaultRunConfigs,
  DilutionDisplayConfig,
  DoctorDto,
  ExecuteInstrumentRunDto,
  ExecuteLabRequestDto,
  InstrumentDto,
  InstrumentStatusDto,
  InstrumentType,
  LabRequestDto,
  PatientDto,
  PimsRequestDto,
  RefClassDto,
  SnapDeviceDto,
} from "@viewpoint/api";
import { useGetDefaultRunConfigsQuery } from "../../api/InstrumentApi";

export interface ReferenceData {
  availableInstruments?: InstrumentStatusDto[];
  availableRefClasses?: RefClassDto[];
  availableSampleTypes?: AvailableSampleTypes;
  availableDoctors?: DoctorDto[];
  availableSnaps?: SnapDeviceDto[];
  suggestedRefClass?: RefClassDto;
  dilutionConfigs?: { [key in InstrumentType]?: DilutionDisplayConfig };
}

export interface LabRequestContext {
  labRequest: Partial<ExecuteLabRequestDto>;
  referenceData: ReferenceData;
  patient: PatientDto;
  initializing: boolean;
  defaultRunConfigs?: DefaultRunConfigs;
  pendingRequest?: PimsRequestDto;
  originalLabRequest?: LabRequestDto;
  updateLabRequest: (updates: Partial<ExecuteLabRequestDto>) => void;
  addExecuteRun: (instrument: InstrumentDto) => ExecuteInstrumentRunDto;
  updateExecuteRun: (
    instrumentId: number,
    runQueueId: number,
    updates: Partial<ExecuteInstrumentRunDto>
  ) => void;
  updateSelectedSnapTests: (snapDeviceIds: number[]) => void;
  removeExecuteRun: (instrumentId: number, runQueueId: number) => void;
  removeRunsForInstrument: (
    instrumentId: number,
    // If true, will keep the order the user selected this instrument in the shopping cart
    retainSortOrder?: boolean
  ) => void;
}

export const BuildLabRequestContext = React.createContext<LabRequestContext>(
  undefined as unknown as LabRequestContext
);

export interface BuildLabRequestProviderProps extends PropsWithChildren {
  patient: PatientDto;
  referenceData: ReferenceData;
  mostRecentWeight?: string;
  matchedDoctor?: DoctorDto;
  pendingRequest?: PimsRequestDto;
  originalLabRequest?: LabRequestDto;
}

const BuildLabRequestProvider = (props: BuildLabRequestProviderProps) => {
  const [labRequest, setLabRequest] = useState<Partial<ExecuteLabRequestDto>>({
    patientId: props.patient.id,
    weight: props.mostRecentWeight ?? "",
    requisitionId:
      props.originalLabRequest?.requisitionId ??
      props.pendingRequest?.requisitionId ??
      "",
    doctorId:
      props.originalLabRequest?.doctorDto?.id ?? props.matchedDoctor?.id,
    refClassId: props.referenceData.suggestedRefClass?.id,
    pimsRequestUUID: props.pendingRequest?.pimsRequestUUID,
    // TODO - remove when IVLS provides endpoint for getting PIMS request by ID/UUID
    // Temporary workaround to pass the PIMS request back to IVLS if it was removed from the pending list
    pimsRequestDto: props.pendingRequest,
  });
  // Get default run config data for the available instruments
  const { data: defaultRunConfigs, isLoading: getDefaultRunConfigLoading } =
    useGetDefaultRunConfigsQuery({
      speciesId: props.patient.speciesDto?.id,
      refClassId: labRequest.refClassId,
    });

  const instrumentSelectionOrder = useRef<Set<number>>(new Set<number>());

  const updateLabRequest = useCallback(
    (updates: Partial<ExecuteLabRequestDto>) => {
      setLabRequest((curr) => ({ ...curr, ...updates }));
    },
    []
  );

  const handleUpdateSelectedSnapTests = useCallback(
    (snapDeviceIds: number[]) => {
      const snapInstrument = props.referenceData.availableInstruments?.find(
        (is) => is.instrument.instrumentType === InstrumentType.SNAP
      );
      if (snapInstrument != null) {
        setLabRequest((currentExecuteLabRequest) => {
          // Remove all SNAP runs
          const updatedRunRequests = (
            currentExecuteLabRequest.instrumentRunDtos ?? []
          ).filter((run) => run.instrumentId !== snapInstrument.instrument.id);
          snapDeviceIds.forEach((snapDeviceId, index) => {
            updatedRunRequests.push({
              instrumentId: snapInstrument.instrument.id,
              runQueueId: index + 1,
              snapDeviceId: snapDeviceId,
              instrumentRunConfigurations: [],
            });
          });
          return {
            ...currentExecuteLabRequest,
            instrumentRunDtos: updatedRunRequests,
          };
        });

        // Use an array with a single undefined device ID if no SNAPs are provided,
        // in order to keep the fake invalid SNAP run in the shopping cart
        const safeSnapDeviceIds =
          snapDeviceIds.length === 0 ? [undefined] : snapDeviceIds;

        setLabRequest((curr) => ({
          ...curr,
          instrumentRunDtos: [
            ...safeSnapDeviceIds.map((snapDeviceId, index) => ({
              instrumentId: snapInstrument.instrument.id,
              snapDeviceId,
              runQueueId: index + 1,
              instrumentRunConfigurations: [],
            })),
            ...(curr.instrumentRunDtos ?? []).filter(
              (run) => run.instrumentId !== snapInstrument.instrument.id
            ),
          ],
        }));
      } else {
        console.error(
          `Unable to locate SNAP instrument from reference data \n${JSON.stringify(
            props.referenceData.availableInstruments,
            null,
            2
          )}`
        );
      }
    },
    [props.referenceData.availableInstruments]
  );

  const handleAddExecuteRun = useCallback(
    (instrument: InstrumentDto) => {
      instrumentSelectionOrder.current.add(instrument.id);

      const defaultRunConfig =
        defaultRunConfigs?.[instrument.instrumentSerialNumber];

      const newRun: ExecuteInstrumentRunDto = {
        instrumentId: instrument.id,
        runQueueId: 1, // Assign a temporary value, the actual run queue ID will be assigned in assignInstrumentRunQueueIds
        instrumentRunConfigurations:
          defaultRunConfig == null ? [] : [defaultRunConfig],
      };
      setLabRequest((currentLabRequest) => {
        return {
          ...currentLabRequest,
          instrumentRunDtos: assignInstrumentRunQueueIds(
            (currentLabRequest.instrumentRunDtos ?? []).concat(newRun)
          ),
        };
      });

      return newRun;
    },
    [defaultRunConfigs]
  );

  const handleUpdateExecuteRun = useCallback(
    (
      instrumentId: number,
      runQueueId: number,
      updates: Partial<ExecuteInstrumentRunDto>
    ) => {
      setLabRequest((curr) => ({
        ...curr,
        instrumentRunDtos: (curr.instrumentRunDtos ?? []).map((run) =>
          run.instrumentId === instrumentId && run.runQueueId === runQueueId
            ? { ...run, ...updates }
            : run
        ),
      }));
    },
    []
  );

  const handleRemoveExecuteRun = useCallback(
    (instrumentId: number, runQueueId: number) => {
      setLabRequest((currentExecuteLabRequest) => {
        const updatedRunRequests = (
          currentExecuteLabRequest.instrumentRunDtos ?? []
        ).filter(
          (run) =>
            run.instrumentId !== instrumentId || run.runQueueId !== runQueueId
        );
        if (
          updatedRunRequests.filter((run) => run.instrumentId === instrumentId)
            .length === 0
        ) {
          instrumentSelectionOrder.current.delete(instrumentId);
        }
        return {
          ...currentExecuteLabRequest,
          instrumentRunDtos: assignInstrumentRunQueueIds(updatedRunRequests),
        };
      });
    },
    []
  );

  const handleRemoveRunsForInstrument = useCallback(
    (instrumentId: number, retainSortOrder?: boolean) => {
      setLabRequest((curr) => {
        // SNAP run config uses the function to clear out all SNAP runs and then
        // add each SNAP run ID in fresh. Setting this to true allows SNAP to
        // retain its order in the shopping cart even when all actual SNAP runs
        // have been removed
        if (!retainSortOrder) {
          instrumentSelectionOrder.current.delete(instrumentId);
        }
        return {
          ...curr,
          instrumentRunDtos: (curr.instrumentRunDtos ?? []).filter(
            (run) => run.instrumentId !== instrumentId
          ),
        };
      });
    },
    []
  );

  const sortedRunsLabRequest: Partial<ExecuteLabRequestDto> = {
    ...labRequest,
    instrumentRunDtos: (labRequest.instrumentRunDtos ?? []).sort((a, b) => {
      const arr = [...instrumentSelectionOrder.current];
      return arr.indexOf(a.instrumentId) - arr.indexOf(b.instrumentId);
    }),
  };

  return (
    <BuildLabRequestContext.Provider
      value={{
        updateLabRequest,
        defaultRunConfigs,
        initializing: getDefaultRunConfigLoading,
        labRequest: sortedRunsLabRequest,
        updateSelectedSnapTests: handleUpdateSelectedSnapTests,
        addExecuteRun: handleAddExecuteRun,
        updateExecuteRun: handleUpdateExecuteRun,
        removeExecuteRun: handleRemoveExecuteRun,
        removeRunsForInstrument: handleRemoveRunsForInstrument,
        referenceData: props.referenceData,
        patient: props.patient,
        pendingRequest: props.pendingRequest,
        originalLabRequest: props.originalLabRequest,
      }}
    >
      {props.children}
    </BuildLabRequestContext.Provider>
  );
};

function assignInstrumentRunQueueIds(
  instrumentRunDtos: ExecuteInstrumentRunDto[]
): ExecuteInstrumentRunDto[] {
  const idRunMap = instrumentRunDtos.reduce(
    (acc, runDto) => ({
      ...acc,
      [runDto.instrumentId]: (acc[runDto.instrumentId] ?? [])
        .concat(runDto)
        .map((ir, index) => ({
          ...ir,
          runQueueId: index + 1,
        })),
    }),
    {} as { [key: number]: ExecuteInstrumentRunDto[] }
  );
  return Object.values(idRunMap).flat();
}

export default BuildLabRequestProvider;
