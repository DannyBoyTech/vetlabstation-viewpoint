import SNAPDotsBackgroundSvg from "../../assets/snap/snap-dots-background.svg";
import styled from "styled-components";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SpotText } from "@viewpoint/spot-react/src";
import {
  DOT_IMAGE_RATIO,
  DotLayoutValues,
  DotPosition,
} from "./snap-constants";
import { SelectableDot } from "./Dot";
import { DotLabel } from "./DotLabel";
import { useTranslation } from "react-i18next";
import { Theme } from "../../utils/StyleConstants";

export const TestId = {
  Dot: (dotId: string) => `snap-selectable-dot-${dotId}`,
  Label: (dotId: string) => `snap-dot-label-${dotId}`,
};

const Root = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: relative;
`;

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  width: auto;
  height: 100%;
`;

const SNAPBackground = styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
`;

export interface SNAPSpotDefinition {
  // Unique ID for the assay
  dotId: string;
  // Position it should be placed in
  position: DotPosition;
  // Whether it is selected
  selected?: boolean;
  // Label (usually the assay name). Expects a localization key, but will fall back to raw string provided if key is missing
  label?: string;
  // Which side of the image to position the label. Defaults are defined for each dot position, but this can be used to override the default.
  labelPosition?: "left" | "right";
  // Whether it is a control dot (not clickable, no selected/unselected label)
  control?: boolean;
  // Label to use when it is selected, defaults to "Positive". Expects a localization key, but will fall back to raw string provided if key is missing
  selectedLabel?: string;
  // Label to use when it is not selected, defaults to "Negative". Expects a localization key, but will fall back to raw string provided if key is missing
  unselectedLabel?: string;
  // Color to use when it is filled, defaults to #8bacca for regular dots, #306f93 for control dots
  filledColor?: string;
  // Additional to apply to the label
  labelStyles?: CSSProperties;
}

export interface SNAPSpotPickerProps {
  className?: string;
  onDotClicked: (dotId: string) => void;

  dots: SNAPSpotDefinition[];

  dotRatio?: number;
}

/**
 * SNAP Spot Picker component. Accepts an array of dots that indicate the set of
 * assays this SNAP test is checking for.
 */
export function SNAPSpotPicker({ className, ...props }: SNAPSpotPickerProps) {
  const [dotPxHeight, setDotPxHeight] = useState<number>();
  // Track positions of the dots so that labels can be attached to them
  const [dotPositions, setDotPositions] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const imageRef = useRef<HTMLImageElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    // Track the height of the image, so we can calculate the height of the selectable
    // dots as a percentage of the total image
    const observer = new ResizeObserver(() =>
      setDotPxHeight(
        imageRef.current == null
          ? undefined
          : imageRef.current.height * (props.dotRatio ?? DOT_IMAGE_RATIO)
      )
    );
    if (imageRef.current != null) {
      observer.observe(imageRef.current);
    }
    return () => observer.disconnect();
  }, [props.dotRatio]);

  const captureDotPositions = (
    ref: HTMLDivElement | null,
    dot: SNAPSpotDefinition
  ) => {
    if (ref != null) {
      const rect = ref.getBoundingClientRect();
      const newPositions = {
        x: rect.x,
        width: rect.width,
      };
      if (
        dotPositions[dot.dotId] == null ||
        dotPositions[dot.dotId].x !== newPositions.x ||
        dotPositions[dot.dotId].width !== newPositions.width
      ) {
        setDotPositions({
          ...dotPositions,
          [dot.dotId]: newPositions,
        });
      }
    }
  };

  return (
    <Root className={className} ref={rootRef}>
      <ImageContainer>
        <SNAPBackground
          src={SNAPDotsBackgroundSvg}
          ref={imageRef}
          style={dotPxHeight == null ? { visibility: "hidden" } : undefined}
        />

        {dotPxHeight != null &&
          props.dots.map((dot) => (
            <SelectableDot
              key={dot.dotId}
              data-testid={TestId.Dot(dot.dotId)}
              style={DotLayoutValues[dot.position].dotStyles}
              position={dot.position}
              dotHeight={dotPxHeight}
              control={dot.control}
              selected={dot.selected}
              fillColor={dot.filledColor}
              onClick={() => props.onDotClicked(dot.dotId)}
              ref={(ref) => captureDotPositions(ref, dot)}
            />
          ))}
      </ImageContainer>
      {dotPxHeight != null &&
        props.dots.map((dot) =>
          dot.label == null ? undefined : (
            <DotLabel
              key={dot.dotId}
              data-testid={TestId.Label(dot.dotId)}
              // ref={labelRef}
              labelPosition={
                dot.labelPosition ?? DotLayoutValues[dot.position].labelPosition
              }
              top={DotLayoutValues[dot.position].dotStyles.top}
              pxHeight={dotPxHeight}
              pxWidth={calculateLabelWidth(
                DotLayoutValues[dot.position].labelPosition,
                dotPositions[dot.dotId]?.x,
                dotPositions[dot.dotId]?.width,
                rootRef.current?.getBoundingClientRect()?.x,
                rootRef.current?.getBoundingClientRect()?.width
              )}
              label={
                <LabelContainer>
                  <SpotText level={"secondary"} bold style={dot.labelStyles}>
                    {t(dot.label as any)}
                  </SpotText>
                  {!dot.control && (
                    <StyledLabel
                      className={dot.selected ? "selected" : undefined}
                      level={"secondary"}
                      bold={dot.selected}
                      style={dot.labelStyles}
                    >
                      {dot.selected
                        ? t(
                            dot.selectedLabel ??
                              ("resultsEntry.snap.results.positive" as any)
                          )
                        : t(
                            dot.unselectedLabel ??
                              ("resultsEntry.snap.results.negative" as any)
                          )}
                    </StyledLabel>
                  )}
                </LabelContainer>
              }
            />
          )
        )}
    </Root>
  );
}

const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledLabel = styled(SpotText)`
  &.selected {
    font-weight: bold;
    color: ${(p: { theme: Theme }) => p.theme.colors?.feedback?.error};
  }
`;

function calculateLabelWidth(
  labelPosition: "left" | "right",
  dotX?: number,
  dotWidth?: number,
  rootX?: number,
  rootWidth?: number
) {
  if (dotX == null || dotWidth == null || rootX == null || rootWidth == null) {
    return 0;
  }
  if (labelPosition === "left") {
    return dotX - rootX - 15;
  } else {
    return rootX + rootWidth - (dotX + dotWidth) - 15;
  }
}
