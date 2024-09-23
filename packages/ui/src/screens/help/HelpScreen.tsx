import { useTranslation } from "react-i18next";
import OpsGuideEn from "../../assets/help/art-06-0019547-00 IVLS Ops Guide.pdf";
import OpsGuideFr from "../../assets/help/art-06-0040507-00 New IVLS Ops Guide_FR.pdf";
import OpsGuideIt from "../../assets/help/art-06-0040508-00 New IVLS Ops Guide_IT.pdf";
import OpsGuideDe from "../../assets/help/art-06-0040509-00 New IVLS Ops Guide_DE.pdf";
import OpsGuideEs from "../../assets/help/art-06-0040510-00 New IVLS Ops Guide_ES.pdf";
import OpsGuideNl from "../../assets/help/art-06-0040511-00 New IVLS Ops Guide_NL.pdf";
import OpsGuidePTBR from "../../assets/help/art-06-0040512-00 New IVLS Ops Guide_PTBR.pdf";
import OpsGuideCz from "../../assets/help/art-06-0040513-00 New IVLS Ops Guide_CZ.pdf";
import OpsGuideSk from "../../assets/help/art-06-0040514-00 New IVLS Ops Guide_SK.pdf";
import OpsGuidePl from "../../assets/help/art-06-0040515-00 New IVLS Ops Guide_PL.pdf";
import OpsGuideTr from "../../assets/help/art-06-0040516-00 New IVLS Ops Guide_TR.pdf";
import OpsGuideKo from "../../assets/help/art-06-0040517-00 New IVLS Ops Guide_KO.pdf";
import OpsGuideTh from "../../assets/help/art-06-0040518-00 New IVLS Ops Guide_TH.pdf";
import OpsGuideZhCn from "../../assets/help/art-06-0040519-00 New IVLS Ops Guide_ZHCN.pdf";
import OpsGuideZhTw from "../../assets/help/art-06-0040520-00 New IVLS Ops Guide_ZHTW.pdf";
import OpsGuideJp from "../../assets/help/art-06-0040521-00 New IVLS Ops Guide_JP.pdf";

import { pdfViewerOpts } from "../../utils/url-utils";
import styled from "styled-components";
import { Card, CardBody, SpotText } from "@viewpoint/spot-react";
import { InstrumentType } from "@viewpoint/api";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { useMemo, useState } from "react";
import { InstrumentHelpModal } from "./InstrumentHelpModal";
import { useHeaderTitle } from "../../utils/hooks/hooks";

const OPS_GUIDE_DEFAULT = OpsGuideEn;
const OPS_GUIDE_BY_LANG: Record<string, string> = {
  en: OpsGuideEn,
  fr: OpsGuideFr,
  es: OpsGuideEs,
  it: OpsGuideIt,
  de: OpsGuideDe,
  ja: OpsGuideJp,
  ko: OpsGuideKo,
  zh_cn: OpsGuideZhCn,
  zh_tw: OpsGuideZhTw,
  tr: OpsGuideTr,
  cs: OpsGuideCz,
  pt: OpsGuidePTBR,
  pl: OpsGuidePl,
  nl: OpsGuideNl,
  th: OpsGuideTh,
  sk: OpsGuideSk,
} as const;

const Root = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const SideBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 330px;
  background-color: #cdedff;
  overflow-y: auto;
  gap: 16px;
  justify-items: center;

  box-sizing: border-box;
  padding: 20px;
`;

const Title = styled(SpotText)`
  grid-column: 1/-1;
`;

const StyledIframe = styled.iframe`
  background-color: #323639; /* to match the color of chromium pdf viewer toolbar */
  padding: 5px;
  flex: 1;
  border: 0;
`;

const AVAILABLE_INSTRUMENTS: InstrumentType[] = [
  InstrumentType.CatalystDx,
  InstrumentType.CatalystOne,
  InstrumentType.CoagDx,
  InstrumentType.ProCyteDx,
  InstrumentType.ProCyteOne,
  InstrumentType.SediVueDx,
  InstrumentType.SNAPPro,
  InstrumentType.UriSysDx,
  InstrumentType.VetStat,
];

export function HelpScreen() {
  const { i18n, t } = useTranslation();
  useHeaderTitle({
    label: t("header.navigation.help"),
  });
  const [selectedInstrument, setSelectedInstrument] =
    useState<InstrumentType>();

  const contentUrl = `${
    OPS_GUIDE_BY_LANG[i18n.language.toLowerCase()] ?? OPS_GUIDE_DEFAULT
  }#${pdfViewerOpts({
    toolbar: true,
    view: "FitH",
  })}`;

  const sortedTypes = useMemo(
    () =>
      AVAILABLE_INSTRUMENTS.sort((irOne, irTwo) =>
        t(`instruments.names.${irOne}`).localeCompare(
          t(`instruments.names.${irTwo}`)
        )
      ),
    [t]
  );

  return (
    <Root>
      <SideBar>
        <Title level="h3">{t("helpScreen.sideBarTitle")}</Title>
        {sortedTypes.map((instrumentType) => (
          <AnalyzerCard
            key={instrumentType}
            instrumentType={instrumentType as InstrumentType}
            onClick={() => setSelectedInstrument(instrumentType)}
          />
        ))}
      </SideBar>
      <StyledIframe src={contentUrl} />
      {selectedInstrument != null && (
        <InstrumentHelpModal
          open
          availableInstruments={sortedTypes}
          onInstrumentSelected={(instrument) =>
            setSelectedInstrument(instrument)
          }
          onClose={() => setSelectedInstrument(undefined)}
          selectedInstrument={selectedInstrument}
        />
      )}
    </Root>
  );
}

const StyledCard = styled(Card)`
  overflow: unset;

  > .spot-card--body {
    padding: 12px;
  }
`;
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;

  > img {
    width: 80%;
    height: auto;
  }
`;

interface AnalyzerCardProps {
  instrumentType: InstrumentType;
  onClick: () => void;
}

function AnalyzerCard(props: AnalyzerCardProps) {
  const { t } = useTranslation();
  return (
    <StyledCard isInteractive onClick={props.onClick}>
      <CardBody>
        <CardContent>
          <img
            src={getInstrumentDisplayImage(props.instrumentType)}
            alt={props.instrumentType}
          />

          <SpotText level="paragraph">
            {t(`instruments.names.${props.instrumentType}`)}
          </SpotText>
        </CardContent>
      </CardBody>
    </StyledCard>
  );
}
