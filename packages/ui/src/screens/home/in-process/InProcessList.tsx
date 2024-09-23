import { SpotText } from "@viewpoint/spot-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  useGetRunningLabRequestsQuery,
  useGetWorkRequestStatusesQuery,
} from "../../../api/LabRequestsApi";
import { InProcessCard, InProcessCardProps } from "./InProcessCard";
import {
  HomeScreenButton,
  HomeScreenButtonContainer,
  HomeScreenColumn,
  HomeScreenLabelContainer,
  HomeScreenScrollContent,
} from "../HomeScreenComponents";
import { useGetInstrumentStatusesQuery } from "../../../api/InstrumentApi";
import { TestId as ActionBarTestId } from "../pending-list/PendingListActionBar";
import InProcessPlaceholder from "../../../assets/home/in-process-placeholder.svg";

const PlaceholderImage = styled.img`
  width: 50%;
  margin: auto;
`;

export interface InProcessListProps {
  includeAnalyzeSample?: boolean;
}

export function InProcessList(props: InProcessListProps) {
  const nav = useNavigate();
  const { t } = useTranslation();
  const scrollContentRef = useRef<HTMLDivElement | null>(null);

  const { data: labRequests } = useGetRunningLabRequestsQuery();
  const { data: instrumentStatuses } = useGetInstrumentStatusesQuery();

  return (
    <HomeScreenColumn>
      <HomeScreenLabelContainer>
        <SpotText level="h3">
          {t("home.labels.inProcess", { count: labRequests?.length ?? 0 })}
        </SpotText>
      </HomeScreenLabelContainer>
      {props.includeAnalyzeSample && (
        <HomeScreenButtonContainer>
          <HomeScreenButton
            data-testid={ActionBarTestId.AnalyzeSampleButton}
            leftIcon="plus"
            onClick={() => nav("/analyzeSample")}
          >
            {t("home.buttons.analyzeSample")}
          </HomeScreenButton>
        </HomeScreenButtonContainer>
      )}

      <HomeScreenScrollContent
        ref={scrollContentRef}
        empty={(labRequests?.length ?? 0) === 0}
      >
        {(labRequests?.length ?? 0) === 0 && (
          <PlaceholderImage src={InProcessPlaceholder} />
        )}
        {instrumentStatuses != null &&
          labRequests?.map((lr) => (
            <InProcessCardWithWorkRequestStatus
              key={lr.id}
              instrumentStatuses={instrumentStatuses}
              labRequest={lr}
              intersectionRootRef={scrollContentRef}
            />
          ))}
      </HomeScreenScrollContent>
    </HomeScreenColumn>
  );
}

function InProcessCardWithWorkRequestStatus(
  props: Omit<InProcessCardProps, "workRequestStatuses">
) {
  const { data: workRequestStatuses } = useGetWorkRequestStatusesQuery(
    props.labRequest.id
  );

  return <InProcessCard {...props} workRequestStatuses={workRequestStatuses} />;
}
