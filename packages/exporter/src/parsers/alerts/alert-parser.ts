import type { OutputWriter } from "../../outputs/outputs";
import fs from "fs";
import path from "path";
import { type CheerioAPI, load as cheerio } from "cheerio";
import { LOGGER } from "../../logger";

export interface AlertParserOptions {
  output: OutputWriter;
  pageName: string;
  rootPath: string;
  parentPageName?: string;
  skipImages?: boolean;
  buildUrl?: string;
}

export async function parseAlerts(opts: AlertParserOptions) {
  LOGGER.info(`Parsing alerts from ${opts.rootPath}`);
  const $ = cheerio("", { recognizeSelfClosing: true });
  await opts.output.setTargetPage(opts.parentPageName, opts.pageName);
  const instrumentListPath = path.join(opts.rootPath, "instruments.json");
  const instrumentTypes: string[] = [];

  if (!fs.existsSync(instrumentListPath)) {
    LOGGER.warn(
      "No instrument list found at root of content directory -- attempting to iterate through directories as they are"
    );
    instrumentTypes.push(...fs.readdirSync(opts.rootPath));
  } else {
    const instrumentNames: string[] = JSON.parse(
      fs.readFileSync(instrumentListPath).toString()
    );
    instrumentTypes.push(...instrumentNames);
  }

  LOGGER.debug("Iterating through instruments in order: ", instrumentTypes);
  for (const instrumentType of instrumentTypes) {
    const instrumentFolder = path.join(opts.rootPath, instrumentType);
    await buildAlertsTableForInstrument(
      $,
      opts.output,
      instrumentType,
      instrumentFolder,
      opts.skipImages
    );
  }

  $("body").prepend(
    await opts.output.createTableOfContentsElement(opts.buildUrl)
  );

  await opts.output.updatePage(opts.pageName, opts.pageName, $.html());
}

async function buildAlertsTableForInstrument(
  $: CheerioAPI,
  output: OutputWriter,
  instrumentType: string,
  instrumentFolder: string,
  skipImages?: boolean
) {
  if (!fs.existsSync(instrumentFolder)) {
    LOGGER.warn(`No instrument folder for instrument type ${instrumentType}`);
    return;
  }
  if (fs.lstatSync(instrumentFolder).isDirectory()) {
    LOGGER.info(`Parsing alerts for ${instrumentType} in ${instrumentFolder}`);

    const metadataFile = path.join(instrumentFolder, "metadata.json");
    if (fs.existsSync(metadataFile)) {
      const metadata: InstrumentMetadata = JSON.parse(
        fs.readFileSync(metadataFile).toString()
      );

      const tableElement = await output.createTableElement(
        metadata.instrumentName,
        [
          "Alert",
          "Primary Title",
          "Secondary Title",
          "Alert Content",
          "Buttons",
          "Screenshot",
        ],
        {
          bodyId: `${instrumentType}-table-body`,
        }
      );
      $("body").append(tableElement);

      for (const alertName of metadata.alerts) {
        const metadataFilePath = path.join(
          instrumentFolder,
          `${alertName}.json`
        );
        const screenshotFilePath = path.join(
          instrumentFolder,
          `${alertName}.png`
        );
        // Parse the JSON alert details
        const alertDetails: AlertMetadata = JSON.parse(
          fs.readFileSync(metadataFilePath).toString()
        );
        await processAlert(
          $,
          output,
          instrumentType,
          alertName,
          alertDetails,
          screenshotFilePath,
          skipImages
        );
      }
    } else {
      LOGGER.warn(
        `Unable to locate metadata file for ${instrumentType} -- skipping`
      );
    }
  } else {
    LOGGER.warn(`Skipping non-directory ${instrumentFolder}`);
  }
}

async function processAlert(
  $: CheerioAPI,
  output: OutputWriter,
  instrumentType: string,
  alertName: string,
  alertDetails: AlertMetadata,
  screenshotLocalPath: string,
  skipImages?: boolean
) {
  LOGGER.debug(
    `Processing alert ${alertName} for instrument ${instrumentType}`
  );
  const rowId = `alert-row-${instrumentType}-${alertName}`;
  $(`#${instrumentType}-table-body`).append(
    await output.createTableRowElement({ rowId })
  );
  const alertRow = $(`#${rowId}`);
  alertRow.append(await output.createTableCellElement(alertName));
  alertRow.append(
    await output.createTableCellElement(alertDetails.primaryTitle)
  );
  alertRow.append(
    await output.createTableCellElement(alertDetails.secondaryTitle)
  );
  alertRow.append(await output.createTableCellElement(alertDetails.body));
  alertRow.append(
    await output.createTableCellElement(alertDetails.buttons.join(", "))
  );

  const screenshotCell = $(await output.createTableCellElement("")).appendTo(
    alertRow
  );
  if (!skipImages && fs.existsSync(screenshotLocalPath)) {
    const imageElement = await output.createImageElement(
      screenshotLocalPath,
      `${instrumentType}_${path.basename(screenshotLocalPath)}`
    );
    screenshotCell.append(imageElement);
  }
}

interface InstrumentMetadata {
  alerts: string[];
  instrumentType: string;
  instrumentName: string;
}

interface AlertMetadata {
  primaryTitle: string;
  secondaryTitle: string;
  body: string;
  buttons: string[];
  instrumentName: string;
}
