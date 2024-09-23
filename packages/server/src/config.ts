import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";

dotenvExpand.expand(dotenv.config({ path: process.env["DOTENV_CONFIG_PATH"] as string }));

type Environment = "development" | "production";

export interface Config {
  HOST: string;
  PORT: number;
  UPSTREAM_REQ_URL: URL;
  UPSTREAM_JACKALOPE_URL: URL;
  UPSTREAM_PRINT_URL: URL;
  BROKER_URL: string;
  VP_UI_PATH: string;
  ENVIRONMENT: Environment;
  AMQP_USERNAME?: string | undefined;
  AMQP_PASSWORD?: string | undefined;
  VP_APP_VERSION?: string | undefined;
}

const defaultConfig: Config = {
  HOST: "127.0.0.1",
  PORT: 3000,
  UPSTREAM_REQ_URL: new URL("http://127.0.0.1:50042"),
  UPSTREAM_JACKALOPE_URL: new URL("http://127.0.0.1:50044"),
  UPSTREAM_PRINT_URL: new URL("http://127.0.0.1:50050"),
  BROKER_URL: "amqp://127.0.0.1",
  VP_UI_PATH: path.join(__dirname, "../../ui/dist"),
  ENVIRONMENT: "development",
};

function isString(val: any): boolean {
  return typeof val === "string";
}

function mergeConfigs(...configs: Record<string, string | undefined>[]): Record<string, string | undefined> {
  return configs.reduce((acc, config) => {
    Object.assign(acc, config);
    return acc;
  }, {});
}

function extractConfig(config: Record<string, string | undefined>): Config {
  return {
    HOST: config["HOST"] || defaultConfig.HOST,
    PORT: Number(config["PORT"]) || defaultConfig.PORT,
    BROKER_URL: config["BROKER_URL"] || defaultConfig.BROKER_URL,
    UPSTREAM_REQ_URL: isString(config["UPSTREAM_REQ_URL"])
      ? new URL(config["UPSTREAM_REQ_URL"]!)
      : defaultConfig.UPSTREAM_REQ_URL,
    UPSTREAM_JACKALOPE_URL: isString(config["UPSTREAM_JACKALOPE_URL"])
      ? new URL(config["UPSTREAM_JACKALOPE_URL"]!)
      : defaultConfig.UPSTREAM_JACKALOPE_URL,
    UPSTREAM_PRINT_URL: isString(config["UPSTREAM_PRINT_URL"])
      ? new URL(config["UPSTREAM_PRINT_URL"]!)
      : defaultConfig.UPSTREAM_PRINT_URL,
    AMQP_USERNAME: config["AMQP_USERNAME"],
    AMQP_PASSWORD: config["AMQP_PASSWORD"],
    VP_UI_PATH: config["VP_UI_PATH"] ?? defaultConfig.VP_UI_PATH,
    VP_APP_VERSION: config["VP_APP_VERSION"],
    ENVIRONMENT: (config["NODE_ENV"] as Environment) ?? config["ENVIRONMENT"] ?? defaultConfig.ENVIRONMENT,
  };
}

export function configFromSources(...sources: Record<string, string | undefined>[]): Config {
  return extractConfig(mergeConfigs(...sources));
}
