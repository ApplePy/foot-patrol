import { injectable } from "inversify";
import * as mysql from "mysql";
import { ISQLService } from "../interfaces/isql-service";

/**
 * Service for connecting to and managing a MySQL database.
 */
@injectable()
export class MySQLService implements ISQLService {
  private connectionPool: mysql.Pool | undefined;

  /**
   * Initialize object
   *
   * @param host { String } The MySQL host to connect to.
   * @param user { String } Username to login with.
   * @param password { String } Password for user.
   * @param database { String } Database to connect to.
   */
  public initialize(host: string, user: string, password: string, database: string) {
    // Only initialize once
    this.connectionPool = this.connectionPool || mysql.createPool({
      connectionLimit : 10,
      host,
      user,
      password,
      database
    });
  }

  /**
   * Gets a connection to the database.
   * Remember to call `release()` when done.
   *
   * @return { Promise<mysql.Connection> } Promise with a MySQL connection or an error.
   */
  public getConnection(): Promise<mysql.PoolConnection> {
    const pool = this.connectionPool;

    return new Promise((res, rej) => {
      // Catch uninitialized
      if (pool === undefined) {
        rej(new Error("Database connection not initialized!"));
        return;
      }

      // Open a new connection
      pool.getConnection((err, conn) => {
        if (err) {
          // Connection failed; call error callback
          rej(err);
        } else {
          res(conn);
        }
      });
    });
  }

  /**
   * Make a basic query to the SQL server.
   *
   * @param query  The query string, optionally with ?s for values to be inserted
   * @param values (Optional) An array of values to be inserted into appropriate places in `query`
   */
  public makeQuery(query: string, values?: any[]): Promise<any> {
    // Get a connection to the database
    return this.getConnection()
    .then((conn) => {
      // Make request
      return new Promise<any>((resolve, reject) => {
        conn.query(query, values, (err, results) => {
          conn.release(); // Release connection

          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });
  }
}
