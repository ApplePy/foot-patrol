/**
 * Rudimentary interface to abstract individual SQL services.
 */
export interface ISQLService {
  /**
   * Make a basic query to the SQL server.
   *
   * @param query  The query string, optionally with ?s for values to be inserted
   * @param values (Optional) An array of values to be inserted into appropriate places in `query`
   */
  makeQuery(query: string, values?: any[]): Promise<any>;

  /**
   * Initialize object
   *
   * @param host { String } The MySQL host to connect to.
   * @param user { String } Username to login with.
   * @param password { String } Password for user.
   * @param database { String } Database to connect to.
   */
  initialize(host: string, user: string, password: string, database: string): void;
}
