import { parseArgs, type ParseArgsConfig } from "node:util";

function parseArgsExtended<T extends ParseArgsConfig>(config: T) {
  const result = parseArgs(config);
  return { ...result, helpOutput: generateHelpOutput<T>(config) };
}

function generateHelpOutput<T extends ParseArgsConfig>(config: T): string {
  let helpOutput = `\nViewPoint content export tool v${process.env["npm_package_version"]}\n\n`;
  const collectedOptions = Object.entries(config.options ?? {}).map(
    ([longOption, option]) => ({
      ...option,
      longOption,
    })
  );

  for (const option of collectedOptions.filter((o) => (o as any).positional)) {
    const description =
      (option as unknown as { description: string })?.description ?? "";
    helpOutput += `  ${option.longOption}: ${description}\n`;
  }

  helpOutput += "\n";

  for (const option of collectedOptions.filter((o) => !(o as any).positional)) {
    const short = option?.short ? `-${option.short}, ` : "";
    const description =
      (option as unknown as { description: string })?.description ?? "";
    helpOutput += `  ${short}--${option.longOption}: ${description}\n`;
  }

  return helpOutput;
}

export function getCliArgs() {
  return parseArgsExtended({
    options: {
      "delete-confluence-attachments": {
        type: "boolean",
        positional: true,
        description:
          "Used to delete all attachments from a given Confluence page",
      },
      output: {
        type: "string",
        short: "o",
        default: "local",
        description:
          "The type of output to use, either 'confluence' to publish to Confluence or 'local' to write raw HTML output to the local filesystem",
      },
      type: {
        type: "string",
        short: "t",
        description:
          "The type of export to process. Currently only 'alerts' is supported",
      },
      contentRoot: {
        type: "string",
        short: "c",
        description: "The path to the content to export",
      },
      space: {
        type: "string",
        short: "s",
        description: "The Confluence space to use for the export",
      },
      page: {
        type: "string",
        short: "p",
        description: "The name of the page to update or create",
      },
      parentPage: {
        type: "string",
        description:
          "(Optional) The name of the parent page to create the new page under",
      },
      buildUrl: {
        type: "string",
        description: "(Optional) URL to the build that generated this export",
      },
      skipImages: {
        type: "boolean",
        description:
          "(Optional) If true, will skip generating image assets for the output",
      },
      help: {
        type: "boolean",
        description: "Print help output",
      },
    },
    allowPositionals: true,
  });
}
