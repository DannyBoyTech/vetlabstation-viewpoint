import { Client, Message } from "@stomp/stompjs";
import EventEmitter from "events";
import { AmqpEventType, AmqpMappings } from "./AmqpUtils";
import { EventId } from "@viewpoint/api";

const domParser = new DOMParser();

export interface IvlsStompClientProps {
  brokerUrl: string;
  login: string;
  passcode: string;
}

export class IvlsStompClient extends EventEmitter {
  client: Client;
  protected exchanges: string[] = [];

  constructor(props: IvlsStompClientProps) {
    super();
    this.client = new Client({
      brokerURL: props.brokerUrl,
      onConnect: this._onConnect.bind(this),
      onDisconnect: this._onDisconnect.bind(this),
      connectHeaders: {
        login: props.login,
        passcode: props.passcode,
      },
      onUnhandledMessage: (msg) =>
        console.log(`Unhandled message: \n${msg.body}`),
    });
  }

  public on(
    event: EventId,
    listener: (topic: string, payload: any) => void
  ): this;

  on(event: any, listener: any): this {
    return super.on(event, listener);
  }

  connect(exchanges?: string[]) {
    if (!this.client.connected) {
      console.log("Connecting to IVLS STOMP...");
      if (exchanges) {
        this.exchanges = exchanges;
      }
      this.client.activate();
    }
  }

  subscribeToExchange(exchange: string) {
    console.log(`Subscribing to IVLS exchange ${exchange}`);
    this.client.subscribe(exchange, this.onMessage.bind(this));
  }

  async disconnect() {
    if (this.client.connected) {
      console.log("Disconnecting from IVLS STOMP...");
      return this.client.deactivate();
    }
  }

  protected onMessage(message: Message) {
    try {
      const parsed = domParser.parseFromString(message.body, "text/xml");
      const messageType: AmqpEventType = parsed.getRootNode().firstChild
        ?.nodeName as AmqpEventType;
      if (messageType && !!AmqpMappings[messageType]) {
        // TODO -- if components are going to subscribe to these events and use the payload, the payload should probably be converted to an object instead of XML string so we don't leak IVLS domain stuff into the app
        AmqpMappings[messageType]?.forEach((viewpointEvent) =>
          this.emit(viewpointEvent, message.body)
        );
      } else {
        console.warn(`Unknown AMQP message type: \n${messageType}`);
      }
    } catch (err) {
      console.error(`Error processing message ${message.body}`, err);
    }
  }

  protected _onConnect() {
    console.log("Connected to IVLS STOMP");
    this.exchanges.forEach((exchange) => this.subscribeToExchange(exchange));
  }

  protected _onDisconnect() {
    console.log("Disconnected from IVLS STOMP");
  }
}
