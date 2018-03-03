import { Router } from "express";
import { injectable } from "inversify";
import { StatusError } from "../models/status-error";
import { default as errStrings } from "../strings";

@injectable()
export abstract class AbstractRoute {
  public abstract router: Router;

  get Router(): Router {
    return this.router;
  }

  /**
   * Translate generic errors from data layer into HTTP errors.
   *
   * @param err
   */
  protected translateErrors(err: Error) {
    if (err.message === "Not Found") {
      return new StatusError(404,
        errStrings.NotFoundError.Title,
        errStrings.NotFoundError.Msg);
    } else {
      console.error(err.toString());
      return new StatusError(500,
        errStrings.InternalServerError.Title,
        errStrings.InternalServerError.Msg);
    }
  }

  /**
   * Check if an object is one of a set of valid values.
   *
   * @param subject Object to check.
   * @param valids The allowed valid values.
   */
  protected validValues(subject: any, ...valids: any[]) {
    let valid = false;

    for (const validOption of valids) {
      if (subject === validOption) {
        valid = true;
        break;
      }
    }

    return valid;
  }
}
