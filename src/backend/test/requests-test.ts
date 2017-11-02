// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiHttp = require("chai-http");
import { only, skip, suite, test } from "mocha-typescript";
import * as mock from "ts-mockito";
import { IFACES, TAGS } from "../src/ids";
import { default as serverEnv } from "../src/index";
import { ISQLService } from "../src/services/isqlservice";
import { FakeSQL } from "./fake-sql";

// Route
import { LocationsRoute } from "../src/routes/locations";

// Chai setup
const should = chai.should();
chai.use(chaiHttp);
const pathPrefix = "/api/v1";  // For adding '/api/v1' to api calls if needed

/**
 * Test the Locations API
 */
@suite
class RequestsAPITest {

  public static before() {
    serverEnv.container.rebind<ISQLService>(IFACES.ISQLSERVICE).to(FakeSQL).inSingletonScope();
    serverEnv.startServer();
  }

  public static after() {
    serverEnv.nodeServer.close();
  }

  constructor() {
    // Put any needed data here
  }

  public before() {
    // hook for before each test; make static to be after the suite
  }

  public after() {
    // hook for after each test; make static to be after the suite
  }

  @test("GET should return a list of requests")
  public requestsList(done: MochaDone) {
    const EXPECTED_RESULTS = {
      requests: [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: false, timestamp: "2017-10-26T06:51:05.000Z"
        }
      ],
      meta: { offset: 0, count: 2, archived: false }
    };

