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
    if (obj.from_location !== undefined &&
        obj.to_location !== undefined &&
        obj.from_location === obj.to_location) {
      throw new Error("Invalid Request Data");
    }

    // Fill object
    this.id = Number(obj.id);

    if (obj.name !== null && obj.name !== undefined) {
      this.name = String(obj.name);
    }

    if (obj.additional_info !== null && obj.additional_info !== undefined) {
      this.additional_info = String(obj.additional_info);
    }

    this.from_location = String(obj.from_location);

    this.to_location = String(obj.to_location);

    this.archived = (obj.archived === "false") ? false : Boolean(obj.archived);

    this.timestamp = new Date(obj.timestamp);
  }
}
