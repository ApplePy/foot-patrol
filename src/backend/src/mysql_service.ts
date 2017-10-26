import * as mysql from "mysql";
import { Server } from "./server";

/**
 * Service for connecting to and managing a MySQL database.
 *
 * @class MySQLService
 */
export class MySQLService {
  // Pools of connections to databases
  private static mapping: Map<string, mysql.Pool> = new Map<string, mysql.Pool>();
  // MySQL host/database that this object queries
  private dbHash = "";

  /**
   * Constructor
   *
   * @param host { String } The MySQL host to connect to.
   * @param user { String } Username to login with.
   * @param password { String } Password for user.
   * @param database { String } Database to connect to.
   */
  constructor(host: string, user: string, password: string, database: string) {
    // normalize host and database (since it's a key)
    host = Server.sanitize(host.toLowerCase());
    this.dbHash = host + Server.sanitize(database.toLowerCase());

    // Create a static pool of connections, so that multiple connection requests to the same DB are cached.
    if (!MySQLService.mapping.hasOwnProperty(this.dbHash)) {
      MySQLService.mapping.set(this.dbHash, mysql.createPool({
        connectionLimit : 10,
        host,
        user,
        password,
        database
      }));
    }
  }

  /**
   * Gets a connection to the database.
   * Remember to call `release()` when done.
   *
   * @return { Promise<mysql.Connection> } Promise with a MySQL connection or an error.
   */
  public getConnection(): Promise<mysql.PoolConnection> {
    const pool = MySQLService.mapping.get(this.dbHash) as mysql.Pool;

    return new Promise((res, rej) => {
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

  public makeQuery(query: string, values?: string[]): Promise<any[]> {
    return this.getConnection()
    .then((conn) => {
      // Make request
      return new Promise<any[]>((resolve, reject) => {
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
