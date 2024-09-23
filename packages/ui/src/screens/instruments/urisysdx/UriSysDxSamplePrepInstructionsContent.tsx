import {
  EventIds,
  InstrumentType,
  PatientDto,
  ProgressDto,
  RunningInstrumentRunDto,
} from "@viewpoint/api";
import styled from "styled-components";
import { Trans } from "react-i18next";
import { useEventListener } from "../../../context/EventSourceContext";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { SpotText } from "@viewpoint/spot-react/src";

import { getAgeString } from "../../../utils/date-utils";
import { getInstrumentDisplayImage } from "../../../utils/instrument-utils";
import { Theme } from "../../../utils/StyleConstants";
import { LocalizedPatientSignalment } from "../../../components/localized-signalment/LocalizedPatientSignalment";

const ClientHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const Body = styled.div`
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.disabled};
  padding: 12px;
  margin: 16px 0;
  display: flex;
  gap: 4px;

  ol {
    padding-left: 16px;
  }
`;

const ImageContainer = styled.div`
  width: 300px;
`;

const InstrumentImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

export const TestId = {
  ContentRoot: "sample-prep-modal",
};

interface UriSysDxSamplePrepInstructionsContentProps {
  patient: PatientDto;
  instrumentRun: RunningInstrumentRunDto;
  onProgress: () => void;
}

export function UriSysDxSamplePrepInstructionsContent(
  props: UriSysDxSamplePrepInstructionsContentProps
) {
  const patient = props.patient;
  const clientDto = props.patient.clientDto;

  useEventListener(EventIds.InstrumentRunProgress, (msg) => {
    const progressDto: ProgressDto = JSON.parse(msg.data);
    if (progressDto.instrumentId === props.instrumentRun?.instrumentId) {
      props.onProgress();
    }
  });

  return (
    <div data-testid={TestId.ContentRoot}>
      <LocalizedPatientSignalment size="small" patient={patient} hideIcon />
      <Body>
        <SpotText level="paragraph">
          <Trans
            i18nKey={
              "instrumentScreens.uriSysDx.samplePreparationInstructions.body"
            }
            components={CommonTransComponents}
          />
        </SpotText>
        <ImageContainer>
          <InstrumentImage
            src={getInstrumentDisplayImage(
              props.instrumentRun.instrumentType as InstrumentType
            )}
          />
        </ImageContainer>
      </Body>
      <SpotText level="paragraph">
        <Trans
          i18nKey={
            "instrumentScreens.uriSysDx.samplePreparationInstructions.disableInstruction"
          }
          components={CommonTransComponents}
        />
      </SpotText>
    </div>
  );
}
