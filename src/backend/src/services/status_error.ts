import { inherits } from "util";

/**
 * Extended Error to supply a HTTP status code.
 */
export class StatusError extends Error {
  public status: number;
  public name: string;
  public message: string;

  /**
   * Constructor
   * @param status The HTTP Status Code to use.
   * @param title The title of the error.
   * @param message Details about the error
   */
  constructor(status: number, title: string = "", message: string = "") {
    super();
    this.status = status;
    this.name = (title.replace(/\s/g, ""));
    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Inform Node that this is an error class
inherits(StatusError, Error);
