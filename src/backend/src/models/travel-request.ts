/**
 * Represents a request object from the DB.
 */
export class TravelRequest {

  /* tslint:disable:variable-name */

  public id: number;
  public name: string;
  public from_location: string;
  public to_location: string;
  public additional_info: string;
  public archived: boolean;
  public timestamp: Date;

  /* tslint:enable:variable-name */

  constructor(obj?: {[key: string]: any}) {
    // Return default object if the obj is null, undefined, empty, etc.
    if (obj == null) {
      return;
    }

    // Sanity check on data
    if (isNaN(Number(obj.id)) === true ||
        Number(obj.id) < 1 ||
        obj.from_location === null ||
        obj.from_location === undefined ||
        obj.to_location === null ||
        obj.to_location === undefined
        ) {
      throw new Error("Invalid MySQL Data");
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

    this.archived = Boolean(obj.archived);

    this.timestamp = new Date(obj.timestamp);
  }
}
