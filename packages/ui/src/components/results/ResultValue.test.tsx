import { describe, expect, it } from "vitest";
import { InstrumentType, QualifierTypeEnum } from "@viewpoint/api";
import { randomInstrumentResult } from "@viewpoint/test-utils";
import { render } from "../../../test-utils/test-utils";
import { ResultValue } from "./ResultValue";

describe("ResultValue", () => {
  it('renders the "resultValueForDisplay" field', () => {
    const result = randomInstrumentResult({
      instrumentType: InstrumentType.CatalystOne,
    });
    const { container } = render(<ResultValue result={result} />);
    expect(container).toHaveTextContent(result.resultValueForDisplay);
  });

  it.each([
    InstrumentType.SNAP,
    InstrumentType.SNAPPro,
    InstrumentType.SNAPshotDx,
  ])(
    'displays "No Result" for %s result with NOTCALCULATED qualifier',
    (instrumentType) => {
      const result = randomInstrumentResult({
        instrumentType,
        qualifierType: QualifierTypeEnum.NOTCALCULATED,
      });
      const { container } = render(<ResultValue result={result} />);
      expect(container).toHaveTextContent("No Result");
    }
  );

  it.each(
    [
      InstrumentType.SNAP,
      InstrumentType.SNAPPro,
      InstrumentType.SNAPshotDx,
    ].flatMap(
      (instrumentType) =>
        [
          [instrumentType, "Negative", "Negative"],
          [instrumentType, "WeakPositive", "Positive(LOW)"],
          [instrumentType, "StrongPositive", "Positive(HIGH)"],
          [instrumentType, "Abnormal", "Abnormal"],
          [instrumentType, "GT800", ">800 mg/dl"],
          [instrumentType, "LT400", "<400 mg/dl"],
          [instrumentType, "400THRU800", "400-800 mg/dl"],
          [instrumentType, "Normal", "Normal"],
          [instrumentType, "Positive", "Positive"],
        ] as const
    )
  )("displays %s %s result as %s", (instrumentType, resultText, expected) => {
    const result = randomInstrumentResult({
      instrumentType,
      resultText,
    });

    const { container } = render(<ResultValue result={result} />);
    expect(container).toHaveTextContent(expected);
  });
});
