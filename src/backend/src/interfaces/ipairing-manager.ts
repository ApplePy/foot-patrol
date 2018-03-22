import { Volunteer } from "../models/volunteer";
import { VolunteerPairing } from "../models/volunteer-pairing";

/**
 * Interface for objects that interact with persistent storage to handle volunteer pairing.
 */
export interface IVolunteerPairingManager {
  /**
   * Get a volunteer pairing from the backend.
   *
   * @param id The id of the pairing to get
   */
  getPairing(id: number): Promise<VolunteerPairing>;

  /**
   * Get a list of volunteer pairs from the backend.
   *
   * Defaults to returning inactive pairs.
   *
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND". Parameters cannot equal null.
   */
  getPairings(filter?: Map<string, any>): Promise<VolunteerPairing[]>;

  /**
   * Create a new volunteer pairing. Returns new ID.
   *
   * @param pairing The new pairing to store.
   */
  createPairing(pairing: VolunteerPairing): Promise<number>;

  // NOTE: Not supporting deleting a volunteer pairing due to references from other tables.

  /**
   * Update a volunteer pairing with new active status.
   *
   * @param id The ID of the volunteer pairing to toggle.
   * @param active The new active state of the pairing.
   */
  toggleActive(id: number, active: boolean): Promise<void>;

  /**
   * Get a list of volunteer pairs from the backend that are not currently busy.
   */
  getUnassignedPairs(): Promise<VolunteerPairing[]>;
}
