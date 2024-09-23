import { PropsWithChildren, useMemo, useState } from "react";
import { useInstrumentNameForId } from "../../utils/hooks/hooks";
import { useTranslation } from "react-i18next";
import {
  AvailableSampleTypes,
  DefaultRunConfigs,
  ExecuteInstrumentRunDto,
  InstrumentDto,
  InstrumentRunConfigurationDto,
  InstrumentStatus,
  InstrumentType,
  RefClassDto,
  SampleTypeDto,
  SampleTypesMapping,
  SpeciesDto,
} from "@viewpoint/api";
import { SelectableInstrument } from "./SelectableInstrument";
import { RunConfigurationPanel } from "../../components/run-configurations/RunConfigurations";
import { SnapConfig } from "../../components/run-configurations/SnapConfig";
import { ReferenceData } from "./BuildLabRequestContext";
import { isBloodType } from "../../components/run-configurations/instruments/theia/blood/blood-common";
import styled from "styled-components";
import { Link, Tabs } from "@viewpoint/spot-react";

const ContentContainer = styled.div`
  padding: 4px;
`;

const AddRunContainer = styled.div`
  display: flex;
  padding: 0 4px;
`;

const AddRunLink = styled(Link)`
  margin: 8px 0;
`;

const StyledTabs = styled(Tabs)`
  padding-top: 8px;
`;

interface SelectableInstrumentWithRunConfigProps {
  instrument: InstrumentDto;
  instrumentStatus: InstrumentStatus;
  executeRunRequests: ExecuteInstrumentRunDto[];
  onAdd: () => void;
  onRemove: (runQueueId?: number) => void;
  onSnapsChanged: (snapDeviceIds: number[]) => void;
  onRunConfigUpdated: (
    runQueueId: number,
    configurations?: InstrumentRunConfigurationDto[]
  ) => void;

  species: SpeciesDto;
  referenceData: ReferenceData;
  defaultRunConfigs: DefaultRunConfigs;
  lifestage?: RefClassDto;
}

export const TestId = {
  Tab: (index: number) => `run-config-tab-${index}`,
  AddRunLink: "add-run-link",
};

export function SelectableInstrumentWithRunConfig(
  props: SelectableInstrumentWithRunConfigProps
) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const matchingRuns =
    props.executeRunRequests?.filter(
      (er) => er.instrumentId === props.instrument.id
    ) ?? [];
  const selectedRun = matchingRuns[selectedTabIndex];

  const getInstrumentName = useInstrumentNameForId();
  const { t } = useTranslation();
  const selectedSampleType = getSelectedSampleType(matchingRuns);

  const currentSelectedSnapIds = useMemo(
    () =>
      (props.executeRunRequests ?? [])
        .filter((er) => er.snapDeviceId != null)
        .map((er) => er.snapDeviceId!),
    [props.executeRunRequests]
  );

  const hasAdditionalContent =
    props.instrument.supportedRunConfigurations.length > 0 ||
    props.instrument.instrumentType === InstrumentType.SNAP ||
    props.instrument.maxQueueableRuns > 1;

  return (
    <SelectableInstrument
      name={getInstrumentName(props.instrument.id)}
      type={props.instrument.instrumentType}
      status={props.instrumentStatus}
      onAdd={props.onAdd}
      onRemove={() => {
        // Reset the selected index, since this one is going to be removed
        setSelectedTabIndex(Math.max(selectedTabIndex - 1, 0));
        props.onRemove(selectedRun.runQueueId);
      }}
      manualInstrument={!!props.instrument.manualEntry}
      serialNumber={props.instrument.instrumentSerialNumber}
      selected={matchingRuns.length > 0}
      selectedSampleType={selectedSampleType}
    >
      <RunRequestWrapper
        instrumentType={props.instrument.instrumentType}
        matchingRuns={matchingRuns}
        selectedTabIndex={selectedTabIndex}
        onTabSelected={(index) => setSelectedTabIndex(index)}
      >
        {hasAdditionalContent && (
          <ContentContainer>
            {props.instrument.supportedRunConfigurations.length > 0 && (
              <RunConfigurationPanel
                instrument={props.instrument}
                speciesType={props.species.speciesName}
                sampleTypes={getSampleTypesFor(
                  props.instrument.instrumentType,
                  props.referenceData.availableSampleTypes ?? {},
                  props.lifestage
                )}
                runRequest={selectedRun}
                dilutionDisplayConfig={
                  props.referenceData.dilutionConfigs?.[
                    props.instrument.instrumentType
                  ]
                }
                defaultRunConfiguration={
                  props.defaultRunConfigs?.[
                    props.instrument.instrumentSerialNumber
                  ]
                }
                onConfigurationChanged={props.onRunConfigUpdated}
              />
            )}
            {props.instrument.instrumentType === InstrumentType.SNAP && (
              <>
                <SnapConfig
                  onSelectionsChanged={props.onSnapsChanged}
                  availableSnaps={props.referenceData.availableSnaps ?? []}
                  selectedSnapDeviceIds={currentSelectedSnapIds}
                />
              </>
            )}

            {props.instrument.maxQueueableRuns > 1 &&
              props.instrument.instrumentType !== InstrumentType.SNAP &&
              matchingRuns.length < props.instrument.maxQueueableRuns && (
                <>
                  {/*<BottomDivider />*/}
                  <AddRunContainer>
                    <AddRunLink
                      data-testid={TestId.AddRunLink}
                      size="small"
                      onClick={() => {
                        // Increment the selected index to have the added run be the selected one
                        // if one is already present
                        if (matchingRuns.length > 0) {
                          setSelectedTabIndex(matchingRuns.length);
                        }
                        props.onAdd();
                      }}
                    >
                      {t("orderFulfillment.fulfillment.addRun", {
                        count: matchingRuns.length,
                      })}
                    </AddRunLink>
                  </AddRunContainer>
                </>
              )}
          </ContentContainer>
        )}
      </RunRequestWrapper>
    </SelectableInstrument>
  );
}

