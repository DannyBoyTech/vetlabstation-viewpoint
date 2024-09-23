import {
  InstrumentStatus,
  InstrumentStatusDto,
  InstrumentType,
} from "@viewpoint/api";
import { useInstrumentNameForId } from "../../utils/hooks/hooks";
import styled from "styled-components";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import React, { useContext } from "react";
import { Button, SpotText } from "@viewpoint/spot-react";
import { StatusPill } from "../../components/status-pill/StatusPill";
import { Trans, useTranslation } from "react-i18next";
import { useSuppressMutation } from "../../api/InstrumentApi";
import { useNavigate } from "react-router-dom";
import { Theme } from "../../utils/StyleConstants";
import { InlineText } from "../../components/typography/InlineText";
import { ViewPointAppStateApiContext } from "../../context/AppStateContext";

export const TestId = {
  Root: "analyzer-overview",
};

const RemoveInstrumentButton = styled(Button)`
  && {
    border-color: ${(p) => p.theme.colors?.feedback?.error};
  }

  > .spot-icon.spot-icon {
    fill: ${(p) => p.theme.colors?.feedback?.error};
  }
`;

const Root = styled.div`
  display: flex;
  gap: 20px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ImageContainer = styled.div`
  width: 150px;
`;
const InstrumentImage = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

const AnalyzerContainer = styled.div`
  .header {
    margin-top: 50px;
  }

  .body {
    margin-top: 20px;
  }

  .remove-button {
    margin-top: 20px;
  }

  .remove-text {
    color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
  }
`;

export interface AnalyzerOverviewProps {
  instrument: InstrumentStatusDto;
  offlineBodyContent: React.ReactNode;
}

export function AnalyzerOverview({
  instrument,
  offlineBodyContent,
}: AnalyzerOverviewProps) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { showAlertsModal } = useContext(ViewPointAppStateApiContext);

  const getInstrumentName = useInstrumentNameForId();
  const [suppress] = useSuppressMutation();

  const onRemoveInstrument = () => {
    suppress({ instrumentId: instrument.instrument.id });
    nav("/");
  };

  const handleClick = () => {
    if (instrument.instrumentStatus === InstrumentStatus.Alert) {
      showAlertsModal(instrument.instrument.id);
    }
  };

  return (
    <>
      <Root onClick={handleClick} data-testid={TestId.Root}>
        <ImageContainer data-testid="instrument-image">
          <InstrumentImage
            src={getInstrumentDisplayImage(
              instrument.instrument.instrumentType
            )}
          />
        </ImageContainer>
        <Info>
          <SpotText level="h5">
            {getInstrumentName(instrument.instrument.id)}
          </SpotText>
          <div>
            <StatusPill status={instrument.instrumentStatus} outline={false} />
          </div>
        </Info>
      </Root>
      {/*Instrument can remain in "ALERT" status even while offline -- always check the connected field instead of relying on instrumentStatus === InstrumentStatus.OFFLINE*/}
      {!instrument.connected && (
        <AnalyzerContainer>
          <div className="header">
            <SpotText level="h5">
              {t(`instrumentScreens.common.offline.offline`, {
                instrumentType: t(
                  `instruments.names.${instrument.instrument.instrumentType}`
                ),
              })}
            </SpotText>
          </div>
          <div className="body">{offlineBodyContent}</div>
          <RemoveInstrumentButton
            data-testid="remove-button"
            leftIcon="delete"
            buttonType="secondary"
            onClick={onRemoveInstrument}
            className="remove-button"
          >
            <SpotText level="secondary" className="remove-text">
              {t("instrumentScreens.general.buttons.removeInstrument")}
            </SpotText>
          </RemoveInstrumentButton>
        </AnalyzerContainer>
      )}
    </>
  );
}

const ReconnectContainer = styled.div`
  margin-top: 20px;
`;

export interface GenericOfflineInstructionsProps {
  instrumentType: InstrumentType;
  includeReconnect?: boolean;

  "data-testid"?: string;
}

export function GenericOfflineInstructions(
  props: GenericOfflineInstructionsProps
) {
  const { t } = useTranslation();
  return (
    <SpotText level="secondary" data-testid={props["data-testid"]}>
      <Trans
        i18nKey={"instrumentScreens.common.offline.description"}
        values={{
          instrumentType: t(`instruments.names.${props.instrumentType}`),
        }}
      />

      {props.includeReconnect && (
        <ReconnectContainer>
          <Trans
            i18nKey={`instrumentScreens.common.offline.reconnect`}
            values={{
              instrumentType: t(`instruments.names.${props.instrumentType}`),
            }}
            components={{
              strong: <InlineText level="secondary" bold />,
            }}
          />
        </ReconnectContainer>
      )}
    </SpotText>
  );
}
