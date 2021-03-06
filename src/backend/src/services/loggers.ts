import * as express from "express";
import { StatusError } from "../models/status-error";

/**
 * Collection of error middleware for logging and responding to user.
 */
export class ErrorMiddleware {

  /**
   * Base error middleware to catch all cases.
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
      res.status(500).send({ error: "Server Error", message: "Undefined error occurred." });
    }
  }

  /**
   * Spits out error to console.
   */
  public static log(
    err: Error | StatusError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) {
    // Don't log to console if testing
    if (process.env.NODE_ENV !== "test") {
      // TODO: Better logging
      console.error(err.name);
      console.error(err.message);

      // Turn on stack traces in development mode
      if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
      }
    }

    next(err);
  }

  /**
   * Processes StatusError errors to respond to user.
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
