import type { RequestHandler } from "express";

type AsyncRequestHandler = (...params: Parameters<RequestHandler>) => Promise<ReturnType<RequestHandler>>;

/**
 * Wraps an async express handler so that it passes errors correctly on to
 * express.
 *
 * This prevents unhandled promise rejections originating in the handler stack
 * from crashing the server.
 * @param handler
 * @returns
 */
function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch((e) => next(e));
  };
}

export { asyncHandler };
