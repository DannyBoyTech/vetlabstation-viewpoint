type EventListenerCallback = (this: EventSource, event: MessageEvent) => any;

interface QueuedListener {
  type: string;
  listener: any;
  options?: boolean | AddEventListenerOptions;
}

export class QueuingEventSource implements EventSource {
  readonly CLOSED = EventSource.CLOSED;
  readonly CONNECTING = EventSource.CONNECTING;
  readonly OPEN = EventSource.OPEN;
  readonly withCredentials: boolean = this._options?.withCredentials ?? false;

  private _eventSource?: EventSource;
  private _listenerMap: Record<
    string,
    Map<
      EventListenerCallback | EventListenerOrEventListenerObject,
      QueuedListener
    >
  > = {};
  private readonly _url: string | URL;
  private readonly _options?: EventSourceInit;

  get readyState(): number {
    return this._eventSource?.readyState ?? this.CLOSED;
  }

  get url(): string {
    return this._eventSource?.url ?? typeof this._url === "string"
      ? (this._url as string)
      : this._url.toString();
  }

  constructor(url: string | URL, options?: EventSourceInit) {
    this._url = url;
    this._options = options;
  }

  connect() {
    console.log("connecting event source");
    this._eventSource = new EventSource(this._url, this._options);
    this._eventSource.onerror = this._onError;
    for (const key in this._listenerMap) {
      for (const listener of this._listenerMap[key].values()) {
        this.addEventListener(
          listener.type,
          listener.listener,
          listener.options
        );
      }
    }
  }

  addEventListener<K extends keyof EventSourceEventMap>(
    type: K | string,
    listener: EventListenerCallback | EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (this._eventSource != null) {
      this._eventSource.addEventListener(
        type,
        listener as EventListenerCallback,
        options
      );
    }
    if (this._listenerMap[type] == null) {
      this._listenerMap[type] = new Map();
    }
    this._listenerMap[type].set(listener, { type, listener, options });
  }

  removeEventListener<K extends keyof EventSourceEventMap>(
    type: K | string,
    listener: EventListenerCallback | EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (this._eventSource != null) {
      this._eventSource.removeEventListener(
        type,
        listener as EventListenerCallback,
        options
      );
    }
    this._listenerMap[type]?.delete(listener);
    if (this._listenerMap[type]?.size === 0) {
      delete this._listenerMap[type];
    }
  }

  close(): void {
    console.debug("closing event source");
    this._eventSource?.close();
    this._eventSource = undefined;
  }

  dispatchEvent(event: Event): boolean {
    if (this._eventSource == null) {
      throw new Error("Event source is not connected");
    }
    return this._eventSource.dispatchEvent(event);
  }

  private _onError() {
    console.debug(
      `error in event source. current state: ${this._eventSource?.readyState}`
    );
    if (this._eventSource?.readyState === 2) {
      this._eventSource.close();
      setTimeout(this.connect, 1000);
    }
  }

  onerror: ((this: EventSource, ev: Event) => any) | null = null;
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null = null;
  onopen: ((this: EventSource, ev: Event) => any) | null = null;
}

export function getEventSource(url: string | URL, options?: EventSourceInit) {
  return new QueuingEventSource(url, options);
}