interface RunRequestWrapperProps extends PropsWithChildren {
  instrumentType: InstrumentType;
  matchingRuns: ExecuteInstrumentRunDto[];
  selectedTabIndex?: number;
  onTabSelected: (runQueueId: number) => void;
}

function RunRequestWrapper(props: RunRequestWrapperProps) {
  const { t } = useTranslation();
  if (
    props.instrumentType === InstrumentType.SNAP ||
    props.matchingRuns.length <= 1
  ) {
    return <>{props.children}</>;
  }
  return (
    <StyledTabs scrollableContent>
      <Tabs.TabBar>
        {props.matchingRuns.map((runRequest, index) => (
          <Tabs.Tab
            key={runRequest.instrumentId + "_" + index}
            active={props.selectedTabIndex === index}
            onClick={() => props.onTabSelected(index)}
            data-testid={TestId.Tab(runRequest.runQueueId)}
          >
            {t("orderFulfillment.fulfillment.runTab", {
              index: runRequest.runQueueId,
            })}
          </Tabs.Tab>
        ))}
      </Tabs.TabBar>
      <Tabs.Content>{props.children}</Tabs.Content>
    </StyledTabs>
  );
}

const getSelectedSampleType = (runs: ExecuteInstrumentRunDto[]) => {
  let selectedSampleType = 0;
  const instrumentRunConfigurations = runs?.[0]?.instrumentRunConfigurations;

  instrumentRunConfigurations &&
    instrumentRunConfigurations.forEach((configuration) => {
      if (isBloodType(configuration)) {
        selectedSampleType = SampleTypesMapping.BLOOD;
      }
      if (configuration.sampleTypeId === SampleTypesMapping.FNA) {
        selectedSampleType = SampleTypesMapping.FNA;
      }
      if (configuration.sampleTypeId === SampleTypesMapping.EAR_SWAB) {
        selectedSampleType = SampleTypesMapping.EAR_SWAB;
      }
    });
  return selectedSampleType;
};

const getSampleTypesFor = (
  instumentType: InstrumentType,
  availableTypes: AvailableSampleTypes,
  refClass?: RefClassDto
): SampleTypeDto[] | undefined => {
  return availableTypes[instumentType]?.[`${refClass?.id ?? "unknown"}`];
};
