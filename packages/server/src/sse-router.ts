import { Response, Router, RouterOptions } from "express";
import { randomUUID } from "crypto";
import { sendEvent } from "./sse";

interface SSEListener {
  id: string;
  notify: (data: string, eventName?: string) => void;
  close: () => void;
}

function createListener(res: Response): SSEListener {
  return {
    id: randomUUID(),
    notify: (data: string, eventName?: string) => sendEvent(res, data, eventName),
    close: () => res.end(),
  };
}

interface ISSENotifier {
  notifyListeners(data: string, eventName?: string): void;
  registerListener(listener: SSEListener): void;
  deregisterListener(listener: SSEListener): void;
  allListeners(): SSEListener[];
  deregisterAllListeners(): void;
}

class SSENotifier {
  private listeners: Record<string, SSEListener> = {};

  registerListener(l: SSEListener) {
    this.listeners[l.id] = l;
  }

  deregisterListener(l: SSEListener) {
    delete this.listeners[l.id];
  }

  allListeners() {
    return Object.values(this.listeners);
  }

  deregisterAllListeners() {
    this.allListeners().forEach(this.deregisterListener);
  }

  notifyListeners(data: string, eventName?: string) {
    this.allListeners().forEach((listener) => {
      listener.notify(data, eventName);
    });
  }
}

function SSERouter(options?: RouterOptions): [router: Router, notifier: SSENotifier] {
  const router = Router(options);
  const notifier = new SSENotifier();

  router.get("/", async (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Content-type", "text/event-stream");
    res.flushHeaders();

    const listener = createListener(res);
    notifier.registerListener(listener);

    res.on("close", () => {
      notifier.deregisterListener(listener);
      listener.close();
    });
  });

  return [router, notifier];
}

export { ISSENotifier, SSERouter };
