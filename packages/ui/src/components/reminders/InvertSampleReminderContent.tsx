import {
  EventIds,
  InstrumentType,
  PatientDto,
  ProgressDto,
} from "@viewpoint/api";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";
import { useEventListener } from "../../context/EventSourceContext";
import { LocalizedPatientSignalment } from "../localized-signalment/LocalizedPatientSignalment";
import { CommonTransComponents } from "../../utils/i18n-utils";
import { Card, SpotText } from "@viewpoint/spot-react/src";
import { InlineText } from "../typography/InlineText";
import PdxPressStart from "../../assets/instruments/maintenance/proCyteDx/start_button.png";
import PcoPressStart from "../../assets/Acadia_press_start.png";

const InvertSampleReminderRoot = styled.div`
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
const Instructions = styled.div`
  flex: 1;
`;
const Image = styled.div`
  max-width: 125px;

  > img {
    object-fit: contain;
    height: 100%;
    width: 100%;
  }
`;

interface InvertSampleReminderContentProps {
  patient: PatientDto;
  instrumentId: number;
  instrumentType: InstrumentType.ProCyteDx | InstrumentType.ProCyteOne;
  onProgress: () => void;
}

export const TestId = {
  ContentRoot: "invert-sample-reminder-modal",
};

export function InvertSampleReminderContent(
  props: InvertSampleReminderContentProps
) {
  const { t } = useTranslation();

  // Note - rendering of this modal could be delayed until after the run has complete
  // (since it uses the addConfirmModal hooks, if there are any other modals shown via
  // that method then this will be queued until the other one(s) are closed) - if that
  // happens, this modal will not receive any more progress messages and will not
  // auto-dismiss. We could get around this by checking for in process runs
  // and complete runs via the API and dismissing based on those states, but
  // the added complexity is likely not worth it since the user can just manually
  // dismiss the reminder and the scenario causing it to happen is very unlikely.
  useEventListener(EventIds.InstrumentRunProgress, (msg) => {
    const progressDto: ProgressDto = JSON.parse(msg.data);
    if (progressDto.instrumentId === props.instrumentId) {
      props.onProgress();
    }
  });

  return (
    <InvertSampleReminderRoot data-testid={TestId.ContentRoot}>
      <LocalizedPatientSignalment
        size="small"
        hideIcon
        patient={props.patient}
      />

      <Card variant="secondary">
        <Content>
          <Instructions>
            <Trans
              i18nKey={`reminders.sampleInvertReminder.instructions_${props.instrumentType}`}
              components={CommonTransComponents}
            />
          </Instructions>
          <Image>
            <PressStartButtonImage instrumentType={props.instrumentType} />
          </Image>
        </Content>
      </Card>
      <SpotText level="secondary">
        <Trans
          i18nKey={`reminders.sampleInvertReminder.disable`}
          values={{
            instrumentName: t(`instruments.names.${props.instrumentType}`),
          }}
          components={{
            ...CommonTransComponents,
            strong: <InlineText level="secondary" bold />,
          }}
        />
      </SpotText>
    </InvertSampleReminderRoot>
  );
}

function PressStartButtonImage(props: {
  instrumentType: InstrumentType.ProCyteDx | InstrumentType.ProCyteOne;
}) {
  if (props.instrumentType === InstrumentType.ProCyteDx) {
    return <img src={PdxPressStart} alt={"Press Start Button on ProCyte Dx"} />;
  } else if (props.instrumentType === InstrumentType.ProCyteOne) {
    return (
      <img src={PcoPressStart} alt={"Press Start Button on ProCyte One"} />
    );
  }
  return <></>;
}
