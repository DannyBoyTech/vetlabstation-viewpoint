import type { Response } from "express";

function sendEvent(res: Response, data: string, eventName?: string) {
  let msg = "";

  if (eventName != null) {
    msg += `event: ${eventName}\n`;
  }

  msg += `data: ${data}\n\n`;

  res.write(msg);
  res.flush();
}

export { sendEvent };