    // Setup fake data
    const REQUESTS_DATA = (query: string, values: any[]) => {
      values.should.deep.equal([false, 0, 2]);
      return [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: 0, timestamp: "2017-10-26T06:51:05.000Z"
        }
      ];
    };
    FakeSQL.response = REQUESTS_DATA;

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
  }

  @test("GET should return a list of requests + archived requests")
  public requestsListArchived(done: MochaDone) {
    const EXPECTED_RESULTS = {
      requests: [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: false, timestamp: "2017-10-26T06:51:05.000Z"
        },
        {
          id: 2, name: "Jane Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: true, timestamp: "2017-10-26T06:51:05.000Z"
        }
      ],
      meta: { offset: 0, count: 2, archived: true }
    };

    // Setup fake data
    const REQUESTS_DATA = (query: string, values: any[]) => {
      values.should.deep.equal([true, 0, 2]);
      return [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: 0, timestamp: "2017-10-26T06:51:05.000Z"
        },
        {
          id: 2, name: "Jane Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: 1, timestamp: "2017-10-26T06:51:05.000Z"
        }
      ];
    };
    FakeSQL.response = REQUESTS_DATA;

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
  }

  @test("GET should handle DB error")
  public dbError(done: MochaDone) {
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
    const EXPECTED_RESULTS = {
      id: 1, name: "John Doe", from_location: "SEB",
      to_location: "UCC", additional_info: null,
      archived: false, timestamp: "2017-10-26T06:51:05.000Z"
    };

    // Setup fake data
    const REQUESTS_DATA = (query: string, values: any[]) => {
      values.should.deep.equal([1]);
      return [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: 0, timestamp: "2017-10-26T06:51:05.000Z"
        }
      ];
    };
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/requests/1")
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
  }

  @test("GET should fail with 404")
  public getBadId(done: MochaDone) {
    // Setup fake data
    const REQUESTS_DATA: any[] = [];
    FakeSQL.response = REQUESTS_DATA;

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

  @test("POST should create a new object, ignoring id and other properties")
  public postSuccess(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      id: 4,
      name: "John Doe",
      from_location: 1,
      to_location: 2,
      additional_info: "test",
      archived: true,
      timestamp: "lol",
      extra: "testme"
    };
    const EXPECTED_RESULTS = {
      id: 1,
      name: "John Doe",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "test",
      archived: false,
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      if (query.search("^INSERT") >= 0) {
        // Ensure unwanted properties are not being added
        ["id", "timestamp", "extra", "archived"].forEach((val) => query.search(val).should.equal(-1));
        return {insertId: 1};
      } else {
        values.should.contain(1); // Ensure correct ID was requested
        return [EXPECTED_RESULTS];
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
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
  }

  @test("POST should fail when a variable is missing")
  public postFail(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: 1
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
    // Setup fake data
    const INPUT = {
      from_location: 1,
      to_location: 2
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
      from_location: 1,
      to_location: 1
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

  @test("POST should catch non-existent locations")
  public postBadLocation(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: 10,
      to_location: 1
    };
    const REQUESTS_DATA = () => Promise.reject(new Error("ER_NO_REFERENCED_ROW_2"));
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
    // Setup fake data
    const REQUESTS_DATA = {affectedRows: 1};
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .del(pathPrefix + "/requests/5")
      .end((err, res) => {
        // Verify results
        res.should.have.status(204);
        done();
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

  @test("DELETE should fail gracefully handle SQL errors")
  public deleteDBFail(done: MochaDone) {
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
    // Setup fake data
    const INPUT = {
      id: 4,
      from_location: 1,
      to_location: 2,
      archived: true,
      timestamp: "2017-10-26T06:51:05.000Z",
      extra: "testme"
    };
    const EXPECTED_RESULTS = {
      id: 1,
      name: "John Doe",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "test",
      archived: true,
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
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
          "archived"
        ].forEach((val) => query.search(val).should.not.equal(-1));
        return {affectedRows: 1};
      } else {
        values.should.contain(1); // Ensure correct ID was requested
        return [EXPECTED_RESULTS];
      }
    };
    FakeSQL.response = REQUESTS_DATA;

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
  }

  @test("PUT should fail when a variable is missing")
  public putFail(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: 1,
      to_location: 2
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
    // Setup fake data
    const INPUT = {
      from_location: 1,
      to_location: 2,
      archived: true
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
      from_location: 1,
      to_location: 1,
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

  @test("PUT should catch non-existent locations")
  public putBadLocation(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: 10,
      to_location: 1,
      archived: false
    };
    const REQUESTS_DATA = () => Promise.reject(new Error("ER_NO_REFERENCED_ROW_2"));
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .put(pathPrefix + "/requests/10")
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
      from_location: 10,
      to_location: 1,
      archived: false
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

  @test("PATCH should update object, ignoring other parameters")
  public patchSuccess(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      id: 4,
      from_location: 1,
      timestamp: "2017-10-26T06:51:05.000Z",
      extra: "testme"
    };
    const EXPECTED_RESULTS = {
      id: 1,
      name: "John Doe",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "test",
      archived: true,
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const REQUESTS_DATA = (query: string, values: any[]) => {
      if (query.search("^UPDATE") >= 0) {
        // Check values
        values.splice(-1);  // Remove ID
        values.should.deep.equal([1]);

        // Remove WHERE parameter since it has the ID
        query = query.substr(0, query.search("WHERE") - 1);

        // Ensure unwanted properties are not being added
        ["id", "extra", "timestamp", "archived", "to_location"].forEach((val) => query.search(val).should.equal(-1));

        // Ensure wanted properties are being added
        ["from_location"].forEach((val) => query.search(val).should.not.equal(-1));

        return {affectedRows: 1};
      } else {
        values.should.contain(1); // Ensure correct ID was requested
        return [EXPECTED_RESULTS];
      }
    };
    FakeSQL.response = REQUESTS_DATA;

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
  }

  @test("PATCH should fail gracefully handle SQL errors")
  public patchDBFail(done: MochaDone) {
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
      from_location: 1,
      to_location: 1
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

  @test("PATCH should catch non-existent locations")
  public patchBadLocation(done: MochaDone) {
    // Setup fake data
    const INPUT = {
      from_location: 10
    };
    const REQUESTS_DATA = () => Promise.reject(new Error("ER_NO_REFERENCED_ROW_2"));
    FakeSQL.response = REQUESTS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
      .patch(pathPrefix + "/requests/10")
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
      from_location: 10,
      to_location: 1,
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
}
