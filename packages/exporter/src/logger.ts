import winston from "winston";

const LogFormatter = winston.format.printf(
  ({ level, message, timestamp, stack }) => {
    if (stack) {
      // print log trace
      return `${timestamp} ${level}: ${message} - ${stack}`;
    }
    return `${timestamp} ${level}: ${message}`;
  }
);

winston.loggers.add("logger", {
  level: "debug",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        process.env["CI"] === "true" || process.env["NODE_ENV"] === "production"
          ? winston.format.uncolorize()
          : winston.format.colorize(),
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        LogFormatter
      ),
    }),
  ],
});

export const LOGGER = winston.loggers.get("logger");
