import EventEmitter from "node:events";

export class EventForwarder {
  private emitter: EventEmitter;
  private task: Cypress.Tasks;
  public on: Cypress.PluginEvents;

  public constructor() {
    this.emitter = new EventEmitter();
    this.task = {};
    this.on = (action: string, arg: any) => {
      if (action === "task") {
        Object.assign(this.task, arg);
      } else {
        this.emitter.on(action, arg as () => void);
      }
    };
  }

  public forward(on: Cypress.PluginEvents): void {
    for (const event of this.emitter.eventNames()) {
      on(event as any, (...args: unknown[]) => {
        for (const listener of this.emitter.listeners(event)) {
          listener(...args);
        }
      });
    }
    on("task", this.task);
  }
}
