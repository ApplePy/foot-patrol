/**
 * Represents a volunteer object from the DB.
 */
export class Volunteer {

  /* tslint:disable:variable-name */

  public id: number = 0;
  public uwo_id: string = "";
  public first_name: string = "";
  public last_name: string = "";
  public disabled: boolean = false;
  public latitude: String = "";
  public longitude: String = "";
  public timestamp: Date = new Date();

  /* tslint:enable:variable-name */

  constructor(obj?: {[key: string]: any}) {
    // Return default object if the obj is undefined
    if (obj === undefined) {
      return;
    }

    const assignment: {[key: string]: any} = {
      id: Number,
      uwo_id: String,
      first_name: String,
      last_name: String,
      disabled: (field: any) => (field === "false") ? false : Boolean(field),
      latitude: String,
      longitude: String,
      timestamp: (field: any) => new Date(field)
    };

    // Check if a value is valid before trying assignment
    for (const key of Object.keys(assignment)) {
      if (this.isValid(obj[key])) {
        (this as any)[key] = assignment[key](obj[key]);
      }
    }
  }

  /**
   * Returns a JS object with sensitive fields removed.
   */
  public CensorSensitiveData() {
    // Make new object
    // tslint:disable-next-line:prefer-const
    let censored: any = {};
    Object.assign(censored, this);

    // Remove sensitive fields
    censored.uwo_id = undefined;
    censored.disabled = undefined;

    return censored;
  }

  /**
   * Checks if the object is in a valid state. (ID is ignored for POSTs)
   */
  public Valid() {
    // Let errors snowball
    let invalid = false;
    invalid = invalid || this.uwo_id.length <= 0;
    invalid = invalid || this.first_name.length <= 0;
    invalid = invalid || this.last_name.length <= 0;

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
}
