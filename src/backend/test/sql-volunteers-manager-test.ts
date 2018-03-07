// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";
import { ISQLService } from "../src/interfaces/isql-service";
import { Volunteer } from "../src/models/volunteer";
import { MySQLService } from "../src/services/mysql-service";
import { FakeSQL } from "./fake-sql";
import { TestReplaceHelper } from "./test-helper";

// Class under test
import { SQLVolunteersManager } from "../src/services/sql-volunteers-manager";
// NOTE: Change this if you want to test with a real MySQL instance
const backend: ISQLService = new FakeSQL();

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

/**
 * Test the Locations API
 */
@suite
class SQLVolunteersManagerTest {

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
  private volMgr: SQLVolunteersManager;

  constructor() {
    // Put any needed data here
    this.volMgr = new SQLVolunteersManager(backend);
  }

  // hook for before each test; make static to be after the suite
  public before(done: MochaDone) {
    // Clear DB state
    FakeSQL.response = undefined;
    backend.makeQuery("DELETE FROM requests")
    .then(() => backend.makeQuery("DELETE FROM volunteer_pairing"))
    .then(() => backend.makeQuery("DELETE FROM volunteers"))
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
    let funct = this.volMgr["generateQuestionMarks"].bind(this.volMgr);

    // Empty case
    funct([]).should.equal("");
    funct(["a", "b"]).should.equal("a=?, b=?");
  }

  @test("GetVolunteer works normally")
  public getVolunteerNormal() {
    const DATA = {
      id: 1, uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", disabled: false
    };

    // Setup FakeSQL response
    FakeSQL.response = [DATA];
    return TestReplaceHelper.replace(this.sqlQuery, "volunteers", DATA)
    .then(() => this.volMgr.getVolunteer(1).should.eventually.deep.equal(new Volunteer(DATA)));
  }

  @test("GetVolunteer rejects when id not found")
  public getVolunteerError() {
    return this.volMgr.getVolunteer(0).should.eventually.be.rejected;
  }

