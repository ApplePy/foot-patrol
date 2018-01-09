import { inject, injectable } from "inversify";
import { IFACES } from "../ids";
import { TravelRequest } from "../models/travel_request";
import { IRequestsManager } from "./irequests_manager";
import { ISQLService } from "./isqlservice";

/**
 * Data manager for handling retrieving requested data from multiple possible persistence layers.
 *
 * This class expects inputs to have already been sanitized and/or limited.
 */
@injectable()
export class SQLRequestsManager implements IRequestsManager {

  private db: ISQLService;

  /**
   * Constructor.
   *
   * @param db The SQL database implementation to use.
   */
  constructor(@inject(IFACES.ISQLSERVICE) db: ISQLService) {
    // Save db
    this.db = db;
  }

  /**
   * Get a request from the backend.
   *
   * @param id The id of the user to get
   */
  public getRequest(id: number) {
    // Make DB request
    return this.db.makeQuery("SELECT * FROM `requests` WHERE id=?", [id])
    // Ensure data was returned
    .then((request) => (request.length > 0) ? request[0] : Promise.reject(new Error("Not Found")))
    // Convert to appropriate format and return
    .then((val) => TravelRequest.convertToTravelRequest(val));
  }

  /**
   * Get a list of requests from the backend.
   *
   * Defaults to returning archived results.
   *
   * @param offset Number >= 0 of results to skip before returning results.
   * @param count  Number >= 0 results to return.
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND"
   */
  public getRequests(offset: number, count: number, filter?: Map<string, any>) {
    // Sanity check
    if (offset < 0 || count < 0) {
        return Promise.reject(new Error("Invalid getRequests input"));
    }

    // Get filter array
    const filterArray = (filter !== undefined) ? this.convertFilterDictToArray(filter) : [];
    const questionMarks = this.generateQuestionMarks(filterArray.length / 2);

    // Query for data
    return this.db.makeQuery(`SELECT * FROM \`requests\` WHERE ${questionMarks} LIMIT ?, ?`,
                             [...filterArray, offset, count])
    .then((requests) => requests.map((x) => TravelRequest.convertToTravelRequest(requests)) as TravelRequest[]);
  }

  /**
   * Create a new request. Returns new ID.
   *
   * @param request The new travel request to store.
   */
  public createRequest(req: TravelRequest) {
    return this.db.makeQuery(
      "INSERT INTO `requests` (name, from_location, to_location, additional_info) VALUES(?,?,?,?)",
      [req.name, req.from_location, req.to_location, req.additional_info])
    .then((results: any) => results.insertId as number);
  }

  /**
   * Delete a request
   *
   * @param id The id to delete
   */
  public deleteRequest(id: number) {
    return this.db.makeQuery("DELETE FROM `requests` WHERE id=?", [id])
    .then((result) => (result.affectedRows > 0) ?
                      Promise.resolve() :
                      Promise.reject(new Error("Not Found")));
  }

  /**
   * Update a travel request with new information.
   *
   * @param request The request to be updated.
   * @param columnUpdate [Optional] Update only specific columns.
   */
  public updateRequest(
    request: TravelRequest,
    columnUpdate: string[] = [
      "name",
      "from_location",
      "to_location",
      "additional_info",
      "archived"]
  ) {

    // Create a map containing only the keys to update
    const infoDict = new Map<string, any>();
    for (const column of columnUpdate) {
      infoDict.set(column, (request as any)[column]);
    }
    // Create the components of the dynamic SQL query
    const filterArray = this.convertFilterDictToArray(infoDict);
    const questionMarks = this.generateQuestionMarks(filterArray.length / 2);

    // DB execute
    return this.db.makeQuery(`UPDATE \`requests\` SET ${questionMarks}`, filterArray)
    .then((result) => (result.affectedRows > 0) ?
                      Promise.resolve() :
                      Promise.reject(new Error("Not Found")));
  }

  /**
   * Converts a flat K-V filter dictionary to an array suitable for SQL prepare.
   *
   * @param filterDict The dictionary to convert.
   */
  private convertFilterDictToArray(filterDict: Map<string, any>) {
    // Sanity check
    if (typeof filterDict !== "object") {
      throw new Error("Invalid Filter Dictionary");
    }

    const filterArray = [];

    // Get the filter array to be [key, value, key, value] etc.
    for (const [key, value] of filterDict) {
        filterArray.push(key);
        filterArray.push(value);
    }

    return filterArray;
  }

  /**
   * Generate strings of "?=?, ?=?, ..." for SQL prepared statements
   *
   * @param pairs The number of "?=?" pairs to create
   */
  private generateQuestionMarks(pairs: number) {
    // Sanity check
    if (pairs < 0) {
      throw new Error("Invalid Pair Count");
    }

    let questionMarks = "";

    // Create the question marks for the prepared statement
    for (let i = 0; i < pairs; i++) {
      questionMarks = questionMarks.concat("?=?, ");
    }
    questionMarks = questionMarks.substring(0, questionMarks.length - 2); // Chop off the trailing ', '

    return questionMarks;
  }
}
