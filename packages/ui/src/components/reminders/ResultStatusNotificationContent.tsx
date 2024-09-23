import { PatientDto } from "@viewpoint/api";
import styled from "styled-components";
import { LocalizedPatientSignalment } from "../localized-signalment/LocalizedPatientSignalment";
import { Card } from "@viewpoint/spot-react/src";
import { PropsWithChildren } from "react";

const ResultStatusNotificationRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
`;
const Content = styled.div`
  display: flex;
  padding: 12px;
  align-items: center;
`;

interface ResultStatusNotificationProps extends PropsWithChildren {
  patient: PatientDto;
}

export const TestId = {
  ContentRoot: "hematology-result-notification-modal",
};

export function ResultStatusNotificationContent(
  props: ResultStatusNotificationProps
) {
  return (
    <ResultStatusNotificationRoot data-testid={TestId.ContentRoot}>
      <LocalizedPatientSignalment
        size="small"
        hideIcon
        patient={props.patient}
      />

      <Card variant="secondary">
        <Content>{props.children}</Content>
      </Card>
    </ResultStatusNotificationRoot>
  );
}
