export class ErrorString {
  public Title: string;
  public Msg: string;

  public constructor(title: string, msg: string) {
    this.Title = title;
    this.Msg = msg;
  }
}

export default {
  InvalidQueryParameter: new ErrorString(
    "Invalid Query Parameter",
    "A required query parameter is missing or out of range."),
  InvalidURLParameter: new ErrorString(
    "Invalid URL Parameter",
    "A required URL parameter is missing our out of range"),
  InvalidBodyParameter: new ErrorString(
    "Invalid Body Parameter",
    "A required body parameter is missing or out of range."),
  NonUniqueParameter: new ErrorString(
    "Non-Unique Parameter",
    "Parameters that were required to be unique were found to be the same."),
  InternalServerError: new ErrorString(
    "Internal Server Error",
    "An error has occurred."),
  NotFoundError: new ErrorString(
    "Not Found Error",
    "The requested data was not found.")
};
