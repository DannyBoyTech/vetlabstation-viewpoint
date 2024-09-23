import {
  InstrumentStatusDto,
  InstrumentType,
  PatientDto,
  RunningLabRequestDto,
  SnapDeviceAltDto,
  WorkRequestStatus,
} from "@viewpoint/api";
import { LocalizedPatientSignalment } from "../../../components/localized-signalment/LocalizedPatientSignalment";
import { MutableRefObject, useMemo } from "react";

import { HomeScreenCard } from "../HomeScreenComponents";
import styled from "styled-components";
import { useInstrumentNameForId } from "../../../utils/hooks/hooks";
import { useTranslation } from "react-i18next";
import { InProcessRun } from "./InProcessRun";

export const TestId = {
  Card: "in-process-card",
};

const RunsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  gap: 20px;
`;

export interface InProcessCardProps {
  labRequest: RunningLabRequestDto;
  instrumentStatuses: InstrumentStatusDto[];
  workRequestStatuses?: Record<number, WorkRequestStatus>;
  intersectionRootRef?: MutableRefObject<HTMLDivElement | null>;
}

export function InProcessCard(props: InProcessCardProps) {
  const { t } = useTranslation();
  const getInstrumentNameForId = useInstrumentNameForId();

  const instrumentRuns = Array.from(props.labRequest?.instrumentRunDtos ?? []);
  instrumentRuns?.sort?.(
    (runOne, runTwo) => runOne.displayOrder - runTwo.displayOrder
  );

  const mappedInstrumentStatuses = useMemo(() => {
    return props.labRequest.instrumentRunDtos?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: props.instrumentStatuses?.find(
          (is) => is.instrument.id === curr.instrumentId
        ),
      }),
      {} as Record<number, InstrumentStatusDto | undefined>
    );
  }, [props.instrumentStatuses, props.labRequest.instrumentRunDtos]);

  const getInstrumentName = (
    id: number | undefined,
    type: InstrumentType,
    snapDevice?: SnapDeviceAltDto
  ) => {
    if (snapDevice != null && type === InstrumentType.SNAP) {
      return t(snapDevice.displayNamePropertyKey as any);
    }
    return id == null
      ? t(`instruments.names.${type}`)
      : getInstrumentNameForId(id) ?? t(`instruments.names.${type}`);
  };

  return (
    <HomeScreenCard data-testid={TestId.Card}>
      <LocalizedPatientSignalment
        patientIdOnNewLine
        boldName
        size={"xs"}
        patient={filterPatient(props.labRequest.patientDto)}
      />

      <RunsContainer>
        {instrumentRuns.map((run) =>
          mappedInstrumentStatuses == null ||
          mappedInstrumentStatuses[run.id] == null ? undefined : (
            <InProcessRun
              intersectionRootRef={props.intersectionRootRef}
              key={run.id}
              run={run}
              labRequest={props.labRequest}
              instrumentName={getInstrumentName(
                mappedInstrumentStatuses[run.id]?.instrument.id,
                run.instrumentType,
                run.snapDeviceDto
              )}
              workRequestStatus={props.workRequestStatuses?.[run.id]}
              instrumentStatus={
                mappedInstrumentStatuses[run.id]?.instrumentStatus
              }
            />
          )
        )}
      </RunsContainer>
    </HomeScreenCard>
  );
}

/**
 * Grudgingly applied modifications to the patient to make certain special cases
 * display well when the data is not consistent enough.
 *
 * @param patient
 * @returns
 */
function filterPatient(patient?: PatientDto) {
  if (patient == null) return undefined;

  if (patient.controlIndicator) {
    return {
      ...patient,
      clientDto: {
        ...patient?.clientDto,
        lastName: "",
      },
    };
  }

  return patient;
}
