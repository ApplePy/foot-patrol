import { injectable } from "inversify";

@injectable()
export abstract class SQLAbstractManager {
  /**
   * Generate strings of "'column name'=?, ..." for SQL prepared statements
   *
   * @param columnNames The names of the columns to use for the prepared sections (must be pre-sanitized)
   * @param separator   [optional] the string to separate the prepared sections
   */
  protected generateQuestionMarks(columnNames: Iterable<string>, separator: string = ", ") {
    let questionMarks = "";

    // Create the question marks for the prepared statement
    for (const name of columnNames) {
      questionMarks = questionMarks.concat(name + "=?" + separator);
    }
    questionMarks = questionMarks.substring(0, questionMarks.length - separator.length); // Chop off the trailing sep

    return questionMarks;
  }
}
