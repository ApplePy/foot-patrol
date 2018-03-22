// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiHttp = require("chai-http");
import { only, skip, suite, test } from "mocha-typescript";
import * as mock from "ts-mockito";
import { IFACES, TAGS } from "../src/ids";
import { default as serverEnv } from "../src/index";
import { ISQLService } from "../src/interfaces/isql-service";
import { MySQLService } from "../src/services/mysql-service";
import { FakeSQL } from "./fake-sql";
import { TestReplaceHelper } from "./test-helper";

// Route
import { RequestsRoute } from "../src/routes/requests";

// Chai setup
const should = chai.should();
chai.use(chaiHttp);
const pathPrefix = "";  // For adding '/api/v1' to api calls if needed

/**
 * Test the Locations API
 */
@suite
class RequestsAPITest {

  public static before(done: MochaDone) {
    FakeSQL.response = undefined;

    // Update this line to switch to MySQL if desired
    serverEnv.container.rebind<ISQLService>(IFACES.ISQLSERVICE).to(FakeSQL).inSingletonScope();
    serverEnv.startServer();

    // Setup DB
    const sqlSrv = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);

    // Clear old data
    sqlSrv.makeQuery("DELETE FROM requests")
    .then(() => sqlSrv.makeQuery("DELETE FROM volunteer_pairing"))
    .then(() => sqlSrv.makeQuery("DELETE FROM volunteers"))

    // Create volunteers
    .then(() => Promise.all([
      sqlSrv.makeQuery("REPLACE INTO volunteers VALUES(1, 'jdoe12', 'John', 'Doe', 0)"),
      sqlSrv.makeQuery("REPLACE INTO volunteers VALUES(2, 'jdoe23', 'Jane', 'Doe', 0)"),
    ]))

