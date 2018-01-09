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
    // Return default object if the obj is undefined
    if (obj === undefined) {
      return;
    }

    // Sanity check on data
    if (this.checkToFromUniqueness(obj.from_location, obj.to_location)) {
      throw new Error("Invalid Request Data");
    }

    // Fill object
    if (this.isValid(obj.name)) {
      this.name = String(obj.name);
    }

    if (this.isValid(obj.additional_info)) {
      this.additional_info = String(obj.additional_info);
    }

    this.id = Number(obj.id);
    this.from_location = String(obj.from_location);
    this.to_location = String(obj.to_location);
    this.timestamp = new Date(obj.timestamp);
    this.archived = (obj.archived === "false") ? false : Boolean(obj.archived);
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
