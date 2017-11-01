// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiHttp = require("chai-http");
import { suite, test } from "mocha-typescript";
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
class LocationsAPITest {

  public static before() {
    serverEnv.container.rebind<ISQLService>(IFACES.ISQLSERVICE).to(FakeSQL).inSingletonScope();  // Swap out SQL service
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

  @test("GET should return a list of locations")
  public locationsList(done: MochaDone) {
    // Setup fake data
    const LOCATIONS_DATA = [
      { id: 1, location: "UCC" },
      { id: 2, location: "SEB" }
    ];
    FakeSQL.response = LOCATIONS_DATA;

    // Start request
    chai.request(serverEnv.nodeServer)
    .get(pathPrefix + "/locations")
    .end((err, res) => {
      // Verify results
      res.should.have.status(200);
      res.body.should.have.property("locations");
      res.body.locations.should.deep.equal(["UCC", "SEB"]);
      done();
    });
  }

  @test("GET should handle DB error")
  public dbError(done: MochaDone) {
    // Setup fake data
    FakeSQL.response = undefined;

    // Start request
    chai.request(serverEnv.nodeServer)
      .get(pathPrefix + "/locations")
      .end((err, res) => {
        // Verify results
        res.should.have.status(500);
        res.body.should.have.property("error");
        res.body.should.have.property("message");
        res.body.should.not.have.property("stack");
        done();
      });
  }
}