  @test("GetVolunteers works")
  public getVolunteersNormal() {
    const DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: true
      }
    ];

    // Setup FakeSQL response
    FakeSQL.response = DATA;

    return Promise.all(DATA.map((x) => TestReplaceHelper.replace(this.sqlQuery, "volunteers", x)))
    .then(() => {
      // Test that the values are respected
      return this.volMgr.getVolunteers().should.eventually.deep.equal(DATA.map((x) => new Volunteer(x)));
    });
  }

  @test("GetVolunteers filter works")
  public getVolunteersFilter() {
    const DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: true
      }
    ];

    // Setup FakeSQL response
    FakeSQL.response = (query: string, values: any[]) => {
      return (
        values[0] === "jdoe38" &&
        values[1] === 1) ? [DATA[1]] : [];
    };

    return Promise.all(
      DATA.map((x) => TestReplaceHelper.replace(this.sqlQuery, "volunteers", x)))
    .then(() => {
      // Test that the filter is respected
      const promises = [];
      promises.push(this.volMgr.getVolunteers(new Map<string, any>([
        ["uwo_id", "jdoe38"],
        ["disabled", 1]
      ])).should.eventually.deep.equal([new Volunteer(DATA[1])]));
      promises.push(this.volMgr.getVolunteers(new Map<string, any>([
        ["uwo_id", "jdoe37"],
        ["disabled", 1]
      ])).should.eventually.deep.equal([]));
      return Promise.all(promises);
    });
  }

  @test("GetPairedVolunteers works")
  public getPairedVolunteers() {
    const VOLUNTEERS = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false
      },
      {
        id: 3, uwo_id: "jdoe39", first_name: "Bobby",
        last_name: "Doe", disabled: true
      }
    ];
    const PAIRINGS = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 1, volunteer_two: 3, active: false },
    ];
    const EXPECTED_DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false
      }
    ];

    // Setup FakeSQL response
    FakeSQL.response = (q: string, v: any) => {
      if (v.length === 0) {
        return EXPECTED_DATA;
      } else if (v[0] === "John") {
        return [EXPECTED_DATA[0]];
      }
      return [];
    };

    return Promise.all(
      VOLUNTEERS.map((x) => TestReplaceHelper.replace(this.sqlQuery, "volunteers", x)))
    .then(() => Promise.all(
      PAIRINGS.map((x) => TestReplaceHelper.replace(this.sqlQuery, "volunteer_pairing", x))))
    .then(() => {
      // Test that the filter is respected
      const promises = [];

      promises.push(this.volMgr.getPairedVolunteers(new Map<string, any>([
        ["first_name", "John"]
      ])).should.eventually.deep.equal([new Volunteer(EXPECTED_DATA[0])]));

      promises.push(this.volMgr.getPairedVolunteers()
        .should.eventually.deep.equal(EXPECTED_DATA.map((x) => new Volunteer(x))));

      promises.push(this.volMgr.getPairedVolunteers(new Map<string, any>([
        ["first_name", "Bobby"]
      ])).should.eventually.deep.equal([]));
      return Promise.all(promises);
    });
  }

  @test("GetUnpairedVolunteers works")
  public getUnpairedVolunteers() {
    const VOLUNTEERS = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false
      },
      {
        id: 3, uwo_id: "jdoe39", first_name: "Bobby",
        last_name: "Doe", disabled: true
      }
    ];
    const PAIRINGS = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 1, volunteer_two: 3, active: false },
    ];
    const EXPECTED_DATA = {
      id: 3, uwo_id: "jdoe39", first_name: "Bobby",
      last_name: "Doe", disabled: true
    };

    // Setup FakeSQL response
    FakeSQL.response = (q: string, v: any) => {
      if (v.length === 0) {
        return [EXPECTED_DATA];
      } else if (v[0] === "Bobby") {
        return [EXPECTED_DATA];
      }
      return [];
    };

    return Promise.all(
      VOLUNTEERS.map((x) => TestReplaceHelper.replace(this.sqlQuery, "volunteers", x)))
    .then(() => Promise.all(
      PAIRINGS.map((x) => TestReplaceHelper.replace(this.sqlQuery, "volunteer_pairing", x))))
    .then(() => {
      // Test that the filter is respected
      const promises = [];

      promises.push(this.volMgr.getUnpairedVolunteers(new Map<string, any>([
        ["first_name", "Bobby"]
      ])).should.eventually.deep.equal([new Volunteer(EXPECTED_DATA)]));

      promises.push(this.volMgr.getUnpairedVolunteers()
        .should.eventually.deep.equal([new Volunteer(EXPECTED_DATA)]));

      promises.push(this.volMgr.getUnpairedVolunteers(new Map<string, any>([
        ["first_name", "John"]
      ])).should.eventually.deep.equal([]));
      return Promise.all(promises);
    });
  }

  @test("createRequest works")
  public createRequestsNormal() {
    // Test data
    const DATA = {
      id: 5, uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", disabled: false
    };

    // Setup FakeSQL response
    FakeSQL.response = {insertId: 1};

    // Assert
    return this.volMgr.createVolunteer(new Volunteer(DATA)).should.eventually.be.fulfilled.and.not.equal(DATA.id);
  }

  @test("updateRequest works")
  public updateRequest() {
    // Test data
    const DATA = {
      id: 5, uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", disabled: false
    };
    const UPDATE = {
      to_location: "CMLP",
      uwo_id: "jdoe99",
      id: 5,
      useless: 0
    };
    const EXPECTED = {
      id: 5, uwo_id: "jdoe99", first_name: "John",
      last_name: "Doe", disabled: false
    };

    // Setup FakeSQL response
    FakeSQL.response = (q: string, v: any) => {
      if (q.indexOf("SELECT") !== -1) {
        return [EXPECTED];
      }

      return {affectedRows: 1};
    };

    return TestReplaceHelper.replace(this.sqlQuery, "volunteers", DATA)
    .then(() =>
      this.volMgr.updateVolunteer(new Volunteer(UPDATE), [
        "uwo_id"
      ]).should.eventually.be.fulfilled)
    .then(() => this.volMgr.getVolunteer(5).should.eventually.deep.equal(new Volunteer(EXPECTED)));
  }
}
