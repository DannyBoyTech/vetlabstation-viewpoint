import { loadAsync } from "jszip";
import fsp from "node:fs/promises";
import assert from "node:assert";

export async function loadFromZip(
  zipFilePath: string,
  requiredFiles: readonly string[]
): Promise<Record<string, ArrayBuffer>> {
  const zipBuf = await fsp.readFile(zipFilePath);
  const jszip = await loadAsync(zipBuf);

  const decompressedFileBuffers: Record<string, ArrayBuffer> = {};
  for (const zObj of jszip.filter((relativePath) =>
    requiredFiles.includes(relativePath)
  )) {
    decompressedFileBuffers[zObj.name] = await zObj.async("nodebuffer");
  }
  const decompressedFileNames = Object.keys(decompressedFileBuffers);
  assert(
    requiredFiles.every((requiredFile) =>
      decompressedFileNames.includes(requiredFile)
    )
  );

  return decompressedFileBuffers;
}
