import { RecentResultDto } from "@viewpoint/api";
import { HomeScreenCard } from "../HomeScreenComponents";
import {
  LocalizablePatient,
  LocalizedPatientSignalment,
} from "../../../components/localized-signalment/LocalizedPatientSignalment";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { SpotText } from "@viewpoint/spot-react";
import { useFormatMediumDateTime12h } from "../../../utils/hooks/datetime";
import { useTranslation } from "react-i18next";

import { useFormatPersonalName } from "../../../utils/hooks/LocalizationHooks";
import { SpotTokens, Theme } from "../../../utils/StyleConstants";
import dayjs from "dayjs";

export const TestId = {
  ResultCard: "recent-result-card",
};

const CardRoot = styled(HomeScreenCard)`
  transition: all 500ms ease-in-out;

  max-height: 180px;

  line-height: normal;

  &.initial {
    max-height: 0;
    opacity: 0;
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.feedback?.success}; // TODO - confirm color choice

    .spot-patient-display,
    .info-text {
      display: none;
    }
  }

  &.notify {
    background-color: ${SpotTokens.color.green[
      "300"
    ]}; // TODO - confirm color choice
    opacity: 1;
    max-height: 80px;

    .spot-patient-display__avatar--na {
      fill: ${(p: { theme: Theme }) =>
        p.theme.colors?.feedback?.success}; // TODO - confirm color choice
      border: 2px solid
        ${(p: { theme: Theme }) => p.theme.colors?.feedback?.success}; // TODO - confirm color choice
    }

    .info-text {
      display: none;
    }
  }
`;

const EllipsizedText = styled(SpotText)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  overflow: hidden;
  white-space: nowrap;
`;

function getLocalizablePatient(result: RecentResultDto): LocalizablePatient {
  return {
    patientName: result.patientName,
    pimsPatientId: result.pimsPatientId,
    clientDto: {
      firstName: result.clientFirstName,
      lastName: result.clientLastName,
      clientId: result.clientId,
    },
    speciesDto: {
      speciesName: result.speciesName,
    },
  };
}

const Transitions = {
  Initial: "initial",
  Notify: "notify",
  Complete: undefined,
};

export interface RecentResultCardProps {
  result: RecentResultDto;
  onClick: () => void;
  skipAnimation: boolean;
}

export function RecentResultCard(props: RecentResultCardProps) {
  const [transitionClass, setTransitionClass] = useState<string | undefined>(
    props.skipAnimation ? Transitions.Complete : Transitions.Initial
  );

  const formatDateTime = useFormatMediumDateTime12h();
  const formatName = useFormatPersonalName();
  const { t } = useTranslation();

  const filteredTestTypes = useMemo(
    () => Array.from(new Set(props.result.testTypes)),
    [props.result.testTypes]
  );

  useEffect(() => {
    if (!props.skipAnimation) {
      setTimeout(() => {
        setTransitionClass(Transitions.Notify);
        setTimeout(() => {
          setTransitionClass(Transitions.Complete);
        }, 2000);
      }, 100);
    }
  }, []);

  return (
    <CardRoot
      onClick={props.onClick}
      data-testid={TestId.ResultCard}
      className={transitionClass}
    >
      <LocalizedPatientSignalment
        patientIdOnNewLine
        boldName
        size={"xs"}
        patient={getLocalizablePatient(props.result)}
        iconName={
          transitionClass !== Transitions.Complete ? "checkmark" : undefined
        }
      />
      <ResultDetailsContainer>
        <SpotText level="secondary" className="info-text">
          {filteredTestTypes.map((key) => t(key as any)).join(", ")}
        </SpotText>

        {(props.result.doctorLastName || props.result.doctorFirstName) && (
          <SpotText level="secondary" className="info-text">
            {formatName({
              firstName: props.result.doctorFirstName,
              lastName: props.result.doctorLastName,
            })}
          </SpotText>
        )}
      </ResultDetailsContainer>

      {props.result.mostRecentRunDate != null && (
        <EllipsizedText level="tertiary" className="info-text">
          {formatDateTime(dayjs.unix(props.result.mostRecentRunDate))}
        </EllipsizedText>
      )}
    </CardRoot>
  );
}
