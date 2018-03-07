// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";
import { ISQLService } from "../src/interfaces/isql-service";
import { TravelRequest } from "../src/models/travel-request";
import { MySQLService } from "../src/services/mysql-service";
import { FakeSQL } from "./fake-sql";
import { TestReplaceHelper } from "./test-helper";

// Class under test
import { SQLRequestsManager } from "../src/services/sql-requests-manager";
// NOTE: Change this if you want to test with a real MySQL instance
const backend: ISQLService = new FakeSQL();

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

/**
 * Test the Locations API
 */
@suite
class SQLRequestsManagerTest {

  @timeout(10 * 1000 * 5)
  public static before(done: MochaDone) {
    if (backend instanceof FakeSQL) {
      done();
      return;
    }

    const sql = backend as MySQLService;
    // Ensure MySQL is up before starting
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
    console.log("Connecting to MySQL...");
    isConnected(4);
  }

  // Get SQL connector instance
  private readonly sqlInstance = backend;
  private readonly sqlQuery = this.sqlInstance.makeQuery.bind(this.sqlInstance);
  private reqMgr: SQLRequestsManager;

  constructor() {
    // Put any needed data here
    this.reqMgr = new SQLRequestsManager(backend);
  }

  // hook for before each test; make static to be after the suite
  public before(done: MochaDone) {
    // Clear DB state
    FakeSQL.response = undefined;
    backend.makeQuery("DELETE FROM requests")
    .then(() => done())
    .catch((x) => {if (x.name === "FakeSQLError") { done(); } else { done(x); } });
  }

  public after() {
    // hook for after each test; make static to be after the suite
  }

  @test("generateQuestionMarks should work normally")
  public normalQuestions() {
    // Bypass typescript permissions system
    // tslint:disable-next-line
    let funct = this.reqMgr["generateQuestionMarks"].bind(this.reqMgr);

    // Empty case
    funct([]).should.equal("");
    funct(["a", "b"]).should.equal("a=?, b=?");
  }

  @test("GetRequest works normally")
  public getRequestNormal() {
    const DATA = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "None",
      archived: 0,
      timestamp: "2018-01-09T02:36:58.000Z",
      status: "REJECTED",
      pairing: null
    };

