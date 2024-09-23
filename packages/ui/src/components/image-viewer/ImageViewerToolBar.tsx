import styled from "styled-components";
import { Button, ButtonGroup, Popover, SpotText } from "@viewpoint/spot-react";
import { ButtonProps } from "@viewpoint/spot-react/src/components/button/Button";
import classNames from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageViewerConfiguration,
  WrappedImageData,
} from "./common-components";

const ToolBarRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const StyledButtonGroup = styled(ButtonGroup)`
  transition: transform 0.25s ease-in-out;

  &.hidden {
    transform: translateY(100px);
  }

  .spot-button {
    border-color: #5d6066;
  }
`;

const IconContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  .spot-button__icon.spot-button__icon {
    fill: white;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  }
`;

const InfoContainer = styled(IconContainer)`
  justify-content: flex-end;
  transition: transform 0.25s ease-in-out;

  &.hidden {
    transform: translateY(100px);
  }
`;

export const TestId = {
  ToolBar: `image-viewer-detailed-view-toolbar`,
  CropBar: `image-viewer-detailed-view-crop-toolbar`,
  InfoButton: `image-viewer-detailed-view-info-button`,
  ImageNumber: `image-viewer-detailed-info-image-number`,
  ImageId: `image-viewer-detailed-info-image-id`,
  ZoomIn: `image-viewer-detailed-zoom-in`,
  ZoomOut: `image-viewer-detailed-zoom-out`,
  Crop: `image-viewer-detailed-crop`,
  Print: `image-viewer-detailed-print`,
};

interface CropToolBarProps {
  onCancel: () => void;
  onPrint: () => void;
  onShare: () => void;
  shareButtonDisabled: boolean;
  printButtonDisabled: boolean;
  shareButtonHidden: boolean;
  shareStatus: { isLoading: boolean };
}

export function CropToolBar(props: CropToolBarProps) {
  return (
    <ToolBarRow data-testid={TestId.CropBar}>
      <IconContainer />
      <StyledButtonGroup withLines>
        <ToolBarButton leftIcon="close" onClick={props.onCancel} />
        <ToolBarButton
          leftIcon="print"
          onClick={props.onPrint}
          data-testid={TestId.Print}
          disabled={props.printButtonDisabled}
        />
        {!props.shareButtonHidden && (
          <ToolBarButton
            data-testid="send-to-pims-button"
            disabled={props.shareButtonDisabled || props.shareStatus.isLoading}
            leftIcon="share"
            onClick={props.onShare}
          />
        )}
      </StyledButtonGroup>
      <IconContainer />
    </ToolBarRow>
  );
}

interface ImageViewerToolBarProps {
  configuration: ImageViewerConfiguration;

  imageData: WrappedImageData;

  onZoom: (increment: number) => void;
  canZoomOut: boolean;
  canZoomIn: boolean;
  visible: boolean;
  setVisible: (visible: boolean) => void;

  onGridViewSelected: () => void;
  onCropSelected: () => void;

  inverted: boolean;
  setInverted: (inverted: boolean) => void;

  tagsVisible: boolean;
  setTagsVisible: (visible: boolean) => void;
}

export function ImageViewerToolBar(props: ImageViewerToolBarProps) {
  const classes = classNames({ hidden: !props.visible });
  const [infoVisible, setInfoVisible] = useState(false);

  return (
    <ToolBarRow data-testid={TestId.ToolBar}>
      <IconContainer>
        <ToolBarButton
          leftIcon={props.visible ? "collapse" : "expand"}
          buttonType="link"
          onClick={() => props.setVisible(!props.visible)}
        />
      </IconContainer>
      <StyledButtonGroup withLines className={classes}>
        <ToolBarButton
          data-testid={TestId.ZoomOut}
          leftIcon="zoom-out"
          disabled={!props.canZoomOut}
          onClick={() => props.onZoom(-0.5)}
        />

        <ToolBarButton
          data-testid={TestId.ZoomIn}
          leftIcon="zoom-in"
          disabled={!props.canZoomIn}
          onClick={() => props.onZoom(0.5)}
        />

        {props.configuration.showInvertColorsButton && (
          <ToolBarButton
            leftIcon="inverse"
            active={props.inverted}
            onClick={() => props.setInverted(!props.inverted)}
          />
        )}

        {props.configuration.showCellLabelsButton && (
          <ToolBarButton
            leftIcon="pin"
            active={props.tagsVisible}
            disabled={!(props.imageData.tagCount ?? 0 > 0)}
            onClick={() => props.setTagsVisible(!props.tagsVisible)}
          />
        )}

        <ToolBarButton leftIcon="app-menu" onClick={props.onGridViewSelected} />

        {props.configuration.showAreaOfInterestButton && (
          <ToolBarButton
            data-testid={TestId.Crop}
            leftIcon="crop"
            onClick={props.onCropSelected}
          />
        )}
      </StyledButtonGroup>

      <InfoContainer className={classes}>
        {props.configuration.showAdditionalInfoButton && (
          <Popover
            target={
              <ToolBarButton
                data-testid={TestId.InfoButton}
                leftIcon="info-2"
                buttonType="link"
              />
            }
            open={infoVisible}
            onClickTarget={() => setInfoVisible(!infoVisible)}
            onClickAway={() => setInfoVisible(false)}
            popFrom="top"
            offsetTo="left"
          >
            <ImageInformation imageData={props.imageData} />
          </Popover>
        )}
      </InfoContainer>
    </ToolBarRow>
  );
}

interface ImageInformationProps {
  imageData: WrappedImageData;
}

function ImageInformation(props: ImageInformationProps) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        whiteSpace: "nowrap",
        gap: "20px",
      }}
    >
      <SpotText level="h5">{t("imageViewer.labels.imageInformation")}</SpotText>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <SpotText level="tertiary">
          {t("imageViewer.labels.imageNumber")}
        </SpotText>
        <SpotText level="tertiary" data-testid={TestId.ImageNumber}>
          {props.imageData.index}
        </SpotText>
        <SpotText level="tertiary">{t("imageViewer.labels.imageId")}</SpotText>
        <SpotText level="tertiary" data-testid={TestId.ImageId}>
          {props.imageData.referenceId ?? ""}
        </SpotText>
      </div>
    </div>
  );
}

function ToolBarButton({
  active,
  ...props
}: ButtonProps & { active?: boolean }) {
  const classes = classNames({ "spot-button--active": active });
  return (
    <Button
      buttonType="secondary"
      buttonSize="large"
      iconOnly
      className={classes}
      {...props}
    />
  );
}
