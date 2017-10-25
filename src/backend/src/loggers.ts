import * as express from "express";
import { StatusError } from "./status_error";

/**
 * Collection of error middleware for logging and responding to user.
 * @class ErrorMiddleware
 */
export class ErrorMiddleware {

  /**
   * Base error middleware to catch all cases.
   *
   * @class ErrorMiddleware
   * @method fallback
   */
  public static fallback(
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) {
    if (process.env.NODE_ENV === "development") {
      // Send the error in development mode
      res.status(500).send({ error: err.name, message: err.message, stack: err.stack });
    } else {
      // Send something generic in production
      res.status(500).send({ error: err.name, message: "Undefined error occurred." });
    }
  }

  /**
   * Spits out error to console.
   *
   * @class ErrorMiddleware
   * @method log
   */
  public static log(
    err: Error | StatusError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) {
    // TODO: Better logging
    console.error(err.name);
    console.error(err.message);

    // Turn on stack traces in development mode
    if (process.env.NODE_ENV === "development") {
      console.error(err.stack);
    }

    next(err);
  }

  /**
   * Processes StatusError errors to respond to user.
   *
   * @class ErrorMiddleware
   * @method log
   */
  public static statusReport(
    err: Error | StatusError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) {
    if (err instanceof StatusError) {
      const error: any = { error: err.name, message: err.message };

      // Add the stack trace in development mode
      if (process.env.NODE_ENV === "development") {
        error.stack = err.stack;
      }

      res.status(err.status).send(error);
    } else {  // Not a StatusError, fallback logger.
      next(err);
    }
  }
}
