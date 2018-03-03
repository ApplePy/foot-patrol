import { injectable } from "inversify";
import { ISanitizer } from "../interfaces/isanitizer";

/**
 * Class for generic sanitation of strings.
 */
@injectable()
export class Sanitizer implements ISanitizer {
  /**
   * Sanitize a user input string to be safe to work with.
   *
   * @param str { String } The string to sanitize
   * @throws { Error } Thrown if str is not a string.
   * @return { String } The sanitized version of the string.
   */
  public sanitize(str: string) {
    // htmlEscape Source: http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
    if (typeof str !== "string") {
      throw new Error("Input is not a string, is " + typeof str);
    }
    return str
        .replace(/&(?![A-Za-z0-9#]{2,4};)/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\//g, "&#x2F;");
  }
}
