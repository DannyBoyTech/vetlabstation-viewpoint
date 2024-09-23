#!/usr/bin/env node

import { createApp } from "./express-app";
import { getLogger } from "./logger";
import { Subscriber } from "./amqp-subscriber";
import { EventEmitter } from "events";
import type { IncomingMessage, Server, ServerResponse } from "http";
import { configFromSources, type Config } from "./config";
import type { Logger } from "winston";

export { configFromSources, type Config, getLogger };

export class ViewPointServer extends EventEmitter {
  readonly logger: Logger;
  private config: Config;
  private amqpSubscriber: Subscriber;
  private server?: Server<typeof IncomingMessage, typeof ServerResponse>;

  constructor(config: Config) {
    super();
    this.config = config;
    this.logger = getLogger();
    this.amqpSubscriber = new Subscriber(this.config.BROKER_URL, {
      username: this.config.AMQP_USERNAME,
      password: this.config.AMQP_PASSWORD,
      heartBeat: 10,
    });
    this.registerShutdownHooks();
  }

  async start() {
    const mode = this.config.ENVIRONMENT;

    const app = await createApp(this.config, this.amqpSubscriber);

    await this.amqpSubscriber?.start();

    this.server = app.listen(this.config.PORT, this.config.HOST, () => {
      this.logger.info(`server started on ${this.config.HOST}:${this.config.PORT} in '${mode}' mode`);
      this.emit("ready");
    });
  }

  async stop() {
    if (this.server) {
      this.server.close(() => {
        this.logger.info(`server stopped`);
      });
    }
    try {
      await this.amqpSubscriber.close();
    } catch (err) {
      this.logger.error("error closing amqp subscriber", err);
    }
  }

  registerShutdownHooks() {
    const logErrorAndEmit = async (err: Error) => {
      this.logger.error("Critical error", err);
      await this.stop();
      this.emit("error", err);
    };

    const emitShutdown = async () => {
      await this.stop();
      this.emit("shutdown");
    };

    process.on("uncaughtException", logErrorAndEmit);
    process.on("unhandledRejection", logErrorAndEmit);

    process.on("exit", emitShutdown);
    process.on("SIGINT", emitShutdown);
    process.on("SIGUSR1", emitShutdown);
    process.on("SIGUSR2", emitShutdown);
  }
}
