import { inherits } from "util";

/**
 * Extended Error to supply a HTTP status code.
 */
export class StatusError extends Error {
  public status: number;
  public name: string;
  public message: string;

  constructor(status: number, title: string, message: string) {
    super();
    this.status = status;
    this.name = title;
    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

inherits(StatusError, Error);