    // Create pairing
    .then(() => sqlSrv.makeQuery("REPLACE INTO volunteer_pairing VALUES(1, 1, 2, 1)"))
    .then(() => done())
    .catch((err) => {
      if (err.name !== "FakeSQLError") {
        done(err);
      } else {
        done();
      }
    });
  }

  public static after() {
    serverEnv.nodeServer.close();
  }

  constructor() {
    // Put any needed data here
  }

  public after() {
    // hook for after each test; make static to be after the suite
  }

    // hook for before each test; make static to be before the suite
  public before(done: MochaDone) {
    // Clear DB and FakeSQL state
    FakeSQL.response = undefined;
    serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE).makeQuery("DELETE FROM requests")
    .then(() => done())
    .catch((err) => {
      if (err.name !== "FakeSQLError") {
        done(err);
      } else {
        done();
      }
    });
  }

  @test("GET should return a list of requests")
  public requestsList(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z",
      status: "ASSIGNED", pairing: 1
    };

    // Expected return
    const EXPECTED_RESULTS = {
      requests: [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: false, timestamp: "2017-10-26T06:51:05.000Z",
          status: "ASSIGNED", pairing: 1
        }
      ],
      meta: { offset: 0, count: 2, archived: false }
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      values.should.deep.equal([false, 0, 2]);
      return [DB_DATA];
    };
    TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .query({ offset: 0, count: 2, archived: false })
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("requests");
        res.body.should.have.property("meta");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should return a list of requests with count capped")
  public requestsListCapped(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z", status: "REQUESTED"
    };

    // Expected return
    const EXPECTED_RESULTS = {
      requests: [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: false, timestamp: "2017-10-26T06:51:05.000Z",
          status: "REQUESTED", pairing: null
        }
      ],
      meta: { offset: 0, count: 100, archived: false }
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      values.should.deep.equal([false, 0, 100]);
      return [DB_DATA];
    };
    TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .query({ offset: 0, count: 500, archived: false })
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("requests");
        res.body.should.have.property("meta");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should return a list of requests + default archived")
  public requestsListDefault(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // DATA
    const DB_DATA = [{
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 1, timestamp: "2017-10-26T06:51:05.000Z", status: "REQUESTED"
    },
    {
      id: 2, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z", status: "COMPLETED"
    }];

    const EXPECTED_RESULTS = {
      requests: [
        {
          id: 2, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: false, timestamp: "2017-10-26T06:51:05.000Z",
          status: "COMPLETED", pairing: null
        }
      ],
      meta: { offset: 0, count: 2, archived: false }
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      values.should.deep.equal([false, 0, 2]);
      return [DB_DATA[1]];
    };
    TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
        .query({ offset: 0, count: 2 })
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("requests");
        res.body.should.have.property("meta");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    });
  }

  @test("GET should return a list of requests + archived requests")
  public requestsListArchived(done: MochaDone) {
     // Get SQL connector instance
     const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
     const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

     // DATA
     const DB_DATA = [{
       id: 1, name: "John Doe", from_location: "SEB",
       to_location: "UCC", additional_info: null,
       archived: 1, timestamp: "2017-10-26T06:51:05.000Z",
       status: "COMPLETED", pairing: 1
     },
     {
       id: 2, name: "Jane Doe", from_location: "SEB",
       to_location: "UCC", additional_info: null,
       archived: 0, timestamp: "2017-10-26T06:51:05.000Z", status: "REJECTED"
     }];

     const EXPECTED_RESULTS = {
      requests: [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: true, timestamp: "2017-10-26T06:51:05.000Z",
          status: "COMPLETED", pairing: 1
        },
        {
          id: 2, name: "Jane Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: false, timestamp: "2017-10-26T06:51:05.000Z",
          status: "REJECTED", pairing: null
        }
      ],
      meta: { offset: 0, count: 2, archived: true }
    };

    // Setup fake data
     FakeSQL.response = (query: string, values: any[]) => {
      values.should.deep.equal([0, 2]);
      return DB_DATA;
    };
     TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
     .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .query({ offset: 0, count: 2, archived: true })
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("requests");
        res.body.should.have.property("meta");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
     });
  }

  @test("GET should error on invalid offset")
  public requestsListInvalidOffset(done: MochaDone) {
    FakeSQL.response = undefined;

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .query({ offset: -1, count: 2, archived: false })
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET should error on invalid archived")
  public requestsListInvalidArchived(done: MochaDone) {
    FakeSQL.response = [];

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .query({ offset: 1, count: 2, archived: "qwerty" })
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET should error on invalid count")
  public requestsListInvalidCount(done: MochaDone) {
    FakeSQL.response = undefined;

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .query({ offset: -1, count: -1, archived: false })
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET should error on missing parameters")
  public requestsListMissingParameters(done: MochaDone) {
    FakeSQL.response = undefined;

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET should handle DB error")
  public dbError(done: MochaDone) {
    if (serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE) instanceof FakeSQL === false) {
      done(); // This only works with FakeSQL faking server errors
      return;
    }

    // Setup fake data
    FakeSQL.response = undefined;

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests")
      .query({ offset: 0, count: 1, archived: true })
      .end((err, res) => {
        // Verify results
        res.should.have.status(500);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET should return one request")
  public getRequest(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z",
      status: "REJECTED", pairing: 1
    };

    // Expected return
    const EXPECTED_RESULTS = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: false, timestamp: "2017-10-26T06:51:05.000Z",
      status: "REJECTED", pairing: 1
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      values.should.deep.equal([1]);
      return [DB_DATA];
    };
    TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/1")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    });
  }

  @test("GET for non-existent ID should fail with 404")
  public getBadId(done: MochaDone) {
    // Setup fake data
    FakeSQL.response = [];

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/1")
      .end((err, res) => {
        // Verify results
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET for invalid ID should fail with 400")
  public getInvalidId(done: MochaDone) {
    // Setup fake data
    FakeSQL.response = [];

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/-1")
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET should return one request's volunteers")
  public getRequestVolunteers(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_REQUESTS_DATA = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z",
      status: "REJECTED", pairing: 1
    };

    const DB_PAIRING_DATA = {
      id: 1, active: 1, volunteer_one: 1, volunteer_two: 2
    };

    const DB_VOLUNTEERS_DATA = [
      { id: 1, uwo_id: "jdoe37", first_name: "John", last_name: "Doe", disabled: 0 },
      { id: 2, uwo_id: "jdoe38", first_name: "Jane", last_name: "Doe", disabled: 0 }
    ];

    // Expected return
    const EXPECTED_RESULTS = {
      volunteers: [
        { id: 1, first_name: "John", last_name: "Doe" },
        { id: 2, first_name: "Jane", last_name: "Doe" }
      ]
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      // Silence the REPLACE calls
      if (query.indexOf("REPLACE") !== -1) {
        return {};
      } else if (query.indexOf("volunteer_pairing") !== -1) {
        values.should.deep.equal([1]);
        return [DB_PAIRING_DATA];
      } else if (query.indexOf("volunteers") !== -1) {
        values[0].should.be.within(1, 2);
        // Return the right volunteer
        if (values[0] === 1) {
          return [DB_VOLUNTEERS_DATA[0]];
        } else {
          return [DB_VOLUNTEERS_DATA[1]];
        }
      } else {
        values.should.deep.equal([1]);
        return [DB_REQUESTS_DATA];
      }
    };

    // Insert all the test data into the DB
    Promise.all(DB_VOLUNTEERS_DATA.map((val) => TestReplaceHelper.replace(sqlQuery, "volunteers", val)))
    .then(() => TestReplaceHelper.replace(sqlQuery, "volunteer_pairing", DB_PAIRING_DATA))
    .then(() => TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_REQUESTS_DATA, "timestamp"))
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/1/volunteers")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    });
  }

  @test("GET for an unassigned request should return no volunteers")
  public getRequestVolunteersNull(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_REQUESTS_DATA = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z",
      status: "REJECTED", pairing: null
    };

    const DB_PAIRING_DATA = {
      id: 1, active: 1, volunteer_one: 1, volunteer_two: 2
    };

    const DB_VOLUNTEERS_DATA = [
      { id: 1, uwo_id: "jdoe37", first_name: "John", last_name: "Doe", disabled: 0 },
      { id: 2, uwo_id: "jdoe38", first_name: "Jane", last_name: "Doe", disabled: 0 }
    ];

    // Expected return
    const EXPECTED_RESULTS = {
      volunteers: []
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.indexOf("requests") !== -1) {
        values.should.deep.equal([1]);
        return [DB_REQUESTS_DATA];
      }

      return {};  // Fallthrough case
    };

    // Insert all the test data into the DB
    Promise.all(DB_VOLUNTEERS_DATA.map((val) => TestReplaceHelper.replace(sqlQuery, "volunteers", val)))
    .then(() => TestReplaceHelper.replace(sqlQuery, "volunteer_pairing", DB_PAIRING_DATA))
    .then(() => TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_REQUESTS_DATA, "timestamp"))
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/1/volunteers")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    });
  }

  @test("GET volunteers for non-existent ID should return 404")
  public getRequestVolunteersBadId(done: MochaDone) {
    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      values.should.deep.equal([0]);
      return {};
    };

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/0/volunteers")
      .end((err, res) => {
        // Verify results
        res.should.have.status(404);
        done();
      });
  }

  @test("GET volunteers for badly-formed ID should return 400")
  public getRequestVolunteersInvalidId(done: MochaDone) {
    // Setup fake data
    FakeSQL.response = {};

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/fake/volunteers")
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("POST should create a new object, ignoring id and other properties")
  public postSuccess(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      id: 4,
      name: "John Doe",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "test",
      archived: true,
      timestamp: "lol",
      extra: "testme",
      status: "COMPLETED",
      pairing: 1
    };
    const EXPECTED_RESULTS = {
      name: "John Doe",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "test",
      archived: false,
      status: "REQUESTED",
      pairing: 1
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      const newId = 2;
      if (query.search("^INSERT") >= 0) {
        // Ensure unwanted properties are not being added
        ["id", "timestamp", "extra", "archived"].forEach((val) => query.search(val).should.equal(-1));
        return {insertId: newId};
      } else {
        values.should.contain(newId); // Ensure correct ID was requested
        return [{...EXPECTED_RESULTS, id: newId, timestamp: "2017-10-26T06:51:05.000Z"}];
      }
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/requests")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(201);
        res.body.should.contain(EXPECTED_RESULTS);
        res.body.should.have.property("id");
        res.body.should.have.property("timestamp");
        done();
      });
  }

  @test("POST should fail when a location is missing")
  public postFail(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: "UCC"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/requests")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("POST should fail gracefully handle SQL errors")
  public postDBFail(done: MochaDone) {
    if (serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE) instanceof FakeSQL === false) {
      done(); // This only works with FakeSQL faking server errors
      return;
    }

    // Setup fake data
    const INPUT = {
      from_location: "UCC",
      to_location: "SEB"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/requests")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(500);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("POST should catch equal locations")
  public postDupLocations(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: "UCC",
      to_location: "UCC"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/requests")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("DELETE should delete successfully")
  public deleteSuccess(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = {
      id: 5, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z"
    };

    // Setup fake data
    const REQUESTS_DATA = {affectedRows: 1};
    FakeSQL.response = REQUESTS_DATA;
    TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
    .then(() => {

      // Start request
      chai.request(serverEnv.nodeServer)
        .del(pathPrefix + "/requests/5")
        .end((err, res) => {
          // Verify results
          res.should.have.status(204);
          done();
        });
    });
  }

  @test("DELETE should fail on non-existent ID")
  public deleteFail(done: MochaDone) {
    // Setup fake data
    const REQUESTS_DATA = {affectedRows: 0};
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .del(pathPrefix + "/requests/10")
      .end((err, res) => {
        // Verify results
        res.should.have.status(404);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("DELETE should fail on invalid ID")
  public deleteInvalidId(done: MochaDone) {
    // Setup fake data
    const INPUT = {};
    FakeSQL.response = {};

    // Start request
    chai.request(serverEnv.nodeServer)
      .del(pathPrefix + "/requests/fake")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("DELETE should fail gracefully handle SQL errors")
  public deleteDBFail(done: MochaDone) {
    if (serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE) instanceof FakeSQL === false) {
      done(); // This only works with FakeSQL faking server errors
      return;
    }

    // Setup fake data
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .del(pathPrefix + "/requests/1")
      .end((err, res) => {
        // Verify results
        res.should.have.status(500);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PUT should update object, ignoring other parameters")
  public putSuccess(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: "additional info",
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z"
    };

    // Setup fake data
    const INPUT = {
      id: 4,
      from_location: "UCC",
      to_location: "SEB",
      archived: true,
      timestamp: "2017-12-26T06:51:05.000Z",
      extra: "testme",
      status: "COMPLETED",
      pairing: 1
    };
    const EXPECTED_RESULTS = {
      id: 1,
      name: null,
      additional_info: null,
      from_location: "UCC",
      to_location: "SEB",
      archived: true,
      timestamp: "2017-10-26T06:51:05.000Z",
      status: "COMPLETED",
      pairing: 1
    };

    // Setup DB responses
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("^UPDATE") >= 0) {
        // Remove WHERE parameter since it has the ID
        query = query.substr(0, query.search("WHERE") - 1);
        // Ensure unwanted properties are not being added
        ["id", "extra", "timestamp"].forEach((val) => query.search(val).should.equal(-1));
        // Ensure wanted properties are being added
        [
          "name",
          "from_location",
          "to_location",
          "additional_info",
          "status",
          "pairing",
          "archived"
        ].forEach((val) => query.search(val).should.not.equal(-1));
        return {affectedRows: 1};
      } else {
        values.should.contain(1); // Ensure correct ID was requested
        return [EXPECTED_RESULTS];
      }
    };

    TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
    .then(() => {

      // Start request
      chai.request(serverEnv.nodeServer)
        .put(pathPrefix + "/requests/1")
        .send(INPUT)
        .end((err, res) => {
          // Verify results
          res.should.have.status(200);
          res.body.should.deep.equal(EXPECTED_RESULTS);
          done();
        });
    });
  }

  @test("PUT should fail when a variable is missing")
  public putFail(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: "UCC",
      to_location: "SEB"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/requests/1")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PUT should fail gracefully handle SQL errors")
  public putDBFail(done: MochaDone) {
    if (serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE) instanceof FakeSQL === false) {
      done(); // This only works with FakeSQL faking server errors
      return;
    }

    // Setup fake data
    const INPUT = {
      from_location: "UCC",
      to_location: "TEB",
      archived: true,
      status: "REJECTED",
      name: "John Doe",
      additional_info: "test string"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/requests/4")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(500);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PUT should catch equal locations")
  public putDupLocations(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: "UCC",
      to_location: "UCC",
       archived: true
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/requests/1")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PUT should fail on non-existent ID")
  public putBadId(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: "UCC",
      to_location: "TEB",
      archived: false,
      status: "REJECTED"
    };
    const REQUESTS_DATA = {affectedRows: 0};
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/requests/10")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(404);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PUT should fail on invalid ID")
  public putInvalidId(done: MochaDone) {
    // Setup fake data
    const INPUT = {};
    FakeSQL.response = {};

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/requests/fake")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PATCH should update object, ignoring other parameters")
  public patchSuccess(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: "additional info",
      archived: 0, timestamp: "2017-10-26T06:51:05.000Z", pairing: null
    };

    // Setup fake data
    const INPUT = {
      id: 4,
      from_location: "UCC",
      to_location: "SEB",
      timestamp: "2017-11-26T06:51:05.000Z",
      extra: "testme",
      status: "REJECTED",
      pairing: 1
    };
    const EXPECTED_RESULTS = {
      id: 1,
      name: "John Doe",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "additional info",
      archived: false,
      timestamp: "2017-10-26T06:51:05.000Z",
      status: "REJECTED",
      pairing: 1
    };
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("^UPDATE") >= 0) {
        // Check query to ensure proper formation
        query.should.equal("UPDATE `requests` SET from_location=?, to_location=?, status=?, pairing=? WHERE id=?");

        // Check values
        values.splice(-1);  // Remove ID
        values.should.deep.equal(["UCC", "SEB", "REJECTED", 1]);

        // Remove WHERE parameter since it has the ID
        query = query.substr(0, query.search("WHERE") - 1);

        // Ensure unwanted properties are not being added
        ["id", "extra", "timestamp", "archived"].forEach((val) => query.search(val).should.equal(-1));

        // Ensure wanted properties are being added
        ["from_location", "to_location", "status", "pairing"].forEach((val) => query.search(val).should.not.equal(-1));

        return {affectedRows: 1};
      } else {
        values.should.contain(1); // Ensure correct ID was requested
        return [EXPECTED_RESULTS];
      }
    };

    TestReplaceHelper.dateReplace(sqlQuery, "requests", DB_DATA, "timestamp")
    .then(() => {

      // Start request
      chai.request(serverEnv.nodeServer)
        .patch(pathPrefix + "/requests/1")
        .send(INPUT)
        .end((err, res) => {
          // Verify results
          res.should.have.status(200);
          res.body.should.deep.equal(EXPECTED_RESULTS);
          done();
        });
    });
  }

  @test("PATCH should fail gracefully handle SQL errors")
  public patchDBFail(done: MochaDone) {
    if (serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE) instanceof FakeSQL === false) {
      done(); // This only works with FakeSQL faking server errors
      return;
    }

    // Setup fake data
    const INPUT = {
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .patch(pathPrefix + "/requests/4")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(500);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PATCH should catch equal locations")
  public patchDupLocations(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: "HI",
      to_location: "HI"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .patch(pathPrefix + "/requests/1")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PATCH should fail on non-existent ID")
  public patchBadId(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: "UCC",
      to_location: "TEB",
      archived: false
    };
    const REQUESTS_DATA = {affectedRows: 0};
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .patch(pathPrefix + "/requests/10")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(404);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }

  @test("PATCH should fail on invalid ID")
  public patchInvalidId(done: MochaDone) {
    // Setup fake data
    const INPUT = {};
    FakeSQL.response = {};

    // Start request
    chai.request(serverEnv.nodeServer)
      .patch(pathPrefix + "/requests/fake")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.contain.property("error");
        res.body.should.contain.property("message");
        res.body.should.not.contain.property("stack");
        done();
      });
  }
}
