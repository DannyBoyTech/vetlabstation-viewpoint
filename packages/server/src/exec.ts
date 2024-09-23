import { configFromSources, getLogger, ViewPointServer } from "./index";

/**
 * Separate entrypoint file for running the ViewPoint server standalone.
 * This was moved out of the index.ts file because we want the electron
 * app to control when the server is started.
 *
 * Note - we originally relied on checking "require.main === module" to start
 * the server when it was run as an executable to allow for having a single entrypoint,
 * but that check does not work as expected when run in the Electron app due to
 * the way the server code is compiled as part of the Electron app build process.
 */

const logger = getLogger();

logger.info("Server running in standalone mode");
(async () => {
  const server = new ViewPointServer(configFromSources(process.env));
  await server.start();

  server.on("error", (err) => {
    logger.error("Server error", err);
    process.exit(1);
  });
  server.on("shutdown", () => {
    logger.info("Server shutdown");
    process.exit(0);
  });
})().catch((e) => {
  logger.error("", e);
  process.exit(1);
});
