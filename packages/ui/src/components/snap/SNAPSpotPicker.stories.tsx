import { Meta, StoryFn } from "@storybook/react";
import {
  SNAPSpotPicker as SNAPSpotPickerComponent,
  SNAPSpotPickerProps,
} from "./SNAPSpotPicker";
import { useState } from "@storybook/preview-api";
import { useEffect } from "react";
import { DotPosition } from "./snap-constants";
import { FourDxPlusDefinition } from "../result-entry/snap/definitions/4DxPlus";
import { ParvoDefinition } from "../result-entry/snap/definitions/Parvo";

const meta: Meta = {
  title: "viewpoint/SNAP",
  component: SNAPSpotPickerComponent,
};
export default meta;

const SNAPSpotPickerTemplate: StoryFn<
  SNAPSpotPickerProps & { maxWidth?: string }
> = ({ maxWidth = "500px", ...props }) => {
  const [results, setResults] = useState(props.dots);

  useEffect(() => {
    setResults(props.dots);
  }, [props.dots]);

  return (
    <div style={{ maxWidth }}>
      <SNAPSpotPickerComponent
        {...props}
        dots={results}
        onDotClicked={(assay) => {
          const updated = [...results];
          const assayIndex = updated.findIndex((res) => res.label === assay);
          updated[assayIndex].selected = !updated[assayIndex].selected;
          setResults(updated);
        }}
      />
    </div>
  );
};

export const FiveSpotPicker = SNAPSpotPickerTemplate.bind({});

FiveSpotPicker.args = {
  dots: FourDxPlusDefinition.dots,
};

export const FourSpotPicker = SNAPSpotPickerTemplate.bind({});

FourSpotPicker.args = {
  dots: [
    {
      position: DotPosition.TopCenter,
      dotId: "Control",
      label: "Control",
      selected: false,
      control: true,
    },
    {
      position: DotPosition.MiddleLeft,
      dotId: "Anaplasma",
      label: "Anaplasma",
      selected: false,
    },
    {
      position: DotPosition.MiddleRight,
      dotId: "Ehrlichia",
      label: "Ehrlichia",
      selected: false,
    },
    {
      position: DotPosition.BottomCenter,
      dotId: "Heartworm",
      label: "Heartworm",
      selected: false,
    },
  ],
};

export const ThreeSpotPicker = SNAPSpotPickerTemplate.bind({});

ThreeSpotPicker.args = {
  dots: [
    {
      position: DotPosition.TopCenter,
      dotId: "Control",
      label: "Control",
      selected: false,
      control: true,
    },
    {
      position: DotPosition.MiddleLeft,
      dotId: "Anaplasma",
      label: "Anaplasma",
      selected: false,
    },
    {
      position: DotPosition.MiddleRight,
      dotId: "Ehrlichia",
      label: "Ehrlichia",
      selected: false,
    },
  ],
};

export const TwoSpotPicker = SNAPSpotPickerTemplate.bind({});

TwoSpotPicker.args = {
  dots: ParvoDefinition.dots,
};
