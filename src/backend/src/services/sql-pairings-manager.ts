import { inject, injectable } from "inversify";
import { IFACES } from "../ids";
import { IVolunteerPairingManager } from "../interfaces/ipairing-manager";
import { ISQLService } from "../interfaces/isql-service";
import { IVolunteersManager } from "../interfaces/ivolunteers-manager";
import { Volunteer } from "../models/volunteer";
import { VolunteerPairing } from "../models/volunteer-pairing";
import { SQLAbstractManager } from "./sql-abstract-manager";

/**
 * Data manager for handling retrieving requested data from multiple possible persistence layers.
 *
 * This class expects inputs to have already been sanitized and/or limited.
 */
@injectable()
export class SQLVolunteerPairingManager extends SQLAbstractManager implements IVolunteerPairingManager {

  private db: ISQLService;
  private volmgr: IVolunteersManager;

  /**
   * Constructor.
   *
   * @param db The SQL database implementation to use.
   */
  constructor(
    @inject(IFACES.ISQLSERVICE) db: ISQLService,
    @inject(IFACES.IVOLUNTEERSMANAGER) volmgr: IVolunteersManager
  ) {
    super();

    // Save db and volunteers manager
    this.db = db;
    this.volmgr = volmgr;
  }

  /**
   * Get a volunteer pairing from the backend.
   *
   * @param id The id of the pairing to get
   */
  public getPairing(id: number) {
    // Make DB request
    return this.db.makeQuery("SELECT * FROM `volunteer_pairing` WHERE id=?", [id])
    // Ensure data was returned
    .then((request) => (request.length > 0) ? request[0] : Promise.reject(new Error("Not Found")))
    // Convert to appropriate format and return
    .then((val) => this.reconstructVolunteerPairing(val));
  }

  /**
   * Get a list of volunteer pairs from the backend.
   *
   * Defaults to returning inactive pairs.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND". Parameters cannot equal null.
   */
  public getPairings(filter?: Map<string, any>) {
    // Get filter array
    const filterArray = (filter !== undefined) ? Array.from(filter.values()) : [];
    const questionMarks = this.generateQuestionMarks((filter !== undefined) ? filter.keys() : [], " AND ");

    // Query for data
    return this.db.makeQuery(
      `SELECT * FROM \`volunteer_pairing\`${(questionMarks.length > 0) ? " WHERE " : ""}${questionMarks}`,
      [...filterArray])
    .then((requests) => {
      // Resolve all the volunteer objects
      const resolves = requests.map((x: any) => this.reconstructVolunteerPairing(x)) as [Promise<VolunteerPairing>];

      // Return when all objects are resolved
      return Promise.all(resolves);
    });
  }

  /**
   * Create a new volunteer pairing. Returns new ID.
   *
   * @param pairing The new pairing to store.
   */
  public createPairing(pairing: VolunteerPairing) {
    // Sanity check
    if (!pairing.Valid()) {
      return Promise.reject("Requesting save of invalid Pairing");
    }

    return this.db.makeQuery(
      "INSERT INTO `volunteer_pairing` (volunteer_one, volunteer_two, active) VALUES(?,?,?)",
      [
        pairing.volunteer_one.id,
        pairing.volunteer_two.id,
        pairing.active
      ])
    .then((results: any) => results.insertId as number);
  }

  // NOTE: Not supporting deleting a volunteer pairing due to references from other tables.

  /**
   * Update a volunteer pairing with new active status.
   *
   * @param id The ID of the volunteer pairing to toggle.
   * @param active The new active state of the pairing.
   */
  public toggleActive(id: number, active: boolean) {
    return this.db.makeQuery(`UPDATE \`volunteer_pairing\` SET active=? WHERE id=?`,
    [active, id])
    .then((result) => (result.affectedRows > 0) ?
                      Promise.resolve() :
                      Promise.reject(new Error("Not Found")));
  }

  /**
   * Resolves the volunteer IDs from the SQL pairing record. For internal use only.
   *
   * @param obj The raw pairing record from the SQL DB.
   */
  public reconstructVolunteerPairing(obj: {[key: string]: any}) {
    // Retrieve volunteers for this pairing
    const volOnePromise = this.volmgr.getVolunteer(Number(obj.volunteer_one));
    const volTwoPromise = this.volmgr.getVolunteer(Number(obj.volunteer_two));
    return Promise.all([volOnePromise, volTwoPromise])
    .then((volunteers) => new VolunteerPairing(
        volunteers[0],
        volunteers[1],
        obj.active,
        obj.id));
  }
}
