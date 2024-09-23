import { ConfirmModal } from "../../components/confirm-modal/ConfirmModal";
import { useTranslation } from "react-i18next";
import { useGetAvailableLocationsQuery } from "../../api/TimeAndDateApi";
import styled from "styled-components";
import {
  useGetSettingQuery,
  useUpdateSettingMutation,
} from "../../api/SettingsApi";
import { SettingTypeEnum } from "@viewpoint/api";
import { Radio, SpotText } from "@viewpoint/spot-react/src";
import { SupportedLanguages } from "../settings/Language";
import { Theme } from "../../utils/StyleConstants";
import { useEffect, useRef, useState } from "react";
import { usePrevious } from "../../utils/hooks/hooks";

interface SelectLanguageModalProps {
  open: boolean;
  onNext: () => void;
}

export const TestId = {
  LanguageRadio: (lng: string) => `select-language-modal-${lng}-radio`,
};

export function SelectLanguageModal(props: SelectLanguageModalProps) {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      responsive
      dismissable={false}
      open={props.open}
      onClose={props.onNext}
      onConfirm={props.onNext}
      bodyContent={<SelectLanguageBody />}
      confirmButtonContent={t("general.buttons.next")}
    />
  );
}

const Root = styled.div`
  width: 80vw;
  height: 70vh;
  display: flex;
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const RadioGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(10, 1fr);
  height: 100%;
`;

const LocationList = styled.div`
  overflow-y: auto;
  height: 100%;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightSecondary};
`;

const LocationItem = styled.div<{ selected: boolean }>`
  padding: 15px 20px;
  margin: 2px;

  :hover {
    cursor: pointer;
    ${(p: { theme: Theme; selected: boolean }) =>
      !p.selected
        ? `background-color: ${p.theme.colors?.background?.disabled}`
        : ""}
  }

  ${(p: { theme: Theme; selected: boolean }) =>
    p.selected
      ? `
            background-color: ${p.theme.colors?.interactive?.hoverPrimary};
            outline: ${p.theme.borders?.lightSecondary};
          `
      : ""}
`;

function SelectLanguageBody() {
  const [firstLoad, setFirstLoad] = useState(true);
  const { t, i18n } = useTranslation();
  const { data: locations } = useGetAvailableLocationsQuery();
  const { data: clinicLanguage } = useGetSettingQuery(
    SettingTypeEnum.CLINIC_LANGUAGE
  );
  const { data: clinicLocation } = useGetSettingQuery(
    SettingTypeEnum.CLINIC_COUNTRY
  );

  const [updateSetting] = useUpdateSettingMutation();

  const locationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const previousLocations = usePrevious(locations);

  const handleLanguageChange = async (code: string) => {
    updateSetting({
      settingType: SettingTypeEnum.CLINIC_LANGUAGE,
      settingValue: code,
    });
    await i18n.changeLanguage(code);
  };

  const handleLocationChange = (countryCode: string) => {
    updateSetting({
      settingType: SettingTypeEnum.CLINIC_COUNTRY,
      settingValue: countryCode,
    });
  };

  // Scroll the selected location into view on first load, or if the list of
  // locations changes (since the list is localized, the order of the list may
  // change when the user changes the language)
  useEffect(() => {
    if (
      clinicLocation != null &&
      (firstLoad || locations !== previousLocations)
    ) {
      locationRefs.current[clinicLocation]?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });

      setFirstLoad(false);
    }
  }, [firstLoad, locations, clinicLocation, previousLocations]);

  return (
    <Root>
      <Section>
        <SpotText level={"h3"}>{t("boot.language.selectLanguage")}</SpotText>
        <RadioGrid>
          {SupportedLanguages.map((language) => (
            <Radio
              data-testid={TestId.LanguageRadio(language.code)}
              key={language.code}
              checked={language.code === clinicLanguage}
              label={language.locale}
              onChange={() => handleLanguageChange(language.code)}
            />
          ))}
        </RadioGrid>
      </Section>

      <Section>
        <SpotText level={"h3"}>{t("boot.language.selectLocation")}</SpotText>
        <LocationList>
          {locations?.map((loc) => (
            <LocationItem
              ref={(ref) => (locationRefs.current[loc.countryCode] = ref)}
              key={loc.countryCode}
              selected={loc.countryCode === clinicLocation}
              onClick={() => handleLocationChange(loc.countryCode)}
            >
              {loc.countryName}
            </LocationItem>
          ))}
        </LocationList>
      </Section>
    </Root>
  );
}
