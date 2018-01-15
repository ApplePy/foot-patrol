// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";
import { MySQLService } from "../src/services/mysql-service";
import { TestReplaceHelper } from "./test-helper";

// Route
import { RequestsRoute } from "../src/routes/requests";

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

/**
 * Test the Locations API
 */
@suite
class MySQLServiceTest {

  @timeout(10 * 1000 * 11)
  public static before(done: MochaDone) {
    // Ensure MySQL is up before starting
    const sql = new MySQLService();
    sql.initialize(
      process.env.MYSQL_HOST as string,
      process.env.MYSQL_USER as string,
      process.env.MYSQL_PASS as string,
      process.env.MYSQL_DB as string);

    // Process of looping around until db is ready
    const isConnected = (retriesLeft: number) => {
      sql.getConnection()
      .then(() => done())
      .catch((err) => {
        if (retriesLeft <= 0) {
          console.error("Ran out of retries, quitting...");
          done(err);  // Error out
        } else {
          console.error("MySQL not ready, waiting 10s before retrying...");
          setTimeout(isConnected, 10 * 1000, retriesLeft - 1);  // Try again
        }
      });
    };

    // Start checking if connected
    isConnected(10);
  }

  constructor() {
    // Put any needed data here
  }

  public before() {
    // hook for before each test; make static to be after the suite
  }

    // hook for after each test; make static to be after the suite
  public after() {
    // Clear DB state
    // serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE).makeQuery("DELETE FROM requests")
    // .then(() => done());
  }

  @test("Getting a connection without initialization should fail.")
  public NoConnectionTest() {
    return new MySQLService().getConnection().should.eventually.be.rejected;
  }

  @test("Getting a connection with bad initialization should fail.")
  public BadCredentials() {
    const sql = new MySQLService();
    sql.initialize("BAD", "USER", "PASSWORD", "DATABASE");
    return sql.getConnection().should.eventually.be.rejected;
  }

  @test("Getting a connection with good initialization should pass.")
  public GoodCredentials() {
    const sql = new MySQLService();
    sql.initialize(
      process.env.MYSQL_HOST as string,
      process.env.MYSQL_USER as string,
      process.env.MYSQL_PASS as string,
      process.env.MYSQL_DB as string);
    return sql.getConnection().should.eventually.be.fulfilled;
  }

  @test("Getting a query with good initialization should pass.")
  public GoodQuery() {
    const sql = new MySQLService();
    sql.initialize(
      process.env.MYSQL_HOST as string,
      process.env.MYSQL_USER as string,
      process.env.MYSQL_PASS as string,
      process.env.MYSQL_DB as string);
    return sql.makeQuery("SELECT * FROM mysql.user").should.eventually.be.fulfilled;
  }

  @test("Getting a bad query with good initialization should fail.")
  public BadQuery() {
    const sql = new MySQLService();
    sql.initialize(
      process.env.MYSQL_HOST as string,
      process.env.MYSQL_USER as string,
      process.env.MYSQL_PASS as string,
      process.env.MYSQL_DB as string);
    return sql.makeQuery("SELECT * FROM nonexistent").should.eventually.be.rejected;
  }
}
