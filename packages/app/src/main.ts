// Leave this import at the top to guarantee all logging configuration is done first
import "./logger";
import path from "path";
import { app, BrowserWindow, ipcMain, shell, dialog, session } from "electron";
import { ViewPointServer, configFromSources } from "@viewpoint/server";
import { writeClientStarted } from "./client-started";
import BrowserWindowConstructorOptions = Electron.BrowserWindowConstructorOptions;
import winston from "winston";
import { envBool } from "./env-bool";
import { heapEnvId } from "./heap-env-id";
import { install as installSourceMapSupport } from "source-map-support";
import { forceCorpHeader } from "./force-corp-header";

installSourceMapSupport({
  environment: "node",
});

const logger = winston.loggers.get("app");

// If it's a packaged app and the NODE_ENV env var isn't set to development, then it's a production build
const RUNTIME_PROFILE =
  app.isPackaged && process.env.NODE_ENV !== "development"
    ? "production"
    : "development";

const APP_VERSION = app.getVersion();

// get the right ui content path to the static content, depending on packaging
const UI_DIST_PATH = app.isPackaged
  ? path.join(process.resourcesPath, "dist")
  : path.join(app.getAppPath(), "../ui/dist");
logger.debug(`Setting UI distributable path to ${UI_DIST_PATH}`);

const SERVER_CONFIG = configFromSources(process.env, {
  VP_UI_PATH: UI_DIST_PATH,
  VP_APP_VERSION: APP_VERSION,
  NODE_ENV: RUNTIME_PROFILE,
});

function handleUnexpectedCriticalError() {
  logger.error("Quitting ViewPoint application due to critical error");
  dialog.showErrorBox(
    "Error occurred",
    "An unexpected error occurred in the IDEXX VetLab Station software. Please contact IDEXX Support for assistance."
  );
  app.quit();
}

const HEAP_ENV_ID = heapEnvId(process.env);
if (HEAP_ENV_ID != null) {
  logger.info(`Using heap environment '${HEAP_ENV_ID}'`);
} else {
  logger.info(`Heap analytics disabled`);
}

async function main() {
  try {
    logger.debug(
      `Starting ViewPoint version ${APP_VERSION} with runtime profile ${RUNTIME_PROFILE}`
    );

    //fix up heap.io responses' CORP headers so the browser allows us to read the contents
    forceCorpHeader(
      /^https:[/][/](?:cdn[.])?heapanalytics.com[/]/,
      "cross-origin",
      session.defaultSession.webRequest
    );

    // Create the browser window to load the UI
    const options = getBrowserWindowOptions();
    logger.debug(
      `Creating browser window with options ${JSON.stringify(options)}`
    );
    const mainWindow = new BrowserWindow(options);

    //configure and start server
    const server = new ViewPointServer(SERVER_CONFIG);
    await server.start();

    // Devs have the option of specifying the UI target URL -- can be useful if wanting to use both the electron functionality plus React hot-reload
    const uiTargetUrl = process.env.VP_UI_URL ?? "http://127.0.0.1:3000";
    logger.debug(`Targeting hosted UI at ${uiTargetUrl}`);

    // Catch critical server errors and exit the app
    server.on("error", (err) => {
      logger.error("Critical ViewPoint server error", err);
      handleUnexpectedCriticalError();
    });

    // Catch shutdown hooks from the server and exit the app
    server.on("shutdown", () => {
      logger.info(
        "ViewPoint Server shutdown event received -- quitting application"
      );
      app.quit();
    });

    // Wait for the VP server to be ready before loading the URL
    server.on("ready", () => {
      logger.info(`VP server ready -- loading UI target ${uiTargetUrl}`);

      mainWindow.loadURL(uiTargetUrl).catch((err) => {
        logger.error(`Error loading the target URL ${uiTargetUrl}`, err);
        handleUnexpectedCriticalError();
      });

      mainWindow.on("close", () => {
        logger.info("main window closed, quitting application");
        app.quit();
      });

      mainWindow.webContents.on("console-message", (ev, level, message) => {
        logger.log(["debug", "info", "warn", "error"][level + 1], message);
      });

      // Listen to on-screen keyboard input events from the browser, translate to proper char codes,
      // and send them back as true input events
      ipcMain.on("kb-input", (event, arg) => {
        const { keyCode, sendChar } = arg;
        mainWindow.webContents.sendInputEvent({ type: "keyDown", keyCode });
        if (sendChar) {
          mainWindow.webContents.sendInputEvent({ type: "char", keyCode });
        }
        mainWindow.webContents.sendInputEvent({ type: "keyUp", keyCode });
      });

      ipcMain.on("beep", () => {
        shell.beep();
      });

      ipcMain.on("shutdown", () => {
        logger.info("shutdown requested by client, quitting application");
        app.quit();
      });
    });

    await writeClientStarted(new Date());
  } catch (err) {
    logger.error("Error starting ViewPoint app", err);
    handleUnexpectedCriticalError();
  }
}

const DEV_OPTIONS: BrowserWindowConstructorOptions = {
  kiosk: false,
  width: 1024,
  height: 768,
};

const PROD_OPTIONS: BrowserWindowConstructorOptions = {
  kiosk: true,
  webPreferences: {
    devTools: envBool(process.env["VP_DEV_TOOLS"]),
  },
};

function getBrowserWindowOptions(): BrowserWindowConstructorOptions {
  const envOptions =
    RUNTIME_PROFILE === "production" ? PROD_OPTIONS : DEV_OPTIONS;
  const additionalArguments = [
    `--VP_APP_VERSION=${app.getVersion()}`,
    `--VP_ENV=${RUNTIME_PROFILE}`,
    `--VP_NO_I18N=${envBool(process.env["VP_NO_I18N"])}`,
    `--VP_HEAP_ENV_ID=${HEAP_ENV_ID}`,
  ];
  return {
    frame: false,
    ...envOptions,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      additionalArguments,
      ...envOptions.webPreferences,
    },
  };
}

// See https://github.com/electron/electron/issues/8725#issuecomment-283600186
app.commandLine.appendSwitch("touch-events", "enabled");
app.on("ready", main);
