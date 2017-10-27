import { inject, injectable } from "inversify";
import * as mysql from "mysql";
import { ISQLService } from "../src/services/isqlservice";

/**
 * Mock class to eliminate SQL server during testing
 */
@injectable()
export class FakeSQL implements ISQLService {
  public static response: any;

  /**
   * Make a basic query to the SQL server.
   * 
   * @param query  The query string, optionally with ?s for values to be inserted
   * @param values (Optional) An array of values to be inserted into appropriate places in `query`
   */
  public makeQuery(query: string, values?: any[] | undefined): Promise<any[]> {
    return new Promise((res, rej) => {
      if (FakeSQL.response !== undefined && FakeSQL.response !== null) {
        res(FakeSQL.response);
      } else {
        rej({name: "FakeSQLError", sqlMessage: "Query not supported."});
      }
    });
  }

  /**
   * Initialize object.
   *
   * @param host { String } The SQL host to connect to.
   * @param user { String } Username to login with.
   * @param password { String } Password for user.
   * @param database { String } Database to connect to.
   */
  public initialize(host: string, user: string, password: string, database: string): void {
    return;
  }

}
