import { describe, expect } from "vitest";
import { DEFINITION_MAP, getDefinition } from "./SNAPDefinitions";
import {
  SNAPResultEntryType,
  SNAPSpotDeviceDefinition,
} from "./definitions/definition-constants";

describe("SNAP definitions", () => {
  const definitions = Object.entries(DEFINITION_MAP)
    .filter(([_, def]) => def.type === SNAPResultEntryType.SpotPicker)
    .map(([snapDeviceId, def]) => ({
      ...def,
      snapDeviceId,
    })) as unknown as (SNAPSpotDeviceDefinition & {
    snapDeviceId: number;
  })[];

  it.each(definitions)(
    "does not have duplicate result mappings for SNAP device ID $snapDeviceId",
    (definition) => {
      const resultMapValues = Object.values(definition.resultMap);
      const seenValues = new Set();

      // For each assay:boolean result mapping
      resultMapValues.forEach((mapValues) => {
        // Convert the assay:boolean map to a sorted string
        const resultMapString = Object.entries(mapValues)
          .sort()
          .map(([key, value]) => `${key}:${value}`)
          .join(",");

        // Verify we don't have any duplicate assay:boolean result values
        expect(seenValues.has(resultMapString)).toBe(false);
      });
    }
  );

  it.each(definitions)(
    "has the expected number of result mapping combinations based on assay count for SNAP device ID $snapDeviceId",
    (definition) => {
      // How many assays are there? Check the first result map entry
      const resultMaps = Object.values(definition.resultMap);
      const assayCount = Object.keys(resultMaps[0]).length;
      expect(resultMaps.length).toEqual(Math.pow(2, assayCount));
    }
  );
});
