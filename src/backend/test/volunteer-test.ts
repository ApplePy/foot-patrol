// Set environment to test when testing
// process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";

// Class under test
import { Volunteer } from "../src/models/volunteer";

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

/**
 * Test the Locations API
 */
@suite
class VolunteerTest {

  @test("Converting an object with all fields should succeed")
  public normalConvert() {
    // Setup
    const testData = {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      uwo_id: "jdoe37",
      disabled: "false",
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const expected = new Volunteer();
    expected.id = 1;
    expected.first_name = "John";
    expected.last_name = "Doe";
    expected.uwo_id = "jdoe37";
    expected.disabled = false;
    expected.latitude = "42.9849";
    expected.longitude = "81.2453";
    expected.timestamp = new Date("2017-10-26T06:51:05.000Z");


    const testReq = new Volunteer(testData);
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(true);
  }

  @test("Converting an object with missing fields should succeed")
  public missingConvert() {
    // Setup
    const testData = {
      first_name: "John",
      last_name: "Doe",
      uwo_id: "jdoe37",
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const expected = new Volunteer();
    expected.id = 0;
    expected.first_name = "John";
    expected.last_name = "Doe";
    expected.uwo_id = "jdoe37";
    expected.disabled = false;
    expected.latitude = "42.9849";
    expected.longitude = "81.2453";
    expected.timestamp = new Date("2017-10-26T06:51:05.000Z");

    const testReq = new Volunteer(testData);
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(true);
  }

  @test("Converting an object with missing required fields should succeed but be marked invalid")
  public missingRequiredConvert() {
    // Setup
    const testData = {
      first_name: "John",
      last_name: "Doe",
      disabled: "false",
      latitude: "42.9849",
      longitude: "81.2453",
      timestamp: "2017-10-26T06:51:05.000Z"
    };
    const expected = new Volunteer();
    expected.id = 0;
    expected.first_name = "John";
    expected.last_name = "Doe";
    expected.disabled = false;
    expected.latitude = "42.9849";
    expected.longitude = "81.2453";
    expected.timestamp = new Date("2017-10-26T06:51:05.000Z");

    const testReq = new Volunteer(testData);
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(false);
  }
}
