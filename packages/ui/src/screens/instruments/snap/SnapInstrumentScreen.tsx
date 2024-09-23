import {
  InstrumentPageContent,
  InstrumentPageRightPanel,
  InstrumentPageRightPanelButtonContainer,
  InstrumentPageRoot,
} from "../common-components";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  SpotText,
  Tabs,
} from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import {
  SettingTypeEnum,
  SnapDeviceDto,
  SpeciesDto,
  SpeciesType,
} from "@viewpoint/api";
import React from "react";
import styled from "styled-components";
import { useGetSnapDevicesQuery } from "../../../api/SnapApi";
import SNAPDisplay from "../../../assets/instruments/display/300x300/SNAP.png";
import { useGetSpeciesQuery } from "../../../api/SpeciesApi";
import { SpotIconName } from "@viewpoint/spot-icons";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "../../../api/SettingsApi";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";

const Root = styled.div`
  display: flex;
  align-items: center;
`;

const TabContainer = styled.div`
  display: block;
`;

const ImageContainer = styled.div`
  width: 150px;
`;
const InstrumentImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;

  .spot-form__checkbox {
    margin: 10px 0 4px 0;
  }
`;

const StyledCard = styled(Card)`
  margin-top: 12px;
  max-height: 400px;
`;

export const TestId = {
  SettingsButton: "snap-settings-button",
  PrintReportButton: "snap-print-report-button",
  InstrumentPageRoot: "snap-instruments-screen",
  SnapCheckbox: (setting: SettingTypeEnum) => `snap-checkbox-${setting}`,
  Tab: (species: SpeciesType) => `snap-tab-${species}`,
  TabContent: (species: SpeciesType) => `snap-tab-content-${species}`,
};

interface SnapConfiguration {
  data: SnapDeviceDto[];
  image: SpotIconName;
  key: string;
  species: SpeciesType;
}

function getSpeciesId(
  speciesDtos: SpeciesDto[] | undefined,
  speciesType: SpeciesType
) {
  return speciesDtos?.find(
    (speciesDto) => speciesDto.speciesName === speciesType
  )?.id;
}

export function SnapInstrumentScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [selectedTab, setSelectedTab] = React.useState<SpeciesType>(
    SpeciesType.Canine
  );
  const [updateSetting, updateSettingStatus] = useUpdateSettingMutation();

  // fetch all species
  const { data: species, isLoading: speciesLoading } = useGetSpeciesQuery();

  // fetch snap devices for desired species
  const canineId = getSpeciesId(species, SpeciesType.Canine);
  const felineId = getSpeciesId(species, SpeciesType.Feline);
  const equineId = getSpeciesId(species, SpeciesType.Equine);
  const { data: canineSnaps, isLoading: canineSnapsLoading } =
    useGetSnapDevicesQuery(
      canineId === undefined
        ? skipToken
        : {
            speciesId: canineId,
            enabledOnly: false,
          }
    );
  const { data: felineSnaps, isLoading: felineSnapsLoading } =
    useGetSnapDevicesQuery(
      felineId === undefined
        ? skipToken
        : {
            speciesId: felineId,
            enabledOnly: false,
          }
    );
  const { data: equineSnaps, isLoading: equineSnapsLoading } =
    useGetSnapDevicesQuery(
      equineId === undefined
        ? skipToken
        : {
            speciesId: equineId,
            enabledOnly: false,
          }
    );
  const _canineSnaps = canineSnaps ?? [];
  const _felineSnaps = felineSnaps ?? [];
  const _equineSnaps = equineSnaps ?? [];

  const snaps = _canineSnaps.concat(_felineSnaps).concat(_equineSnaps);
  const snapsLoading =
    canineSnapsLoading || felineSnapsLoading || equineSnapsLoading;

  // fetch settings for all snap devices available, query re-executed after updating setting
  const {
    data: snapSettings,
    isLoading: snapSettingsLoading,
    isFetching: snapSettingsFetching,
  } = useGetSettingsQuery(
    snapsLoading || snaps.length === 0
      ? skipToken
      : snaps.map((device) => device.settingType)
  );

  // create array of SnapConfiguration to reflect snap configuration on UI
  const snapConfigurations: SnapConfiguration[] = [
    {
      data: _canineSnaps,
      image: "animal-canine",
      key: "Species.Canine",
      species: SpeciesType.Canine,
    },
    {
      data: _felineSnaps,
      image: "animal-feline",
      key: "Species.Feline",
      species: SpeciesType.Feline,
    },
    {
      data: _equineSnaps,
      image: "animal-equine",
      key: "Species.Equine",
      species: SpeciesType.Equine,
    },
  ];

  // loading vs updating
  const loading = speciesLoading || snapsLoading || snapSettingsLoading;
  const updating = updateSettingStatus.isLoading || snapSettingsFetching;

  return loading ? (
    <SpinnerOverlay />
  ) : (
    <InstrumentPageRoot data-testid={TestId.InstrumentPageRoot}>
      <InstrumentPageContent>
        <Root>
          <ImageContainer data-testid="instrument-image">
            <InstrumentImage src={SNAPDisplay} />
          </ImageContainer>
          <SpotText level="h3" bold>
            {t("instruments.names.SNAP")}
          </SpotText>
        </Root>

        <TabContainer>
          <Tabs>
            <Tabs.TabBar>
              {snapConfigurations.map((item) => (
                <Tabs.Tab
                  data-testid={TestId.Tab(item.species)}
                  key={item.species}
                  iconName={item.image}
                  active={selectedTab === item.species}
                  onClick={() => setSelectedTab(item.species)}
                >
                  {t(item.key as any)}
                </Tabs.Tab>
              ))}
            </Tabs.TabBar>
            {snapConfigurations.map((item) => (
              <div key={item.key}>
                {selectedTab === item.species && (
                  <Tabs.Content data-testid={TestId.TabContent(item.species)}>
                    <StyledCard variant="secondary">
                      <CardBody>
                        <CheckboxContainer>
                          {item.data.map((snapDevice) => (
                            <Checkbox
                              data-testid={TestId.SnapCheckbox(
                                snapDevice.settingType
                              )}
                              key={snapDevice.settingType}
                              disabled={updating}
                              checked={
                                snapSettings?.[snapDevice.settingType] ===
                                "true"
                              }
                              onChange={(ev) =>
                                updateSetting({
                                  settingType: snapDevice.settingType,
                                  settingValue: `${ev.target.checked}`,
                                })
                              }
                              label={t(
                                snapDevice.displayNamePropertyKey as any
                              )}
                            />
                          ))}
                        </CheckboxContainer>
                      </CardBody>
                    </StyledCard>
                  </Tabs.Content>
                )}
              </div>
            ))}
          </Tabs>
        </TabContainer>
      </InstrumentPageContent>

      <InstrumentPageRightPanel>
        <InstrumentPageRightPanelButtonContainer>
          <Button
            data-testid={TestId.SettingsButton}
            buttonType="primary"
            onClick={() => nav("settings")}
          >
            {t("instrumentScreens.general.buttons.settings")}
          </Button>
          <Button
            data-testid={TestId.PrintReportButton}
            buttonType="primary"
            onClick={() => nav("reports")}
          >
            {t("instrumentScreens.snap.buttons.printSnapReport")}
          </Button>
        </InstrumentPageRightPanelButtonContainer>
      </InstrumentPageRightPanel>
    </InstrumentPageRoot>
  );
}
