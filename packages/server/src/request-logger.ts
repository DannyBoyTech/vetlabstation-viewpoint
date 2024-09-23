import morgan from "morgan";
import { getLogger } from "./logger";

const getRequestLogger = () => {
  const logger = getLogger();

  return morgan("short", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  });
};

export { getRequestLogger };
