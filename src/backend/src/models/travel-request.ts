/**
 * Represents a request object from the DB.
 */
export class TravelRequest {

  /**
   * Convert JS object into a TravelRequest object
   *
   * @param obj Raw mysqljs object
   */
  public static convertToTravelRequest(obj: {[key: string]: any}) {
    const travelRequest = new TravelRequest();

    // Sanity check on data
    if (isNaN(Number(obj.id)) === true || Number(obj.id) < 1) {
      throw new Error("Invalid MySQL Data");
    }

    // Fill object
    travelRequest.id = Number(obj.id);

    if (obj.name !== null && obj.name !== undefined) {
      travelRequest.name = String(obj.name);
    }

    if (obj.additional_info !== null && obj.additional_info !== undefined) {
    travelRequest.additional_info = String(obj.additional_info);
    }

    travelRequest.from_location = String(obj.from_location);

    travelRequest.to_location = String(obj.to_location);

    travelRequest.archived = Boolean(obj.archived);

    travelRequest.timestamp = new Date(obj.timestamp);

    return travelRequest;
  }

  /* tslint:disable:variable-name */

  public id: number;
  public name: string;
  public from_location: string;
  public to_location: string;
  public additional_info: string;
  public archived: boolean;
  public timestamp: Date;

  /* tslint:enable:variable-name */

}
