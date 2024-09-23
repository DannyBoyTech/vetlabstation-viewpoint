import { ImgHTMLAttributes, useState } from "react";
import { FullSizeSpinner } from "../spinner/FullSizeSpinner";

export function ImageWithPlaceholder({
  isLoading,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { isLoading?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <img
        {...props}
        alt="alt"
        onLoad={() => setLoaded(true)}
        style={
          loaded && !isLoading
            ? { ...props.style, width: "100%" }
            : { ...props.style, display: "none" }
        }
      />
      {(!loaded || isLoading) && <FullSizeSpinner />}
    </>
  );
}
