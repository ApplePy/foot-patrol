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
import { Volunteer } from "../src/models/volunteer";
import { RequestsRoute } from "../src/routes/requests";

// Chai setup
const should = chai.should();
chai.use(chaiHttp);
const pathPrefix = "";  // For adding '/api/v1' to api calls if needed

/**
 * Test the Locations API
 */
@suite
class PairingsAPITest {

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

    // Create volunteers
    .then(() => TestReplaceHelper.replaceParallel(sqlSrv.makeQuery.bind(sqlSrv), "volunteers", this.VOLUNTEERS))
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

  private static readonly VOLUNTEERS = [
    { id: 1, uwo_id: "jdoe12", first_name: "John", last_name: "Doe", disabled: false,
    latitude: "42.9849",
    longitude: "81.2453",
    timestamp: "2017-10-26T06:51:05.000Z" },
    { id: 2, uwo_id: "jdoe23", first_name: "Jane", last_name: "Doe", disabled: false,
    latitude: "42.9849",
    longitude: "81.2453",
    timestamp: "2017-10-26T06:51:05.000Z" },
    { id: 3, uwo_id: "jdoe34", first_name: "Bobby", last_name: "Doe", disabled: true,
    latitude: "42.9849",
    longitude: "81.2453",
    timestamp: "2017-10-26T06:51:05.000Z" }
  ];

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
    .then(() => done())
    .catch((err) => {
      if (err.name !== "FakeSQLError") {
        done(err);
      } else {
        done();
      }
    });
  }

  @test("GET should return a list of pairs")
  public pairingsList(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA: any[] = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 2, volunteer_two: 3, active: true },
      { id: 3, volunteer_one: 1, volunteer_two: 3, active: false}
    ];

    const DB_RESOLVED = DB_DATA.map((x) => {
      const rx: any = {id: x.id, active: x.active};
      rx.volunteers = [
      new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_one)),
      new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_two))
      ];
      // Foreach to fix date formatting error
      rx.volunteers.forEach((element: any) => element.timestamp = element.timestamp.toJSON());
      return rx;
    });

    // Expected return
    const EXPECTED_RESULTS = {
      pairs: [DB_RESOLVED[0], DB_RESOLVED[1]]
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.indexOf(`volunteer_pairing`) !== -1) {
        return [DB_DATA[0], DB_DATA[1]];
      }
      return [PairingsAPITest.VOLUNTEERS.find((x) => x.id === values[0])];
    };
    TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_DATA)
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteerpairs")
      .query({ inactive: false })
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("pairs");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should return a list of pairs + default inactive")
  public pairingsListDefault(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA: any[] = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 2, volunteer_two: 3, active: true },
      { id: 3, volunteer_one: 1, volunteer_two: 3, active: false }
    ];

    const DB_RESOLVED = DB_DATA.map((x) => {
      const rx: any = {id: x.id, active: x.active};
      rx.volunteers = [
        new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_one)),
        new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_two))
      ];
      // Foreach to fix date formatting error
      rx.volunteers.forEach((element: any) => element.timestamp = element.timestamp.toJSON());
      return rx;
    });

    // Expected return
    const EXPECTED_RESULTS = {
      pairs: [DB_RESOLVED[0], DB_RESOLVED[1]]
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.indexOf(`volunteer_pairing`) !== -1) {
        values.should.contain(true);
        return [DB_DATA[0], DB_DATA[1]];
      }
      return [PairingsAPITest.VOLUNTEERS.find((x) => x.id === values[0])];
    };
    TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_DATA)
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteerpairs")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("pairs");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should return a list of pairs + inactive pairs")
  public pairingsListArchived(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA: any[] = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 2, volunteer_two: 3, active: true },
      { id: 3, volunteer_one: 1, volunteer_two: 3, active: false}
    ];

    const DB_RESOLVED = DB_DATA.map((x) => {
      const rx: any = {id: x.id, active: x.active};
      rx.volunteers = [
        new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_one)),
        new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_two))
      ];
      // Foreach to fix date formatting error
      rx.volunteers.forEach((element: any) => element.timestamp = element.timestamp.toJSON());
      return rx;
    });

    // Expected return
    const EXPECTED_RESULTS = {
      pairs: DB_RESOLVED
    };

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.indexOf(`volunteer_pairing`) !== -1) {
        // tslint:disable-next-line:no-unused-expression
        values.should.be.empty;
        return DB_DATA;
      }
      return [PairingsAPITest.VOLUNTEERS.find((x) => x.id === values[0])];
    };
    TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_DATA)
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteerpairs")
      .query({ inactive: true })
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("pairs");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
    })
    .catch(done);
  }

  @test("GET should error on invalid active")
  public pairingsListInvalidInactive(done: MochaDone) {
    FakeSQL.response = [];

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteerpairs")
      .query({ inactive: "qwerty" })
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
      .get(pathPrefix + "/volunteerpairs")
      .end((err, res) => {
        // Verify results
        res.should.have.status(500);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }

  @test("GET should return one pair")
  public getPair(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA: any[] = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 2, volunteer_two: 3, active: true },
      { id: 3, volunteer_one: 1, volunteer_two: 3, active: false}
    ];

    const DB_RESOLVED = DB_DATA.map((x) => {
      const rx: any = {id: x.id, active: x.active};
      rx.volunteers = [
        new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_one)),
        new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === x.volunteer_two))
      ];
      // Foreach to fix date formatting error
      rx.volunteers.forEach((element: any) => element.timestamp = element.timestamp.toJSON());
      return rx;
    });

    // Expected return
    const EXPECTED_RESULTS = DB_RESOLVED[1];

    // Setup fake data
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.indexOf(`volunteer_pairing`) !== -1) {
        values.should.deep.equal([2]);
        return [DB_DATA[1]];
      }
      return [PairingsAPITest.VOLUNTEERS.find((x) => x.id === values[0])];
    };
    TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_DATA)
    .then(() => {

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/volunteerpairs/2")
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
      .get(pathPrefix + "/volunteerpairs/1")
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
      .get(pathPrefix + "/volunteerpairs/-1")
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
    const INPUT = { id: 5, volunteers: [1, 2], active: false, extra: false };
    const NEW_RECORD = { volunteer_one: 1, volunteer_two: 2, active: false };

    // Setup fake data processing
    const REQUESTS_DATA = (query: string, values: any[]) => {
      const newId = 2;
      if (query.search("`volunteers`") >= 0) {
        return [PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === values[0])];
      }

      if (query.search("^INSERT") >= 0) {
        // Ensure unwanted properties are not being added
        ["id", "extra"].forEach((val) => query.search(val).should.equal(-1));
        return {insertId: newId};
      }

      values.should.contain(newId); // Ensure correct ID was requested
      return [{...NEW_RECORD, id: newId}];
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteerpairs")
      .send(INPUT)
      .end((err, res) => {
        // Foreach to fix date formatting error
        const expRes = [
          new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === 1)),
          new Volunteer(PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === 2))
        ];
        expRes.forEach((element: any) => element.timestamp = element.timestamp.toJSON());

        // Verify results
        res.should.have.status(201);
        res.body.should.have.property("id");
        res.body.should.have.property("active").equal(false);
        res.body.should.have.property("volunteers").deep.equal(expRes);
        done();
      });
  }

  @test("POST should fail when a volunteer is missing")
  public postFail(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      active: true,
      volunteers: [1]
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      const newId = 2;
      if (query.search("`volunteers`") >= 0) {
        return [PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === values[0])];
      }
      return [];
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteerpairs")
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
    const INPUT = { id: 5, volunteers: [1, 2], active: false, extra: false };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      const newId = 2;
      if (query.search("`volunteers`") >= 0) {
        return [PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === values[0])];
      }
      throw {name: "FakeSQLError", sqlMessage: "Query not supported."};
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteerpairs")
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

  @test("POST should catch equal volunteers")
  public postDupVolunteers(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      active: true,
      volunteers: [1, 1]
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      const newId = 2;
      if (query.search("`volunteers`") >= 0) {
        return [PairingsAPITest.VOLUNTEERS.find((vol) => vol.id === values[0])];
      }
      throw {name: "FakeSQLError", sqlMessage: "Query not supported."};
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteerpairs")
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

  @test("Toggle POST should update active status")
  public toggleSuccess(done: MochaDone) {
    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 2, volunteer_two: 3, active: true },
      { id: 3, volunteer_one: 1, volunteer_two: 3, active: false}
    ];

    // Setup fake data
    const INPUT = { active: true };
    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("UPDATE") >= 0) {
        values.should.contain(2);
        return {affectedRows: 1};
      }
      throw {name: "FakeSQLError", sqlMessage: "Query not supported."};
    };

    TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_DATA)
    .then(() => {

      // Start request
      chai.request(serverEnv.nodeServer)
        .post(pathPrefix + "/volunteerpairs/2/active")
        .send(INPUT)
        .end((err, res) => {
          // Verify results
          res.should.have.status(204);
          done();
        });
    });
  }

  @test("Toggle POST should fail gracefully handle SQL errors")
  public toggleDBFail(done: MochaDone) {
    if (serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE) instanceof FakeSQL === false) {
      done(); // This only works with FakeSQL faking server errors
      return;
    }

    // Get SQL connector instance
    const sqlInstance = serverEnv.container.get<ISQLService>(IFACES.ISQLSERVICE);
    const sqlQuery = sqlInstance.makeQuery.bind(sqlInstance);

    // Fake data
    const DB_DATA = [
      { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
      { id: 2, volunteer_one: 2, volunteer_two: 3, active: true },
      { id: 3, volunteer_one: 1, volunteer_two: 3, active: false}
    ];

    // Setup fake data
    const INPUT = { active: true };
    FakeSQL.response = undefined;

    TestReplaceHelper.replaceParallel(sqlQuery, "volunteer_pairing", DB_DATA)
    .then(() => {

      // Start request
      chai.request(serverEnv.nodeServer)
        .post(pathPrefix + "/volunteerpairs/2/active")
        .send(INPUT)
        .end((err, res) => {
          // Verify results
          res.should.have.status(500);
          done();
        });
    });
  }

  @test("Toggle POST should fail on non-existent ID")
  public togglePostBadId(done: MochaDone) {
    // Setup fake data
    const INPUT = { active: true };
    const REQUESTS_DATA = {affectedRows: 0};
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteerpairs/10/active")
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

  @test("Toggle POST should fail on invalid ID")
  public togglePostInvalidId(done: MochaDone) {
    // Setup fake data
    const INPUT = {};
    FakeSQL.response = {};

    // Start request
    chai.request(serverEnv.nodeServer)
      .post(pathPrefix + "/volunteerpairs/fake/active")
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
