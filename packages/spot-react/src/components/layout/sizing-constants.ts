export const sizes = [
  "none",
  "xsmall",
  "small",
  "medium",
  "larg",
  "xlarge",
  "xxlarge",
] as const;
export type Size = (typeof sizes)[number];

export type SizeType = Size | string;

export type ValueType = string | number | undefined;

export const getSizeSafe = (propValue: ValueType, defaultValue = "") => {
  if (typeof propValue === "string") {
    return propValue;
  }

  return typeof propValue === "number" ? `${propValue}px` : defaultValue;
};
