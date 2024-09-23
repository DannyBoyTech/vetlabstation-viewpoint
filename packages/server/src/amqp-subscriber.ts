import amqp, { Connection, Channel } from "amqplib";
import { getLogger } from "./logger";

type MessageHandler = (msg: amqp.ConsumeMessage) => void;
type ExchangeHandlers = { [exchange: string]: MessageHandler };

interface Options {
  exchangeHandlers?: ExchangeHandlers;
  username?: string | undefined;
  password?: string | undefined;
  heartBeat?: number | undefined;
}

const logger = getLogger();

class Subscriber {
  private _connected: boolean = false;
  private brokerUrl: string;
  private exchangeHandlers: ExchangeHandlers = {};
  private conn?: Connection;
  private rcvChan?: Channel;
  private connecting: boolean = false;
  private readonly username?: string | undefined;
  private readonly password?: string | undefined;
  private readonly heartBeat?: number | undefined;

  constructor(brokerUrl: string, options?: Options) {
    this.brokerUrl = brokerUrl;
    this.setExchangeHandlers(options?.exchangeHandlers ?? {});
    this.username = options?.username;
    this.password = options?.password;
    this.heartBeat = options?.heartBeat;
  }

  restartAfterMillis(millis: number) {
    setTimeout(async () => {
      try {
        await this.start();
      } catch (err) {
        logger.error("couldn't close subscriber (already closed?)", err);
      }
    }, millis);
  }

  async start() {
    if (this.connecting) return;

    this.connecting = true;

    try {
      const url = new URL(this.brokerUrl);
      this.conn = await amqp.connect({
        username: this.username,
        password: this.password,
        hostname: url.hostname,
        port: parseInt(url.port),
        protocol: url.protocol.replace(":", ""),
        heartbeat: this.heartBeat,
      });
      logger.info(`connected to ${this.brokerUrl}`);

      this.conn.on("error", (err) => {
        logger.warn(`connection error: ${err}`);
        this.restartAfterMillis(1000);
      });

      this.conn.on("close", (err) => {
        if (err) {
          logger.warn(`unexpected connection close: ${err}`);
          this._connected = false;
          this.restartAfterMillis(1000);
        }
      });

      this.rcvChan = await this.conn.createChannel();
      logger.info(`channel established`);

      this.rcvChan.on("error", (err) => {
        logger.warn(`channel error: ${err}`);
        this._connected = false;
        this.restartAfterMillis(1000);
      });

      await this.resubscribe();
      this._connected = true;
    } catch (e) {
      logger.warn("Error starting AMQP subscriber", e);
      this.restartAfterMillis(1000);
    } finally {
      this.connecting = false;
    }
  }

  setExchangeHandlers(exchangeHandlers: ExchangeHandlers) {
    Object.assign(this.exchangeHandlers, exchangeHandlers);
  }

  async resubscribe() {
    try {
      if (this.rcvChan) {
        const subs = Object.entries(this.exchangeHandlers).map(([exchange, handler]) =>
          bindTempQueueAndConsume(this.rcvChan!, exchange, "fanout", true, handler)
        );

        await Promise.all(subs);

        logger.info("subscriptions established");
      } else {
        logger.warn("channel is not established");
      }
    } catch (e) {
      logger.warn(`subscription failed ${e}`);
    }
  }

  async close() {
    await this.conn?.close();
  }

  get connected() {
    return this._connected;
  }
}

async function bindTempQueueAndConsume(
  chan: Channel,
  exchange: string,
  exchangeType: string,
  durableExchange: boolean,
  fn: (msg: any) => void
): Promise<string> {
  const exchOk = await chan.assertExchange(exchange, exchangeType, {
    durable: durableExchange,
  });

  const qRes = await chan.assertQueue("", {
    exclusive: true,
    autoDelete: true,
  });

  await chan.bindQueue(qRes.queue, exchOk.exchange, "");

  const consumeRes = await chan.consume(qRes.queue, fn);

  return consumeRes.consumerTag;
}

export default Subscriber;
export { Options, Subscriber, MessageHandler };
