// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";
import { Volunteer } from "../src/models/volunteer";
import { VolunteerPairing } from "../src/models/volunteer-pairing";
import { MySQLService } from "../src/services/mysql-service";
import { SQLVolunteersManager } from "../src/services/sql-volunteers-manager";
import { FakeSQL } from "./fake-sql";
import { TestReplaceHelper } from "./test-helper";

// Class under test
import { SQLVolunteerPairingManager } from "../src/services/sql-pairings-manager";
// NOTE: Change this if you want to test with a real MySQL instance
const backend: MySQLService = new MySQLService();

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

/**
 * Test the Locations API
 */
@suite
class SQLVolunteerPairingsManagerTest {

  @timeout(10 * 1000 * 5)
  public static before(done: MochaDone) {
    if (backend instanceof FakeSQL) {
      done("This suite does not support FakeSQL.");
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
  private pairMgr: SQLVolunteerPairingManager;

  // Include sample volunteers for all tests
  private readonly VOLUNTEERS = [
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

  constructor() {
    // Put any needed data here
    this.pairMgr = new SQLVolunteerPairingManager(backend, new SQLVolunteersManager(backend));
  }

  // hook for before each test; make static to be before the suite
  public before() {
    // Clear DB state
    FakeSQL.response = undefined;
    const clean = backend.makeQuery("DELETE FROM requests")
    .then(() => backend.makeQuery("DELETE FROM volunteer_pairing"))
    .then(() => backend.makeQuery("DELETE FROM volunteers"));

    // Insert volunteers into DB
    return clean.then(() => Promise.all(this.VOLUNTEERS.map((x) => {
      return TestReplaceHelper.replace(this.sqlQuery, "volunteers", x);
    })));
  }

  public after() {
    // hook for after each test; make static to be after the suite
  }

  @test("generateQuestionMarks should work normally")
  public normalQuestions() {
    // Bypass typescript permissions system
    // tslint:disable-next-line
    let funct = this.pairMgr["generateQuestionMarks"].bind(this.pairMgr);

    // Empty case
    funct([]).should.equal("");
    funct(["a", "b"]).should.equal("a=?, b=?");
  }

  @test("ReconstructVolunteerPairing works")
  public reconstructTest() {
    const DATA = {
      id: 1,
      volunteer_one: 1,
      volunteer_two: 2,
      active: true
    };

    return this.pairMgr.reconstructVolunteerPairing(DATA)
      .should.eventually.deep.equal(new VolunteerPairing(
        new Volunteer(this.VOLUNTEERS[0]),
        new Volunteer(this.VOLUNTEERS[1]),
        DATA.active,
        DATA.id
      ));
  }

  @test("GetPairing works normally")
  public getPairingNormal() {
    const DATA = { id: 1, volunteer_one: 1, volunteer_two: 2, active: 1 };

    return TestReplaceHelper.replace(this.sqlQuery, "volunteer_pairing", DATA)
    .then(() => this.pairMgr.getPairing(1))
    .then((pair: any) =>
      new VolunteerPairing(pair.volunteer_one, pair.volunteer_two, pair.active, pair.id))
    .should.eventually.deep.equal(new VolunteerPairing(
      new Volunteer(this.VOLUNTEERS[0]),
      new Volunteer(this.VOLUNTEERS[1]),
      Boolean(DATA.active),
      DATA.id
    ));
  }

  @test("GetPairing rejects when id not found")
  public getRequestError() {
    return this.pairMgr.getPairing(0).should.eventually.be.rejected;
  }

  @test("GetPairings & filter works")
  public getPairingsNormal() {
    const DATA = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: 1 },
      { id: 2, volunteer_one: 1, volunteer_two: 3, active: 0 }
    ];

    const DATA_RESOLVED = DATA.map((x) =>
      new VolunteerPairing(
        new Volunteer(this.VOLUNTEERS[x.volunteer_one - 1]),
        new Volunteer(this.VOLUNTEERS[x.volunteer_two - 1]),
        Boolean(x.active),
        x.id));

    return Promise.all(DATA.map((x) => TestReplaceHelper.replace(this.sqlQuery, "volunteer_pairing", x)))
    .then(() => {
      // Test that the values are respected
      const promises = [];
      promises.push(this.pairMgr.getPairings().should.eventually.deep.equal(DATA_RESOLVED));
      promises.push(this.pairMgr.getPairings(new Map<string, any>([
        ["active", true]
      ])).should.eventually.deep.equal([DATA_RESOLVED[0]]));
      promises.push(this.pairMgr.getPairings(new Map<string, any>([
        ["id", 5]
      ])).should.eventually.deep.equal([]));
      return Promise.all(promises);
    });
  }

  @test("createPairing works")
  public createPairingNormal() {
    // Test data
    const DATA = new VolunteerPairing(
      new Volunteer(this.VOLUNTEERS[1]),
      new Volunteer(this.VOLUNTEERS[2]),
      true,
      9);

    // Assert
    return this.pairMgr.createPairing(DATA)
      .should.eventually.be.fulfilled.and.not.equal(DATA.id);
  }

  @test("ToggleActive works")
  public toggleActive() {
    const DATA = { id: 1, volunteer_one: 1, volunteer_two: 2, active: true };

    // Add the pairing, toggle active, and make sure it got toggled.
    return TestReplaceHelper.replace(this.sqlQuery, "volunteer_pairing", DATA)
    .then(() => this.pairMgr.toggleActive(DATA.id, !DATA.active)
                  .should.eventually.be.fulfilled)
    .then(() => this.pairMgr.getPairing(DATA.id)
                  .should.eventually.have.property("active").equal(false));
  }
}
