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
import { VolunteersRoute } from "../src/routes/volunteers";

// Chai setup
const should = chai.should();
chai.use(chaiHttp);
const pathPrefix = "";  // For adding '/api/v1' to api calls if needed

/**
 * Test the Locations API
 */
@suite
class VolunteersAPITest {

  public static before(done: MochaDone) {
    // Update this line to switch to MySQL if desired
    serverEnv.container.rebind<ISQLService>(IFACES.ISQLSERVICE).to(FakeSQL).inSingletonScope();
    serverEnv.startServer();

    // Setup DB
    const sqlSrv = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);

    // Clear old data
    sqlSrv.makeQuery("DELETE FROM requests")
    .then(() => sqlSrv.makeQuery("DELETE FROM volunteer_pairing"))
    .then(() => sqlSrv.makeQuery("DELETE FROM volunteers"))
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
    serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE).makeQuery("DELETE FROM volunteer_pairing")
    .then(() => serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE).makeQuery("DELETE FROM volunteers"))
    .then(() => done())
    .catch((err) => {
      if (err.name !== "FakeSQLError") {
        done(err);
      } else {
        done();
      }
    });
  }

  @test("GET should return a list of volunteers")
  public volunteersList(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 3, uwo_id: "jdoe39", first_name: "Bobby",
        last_name: "Doe", disabled: true,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      }
    ];

    // Expected return
    const EXPECTED_RESULTS = {
      volunteers: [DB_DATA[0], DB_DATA[1]]
    };

    // Setup fake data
    FakeSQL.response = {};
    TestReplaceHelper.dateReplace(sqlQuery, "volunteers", DB_DATA, "timestamp")
    .then(() => {
      FakeSQL.response = (q: string, v: any[]) => {
        v.should.contain(false);
        return [DB_DATA[0], DB_DATA[1]];
      };
    })
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteers")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("volunteers");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should return a list of volunteers + disabled volunteers")
  public volunteersListDisabled(done: MochaDone) {
     // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 3, uwo_id: "jdoe39", first_name: "Bobby",
        last_name: "Doe", disabled: true,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      }
    ];

    // Expected return
    const EXPECTED_RESULTS = {
      volunteers: DB_DATA
    };

    // Setup fake data
    FakeSQL.response = {};
    TestReplaceHelper.dateReplace(sqlQuery, "volunteers", DB_DATA, "timestamp")
    .then(() => {
      FakeSQL.response = DB_DATA;
    })
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteers")
      .query({disabled: true})
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("volunteers");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should return a list of active volunteers")
  public activeVolunteersList(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_VOLUNTEERS_DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 3, uwo_id: "jdoe39", first_name: "Bobby",
        last_name: "Doe", disabled: true,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      }
    ];
    const DB_PAIRING_DATA = [
      { id: 1, active: true, volunteer_one: 1, volunteer_two: 2 },
      { id: 2, active: true, volunteer_one: 2, volunteer_two: 3 },
      { id: 3, active: false, volunteer_one: 1, volunteer_two: 3 }
    ];

    // Expected return
    const EXPECTED_RESULTS = {
      volunteers: [DB_VOLUNTEERS_DATA[0], DB_VOLUNTEERS_DATA[1]]
    };

    // Setup fake data
    FakeSQL.response = {};
    TestReplaceHelper.replaceParallel(sqlQuery, "volunteers", DB_VOLUNTEERS_DATA)
    .then(() => TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_PAIRING_DATA))
    .then(() => TestReplaceHelper.dateReplace(sqlQuery, "volunteers", DB_VOLUNTEERS_DATA, "timestamp"))
    .then(() => {
      FakeSQL.response = [DB_VOLUNTEERS_DATA[0], DB_VOLUNTEERS_DATA[1]];
    })
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteers/active")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("volunteers");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should return a list of inactive volunteers")
  public inactiveVolunteersList(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_VOLUNTEERS_DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 3, uwo_id: "jdoe39", first_name: "Bobby",
        last_name: "Doe", disabled: true,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      }
    ];
    const DB_PAIRING_DATA = [
      { id: 1, active: false, volunteer_one: 1, volunteer_two: 2 },
      { id: 2, active: true, volunteer_one: 2, volunteer_two: 3 },
      { id: 3, active: false, volunteer_one: 1, volunteer_two: 3 }
    ];

    // Expected return
    const EXPECTED_RESULTS = {
      volunteers: [DB_VOLUNTEERS_DATA[0]]
    };

    // Setup fake data
    FakeSQL.response = {};
    TestReplaceHelper.replaceParallel(sqlQuery, "volunteers", DB_VOLUNTEERS_DATA)
    .then(() => TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_PAIRING_DATA))
    .then(() => TestReplaceHelper.dateReplace(sqlQuery, "volunteers", DB_VOLUNTEERS_DATA, "timestamp"))
    .then(() => {
      FakeSQL.response = [DB_VOLUNTEERS_DATA[0]];
    })
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteers/inactive")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("volunteers");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should error on invalid disabled")
  public volunteersListInvalidDisabled(done: MochaDone) {
    FakeSQL.response = [];

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteers")
      .query({ disabled: "qwerty" })
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
    const DB_DATA = [
      {
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 2, uwo_id: "jdoe38", first_name: "Jane",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      },
      {
        id: 3, uwo_id: "jdoe39", first_name: "Bobby",
        last_name: "Doe", disabled: true,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      }
    ];

    // Expected return
    const EXPECTED_RESULTS = {
      id: 2, uwo_id: "jdoe38", first_name: "Jane",
      last_name: "Doe", disabled: false,
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };

    // Setup fake data
    FakeSQL.response = {};
    TestReplaceHelper.dateReplace(sqlQuery, "volunteers", DB_DATA, "timestamp")
    .then(() => {
      FakeSQL.response = (query: string, values: any[]) => {
        values.should.deep.equal([2]);
        return [DB_DATA[1]];
      };
    })
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteers/2")
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
      .get(pathPrefix + "/volunteers/1")
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
      .get(pathPrefix + "/volunteers/-1")
      .end((err, res) => {
        // Verify results
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("POST should create a new object, ignoring id and other properties")
  public postSuccess(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      id: 5, uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", extra: "test",
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const EXPECTED_RESULTS = {
      uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", disabled: false,
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      const newId = 2;
      if (query.search("^INSERT") >= 0) {
        // Ensure unwanted properties are not being added
        ["extra"].forEach((val) => query.search(val).should.equal(-1));
        return {insertId: newId};
      } else {
        values.should.contain(newId); // Ensure correct ID was requested
        return [{...EXPECTED_RESULTS, id: newId}];
      }
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteers")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(201);
        res.body.should.contain(EXPECTED_RESULTS);
        res.body.should.have.property("id");
        done();
      });
  }

  @test("POST should create a new object even if latitude/longitude/timestamp are not available")
  public postPositionSuccess(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      id: 5, uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", extra: "test",
    };
    const EXPECTED_RESULTS = {
      uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", disabled: false,
      latitude: "",
      longitude: "",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      const newId = 2;
      if (query.search("^INSERT") >= 0) {
        // Ensure unwanted properties are not being added
        ["extra"].forEach((val) => query.search(val).should.equal(-1));
        return {insertId: newId};
      } else {
        values.should.contain(newId); // Ensure correct ID was requested
        return [{...EXPECTED_RESULTS, id: newId}];
      }
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteers")
      .send(INPUT)
      .end((err, res) => {
        // Verify results
        res.should.have.status(201);
        res.body.should.contain(EXPECTED_RESULTS);
        res.body.should.have.property("id");
        done();
      });
  }

  @test("POST should fail when a longitude is missing")
  public postLongitudeFail(done: MochaDone) {
    // Setup fake data
    const INPUT = { first_name: "John", last_name: "Doe", disabled: true, latitude: "55"};
    const REQUESTS_DATA = undefined;

    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteers")
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

  @test("POST should fail when a uwo_id is missing")
  public postFail(done: MochaDone) {
    // Setup fake data
    const INPUT = { first_name: "John", last_name: "Doe", disabled: true};
    const REQUESTS_DATA = undefined;

    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteers")
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
      uwo_id: "joe37", first_name: "John", last_name: "Doe", disabled: true,
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteers")
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

  @test("PUT should update object, ignoring other parameters")
  public putSuccess(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = [{
        id: 1, uwo_id: "jdoe37", first_name: "John",
        last_name: "Doe", disabled: false,
        latitude: "42.9849",
        longitude: "81.2453",
        timestamp: "2017-10-26T06:51:05.000Z"
      }];

    // Setup fake data
    const INPUT = {
      id: 5, uwo_id: "jdoe39", first_name: "Johnny",
      last_name: "Doey", disabled: true,
      latitude: "43.9849",
      longitude: "82.2453",
      timestamp: "2018-10-26T06:51:05.000Z"
    };
    const EXPECTED_RESULTS = {
      id: 1, uwo_id: "jdoe39", first_name: "Johnny",
      last_name: "Doey", disabled: true,
      latitude: "43.9849",
      longitude: "82.2453",
      timestamp: "2018-10-26T06:51:05.000Z"
    };

    // Setup DB responses
    FakeSQL.response = [];
    TestReplaceHelper.dateReplace(sqlQuery, "volunteers", DB_DATA, "timestamp")
    .then(() => {
      FakeSQL.response = (query: string, values: any[]) => {
        if (query.search("^UPDATE") >= 0) {
          // Remove WHERE parameter since it has the ID
          query = query.substr(0, query.search("WHERE") - 1);
          // Ensure unwanted properties are not being added
          [" id", "extra"].forEach((val) => query.search(val).should.equal(-1));
          // Ensure wanted properties are being added
          [
            "first_name",
            "uwo_id",
            "last_name",
            "disabled",
            "latitude",
            "longitude",
            "timestamp"
          ].forEach((val) => query.search(val).should.not.equal(-1));
          return {affectedRows: 1};
        } else {
          values.should.contain(1); // Ensure correct ID was requested
          return [EXPECTED_RESULTS];
        }
      };
    })
    .then(() => {

      // Start request
      chai.request(serverEnv.nodeServer)
        .put(pathPrefix + "/volunteers/1")
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
      first_name: "test", last_name: "test"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/volunteers/1")
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
      uwo_id: "jdoe37", first_name: "John", last_name: "Doe",
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = undefined;
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/volunteers/4")
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

  @test("PUT should fail on non-existent ID")
  public putBadId(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      uwo_id: "jdoe37", first_name: "John", last_name: "Doe",
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = {affectedRows: 0};
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/volunteers/10")
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
      .put(pathPrefix + "/volunteers/fake")
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
      id: 1, uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", disabled: false,
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };

    // Setup fake data
    const INPUT = {
      id: 4,
      extra: "testme",
      disabled: true
    };
    const EXPECTED_RESULTS = {
      id: 1, uwo_id: "jdoe37", first_name: "John",
      last_name: "Doe", disabled: true,
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };

    // Setup DB with data
    FakeSQL.response = {};
    TestReplaceHelper.replace(sqlQuery, "volunteers", DB_DATA)
    .then(() => TestReplaceHelper.dateReplace(sqlQuery, "volunteers", DB_DATA, "timestamp"))
    .then(() => {
      FakeSQL.response = (query: string, values: any[]) => {
        if (query.search("^UPDATE") >= 0) {
          // Check values
          values.splice(-1);  // Remove ID
          values.should.deep.equal([true]);

          // Remove WHERE parameter since it has the ID
          query = query.substr(0, query.search("WHERE") - 1);

          // Ensure unwanted properties are not being added
          [" id"].forEach((val) => query.search(val).should.equal(-1));

          // Ensure wanted properties are being added
          ["disabled"].forEach((val) => query.search(val).should.not.equal(-1));

          return {affectedRows: 1};
        } else {
          values.should.contain(1); // Ensure correct ID was requested
          return [EXPECTED_RESULTS];
        }
      };
    })
    .then(() => {

      // Start request
      chai.request(serverEnv.nodeServer)
        .patch(pathPrefix + "/volunteers/1")
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
      .patch(pathPrefix + "/volunteers/4")
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

  @test("PATCH should fail on non-existent ID")
  public patchBadId(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      uwo_id: "jdoe37", first_name: "John", last_name: "Doe"
    };
    const REQUESTS_DATA = {affectedRows: 0};
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .patch(pathPrefix + "/volunteers/10")
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
      .patch(pathPrefix + "/volunteers/fake")
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
