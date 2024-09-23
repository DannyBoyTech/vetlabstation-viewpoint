import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import {
  PendingPimsRequestMatchDto,
  PimsRequestDto,
  PimsRequestTypeEnum,
} from "@viewpoint/api";
import {
  pimsApi,
  useGetCensusRequestsQuery,
  useGetPendingRequestsQuery,
} from "../../../api/PimsApi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PendingListCard } from "./PendingListCard";
import { ConfirmModal } from "../../../components/confirm-modal/ConfirmModal";
import { getPatientName } from "../../../utils/patient-utils";
import { Button, List, Popover, SpotText } from "@viewpoint/spot-react";
import { PendingListActionBar } from "./PendingListActionBar";
import {
  useSelectedPimsRequestType,
  useUpdateSelectedPimsRequestType,
} from "../../../context/AppStateContext";
import { Theme } from "../../../utils/StyleConstants";
import {
  HomeScreenColumn,
  HomeScreenLabelContainer,
  HomeScreenScrollContent,
} from "../HomeScreenComponents";
import { PatientMatchModal } from "./PatientMatchModal";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import classNames from "classnames";

const CancelConfirmBodyContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledPopover = styled(Popover)`
  .spot-list-group__item-label {
    white-space: nowrap;
  }
`;

const StyledLabelContainer = styled(HomeScreenLabelContainer)`
  gap: 4px;
`;

interface PendingListProps {
  enabledListItems: PimsRequestTypeEnum[];
}

// Decorate PIMS requests with a field that contains the entire patient name so that
// the full name can be searched instead of only individual fields
const QUERY_SELECTOR = {
  selectFromResult: (res: { data?: PimsRequestDto[] }) => ({
    ...res,
    data: res.data?.map((item) => ({
      ...item,
      fullPatientName: `${item.patientName} ${item.clientLastName}`,
    })),
  }),
};

export function PendingList(props: PendingListProps) {
  const [pimsRequestToDelete, setPimsRequestToDelete] =
    useState<PimsRequestDto>();
  const [editing, setEditing] = useState(false);
  const [patientMatchResponse, setPatientMatchResponse] =
    useState<PendingPimsRequestMatchDto>();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const { data: pendingRequests } = useGetPendingRequestsQuery(
    undefined,
    QUERY_SELECTOR
  );
  const { data: censusRequests } = useGetCensusRequestsQuery(
    undefined,
    QUERY_SELECTOR
  );
  const [deleteRequest] = pimsApi.useDeletePimsRequestMutation();
  const [resolveMatches, resolveMatchesStatus] =
    pimsApi.useResolveMatchesForPimsRequestMutation();
  const [matchRecords] = pimsApi.useMatchPimsRequestRecordsMutation();
  const [createRecords] = pimsApi.useCreateNewPatientForPimsRequestMutation();

  const nav = useNavigate();
  const { t } = useTranslation();

  const selectedPimsRequestType = useSelectedPimsRequestType();
  const setSelectedPimsRequestType = useUpdateSelectedPimsRequestType();

  useEffect(() => {
    if (props.enabledListItems.length === 1) {
      setSelectedPimsRequestType(props.enabledListItems[0]);
    }
  }, [props.enabledListItems, setSelectedPimsRequestType]);

  const requestsToUse =
    selectedPimsRequestType === PimsRequestTypeEnum.PENDING
      ? pendingRequests
      : censusRequests;

  const filteredRequests = useMemo(
    () =>
      requestsToUse?.filter((pr) =>
        pr.fullPatientName.toLowerCase().includes(searchFilter.toLowerCase())
      ),
    [requestsToUse, searchFilter]
  );

  const handleItemSelected = async (pimsRequest: PimsRequestDto) => {
    const matches = await resolveMatches(pimsRequest.id).unwrap();
    if (matches.pimsRequestDto != null && matches.patientDto != null) {
      continueToBuildLabRequest(matches);
    } else {
      setPatientMatchResponse(matches);
    }
  };

  const continueToBuildLabRequest = (match: PendingPimsRequestMatchDto) => {
    if (match.patientDto == null) {
      throw new Error("Matched patient required");
    }
    const queryParams = buildLabRequestQueryParams({
      type: selectedPimsRequestType,
      pimsRequestUuid: match.pimsRequestDto.pimsRequestUUID,
      patientId: match.patientDto.id,
      existingLabRequestId: match.existingLabRequest?.id,
      doctorId: match.doctorDto?.id,
      weight: match.weight,
    });
    nav(`/labRequest/build?${queryParams.toString()}`);
  };

  return (
    <HomeScreenColumn>
      {resolveMatchesStatus.isLoading && <SpinnerOverlay />}
      <StyledLabelContainer>
        <SpotText level="h3">
          {t(
            `home.labels.${
              selectedPimsRequestType === PimsRequestTypeEnum.PENDING
                ? "pending"
                : "census"
            }`,
            { count: requestsToUse?.length ?? 0 }
          )}
        </SpotText>

        {editing ? (
          <Button
            iconOnly
            leftIcon={"checkmark"}
            buttonSize={"large"}
            buttonType="link"
            onClick={() => setEditing(false)}
          />
        ) : (
          <>
            {props.enabledListItems.length === 2 && (
              <MenuPopover
                pendingCount={pendingRequests?.length ?? 0}
                censusCount={censusRequests?.length ?? 0}
                selectedPimsRequestType={selectedPimsRequestType}
                onPimsRequestTypeChanged={(type) =>
                  setSelectedPimsRequestType(type)
                }
                onClickEdit={() => setEditing(!editing)}
              />
            )}

            {props.enabledListItems.length === 1 && (
              <Button
                iconOnly
                buttonSize="large"
                leftIcon={"edit"}
                buttonType="link"
                onClick={() => setEditing(true)}
              />
            )}
          </>
        )}
      </StyledLabelContainer>

      <PendingListActionBar
        onSearchInputChanged={(s) => setSearchFilter(s)}
        onAnalyzeSample={() => nav("/analyzeSample")}
      />

      <HomeScreenScrollContent empty={(filteredRequests?.length ?? 0) === 0}>
        {filteredRequests?.map((pr) => (
          <PendingListCard
            key={pr.pimsRequestUUID}
            editable={editing}
            request={pr}
            onSelect={() => handleItemSelected(pr)}
            onDelete={() => {
              setPimsRequestToDelete(pr);
            }}
          />
        ))}
      </HomeScreenScrollContent>

      {pimsRequestToDelete != null && (
        <DeleteRequestModal
          onClose={() => setPimsRequestToDelete(undefined)}
          onConfirm={() => {
            if (pimsRequestToDelete) {
              deleteRequest(pimsRequestToDelete.id).then(() =>
                setPimsRequestToDelete(undefined)
              );
            }
          }}
          pimsRequest={pimsRequestToDelete}
        />
      )}

      {patientMatchResponse != null && (
        <PatientMatchModal
          open={true}
          matchResponse={patientMatchResponse}
          onMatch={async (selectedMatch) => {
            if (patientMatchResponse != null) {
              const newMatchResponse = await matchRecords({
                patientId: selectedMatch.patientDto.id,
                clientId: selectedMatch.patientDto.clientDto.id,
                pimsRequestId: patientMatchResponse.pimsRequestDto.id,
              }).unwrap();
              continueToBuildLabRequest(newMatchResponse);
            }
          }}
          onCreateNew={async () => {
            if (patientMatchResponse != null) {
              const newMatchResponse = await createRecords(
                patientMatchResponse.pimsRequestDto.id
              ).unwrap();
              continueToBuildLabRequest(newMatchResponse);
            }
          }}
          onClose={() => {
            setPatientMatchResponse(undefined);
          }}
        />
      )}
    </HomeScreenColumn>
  );
}

