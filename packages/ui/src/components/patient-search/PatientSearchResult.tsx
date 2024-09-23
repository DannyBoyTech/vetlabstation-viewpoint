import styled from "styled-components";
import { SpotText } from "@viewpoint/spot-react";
import { Theme } from "../../utils/StyleConstants";
import { PatientDto } from "@viewpoint/api";
import { PatientImage } from "@viewpoint/spot-react";
import { PatientDisplay } from "@viewpoint/spot-react";
import { CSSProperties } from "react";
import { useFormatDateTime12h } from "../../utils/hooks/datetime";

const PatientSearchResultRoot = styled.div<{ selected: boolean }>`
  display: flex;
  gap: 20px;

  background-color: ${(p) =>
    p.selected ? p.theme.colors?.background?.secondary : undefined};

  > div {
    min-width: 0;
  }

  /*vv resize patient species icon */

  .spot-patient-display {
    margin-left: 12px;

    .spot-patient-display__icon {
      width: 35px;
      height: 35px;

      .spot-patient-display__avatar {
        width: 35px;
        height: 35px;
      }
    }
  }

  /*^^ resize patient species icon */

  /*vv truncation of long fields in search results */

  .spot-patient-display {
    min-width: 0;
  }

  .spot-typography__text--secondary {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    color: ${(p) => p.theme.colors?.text?.primary};
  }

  /*^^ truncation of long fields in search results */
`;

const ResultColumn = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export interface PatientSearchResultProps {
  style: CSSProperties;
  patient: PatientDto;
  runDate?: number;
  selected?: boolean;
  onMouseDown?: () => void;
  asSearch?: boolean;
}

export function PatientSearchResult(props: PatientSearchResultProps) {
  const formatDate = useFormatDateTime12h();

  return (
    <PatientSearchResultRoot
      className="patient-search-result"
      style={props.style}
      selected={!!props.selected}
      onMouseDown={props.onMouseDown}
    >
      <ResultColumn>
        <PatientDisplay size="xs">
          <PatientImage species={props.patient.speciesDto?.speciesName} />
          <SpotText level="secondary">{props.patient.patientName}</SpotText>
        </PatientDisplay>
      </ResultColumn>
      <ResultColumn>
        <SpotText level="secondary">{`${props.patient.clientDto?.lastName}${
          props.patient.clientDto?.firstName
            ? `, ${props.patient.clientDto?.firstName}`
            : ``
        }`}</SpotText>
      </ResultColumn>
      <ResultColumn>
        <SpotText level="secondary">
          {props.patient.clientDto?.clientId}
        </SpotText>
      </ResultColumn>
      {props.asSearch && props.runDate && (
        <ResultColumn>
          <SpotText level="secondary">{formatDate(props.runDate)}</SpotText>
        </ResultColumn>
      )}
    </PatientSearchResultRoot>
  );
}
