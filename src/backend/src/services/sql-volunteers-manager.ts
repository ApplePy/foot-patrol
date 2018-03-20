import { inject, injectable } from "inversify";
import { IFACES } from "../ids";
import { ISQLService } from "../interfaces/isql-service";
import { IVolunteersManager } from "../interfaces/ivolunteers-manager";
import { Volunteer } from "../models/volunteer";
import { SQLAbstractManager } from "./sql-abstract-manager";

/**
 * Data manager for handling retrieving requested data from multiple possible persistence layers.
 *
 * This class expects inputs to have already been sanitized and/or limited.
 */
@injectable()
export class SQLVolunteersManager extends SQLAbstractManager implements IVolunteersManager {

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
   * Get a volunteer from the backend.
   *
   * @param id The id of the user to get
   */
  public getVolunteer(id: number) {
    // Make DB request
    return this.db.makeQuery("SELECT * FROM `volunteers` WHERE id=?", [id])
    // Ensure data was returned
    .then((volunteers) => (volunteers.length > 0) ? volunteers[0] : Promise.reject(new Error("Not Found")))
    // Convert to appropriate format and return
    .then((val) => new Volunteer(val));
  }

  /**
   * Get a list of volunteers from the backend.
   *
   * Defaults to returning disabled volunteers.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND"
   */
  public getVolunteers(filter?: Map<string, any>) {
    return this.queryVolunteers("volunteers", filter);
  }

  /**
   * Get a list of actively-paired volunteers from the backend.
   *
   * Defaults to returning disabled volunteers.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND"
   */
  public getPairedVolunteers(filter?: Map<string, any>) {
    return this.queryVolunteers("active_volunteers", filter);
  }

  /**
   * Get a list of unpaired volunteers from the backend.
   *
   * Defaults to returning disabled volunteers.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND"
   */
  public getUnpairedVolunteers(filter?: Map<string, any>) {
    return this.queryVolunteers("inactive_volunteers", filter);
  }

  /**
   * Create a new volunteer. Returns new ID.
   *
   * @param volunteer The new volunteer to store.
   */
  public createVolunteer(volunteer: Volunteer) {
    // Sanity check
    if (!volunteer.Valid()) {
      return Promise.reject("Requesting save of invalid Volunteer");
    }

    return this.db.makeQuery(
      "INSERT INTO `volunteers` (uwo_id, first_name, last_name, disabled, latitude, longitude, timestamp) VALUES(?,?,?,?,?,?,?)",
      [volunteer.uwo_id, volunteer.first_name, volunteer.last_name, volunteer.disabled, volunteer.latitude, volunteer.longitude, volunteer.timestamp])
    .then((results: any) => results.insertId as number);
  }

  // NOTE: Not supporting deleting a volunteer due to references from other tables.

  /**
   * Update a volunteer with new information.
   *
   * @param volunteer The volunteer to be updated.
   * @param columnUpdate [Optional] Update only specific columns.
   */
  public updateVolunteer(
    volunteer: Volunteer,
    columnUpdate: string[] = [
      "uwo_id",
      "first_name",
      "last_name",
      "disabled",
      "latitude",
      "longitude",
      "timestamp"
    ]
    ) {

    // Create a map containing only the keys to update
    const infoDict = new Map<string, any>();
    for (const column of columnUpdate) {
      infoDict.set(column, (volunteer as any)[column]);
    }
    // Create the components of the dynamic SQL query
    const filterArray = Array.from(infoDict.values());
    const questionMarks = this.generateQuestionMarks(infoDict.keys());

    // DB execute
    if (questionMarks.length === 0) {
      return Promise.resolve();
    }

    return this.db.makeQuery(`UPDATE \`volunteers\` SET ${questionMarks} WHERE id=?`,
    [...filterArray, volunteer.id])
    .then((result) => (result.affectedRows > 0) ?
                      Promise.resolve() :
                      Promise.reject(new Error("Not Found")));
  }

  /**
   * Queries a table for Volunteer objects.
   *
   * @param table Table to query.
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND". Parameters cannot equal null.
   */
  private queryVolunteers(table: string, filter?: Map<string, any>) {
    // Get filter array
    const filterArray = (filter !== undefined) ? Array.from(filter.values()) : [];
    const questionMarks = this.generateQuestionMarks((filter !== undefined) ? filter.keys() : [], " AND ");

    // Query for data
    return this.db.makeQuery(
      `SELECT * FROM \`${table}\`${(questionMarks.length > 0) ? " WHERE " : ""}${questionMarks}`,
      [...filterArray])
    .then((volunteers) => volunteers.map((x: any) => new Volunteer(x)) as Volunteer[]);
  }
}
