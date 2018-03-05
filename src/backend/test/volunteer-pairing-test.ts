// Set environment to test when testing
// process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";

// Class under test
import { Volunteer } from "../src/models/volunteer";
import { VolunteerPairing } from "../src/models/volunteer-pairing";

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

/**
 * Test the Locations API
 */
@suite
class VolunteerPairingTest {

  @test("Converting an object with all fields should succeed")
  public normalConvert() {
    const expected = new VolunteerPairing();
    expected.id = 1;
    expected.volunteer_one = new Volunteer({id: 1});
    expected.volunteer_two = new Volunteer({id: 2});
    expected.active = false;

    const testReq = new VolunteerPairing(
      new Volunteer({id: 1}),
      new Volunteer({id: 2}),
      false,
      1
    );
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(true);
  }

  @test("Converting an object with missing fields should succeed")
  public missingConvert() {
    const expected = new VolunteerPairing();
    expected.id = 0;
    expected.volunteer_one = new Volunteer({id: 1});
    expected.volunteer_two = new Volunteer({id: 2});
    expected.active = true;

    const testReq = new VolunteerPairing(
      new Volunteer({id: 1}),
      new Volunteer({id: 2})
    );
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(true);
  }

  @test("Converting an object with missing required fields should succeed but be marked invalid")
  public missingRequiredConvert() {
    const expected = new VolunteerPairing();
    expected.id = 0;
    expected.volunteer_one = new Volunteer({id: 1});
    expected.volunteer_two = VolunteerPairing.NullVolunteer;
    expected.active = true;

    const testReq = new VolunteerPairing(
      new Volunteer({id: 1})
    );
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(false);
  }

  @test("Converting an object with bad Volunteer order should be invalid")
  public badOrderingConvert() {
    const expected = new VolunteerPairing();
    expected.id = 0;
    expected.volunteer_one = new Volunteer({id: 2});
    expected.volunteer_two = new Volunteer({id: 1});
    expected.active = true;

    const testReq = new VolunteerPairing(
      new Volunteer({id: 2}),
      new Volunteer({id: 1})
    );
    testReq.should.deep.equal(expected);
    testReq.Valid().should.equal(false);
  }
}
