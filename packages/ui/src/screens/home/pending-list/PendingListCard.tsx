import { Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { PimsRequestDto, PimsRequestTypeEnum } from "@viewpoint/api";
import {
  LocalizablePatient,
  LocalizedPatientSignalment,
} from "../../../components/localized-signalment/LocalizedPatientSignalment";
import { InlineText } from "../../../components/typography/InlineText";
import { Theme } from "../../../utils/StyleConstants";
import { useFormatMediumDateTime12h } from "../../../utils/hooks/datetime";
import { HomeScreenCard } from "../HomeScreenComponents";
import { useTranslation } from "react-i18next";

import { useFormatPersonalName } from "../../../utils/hooks/LocalizationHooks";

const Wrapper = styled(HomeScreenCard)<{ editable?: boolean }>`
  display: flex;
  align-items: center;
  padding: 15px;

  ${(p: { theme: Theme; editable?: boolean }) =>
    p.editable
      ? `
          outline: ${p.theme.borders?.controlFocus};
          outline-width: 2px;
          outline-radius: 5px;
          `
      : ""}
`;

const PendingItem = styled.div`
  & {
    line-height: normal;
    width: 100%;
    display: grid;
    row-gap: 5px;
    overflow: hidden;
  }
`;

const DeleteButton = styled(Button)`
  margin-left: 0px;
  width: 0px;

  transition: all 300ms;
  opacity: 0;
  padding: 0;

  &.visible {
    opacity: 1;
    width: 50px;
    justify-content: center;
  }
`;

const EllipsizedText = styled(InlineText)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export interface PendingListItemProps {
  request: PimsRequestDto;
  onSelect?: (pr: PimsRequestDto) => void;
  onDelete?: (pr: PimsRequestDto) => void;
  editable?: boolean;
}

export const TestId = {
  deleteIcon: (pimsRequestId: number) => `delete-pims-request-${pimsRequestId}`,
};

function toLocalizablePatient(request: PimsRequestDto): LocalizablePatient {
  return {
    patientName: request.patientName,
    pimsPatientId: request.pimsPatientId,
    clientDto: {
      clientId: request.pimsClientId,
      lastName: request.clientLastName,
      firstName: request.clientFirstName,
    },
    speciesDto: request.patientSpecies,
    breedDto: request.patientBreed,
    genderDto: request.patientGender,
  };
}

const RequestDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  overflow: hidden;
  white-space: nowrap;
`;

export const PendingListCard = (props: PendingListItemProps) => {
  const formatDateTime = useFormatMediumDateTime12h();
  const formatName = useFormatPersonalName();
  const { t } = useTranslation();

  return (
    <Wrapper
      onClick={() => props.onSelect?.(props.request)}
      editable={props.editable}
    >
      <PendingItem data-testid="pending-list-item">
        <LocalizedPatientSignalment
          patientIdOnNewLine
          boldName
          size={"xs"}
          patient={toLocalizablePatient(props.request)}
        />

        <RequestDetailsContainer>
          {props.request.pimsRequestType === PimsRequestTypeEnum.PENDING && (
            <EllipsizedText level="secondary">
              {props.request.requisitionId != null &&
                props.request.requisitionId}
              {props.request.pimsServiceRequests != null &&
                props.request.pimsServiceRequests.length > 0 &&
                ` | ${props.request.pimsServiceRequests
                  .map((service) => service.profileName)
                  .join(", ")}`}
            </EllipsizedText>
          )}

          {props.request.pimsRequestType === PimsRequestTypeEnum.CENSUS &&
            props.request.reasonForVisit != null && (
              <EllipsizedText level="secondary">
                {props.request.reasonForVisit}
              </EllipsizedText>
            )}

          {(props.request.doctorLastName || props.request.doctorLastName) && (
            <EllipsizedText level="secondary">
              {formatName({
                firstName: props.request.doctorFirstName,
                lastName: props.request.doctorLastName,
              })}
            </EllipsizedText>
          )}
        </RequestDetailsContainer>
        {props.request.dateRequestedUtc && (
          <EllipsizedText level="tertiary">
            {formatDateTime(props.request.dateRequestedUtc)}
          </EllipsizedText>
        )}
      </PendingItem>
      <DeleteButton
        disabled={!props.editable}
        buttonType="link"
        iconOnly
        leftIcon="delete"
        className={props.editable ? "visible" : ""}
        onClick={(ev) => {
          if (props.editable) {
            props.onDelete?.(props.request);
            ev.stopPropagation();
          }
        }}
        data-testid={TestId.deleteIcon(props.request.id)}
      />
    </Wrapper>
  );
};