const Separator = styled.div`
  margin: 10px;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

const StyledListItem = styled(List.Item)`
  &.disabled {
    pointer-events: none;

    .spot-list-group__item-label {
      color: ${(p) => p.theme.colors?.text?.disabled};
    }
  }
`;

interface MenuPopoverProps {
  onPimsRequestTypeChanged: (type: PimsRequestTypeEnum) => void;
  selectedPimsRequestType: PimsRequestTypeEnum;
  onClickEdit: () => void;
  pendingCount: number;
  censusCount: number;
}

function MenuPopover(props: MenuPopoverProps) {
  const [popoverShown, setPopoverShown] = useState(false);
  const { t } = useTranslation();

  return (
    <StyledPopover
      open={popoverShown}
      onClickAway={() => setPopoverShown(false)}
      target={
        <Button
          iconOnly
          onClick={() => setPopoverShown(!popoverShown)}
          buttonSize="large"
          leftIcon="more"
          buttonType="link"
        />
      }
    >
      <List>
        <StyledListItem
          active={props.selectedPimsRequestType === PimsRequestTypeEnum.PENDING}
          onClick={() => {
            setPopoverShown(false);
            props.onPimsRequestTypeChanged(PimsRequestTypeEnum.PENDING);
          }}
        >
          {t("home.pendingList.viewPending", { count: props.pendingCount })}
        </StyledListItem>
        <Separator />
        <StyledListItem
          active={props.selectedPimsRequestType === PimsRequestTypeEnum.CENSUS}
          onClick={() => {
            setPopoverShown(false);
            props.onPimsRequestTypeChanged(PimsRequestTypeEnum.CENSUS);
          }}
        >
          {t("home.pendingList.viewCensus", { count: props.censusCount })}
        </StyledListItem>
        <Separator />
        <StyledListItem
          className={classNames({
            disabled:
              props.selectedPimsRequestType === PimsRequestTypeEnum.CENSUS,
          })}
          onClick={() => {
            setPopoverShown(false);
            props.onClickEdit();
          }}
        >
          {t("home.pendingList.delete")}
        </StyledListItem>
      </List>
    </StyledPopover>
  );
}

interface DeleteRequestModalProps {
  onClose: () => void;
  onConfirm: () => void;
  pimsRequest: PimsRequestDto;
}

function DeleteRequestModal(props: DeleteRequestModalProps) {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      open={true}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      headerContent={t("pendingList.cancelConfirm.header", {
        patientName: props.pimsRequest.patientName,
      })}
      bodyContent={
        <CancelConfirmBodyContainer>
          {t("pendingList.cancelConfirm.body", {
            patientName: getPatientName(
              props.pimsRequest.patientName,
              props.pimsRequest.clientLastName
            ),
          })}
        </CancelConfirmBodyContainer>
      }
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.delete")}
    />
  );
}

const buildLabRequestQueryParams = (args: {
  type: PimsRequestTypeEnum;
  pimsRequestUuid: string;
  patientId: number;
  existingLabRequestId?: number;
  doctorId?: number;
  weight?: string;
}) => {
  const queryParams = new URLSearchParams();
  queryParams.set(
    args.type === PimsRequestTypeEnum.PENDING
      ? "pimsRequestId"
      : "censusPimsRequestId",
    args.pimsRequestUuid
  );
  queryParams.set("patientId", `${args.patientId}`);
  if (args.existingLabRequestId != null) {
    queryParams.set("originalLabRequestId", `${args.existingLabRequestId}`);
  }
  if (args.doctorId != null) {
    queryParams.set("doctorId", `${args.doctorId}`);
  }
  if (args.weight != null) {
    queryParams.set("weight", args.weight);
  }
  return queryParams;
};
