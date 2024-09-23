import { rest } from "msw";
import { setupServer } from "msw/node";

export const handlers = [
  rest.get("*/device/status", (req, res, ctx) => {
    return res(ctx.json([]));
  }),
];

export const server = setupServer(...handlers);
