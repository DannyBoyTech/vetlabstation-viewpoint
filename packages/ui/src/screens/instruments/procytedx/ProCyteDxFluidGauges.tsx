import styled from "styled-components";
import { ProCyteDxFluidType } from "@viewpoint/api";
import ReagentKitTop from "../../../assets/gauges/pdx/pdx-reagent-kit-top.png";
import StainPackTop from "../../../assets/gauges/pdx/pdx-stain-pack-top.png";
import ReagentMarkers from "../../../assets/gauges/pdx/pdx-reagent-markers.png";
import StainMarkers from "../../../assets/gauges/pdx/pdx-stain-markers.png";
import ReagentMarkersEmpty from "../../../assets/gauges/pdx/pdx-reagent-markers-empty.png";
import StainMarkersEmpty from "../../../assets/gauges/pdx/pdx-stain-markers-empty.png";
import { Theme } from "../../../utils/StyleConstants";
import { FullSizeSpinner } from "../../../components/spinner/FullSizeSpinner";
import { useState } from "react";
import { Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { ProCyteDxReagentLogModal } from "./ProCyteDxReagentLogModal";

export const TestId = {
  GaugesRoot: "pdx-fluid-gauges-root",
  GaugeLevel: "pdx-fluid-gauge-level",
  ViewLogsButton: "pdx-view-reagent-logs-button",
  FluidGauge: (type: ProCyteDxFluidType) => `pdx-fluid-gauge-${type}`,
  FluidInfo: (type: ProCyteDxFluidType) => `pdx-fluid-info-${type}`,
  LoadingSpinner: `pdx-fluid-gauges-loading-spinner`,
};

const HeaderRoot = styled.div`
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 10px;

  .spot-button--link {
    padding: 0;
  }
`;

interface ProCyteDxFluidGaugesHeaderProps {
  instrumentId: number;
}

export function ProCyteDxFluidGaugesHeader(
  props: ProCyteDxFluidGaugesHeaderProps
) {
  const [fluidLogOpen, setFluidLogOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <HeaderRoot>
      <SpotText level="h4">
        {t("instrumentScreens.common.fluid.labels.fluidLevels")}
      </SpotText>
      <div>
        <SpotText level="h4">|</SpotText>
      </div>
      <Button
        data-testid={TestId.ViewLogsButton}
        buttonType="link"
        onClick={() => setFluidLogOpen(true)}
      >
        {t("instrumentScreens.proCyteDx.fluid.buttons.viewLog")}
      </Button>

      {fluidLogOpen && (
        <ProCyteDxReagentLogModal
          open={fluidLogOpen}
          onClose={() => setFluidLogOpen(false)}
          instrumentId={props.instrumentId}
        />
      )}
    </HeaderRoot>
  );
}

const GaugesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
  border-radius: 5px;
  padding: 15px;
  max-width: 400px;
  align-items: flex-end;
`;

const GaugeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

interface PdxFluidGaugesProps {
  reagentKitPercentage?: number;
  stainPackPercentage?: number;
  reagentKitDaysLeft?: number;
  stainPackDaysLeft?: number;
  onClickChange: (type: ProCyteDxFluidType) => void;
  canChangePacks: boolean;
}

export function ProCyteDxFluidGauges(props: PdxFluidGaugesProps) {
  return (
    <GaugesContainer data-testid={TestId.GaugesRoot}>
      <GaugeContainer>
        <FluidGauge
          percentLeft={
            props.reagentKitPercentage == null
              ? undefined
              : props.reagentKitPercentage * 100
          }
          height={"120px"}
          width={"170px"}
          type={ProCyteDxFluidType.REAGENT}
        />
      </GaugeContainer>
      <GaugeContainer>
        <FluidGauge
          percentLeft={
            props.stainPackPercentage == null
              ? undefined
              : props.stainPackPercentage * 100
          }
          height={"75px"}
          width={"100px"}
          type={ProCyteDxFluidType.STAIN}
        />
      </GaugeContainer>

      <FluidInfo
        type={ProCyteDxFluidType.REAGENT}
        daysLeft={props.reagentKitDaysLeft}
        onClickChange={props.onClickChange}
        changeButtonDisabled={!props.canChangePacks}
      />

      <FluidInfo
        type={ProCyteDxFluidType.STAIN}
        daysLeft={props.stainPackDaysLeft}
        onClickChange={props.onClickChange}
        changeButtonDisabled={!props.canChangePacks}
      />
    </GaugesContainer>
  );
}

const FluidInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .spot-button--link {
    padding: 0;
  }
`;

interface FluidInfoProps {
  type: ProCyteDxFluidType;
  daysLeft?: number;
  onClickChange: (type: ProCyteDxFluidType) => void;
  changeButtonDisabled: boolean;
}

function FluidInfo(props: FluidInfoProps) {
  const { t } = useTranslation();
  return (
    <FluidInfoContainer data-testid={TestId.FluidInfo(props.type)}>
      <div>
        <SpotText level="paragraph" bold>
          {t(`instrumentScreens.proCyteDx.fluid.labels.${props.type}`)}
        </SpotText>
        <SpotText level="paragraph">
          {t("instrumentScreens.common.fluid.labels.expires", {
            days: props.daysLeft,
          })}
        </SpotText>
      </div>
      <div>
        <Button
          buttonType="link"
          onClick={() => props.onClickChange(props.type)}
          disabled={props.changeButtonDisabled}
        >
          {t(`instrumentScreens.proCyteDx.fluid.changeButtons.${props.type}`)}
        </Button>
      </div>
    </FluidInfoContainer>
  );
}

const GaugeImages = {
  REAGENT: ReagentKitTop,
  STAIN: StainPackTop,
};

const MarkerImages = {
  REAGENT: ReagentMarkers,
  STAIN: StainMarkers,
};

const EmptyMarkerImages = {
  REAGENT: ReagentMarkersEmpty,
  STAIN: StainMarkersEmpty,
};

const GaugeRoot = styled.div<{ width: string; height: string }>`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr;
  flex-direction: column;
  height: ${(p) => p.height};
  width: ${(p) => p.width};
`;

const GaugeTopImage = styled.img`
  width: 100%;
  object-fit: contain;
`;

const SideImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 5px 0px 5px 5px;
`;

const GaugeSideImage = styled.img`
  height: 100%;
  object-fit: contain;
`;

const GaugeContainerBorder = styled.div`
  flex: 1;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.text?.disabled}; // TODO - confirm color choice
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  padding: 4px;
`;

const GaugeLevelBorder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary}; // TODO - confirm color choice
  border-radius: 6px;
`;
const GaugeLevel = styled.div<{ percent?: number }>`
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.text?.secondary}; // TODO - confirm color choice
  border-radius: 3px;
  margin: 3px;
  height: ${(p) => p.percent ?? 0}%;
`;

interface FluidGaugeProps {
  percentLeft?: number;
  type: ProCyteDxFluidType;
  width: string;
  height: string;
}

function FluidGauge(props: FluidGaugeProps) {
  return (
    <GaugeRoot
      width={props.width}
      height={props.height}
      data-testid={TestId.FluidGauge(props.type)}
    >
      <GaugeTopImage src={GaugeImages[props.type]} />
      <div />
      <GaugeContainerBorder>
        <GaugeLevelBorder>
          <GaugeLevel
            percent={props.percentLeft}
            data-testid={TestId.GaugeLevel}
          />
          {props.percentLeft == null && (
            <FullSizeSpinner data-testid={TestId.LoadingSpinner} />
          )}
        </GaugeLevelBorder>
      </GaugeContainerBorder>
      <SideImageContainer>
        <GaugeSideImage
          src={
            props.percentLeft === 0
              ? EmptyMarkerImages[props.type]
              : MarkerImages[props.type]
          }
        />
      </SideImageContainer>
    </GaugeRoot>
  );
}
