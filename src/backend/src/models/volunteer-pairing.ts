import { Volunteer } from "./volunteer";

/**
 * Represents a pairing of Volunteers from the DB.
 */
export class VolunteerPairing {

  public static readonly NullVolunteer = new Volunteer();

  /* tslint:disable:variable-name */

  public id: number;
  public volunteer_one: Volunteer;
  public volunteer_two: Volunteer;
  public active: boolean;

  /* tslint:enable:variable-name */

  constructor(
    volOne: Volunteer = VolunteerPairing.NullVolunteer,
    volTwo: Volunteer = VolunteerPairing.NullVolunteer,
    active: boolean = true,
    id: number = 0
  ) {
    this.volunteer_one = volOne;
    this.volunteer_two = volTwo;
    this.active = active;
    this.id = id;
  }

  /**
   * Checks if the object is in a valid state
   */
  public Valid() {
    let invalid = false;
    invalid = invalid || this.volunteer_one === VolunteerPairing.NullVolunteer;
    invalid = invalid || this.volunteer_two === VolunteerPairing.NullVolunteer;
    invalid = invalid || this.checkOrdering(this.volunteer_one, this.volunteer_two);

    return !invalid;
  }

  /**
   * Check if to and from are the same.
   *
   * @param first
   * @param second
   */
  private checkOrdering(first: Volunteer, second: Volunteer) {
    return (first == null || second == null || first.id >= second.id);
  }
}
