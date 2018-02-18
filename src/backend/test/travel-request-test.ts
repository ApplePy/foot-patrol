// Set environment to test when testing
// process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";

// Class under test
import { TravelRequest } from "../src/models/travel-request";

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

/**
 * Test the Locations API
 */
@suite
class TravelRequestTest {

  @test("Converting an object with all fields should succeed")
  public normalConvert() {
    // Setup
    const testData = {
      id: 1,
      name: "John",
      from_location: "UCC",
      to_location: "SEB",
      additional_info: "test",
      archived: 0,
      timestamp: "2018-01-09T01:44:12.926Z"
    };
    const expected = new TravelRequest();
    expected.id = 1;
    expected.name = "John";
    expected.from_location = "UCC";
    expected.to_location = "SEB";
    expected.additional_info = "test";
    expected.archived = false;
    expected.timestamp = new Date("2018-01-09T01:44:12.926Z");

    const testReq = new TravelRequest(testData);
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(true);
  }

  @test("Converting an object with missing fields should succeed")
  public missingConvert() {
    // Setup
    const testData = {
      id: 1,
      from_location: "UCC",
      to_location: "SEB",
      archived: 0,
      timestamp: "2018-01-09T01:44:12.926Z"
    };
    const expected = new TravelRequest();
    expected.id = 1;
    expected.from_location = "UCC";
    expected.to_location = "SEB";
    expected.archived = false;
    expected.timestamp = new Date("2018-01-09T01:44:12.926Z");

    const testReq = new TravelRequest(testData);
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(true);
  }

  @test("Converting an object with missing required fields should succeed but be marked invalid")
  public missingRequiredConvert() {
    // Setup
    const testData = {
      id: 1,
      archived: 0,
      timestamp: "2018-01-09T01:44:12.926Z"
    };
    const expected = new TravelRequest();
    expected.id = 1;
    expected.archived = false;
    expected.timestamp = new Date("2018-01-09T01:44:12.926Z");

    const testReq = new TravelRequest(testData);
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(false);
  }
}
