export interface Dimensions {
  height: number;
  width: number;
}

export function drawToContext(
  canvasContext: CanvasRenderingContext2D,
  canvasDimensions: Dimensions,
  image: HTMLImageElement,
  zoomFactor: number,
  panX: number,
  panY: number
) {
  canvasContext.resetTransform();
  // Scale the canvas based on the provided zoom factor
  canvasContext.scale(zoomFactor, zoomFactor);

  // Calculate offsets based on zoom as well as panning
  const offsets = calculateZoomOffsets(
    canvasDimensions.width,
    canvasDimensions.height,
    panX,
    panY,
    zoomFactor
  );

  // Draw the image
  canvasContext.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    offsets.x,
    offsets.y,
    canvasDimensions.width,
    canvasDimensions.height
  );
}

// Calculate the ideal canvas size -- should stretch to the height of the container, but keep the same ratio as the image it's drawing
export function calculateCanvasSize(
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): Dimensions {
  const height = containerHeight;
  const width = imageWidth * (height / imageHeight);
  return { width, height };
}

// Calculate dX and dY for the canvas (accounting for panning values) to appropriately position the image
function calculateZoomOffsets(
  canvasWidth: number,
  canvasHeight: number,
  panX: number,
  panY: number,
  zoomFactor: number
): { x: number; y: number } {
  const centerDistX = canvasWidth / 2;
  const centerDistY = canvasHeight / 2;

  const adjustedPanX = calculateRestrainedPanValue(
    0,
    panX,
    canvasWidth,
    zoomFactor
  );
  const adjustedPanY = calculateRestrainedPanValue(
    0,
    panY,
    canvasHeight,
    zoomFactor
  );

  const diffX = -(centerDistX - centerDistX / zoomFactor) + adjustedPanX;
  const diffY = -(centerDistY - centerDistY / zoomFactor) + adjustedPanY;

  return {
    x: diffX,
    y: diffY,
  };
}

// Restrain panning values -- if restraining X, provide canvas width, if restraining Y, provide canvas height
export function calculateRestrainedPanValue(
  incrementAmount: number,
  currentPanAmount: number,
  canvasDimensionRestraint: number,
  zoomFactor: number
): number {
  // Calculate distance from the center to the edge
  const centerDist = canvasDimensionRestraint / 2;
  // Calculate the current expected diff based on the zoom factor (not including pan value -- this is the dX or dY required to center the image)
  const diff = -(centerDist - centerDist / zoomFactor);

  // Calculate what the minimum diff offset can be (based on the dimensions of the canvas and the zoom factor)
  const minDiff = -(
    canvasDimensionRestraint -
    canvasDimensionRestraint / zoomFactor
  );
  // Max is always 0
  const maxDiff = 0;

  // Restrain the new pan amount so that the new diff value is between minDiff and maxDiff
  let newPanAmount = currentPanAmount + incrementAmount;
  const newDiff = diff + newPanAmount;
  if (newDiff > maxDiff) {
    newPanAmount = maxDiff - diff;
  } else if (newDiff < minDiff) {
    newPanAmount = minDiff - diff;
  }

  return newPanAmount;
}

export interface CropDimensions {
  height: number;
  width: number;
  x: number;
  y: number;
}

export function handleCrop(
  cropSelection: CropDimensions,
  imageCanvas: HTMLCanvasElement,
  cellCanvas: HTMLCanvasElement | null,
  onReady: (bytes: string | ArrayBuffer | null) => void
) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = cropSelection.width;
  tempCanvas.height = cropSelection.height;
  const context = tempCanvas.getContext("2d");
  context?.drawImage(
    imageCanvas,
    cropSelection.x,
    cropSelection.y,
    cropSelection.width,
    cropSelection.height,
    0,
    0,
    cropSelection.width,
    cropSelection.height
  );
  if (cellCanvas) {
    // Copy the cell markers onto the temp canvas so they are included in the cropped version
    const ratioX = imageCanvas.width / cellCanvas.width;
    const ratioY = imageCanvas.height / cellCanvas.height;

    context?.drawImage(
      cellCanvas,
      0,
      0,
      cropSelection.width / ratioX,
      cropSelection.height / ratioY,
      0,
      0,
      cropSelection.width,
      cropSelection.height
    );
  }

  const fileReader = new FileReader();

  tempCanvas.toBlob((blob) => {
    if (blob) {
      fileReader.addEventListener("loadend", () => onReady(fileReader.result));
      fileReader.readAsArrayBuffer(blob);
    }
  }, "image/png");
}
