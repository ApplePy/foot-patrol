import { VolunteerPairing } from "./volunteer-pairing";

/**
 * Represents the current state of a travel request.
 */
export enum TravelStatus {
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REQUESTED = "REQUESTED",
  REJECTED = "REJECTED"
}

/**
 * Represents a request object from the DB.
 */
export class TravelRequest {

  /* tslint:disable:variable-name */

  public id: number = 0;
  public name: string | null = null;
  public from_location: string = "";
  public to_location: string = "";
  public additional_info: string | null = null;
  public archived: boolean = false;
  public timestamp: Date = new Date();
  public status: TravelStatus = TravelStatus.REQUESTED;
  public pairing: VolunteerPairing | number | null = null;

  /* tslint:enable:variable-name */

  constructor(obj?: {[key: string]: any}) {
    // Return default object if the obj is undefined
    if (obj === undefined) {
      return;
    }

    const assignment: {[key: string]: any} = {
      name: String,
      additional_info: String,
      id: Number,
      from_location: String,
      to_location: String,
      pairing: (field: any) => (field instanceof VolunteerPairing) ? field : Number(field),
      status: (field: any) => TravelStatus[field],
      timestamp: (field: any) => new Date(field),
      archived: (field: any) => (field === "false") ? false : Boolean(field)
    };

    // Check if a value is valid before trying assignment
    for (const key of Object.keys(assignment)) {
      if (this.isValid(obj[key])) {
        (this as any)[key] = assignment[key](obj[key]);
      }
    }
  }

  /**
   * Checks if the object is in a valid state
   */
  public Valid() {
    let invalid = false;
    invalid = invalid || this.checkToFromUniqueness(this.from_location, this.to_location);
    invalid = invalid || this.status == null;

    return !invalid;
  }

  /**
   * Checks if a variable is not null or undefined.
   *
   * @param variable Variable to check
   */
  private isValid(variable: any) {
    return variable !== null && variable !== undefined && variable !== "";
  }

  /**
   * Check if to and from are the same.
   *
   * @param to
   * @param from
   */
  private checkToFromUniqueness(to: string, from: string) {
    return (to == null || from == null || to === "" || from === "" || to === from);
  }
}
