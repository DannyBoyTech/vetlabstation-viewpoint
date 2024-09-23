import {
  FnaRunConfigurationDto,
  TheiaSampleLocation,
  TheiaSite,
  TheiaSubsite,
} from "@viewpoint/api";
import { Radio, RadioGroup, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { getSubsitesForSite } from "./fna-utils";

export const TestId = {
  SampleLocationRadio: (location: TheiaSampleLocation) =>
    `theia-fna-sample-location-${location}`,
  SampleSiteRadio: (site: TheiaSite) => `theia-fna-sample-site-${site}`,
  SampleSubSiteRadio: (subsite: TheiaSubsite) =>
    `theia-fna-sample-subsite-${subsite}`,
};

const Root = styled.div`
  display: flex;
  gap: 8px;
  overflow: hidden;
  padding: 0 8px;
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export interface SampleLocationProps {
  onChange: (updatedConfig: Partial<FnaRunConfigurationDto>) => void;
  currentConfig: Partial<FnaRunConfigurationDto>;
}

export function SampleLocation(props: SampleLocationProps) {
  const { t } = useTranslation();
  return (
    <Root>
      <Section>
        <SpotText level="paragraph">
          {t("orderFulfillment.runConfig.inVueDx.fna.sampleLocation.title")}
        </SpotText>
        <RadioGroup>
          {Object.values(TheiaSampleLocation).map((location) => (
            <Radio
              data-testid={TestId.SampleLocationRadio(location)}
              key={location}
              label={t(
                `orderFulfillment.runConfig.inVueDx.fna.sampleLocation.${location}`
              )}
              checked={props.currentConfig.theiaSampleLocation === location}
              onChange={() =>
                props.onChange({
                  ...props.currentConfig,
                  theiaSampleLocation: location,
                })
              }
            />
          ))}
        </RadioGroup>
      </Section>

      <Section>
        <SpotText level="paragraph">
          {t("orderFulfillment.runConfig.inVueDx.fna.sampleSite.title")}
        </SpotText>
        <RadioGroup>
          {Object.values(TheiaSite)
            // Not for FNA
            .filter((s) => s !== TheiaSite.EAR)
            .map((site) => (
              <Radio
                data-testid={TestId.SampleSiteRadio(site)}
                key={site}
                label={t(
                  `orderFulfillment.runConfig.inVueDx.fna.sampleSite.${site}`
                )}
                checked={props.currentConfig.theiaSite === site}
                onChange={() =>
                  props.onChange({
                    ...props.currentConfig,
                    theiaSite: site,
                    theiaSubsite: undefined,
                  })
                }
              />
            ))}
        </RadioGroup>
      </Section>

      <Section>
        {props.currentConfig.theiaSite != null && (
          <>
            <SpotText level="paragraph">
              {t("orderFulfillment.runConfig.inVueDx.fna.subsite.title")}
            </SpotText>
            <RadioGroup>
              {getSubsitesForSite(props.currentConfig.theiaSite).map(
                (subsite) => (
                  <Radio
                    small
                    data-testid={TestId.SampleSubSiteRadio(subsite)}
                    key={subsite}
                    label={t(
                      `orderFulfillment.runConfig.inVueDx.fna.subsite.${subsite}`
                    )}
                    checked={props.currentConfig.theiaSubsite === subsite}
                    onChange={() =>
                      props.onChange({
                        ...props.currentConfig,
                        theiaSubsite: subsite,
                      })
                    }
                  />
                )
              )}
            </RadioGroup>
          </>
        )}
      </Section>
    </Root>
  );
}
