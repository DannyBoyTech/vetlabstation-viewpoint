import { ClientDto } from "@viewpoint/api";
import { Button, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Theme } from "../../utils/StyleConstants";
import { MaskedTextEntry, TextEntry } from "./Inputs";
import { useEffect, useRef, useState } from "react";
import { SpotPopover } from "../popover/Popover";
import { RequiredInput } from "../input/RequiredInput";
import { useDebounce } from "../../utils/hooks/hooks";
import { patientApi } from "../../api/PatientApi";
import { useFormatPersonalNameReversed } from "../../utils/hooks/LocalizationHooks";

export const TestId = {
  ClientId: "client-id-input",
  LastName: "client-last-name-input",
  FirstName: "client-first-name-input",
  MatchContainer: "client-match-container",
} as const;

const ClientMatchContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  max-height: 300px;
  overflow: hidden;
`;

const MatchHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

const AddClientButton = styled(Button)`
  margin: 10px 10px 10px auto;
`;

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Match = styled.div`
  margin: 20px;
`;

interface ClientMatchesProps {
  clients?: ClientDto[];
  onSelect?: (client: ClientDto) => void;
  onAddNew?: () => void;
}

function ClientMatches(props: ClientMatchesProps) {
  const { t } = useTranslation();
  const { clients, onSelect, onAddNew } = props;

  const formatClient = useFormatPersonalNameReversed();

  return (
    <ClientMatchContainer data-testid={TestId.MatchContainer}>
      <MatchHeader>
        <SpotText level="h5">{t("searchPatient.existingClients")}</SpotText>
        <AddClientButton buttonType="secondary" onClick={() => onAddNew?.()}>
          {t("searchPatient.addNewClient")}
        </AddClientButton>
      </MatchHeader>
      <MatchList>
        {clients?.map((client) => (
          <Match key={client.id} onClick={() => onSelect?.(client)}>
            <SpotText level="paragraph">
              {formatClient(client)} ({client.clientId})
            </SpotText>
          </Match>
        ))}
      </MatchList>
    </ClientMatchContainer>
  );
}

export interface ClientDetailsProps {
  onClientChanged: (client: Partial<ClientDto>) => void;
  client?: Partial<ClientDto>;
  alreadyConfirmed?: boolean;
}

export function ClientDetails(props: ClientDetailsProps) {
  const [addClient, setAddClient] = useState(false);
  const { client, onClientChanged, alreadyConfirmed } = props;
  const clientIdRef = useRef<HTMLInputElement>(null);

  const debouncedClientId = useDebounce(client?.clientId, 300);

  const [matchWindowDismissed, setMatchWindowDismissed] = useState(false);

  const skipQuery =
    alreadyConfirmed ||
    debouncedClientId == null ||
    debouncedClientId.length < 1;

  const { currentData: matchingClients, isFetching } =
    patientApi.useGetClientsQuery(
      {
        clientIdentifier: debouncedClientId,
        clientLastName: client?.lastName,
        clientFirstName: client?.firstName,
      },
      {
        skip: skipQuery,
        selectFromResult: (res) =>
          skipQuery ? { ...res, currentData: undefined } : res,
      }
    );

  const { t } = useTranslation();

  // Whether a valid Client has been defined -- either by selecting an existing
  // one, or entering the required fields to create a new one
  const validClientEntered =
    // Existing client selected from the dropdown
    client?.id != null ||
    // User has entered a client ID that doesn't match any existing clients
    (debouncedClientId &&
      debouncedClientId.length > 0 &&
      !isFetching &&
      (matchingClients ?? []).length === 0) ||
    // There are matches but user has chosen to add a new client
    addClient;

  // Show match drop down if
  //  - It hasn't been dismissed (by clicking away from it)
  //  - Client hasn't already been confirmed (by choosing one, or choosing to "add new")
  //  - User has entered something in the client ID field
  //  - There are >0 matches found
  const showMatchingClients =
    !alreadyConfirmed &&
    !matchWindowDismissed &&
    !validClientEntered &&
    (debouncedClientId ?? "").length > 0 &&
    (client?.clientId ?? "").length > 0 &&
    (matchingClients ?? []).length > 0;

  return (
    <>
      <TextEntry
        label={t("patientEntry.labels.client.lastName")}
        inputProps={{ type: "search", "data-testid": TestId.LastName }}
        value={client?.lastName}
        maxLength={255}
        onChange={(lastName) => {
          onClientChanged({
            ...client,
            lastName,
            // Reset ID when user modifies first/last name in order to create a new client
            id: undefined,
          });
        }}
      />
      <TextEntry
        label={t("patientEntry.labels.client.firstName")}
        inputProps={{ type: "search", "data-testid": TestId.FirstName }}
        value={client?.firstName}
        maxLength={255}
        onChange={(firstName) => {
          onClientChanged({
            ...client,
            firstName,
            // Reset ID when user modifies first/last name in order to create a new client
            id: undefined,
          });
        }}
      />
      <RequiredInput
        error={client?.clientId?.length === 0}
        errorText={t("validation.genericInput")}
      >
        <MaskedTextEntry
          label={t("patientEntry.labels.client.clientId")}
          required
          value={client?.clientId}
          maxLength={255}
          onChange={(newClientId) => {
            if (client?.clientId !== newClientId) {
              // Reset user's add client selection if they change the client ID
              setAddClient(false);
              onClientChanged({
                ...client,
                clientId: newClientId,
                // Reset ID when user modifies Client ID in order to create a new client
                id: undefined,
              });
            }
          }}
          inputProps={{
            type: "search",
            mask: /^[a-zA-Z0-9, .'-]+$/,
            inputRef: clientIdRef,
            onFocus: () => setMatchWindowDismissed(false),
            "data-testid": TestId.ClientId,
          }}
        />
      </RequiredInput>

      {showMatchingClients && (
        <SpotPopover
          anchor={clientIdRef.current}
          onClickAway={() => setMatchWindowDismissed(true)}
          popFrom="bottom"
        >
          <ClientMatches
            clients={matchingClients}
            onSelect={(client) => {
              onClientChanged({
                ...client,
              });
            }}
            onAddNew={() => {
              setAddClient(true);
            }}
          />
        </SpotPopover>
      )}
    </>
  );
}
