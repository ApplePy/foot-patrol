/**
 * Represents a request object from the DB.
 */
export class TravelRequest {

  /* tslint:disable:variable-name */

  public id: number;
  public name: string | null = null;
  public from_location: string;
  public to_location: string;
  public additional_info: string | null = null;
  public archived: boolean;
  public timestamp: Date;

  /* tslint:enable:variable-name */

  constructor(obj?: {[key: string]: any}) {
    // Set timestamp of creation
    this.timestamp = new Date();

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
    // Set false and wait until a validity check sets it true
    let invalid = false;

    // Check fields
    invalid = invalid || this.checkToFromUniqueness(this.from_location, this.to_location);
    const fields = [this.id, this.timestamp, this.archived];
    for (const field of fields) {
      invalid = invalid || !this.isValid(field);
    }

    return !invalid;
  }

  /**
   * Checks if a variable is not null or undefined.
   *
   * @param variable Variable to check
   */
  private isValid(variable: any) {
    return variable !== null && variable !== undefined;
  }

  /**
   * Check if to and from are the same.
   *
   * @param to
   * @param from
   */
  private checkToFromUniqueness(to: string, from: string) {
    return (to == null || from == null || to === from);
  }
}
