import { validIPv4OctetString, validIPv4String } from "./ipv4-utils";
import { describe, test, expect } from "vitest";

describe("ipv4-utils", () => {
  test.each([
    { input: undefined, expected: false },
    { input: "", expected: false },
    { input: "a", expected: false },
    { input: "256", expected: false },
    { input: "-1", expected: false },
    { input: "0", expected: true },
    { input: "1", expected: true },
    { input: "127", expected: true },
    { input: "255", expected: true },
    { input: " 255", expected: false },
    { input: "127 ", expected: false },
  ])(
    "validIPv4OctetString($input) should return $expected",
    ({ input, expected }) => {
      expect(validIPv4OctetString(input)).toBe(expected);
    }
  );

  test.each([
    { input: undefined, expected: false },
    { input: "", expected: false },
    { input: "a", expected: false },
    { input: "256", expected: false },
    { input: "-1", expected: false },
    { input: "1", expected: false },
    { input: "127", expected: false },
    { input: "255", expected: false },
    { input: " 255", expected: false },
    { input: "127 ", expected: false },
    { input: "127.", expected: false },
    { input: "127.0", expected: false },
    { input: "127.0.0", expected: false },
    { input: "127.0.0.", expected: false },
    { input: "255.255.255.255.255", expected: false },
    { input: "127.-1.0.1", expected: false },
    { input: "...", expected: false },
    { input: "255.255.255.255", expected: true },
    { input: "127.0.0.1", expected: true },
  ])(
    "validIPv4String($input) should return $expected",
    ({ input, expected }) => {
      expect(validIPv4String(input)).toBe(expected);
    }
  );
});
