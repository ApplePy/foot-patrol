import { inject, injectable } from "inversify";
import { IFACES } from "../ids";
import { IRequestsManager } from "../interfaces/irequests-manager";
import { ISQLService } from "../interfaces/isql-service";
import { TravelRequest } from "../models/travel-request";
import { SQLAbstractManager } from "./sql-abstract-manager";

/**
 * Data manager for handling retrieving requested data from multiple possible persistence layers.
 *
 * This class expects inputs to have already been sanitized and/or limited.
 */
@injectable()
export class SQLRequestsManager extends SQLAbstractManager implements IRequestsManager {

  private db: ISQLService;

  /**
   * Constructor.
   *
   * @param db The SQL database implementation to use.
   */
  constructor(@inject(IFACES.ISQLSERVICE) db: ISQLService) {
    super();

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
    .then((val) => new TravelRequest(val));
  }

  /**
   * Get a list of requests from the backend.
   *
   * Defaults to returning archived results.
   *
   * @param offset Number >= 0 of results to skip before returning results.
   * @param count  Number >= 0 results to return.
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND". Parameters cannot equal null.
   */
  public getRequests(offset: number, count: number, filter?: Map<string, any>) {
    // Sanity check
    if (offset < 0 || count < 0) {
        return Promise.reject(new Error("Invalid getRequests input"));
    }

    // Get filter array
    const filterArray = (filter !== undefined) ? Array.from(filter.values()) : [];
    const questionMarks = this.generateQuestionMarks((filter !== undefined) ? filter.keys() : [], " AND ");

    // Query for data
    return this.db.makeQuery(
      `SELECT * FROM \`requests\`${(questionMarks.length > 0) ? " WHERE " : ""}${questionMarks} ORDER BY \`timestamp\` DESC LIMIT ?, ?`,
      [...filterArray, offset, count])
    .then((requests) => requests.map((x: any) => new TravelRequest(x)) as TravelRequest[]);
  }

  /**
   * Create a new request. Returns new ID.
   *
   * @param request The new travel request to store.
   */
  public createRequest(req: TravelRequest) {
    // Sanity check
    if (!req.Valid()) {
      return Promise.reject("Requesting save of invalid TravelRequest");
    }

    return this.db.makeQuery(
      "INSERT INTO `requests` (name, from_location, to_location, additional_info, status, pairing) VALUES(?,?,?,?,?,?)",
      [req.name, req.from_location, req.to_location, req.additional_info, req.status, req.pairing])
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
      "status",
      "pairing",
      "archived"]
  ) {

    // Create a map containing only the keys to update
    const infoDict = new Map<string, any>();
    for (const column of columnUpdate) {
      infoDict.set(column, (request as any)[column]);
    }
    // Create the components of the dynamic SQL query
    const filterArray = Array.from(infoDict.values());
    const questionMarks = this.generateQuestionMarks(infoDict.keys());

    // DB execute
    if (questionMarks.length === 0) {
      return Promise.resolve();
    }

    return this.db.makeQuery(`UPDATE \`requests\` SET ${questionMarks} WHERE id=?`,
    [...filterArray, request.id])
    .then((result) => (result.affectedRows > 0) ?
                      Promise.resolve() :
                      Promise.reject(new Error("Not Found")));
  }
}
