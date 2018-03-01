import { Volunteer } from "../models/volunteer";

/**
 * Interface for objects that interact with persistent storage to handle volunteers.
 */
export interface IVolunteersManager {
  /**
   * Get a volunteer from the backend.
   *
   * @param id The id of the user to get
   */
  getVolunteer(id: number): Promise<Volunteer>;

  /**
   * Get a list of volunteers from the backend.
   *
   * Defaults to returning disabled volunteers.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND"
   */
  getVolunteers(filter?: Map<string, any>): Promise<Volunteer[]>;

  /**
   * Get a list of actively-paired volunteers from the backend.
   *
   * Defaults to returning disabled volunteers.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND"
   */
  getPairedVolunteers(filter?: Map<string, any>): Promise<Volunteer[]>;

  /**
   * Get a list of unpaired volunteers from the backend.
   *
   * Defaults to returning disabled volunteers.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND"
   */
  getUnpairedVolunteers(filter?: Map<string, any>): Promise<Volunteer[]>;

  /**
   * Create a new volunteer. Returns new ID.
   *
   * @param volunteer The new volunteer to store.
   */
  createVolunteer(volunteer: Volunteer): Promise<number>;

  // NOTE: Not supporting deleting a volunteer due to references from other tables.

  /**
   * Update a volunteer with new information.
   *
   * @param volunteer The volunteer to be updated.
   * @param columnUpdate [Optional] Update only specific columns.
   */
  updateVolunteer(volunteer: Volunteer, columnUpdate?: string[]): Promise<void>;
}
