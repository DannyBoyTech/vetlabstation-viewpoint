import { distinct, naturals } from "./general-utils";

describe("distinct", () => {
  it("should return undefined if passed undefined", () => {
    const output = distinct(undefined);

    expect(output).toBeUndefined();
  });

  it("should return null if passed null", () => {
    const output = distinct(null);

    expect(output).toBeNull();
  });

  it("should return equivalent array if there are no duplicates", () => {
    const input = ["abc", "def", "ghi"];

    const output = distinct(input);

    expect(output).toEqual(input);
  });

  it("should return list where first occurrence of each value is returned in original order", () => {
    const input = [
      "abc",
      "abc",
      "abc",
      "def",
      "def",
      "ghi",
      "abc",
      "ghi",
      "def",
    ];
    const expected = ["abc", "def", "ghi"];

    const output = distinct(input);

    expect(output).toEqual(expected);
  });

  it("should not modify original array", () => {
    const input = [1, 2, 3, 3];
    const originalInputValues = [...input];
    const expected = [1, 2, 3];

    const output = distinct(input);

    expect(output).toEqual(expected);
    expect(input).toEqual(originalInputValues);
  });
});

describe("naturals", () => {
  test.each([
    { endpoint: -3, expected: [] },
    { endpoint: 0, expected: [] },
    { endpoint: 1, expected: [1] },
    { endpoint: 2.1, expected: [1, 2] },
    { endpoint: 3, expected: [1, 2, 3] },
    { endpoint: 5.8, expected: [1, 2, 3, 4, 5] },
  ])("naturals(%i) => %j", ({ endpoint, expected }) => {
    expect(naturals(endpoint)).toEqual(expected);
  });
});
