// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiHttp = require("chai-http");
import { skip, suite, test } from "mocha-typescript";
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
const pathPrefix = "";  // For adding '/api/v1' to api calls if needed

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

  @test("should return a list of requests")
  public requestsList(done: MochaDone) {
    const EXPECTED_RESULTS = {
      requests: [
        {
          id: 1, name: "John Doe", from_location: "SEB",
          to_location: "UCC", additional_info: null,
          archived: false, timestamp: "2017-10-26T06:51:05.000Z"
        }
      ],
      meta: { offset: 0, count: 1, archived: true }
    };

    // Setup fake data
    const REQUESTS_DATA = (query: string, values: any[]) => {
      values.should.deep.equal([true, 0, 1]);
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
      .query({ offset: 0, count: 1, archived: true })
      .end((err, res) => {
        // Verify results
        res.should.have.status(200);
        res.body.should.have.property("requests");
        res.body.should.have.property("meta");
        res.body.should.deep.equal(EXPECTED_RESULTS);
        done();
      });
  }

  @test("should handle DB error")
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

  @test("should return one request")
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

  @test("should fail with 404")
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
}
