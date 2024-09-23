import { parseIvlsDob } from "./date-utils";

describe("parseIvlsDob", () => {
  it("parses IVLS LocalDate number array format to YYYY-MM-DD formatted string", () => {
    expect(parseIvlsDob([2019, 5, 24])).toEqual("2019-05-24");
    expect(parseIvlsDob([2019, 5, 24, 12, 74] as number[])).toEqual("2019-05-24");
    expect(parseIvlsDob(["2019", "5", "24"] as unknown as number[])).toEqual("2019-05-24");
  });

  it("returns undefined for malformed arrays", () => {
    expect(parseIvlsDob([])).toEqual(undefined);
    expect(parseIvlsDob([2019, 5])).toEqual(undefined);
    expect(parseIvlsDob([undefined, 5, 24] as number[])).toEqual(undefined);
    expect(parseIvlsDob([2019, undefined, 24] as number[])).toEqual(undefined);
    expect(parseIvlsDob([2019, 5, undefined] as number[])).toEqual(undefined);
    expect(parseIvlsDob(undefined as unknown as number[])).toEqual(undefined);
  });
});
