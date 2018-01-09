import { injectable } from "inversify";
import * as mysql from "mysql";
import { ISQLService } from "../src/services/isqlservice";

/**
 * Mock class to eliminate SQL server during testing
 */
@injectable()
export class FakeSQL implements ISQLService {
  /**
   * This static property allows modification of what the fake MySQL service
   * returns to the code calling `makeQuery`.
   * Supplying `undefined` will cause FakeSQL to throw a MySQL like DB error.
   */
  public static response: any;

  /**
   * Make a basic query to the SQL server.
   *
   * @param query  The query string, optionally with ?s for values to be inserted
   * @param values (Optional) An array of values to be inserted into appropriate places in `query`
   */
  public makeQuery(query: string, values?: any[] | undefined): Promise<any> {
    return new Promise((res, rej) => {
      // Catch error cases
      if (FakeSQL.response === undefined || FakeSQL.response === null) {
        rej({name: "FakeSQLError", sqlMessage: "Query not supported."});
      }

      // Spit out reponse
      if (typeof FakeSQL.response === "function") {
        res(FakeSQL.response(query, values));
      } else {
        res(FakeSQL.response);
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
