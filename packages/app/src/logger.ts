import * as winston from "winston";
import { app } from "electron";
import path from "path";
import "winston-daily-rotate-file";
import { LoggerOptions } from "winston";

const LOG_PATH = app.isPackaged
  ? "/idexx/labstation/logs"
  : path.join(app.getPath("userData"), "logs");

const LogFormatter = winston.format.printf(
  ({ level, message, timestamp, stack, service }) => {
    if (stack) {
      // print log trace
      return `${timestamp} ${service} ${level}: ${message} - ${stack}`;
    }
    return `${timestamp} ${service} ${level}: ${message}`;
  }
);

function getLogTransports(loggerType: "app" | "server" | "client") {
  const transports: LoggerOptions["transports"] = [
    // Console logger
    new winston.transports.Console({
      format: winston.format.combine(
        app.isPackaged
          ? // Don't use color when packaged
            winston.format.uncolorize()
          : winston.format.colorize(),
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        LogFormatter
      ),
    }),
  ];
  if (app.isPackaged) {
    transports.push(
      // JSON file logger
      new winston.transports.DailyRotateFile({
        filename: `${LOG_PATH}/%DATE%/viewpoint-${loggerType}.%DATE%.json`,
        datePattern: "YYYY-MM-DD",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format.errors({ stack: true })
        ),
      }),
      // Traditional log file
      new winston.transports.DailyRotateFile({
        filename: `${LOG_PATH}/%DATE%/viewpoint-${loggerType}.%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          LogFormatter
        ),
      })
    );
  }
  return transports;
}

winston.loggers.add("client", {
  level: "debug",
  transports: getLogTransports("client"),
  defaultMeta: { service: "client" },
});

winston.loggers.add("server", {
  level: "debug",
  transports: getLogTransports("server"),
  defaultMeta: { service: "server" },
});

winston.loggers.add("app", {
  level: "debug",
  transports: getLogTransports("app"),
  defaultMeta: { service: "app" },
});