    // Setup FakeSQL response
    FakeSQL.response = (query: string, values: any[]) => {
      return [DATA];
    };
    return TestReplaceHelper.dateReplace(this.sqlQuery, "requests", DATA, "timestamp")
    .then(() => this.reqMgr.getRequest(1).should.eventually.deep.equal(new TravelRequest(DATA)));
  }

  @test("GetRequest rejects when id not found")
  public getRequestError() {
    return this.reqMgr.getRequest(-1).should.eventually.be.rejected;
  }

  @test("GetRequests offsets and counts works")
  public getRequestsNormal() {
    const DATA = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "None",
      archived: 0,
      timestamp: "2018-01-09T02:36:58.000Z",
      status: "REQUESTED",
      pairing: null
    };

    // Setup FakeSQL response
    FakeSQL.response = (query: string, values: any[]) => {
      return (values[0] === 0 && values[1] >= 1) ? [DATA] : [];
    };

    return TestReplaceHelper.dateReplace(this.sqlQuery, "requests", DATA, "timestamp")
    .then(() => {
      // Test that the values are respected
      const promises = [];
      promises.push(this.reqMgr.getRequests(0, 1).should.eventually.deep.equal([new TravelRequest(DATA)]));
      promises.push(this.reqMgr.getRequests(1, 1).should.eventually.deep.equal([]));
      promises.push(this.reqMgr.getRequests(0, 0).should.eventually.deep.equal([]));
      return Promise.all(promises);
    });
  }

  @test("GetRequests filter works")
  public getRequestsFilter() {
    const DATA = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "None",
      archived: 0,
      timestamp: "2018-01-09T02:36:58.000Z",
      status: "IN_PROGRESS",
      pairing: null
    };

    // Setup FakeSQL response
    FakeSQL.response = (query: string, values: any[]) => {
      return (
        values[0] === "John" &&
        values[1] === 0 &&
        values[2] === "IN_PROGRESS") ? [DATA] : [];
    };

    return TestReplaceHelper.dateReplace(this.sqlQuery, "requests", DATA, "timestamp")
    .then(() => {
      // Test that the filter is respected
      const promises = [];
      promises.push(this.reqMgr.getRequests(0, 1, new Map<string, any>([
        ["name", "John"],
        ["archived", 0],
        ["status", "IN_PROGRESS"]
      ])).should.eventually.deep.equal([new TravelRequest(DATA)]));
      promises.push(this.reqMgr.getRequests(0, 1, new Map<string, any>([
        ["name", "Jane"],
        ["archived", 0],
        ["status", "IN_PROGRESS"]
      ])).should.eventually.deep.equal([]));
      return Promise.all(promises);
    });
  }

  @test("createRequest works")
  public createRequestsNormal() {
    // Test data
    const DATA = {
      id: 999,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "None",
      archived: 1,
      timestamp: "2018-01-09T02:36:58.000Z"
    };

    // Setup FakeSQL response
    FakeSQL.response = (query: string, values: any[]) => {
      return {insertId: 1};
    };

    // Assert
    return this.reqMgr.createRequest(new TravelRequest(DATA)).should.eventually.be.fulfilled.and.not.equal(DATA.id);
  }

  @test("deleteRequest works")
  public deleteRequestsNormal() {
    // Test data
    const DATA = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "None",
      archived: 1,
      timestamp: "2018-01-09T02:36:58.000Z"
    };

    // Setup FakeSQL response
    FakeSQL.response = (query: string, values: any[]) => {
      return {affectedRows: 1};
    };

    // Setup MySQL and assert
    return TestReplaceHelper.dateReplace(this.sqlQuery, "requests", DATA, "timestamp")
    .then(() => this.reqMgr.deleteRequest(DATA.id).should.eventually.be.fulfilled);
  }

  @test("deleteRequest rejects when the ID is not found")
  public deleteRequestsInvalid() {
    // Test data
    const DATA = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "None",
      archived: 1,
      timestamp: "2018-01-09T02:36:58.000Z"
    };

    // Setup FakeSQL response
    FakeSQL.response = (query: string, values: any[]) => {
      return {affectedRows: 0};
    };

    // Setup MySQL and assert
    return TestReplaceHelper.dateReplace(this.sqlQuery, "requests", DATA, "timestamp")
    .then(() => this.reqMgr.deleteRequest(100).should.eventually.be.rejected);
  }

  @test("updateRequest works")
  public updateRequest() {
    // Test data
    const DATA = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "None",
      archived: 1,
      timestamp: "2018-01-09T02:36:58.000Z",
      pairing: null,
      status: "REQUESTED"
    };
    const UPDATE = {
      to_location: "CMLP",
      additional_info: "Some stuff",
      id: 999,
      useless: 0,
      status: "REJECTED"
    };
    const EXPECTED = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "CMLP",
      additional_info: "Some stuff",
      archived: true,
      timestamp: "2018-01-09T02:36:58.000Z",
      status: "REJECTED",
      pairing: null
    };

    // Setup FakeSQL response
    FakeSQL.response = (q: string, v: any) => {
      if (q.indexOf("SELECT") !== -1) {
        return [EXPECTED];
      }

      return {affectedRows: 1};
    };

    return TestReplaceHelper.dateReplace(this.sqlQuery, "requests", DATA, "timestamp")
    .then(() =>
      this.reqMgr.updateRequest(new TravelRequest(UPDATE), [
        "to_location",
        "additional_info",
        "status"
      ]).should.eventually.be.fulfilled)
    .then(() => this.reqMgr.getRequest(1).should.eventually.deep.equal(new TravelRequest(EXPECTED)));
  }
}
