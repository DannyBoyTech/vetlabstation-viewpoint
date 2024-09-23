import winston from "winston";

const LogFormatter = winston.format.printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    // print log trace
    return `${timestamp} ${level}: ${message} - ${stack}`;
  }
  return `${timestamp} ${level}: ${message}`;
});

const getLogger = () => {
  // When running in production, logging is configured at the Electron app level
  // to keep client/server logging configurations colocated. If the server is
  // running standalone, just add a console logger.
  if (!winston.loggers.has("server")) {
    winston.loggers.add("server", {
      level: "debug",
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            LogFormatter
          ),
        }),
      ],
    });
  }

  return winston.loggers.get("server");
};

export { getLogger };
