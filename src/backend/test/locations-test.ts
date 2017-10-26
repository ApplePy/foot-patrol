// Set environment to test when testing
process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiHttp = require("chai-http");
import { suite, test } from "mocha-typescript";
import { httpServer as server} from "../src/index.js";

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
class LocationsAPITest {

  constructor() {
    // Put any needed data here
  }

  public before() {
    // hook for before each test; make static to be after the suite
  }

  public after() {
    // hook for after each test; make static to be after the suite
  }

  @test("should return a list of locations")
  public locationsList() {
    chai.request(server)
    .get(pathPrefix + "/locations")
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("locations");
      res.body.locations.should.have.length.above(0);
    });
  }
}
