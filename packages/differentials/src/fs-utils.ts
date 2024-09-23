import fs from "node:fs/promises";
import path from "node:path";

async function fileExists(filename: string) {
  try {
    await fs.access(filename);
    return true;
  } catch (_e) {
    return false;
  }
}

export const dirExists = fileExists;

/**
 * Removes all directory contents recursively.
 * Silently succeeds if the specified directory doesn't exist.
 *
 * @param dirname
 */
export async function removeDirContents(dirname: string) {
  if (await dirExists(dirname)) {
    await Promise.all(
      (
        await fs.readdir(dirname)
      ).map(async (dirChild) => {
        const childFullPath = path.join(dirname, dirChild);
        await fs.rm(childFullPath, { recursive: true, force: true });
      })
    );
  }
}
