import { writeFile } from "fs/promises";
import path from "node:path";
import winston from "winston";

const logger = winston.loggers.get("app");

/**
 * Write the passed datetime as a UTC ISO-8601 string to a platform-specific data file.
 * The IVLS server monitors this file and sends it back to IDEXX via SmartService.
 *
 * In is important the the file paths for each platform match the ones polled by the IVLS server.
 * See implementations of ViewPointAppDataRepository.java in the IVLS codebase for more details.
 *
 * @param timestamp
 * @returns
 */
export async function writeClientStarted(timestamp: Date) {
  const appDataDirEnvVar = "VIEWPOINT_HOME";
  const appDataDirPath = process.env[appDataDirEnvVar];

  if (appDataDirPath == null) {
    logger.warn(
      `The '${appDataDirEnvVar}' environment variable is not defined`
    );
    return;
  }

  const clientStartedFile = path.join(appDataDirPath, "ClientStarted");
  try {
    await writeFile(clientStartedFile, timestamp.toISOString());
  } catch (e) {
    logger.warn(`Unable to write to ${clientStartedFile}`, e);
  }
}
