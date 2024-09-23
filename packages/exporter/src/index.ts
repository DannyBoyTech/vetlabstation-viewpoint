import { LocalOutput, type OutputWriter } from "./outputs/outputs";
import { parseAlerts } from "./parsers/alerts/alert-parser";
import { LOGGER } from "./logger";
import { ConfluenceOutput } from "./outputs/confluence/confluence-output";
import { getCliArgs } from "./util/cli-utils";

async function run() {
  const start = Date.now();
  const { values, positionals, helpOutput } = getCliArgs();
  LOGGER.debug(
    `Running export with command line values ${JSON.stringify(
      values
    )}, ${JSON.stringify(positionals)}`
  );

  // Positional commands
  if (positionals.includes("delete-confluence-attachments")) {
    if (values.page == null) {
      LOGGER.error("--page (p) is required when deleting attachments");
      process.exit(1);
    }
    await handleDeleteAttachments(values.parentPage, values.page, values.space);
  }

  if (values.help) {
    console.log(helpOutput);
    process.exit(0);
  }

  // Primary workflow
  if (values.output == null) {
    LOGGER.error("--output/(-o) arg is required");
    process.exit(1);
  }
  if (values.type == null) {
    LOGGER.error("--type/(-t) arg is required");
    process.exit(1);
  }
  if (values.contentRoot == null) {
    LOGGER.error("'--contentRoot/(-c)' arg is required");
    process.exit(1);
  }
  if (values.page == null) {
    LOGGER.error("'--page/(-p)' arg is required");
    process.exit(1);
  }

  const output = getOutput(values.output, values.space);

  switch (values.type?.toLowerCase()) {
    case "alerts":
      await parseAlerts({
        output,
        pageName: values.page,
        rootPath: values.contentRoot,
        parentPageName: values.parentPage,
        skipImages: values.skipImages,
        buildUrl: values.buildUrl,
      });
      break;
    default:
      throw new Error(`Unknown type '${values.type}'`);
  }

  LOGGER.info(
    `Completed export in ${((Date.now() - start) / 1000).toFixed(2)} seconds`
  );
}

async function handleDeleteAttachments(
  parentPage: string | undefined,
  targetPage: string,
  spaceKey: string | undefined
) {
  LOGGER.warn(`Deleting all attachments in ${targetPage}`);
  const client = getOutput("confluence", spaceKey) as ConfluenceOutput;
  await client.setTargetPage(parentPage, targetPage);
  await client.deleteAllAttachments();
  process.exit(0);
}

function getOutput(output: string, spaceKey: string | undefined): OutputWriter {
  switch (output) {
    case "confluence":
      if (
        !process.env["CONFLUENCE_USER"] ||
        !process.env["CONFLUENCE_API_KEY"] ||
        !process.env["CONFLUENCE_TARGET"]
      ) {
        throw new Error(
          "'CONFLUENCE_TARGET', 'CONFLUENCE_USER' and 'CONFLUENCE_API_KEY' environment variables are required to target the Confluence API"
        );
      }
      return new ConfluenceOutput({
        defaultSpaceKey: spaceKey,
        clientOptions: {
          targetHost: process.env["CONFLUENCE_TARGET"],
          user: process.env["CONFLUENCE_USER"],
          apiKey: process.env["CONFLUENCE_API_KEY"],
        },
      });
    case "local":
      return new LocalOutput();
    default:
      throw new Error(`Unknown output type ${output}`);
  }
}

run().catch((err) => LOGGER.error("", err));
