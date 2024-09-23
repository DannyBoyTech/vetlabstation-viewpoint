import { Meta, StoryFn } from "@storybook/react";
import { ImageViewerModal as Component, ImageViewerProps } from "./ImageViewer";
import ViewpointResultsPageProvider from "../../context/ResultsPageContext";
import {
  randomLabRequest,
  randomLabRequestRecord,
} from "@viewpoint/test-utils/src/generators/viewpoint-generators";
import { ImageDto } from "@viewpoint/api";
import { useState } from "@storybook/preview-api";
import { useEffect } from "react";
import SpinnerOverlay from "../overlay/SpinnerOverlay";
import { Button } from "@viewpoint/spot-react";

const meta: Meta = {
  title: "viewpoint/ImageViewer",
  component: Component,
};
export default meta;

const Template: StoryFn<ImageViewerProps> = (args) => {
  const [open, setOpen] = useState(args.visible);
  const [imageMetadata, setImageMetadata] = useState<ImageDto[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("sedivue-images/metadata.json");
      const data = await response.json();
      setImageMetadata(data);
    };
    fetchImages().catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setOpen(args.visible);
  }, [args.visible]);

  if (imageMetadata == null) {
    return <SpinnerOverlay />;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Image Viewer</Button>
      <ViewpointResultsPageProvider
        labRequest={randomLabRequest()}
        record={randomLabRequestRecord()}
      >
        <Component
          {...args}
          imageData={imageMetadata.map((data, i) => ({
            index: i,
            tagCount: i,
            image: data,
          }))}
          visible={open}
          onClose={() => setOpen(false)}
        />
      </ViewpointResultsPageProvider>
    </>
  );
};

export const ImageViewer = Template.bind({});
ImageViewer.args = {
  configuration: {
    showAddToRecordMark: true,
    showCellLabelsButton: true,
    showAreaOfInterestButton: true,
    showInvertColorsButton: true,
    showAdditionalInfoButton: true,
  },
  // imageData: imageMetadata as ImageDto[],
};
