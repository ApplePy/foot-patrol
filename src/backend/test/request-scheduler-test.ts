// Set environment to test when testing
// process.env.NODE_ENV = "test";

import * as chai from "chai";
import chaiAsPromised = require("chai-as-promised");
import { only, skip, suite, test, timeout } from "mocha-typescript";
import "reflect-metadata";
import * as mock from "ts-mockito";
import { ISQLService } from "../src/interfaces/isql-service";
import { SQLVolunteerPairingManager } from "../src/services/sql-pairings-manager";
import { SQLRequestsManager } from "../src/services/sql-requests-manager";
import { SQLVolunteersManager } from "../src/services/sql-volunteers-manager";
import { FakeSQL } from "./fake-sql";

// Class under test
import { SchedulerTask } from "../src/tasks/request-scheduler";

// Chai setup
const should = chai.should();
const eventually = chai.use(chaiAsPromised);

// Linter disables for the chai-as-promised library
// tslint:disable:no-unused-expression

/**
 * Test the Locations API
 */
@suite
class RequestSchedulerTest {
  // Base data
  private readonly VOLUNTEERS = [
    {
      id: 1, first_name: "John", last_name: "Doe", uwo_id: "jdoe1", disabled: false,
      latitude: "35", longitude: "40", timestamp: "2017-10-26T06:51:05.000Z"
    },
    {
      id: 2, first_name: "Jane", last_name: "Doe", uwo_id: "jdoe2", disabled: false,
      latitude: "35", longitude: "41", timestamp: "2017-10-26T06:51:05.000Z"
    },
    {
      id: 3, first_name: "Josh", last_name: "Doe", uwo_id: "jdoe3", disabled: false,
      latitude: "36", longitude: "40", timestamp: "2017-10-26T06:51:05.000Z"
    },
    {
      id: 4, first_name: "Jillian", last_name: "Doe", uwo_id: "jdoe4", disabled: false,
      latitude: "36", longitude: "41", timestamp: "2017-10-26T06:51:05.000Z"
    }
  ];
  private readonly PAIRING = [
    { id: 1, volunteer_one: 1, volunteer_two: 2, active: true },
    { id: 2, volunteer_one: 3, volunteer_two: 4, active: true }
  ];
  private readonly REQUESTS = [
    {
      id: 1, from_location: "34 39", to_location: "SEB", timestamp: "2017-10-26T06:51:05.000Z",
      archived: false, status: "REQUESTED", additional_info: "", pairing: null
    },
    {
      id: 2, from_location: "32 39", to_location: "SEB", timestamp: "2017-10-26T06:51:05.000Z",
      archived: false, status: "REQUESTED", additional_info: "", pairing: null
    },
    {
      id: 3, from_location: "32 39", to_location: "SEB", timestamp: "2017-10-26T06:51:05.000Z",
      archived: true, status: "REQUESTED", additional_info: "", pairing: null
    }
  ];

  private scheduler: SchedulerTask;

  constructor() {
    const backend   = new FakeSQL();
    const reqMgr    = new SQLRequestsManager(backend);
    const volMgr    = new SQLVolunteersManager(backend);
    const pairMgr   = new SQLVolunteerPairingManager(backend, volMgr);

    this.scheduler  = new SchedulerTask(pairMgr, reqMgr);
  }

  // hook for before each test; make static to be before the suite
  public before() {
    // Clear DB state
    FakeSQL.response = undefined;
  }

  @test("An equal number of requests and volunteers should all be matched together")
  public fullMatch() {
    const VOLUNTEERS = this.VOLUNTEERS.slice(0, this.VOLUNTEERS.length);
    const PAIRING = this.PAIRING.slice(0, this.PAIRING.length);
    const REQUESTS = this.REQUESTS.slice(0, this.REQUESTS.length);
    const NEW_REQUESTS: any[] = [];
    const EXPECTED = [
      {
        id: 1, from_location: "34 39", to_location: "SEB", timestamp: "2017-10-26T06:51:05.000Z",
        archived: false, status: "ASSIGNED", additional_info: "", pairing: 2
      },
      {
        id: 2, from_location: "32 39", to_location: "SEB", timestamp: "2017-10-26T06:51:05.000Z",
        archived: false, status: "ASSIGNED", additional_info: "", pairing: 1
      }
    ];

    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("UPDATE") !== -1) {
        // For writing the new request
        const req = REQUESTS.find((x) => x.id === values[values.length - 1]);
        if (req === undefined) {
          throw Error("Not Found");
        }
        req.pairing = values[0];
        req.status = values[1];
        NEW_REQUESTS.push(req);
        return {affectedRows: 1};
      } else if (query.search(new RegExp("^SELECT \\* FROM `idle_pairs`")) !== -1) {
        // For finding available pairs
        return PAIRING;
      } else if (query.search(new RegExp("^SELECT .* FROM `volunteers`")) !== -1) {
        // For finding the volunteer's data
        return [VOLUNTEERS.find((x) => x.id === values[0])];
      } else if (query.search(new RegExp("^SELECT \\* FROM `requests`")) !== -1) {
        // For finding unfulfilled requests
        return REQUESTS.filter((x) => x.status === values[0] && x.archived === values[1])
          .slice(values[2], values[2] + values[3]);
      }

      // Default fallback
      throw Error("Unhandled query");
    };

    return this.scheduler.scheduleRequests().then(() => {
      NEW_REQUESTS.sort((a, b) => b.id - a.id)
      .should.deep.equal(EXPECTED.sort((a, b) => b.id - a.id));
    });
  }

  @test("When there are more requests than volunteers, oldest requests should all be matched")
  public moreRequests() {
    const VOLUNTEERS = this.VOLUNTEERS.slice(0, this.VOLUNTEERS.length);
    const PAIRING = this.PAIRING.slice(1, this.PAIRING.length);
    const REQUESTS = this.REQUESTS.slice(0, this.REQUESTS.length);
    const NEW_REQUESTS: any[] = [];
    const EXPECTED = [
      {
        id: 1, from_location: "34 39", to_location: "SEB", timestamp: "2017-10-26T06:51:05.000Z",
        archived: false, status: "ASSIGNED", additional_info: "", pairing: 2
      }
    ];

    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("UPDATE") !== -1) {
        // For writing the new request
        const req = REQUESTS.find((x) => x.id === values[values.length - 1]);
        if (req === undefined) {
          throw Error("Not Found");
        }
        req.pairing = values[0];
        req.status = values[1];
        NEW_REQUESTS.push(req);
        return {affectedRows: 1};
      } else if (query.search(new RegExp("^SELECT \\* FROM `idle_pairs`")) !== -1) {
        // For finding available pairs
        return PAIRING;
      } else if (query.search(new RegExp("^SELECT .* FROM `volunteers`")) !== -1) {
        // For finding the volunteer's data
        return [VOLUNTEERS.find((x) => x.id === values[0])];
      } else if (query.search(new RegExp("^SELECT \\* FROM `requests`")) !== -1) {
        // For finding unfulfilled requests
        return REQUESTS.filter((x) => x.status === values[0] && x.archived === values[1])
          .slice(values[2], values[2] + values[3]);
      }

      // Default fallback
      throw Error("Unhandled query");
    };

    return this.scheduler.scheduleRequests().then(() => {
      NEW_REQUESTS.sort((a, b) => b.id - a.id)
      .should.deep.equal(EXPECTED.sort((a, b) => b.id - a.id));
    });
  }

  @test("When there are more volunteers than requests, all requests should all be matched")
  public moreVolunteers() {
    const VOLUNTEERS = this.VOLUNTEERS.slice(0, this.VOLUNTEERS.length);
    const PAIRING = this.PAIRING.slice(0, this.PAIRING.length);
    const REQUESTS = this.REQUESTS.slice(1, this.REQUESTS.length);
    const NEW_REQUESTS: any[] = [];
    const EXPECTED = [
      {
        id: 2, from_location: "32 39", to_location: "SEB", timestamp: "2017-10-26T06:51:05.000Z",
        archived: false, status: "ASSIGNED", additional_info: "", pairing: 1
      }
    ];

    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("UPDATE") !== -1) {
        // For writing the new request
        const req = REQUESTS.find((x) => x.id === values[values.length - 1]);
        if (req === undefined) {
          throw Error("Not Found");
        }
        req.pairing = values[0];
        req.status = values[1];
        NEW_REQUESTS.push(req);
        return {affectedRows: 1};
      } else if (query.search(new RegExp("^SELECT \\* FROM `idle_pairs`")) !== -1) {
        // For finding available pairs
        return PAIRING;
      } else if (query.search(new RegExp("^SELECT .* FROM `volunteers`")) !== -1) {
        // For finding the volunteer's data
        return [VOLUNTEERS.find((x) => x.id === values[0])];
      } else if (query.search(new RegExp("^SELECT \\* FROM `requests`")) !== -1) {
        // For finding unfulfilled requests
        return REQUESTS.filter((x) => x.status === values[0] && x.archived === values[1])
          .slice(values[2], values[2] + values[3]);
      }

      // Default fallback
      throw Error("Unhandled query");
    };

    return this.scheduler.scheduleRequests().then(() => {
      NEW_REQUESTS.sort((a, b) => b.id - a.id)
      .should.deep.equal(EXPECTED.sort((a, b) => b.id - a.id));
    });
  }

  @test("When there are no requests, no matching should happen")
  public noRequests() {
    const VOLUNTEERS = this.VOLUNTEERS.slice(0, this.VOLUNTEERS.length);
    const PAIRING = this.PAIRING.slice(0, this.PAIRING.length);
    const REQUESTS: any[] = [];
    const NEW_REQUESTS: any[] = [];
    const EXPECTED: any[] = [];

    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("UPDATE") !== -1) {
        // For writing the new request
        const req = REQUESTS.find((x) => x.id === values[values.length - 1]);
        if (req === undefined) {
          throw Error("Not Found");
        }
        req.pairing = values[0];
        req.status = values[1];
        NEW_REQUESTS.push(req);
        return {affectedRows: 1};
      } else if (query.search(new RegExp("^SELECT \\* FROM `idle_pairs`")) !== -1) {
        // For finding available pairs
        return PAIRING;
      } else if (query.search(new RegExp("^SELECT .* FROM `volunteers`")) !== -1) {
        // For finding the volunteer's data
        return [VOLUNTEERS.find((x) => x.id === values[0])];
      } else if (query.search(new RegExp("^SELECT \\* FROM `requests`")) !== -1) {
        // For finding unfulfilled requests
        return REQUESTS.filter((x) => x.status === values[0] && x.archived === values[1])
          .slice(values[2], values[2] + values[3]);
      }

      // Default fallback
      throw Error("Unhandled query");
    };

    return this.scheduler.scheduleRequests().then(() => {
      NEW_REQUESTS.sort((a, b) => b.id - a.id)
      .should.deep.equal(EXPECTED.sort((a, b) => b.id - a.id));
    });
  }

  @test("When there are no volunteers, no matching should happen")
  public noVolunteers() {
    const VOLUNTEERS = this.VOLUNTEERS.slice(0, 0);
    const PAIRING = this.PAIRING.slice(0, this.PAIRING.length);
    const REQUESTS = this.REQUESTS.slice(0, this.REQUESTS.length);
    const NEW_REQUESTS: any[] = [];
    const EXPECTED: any[] = [];

    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("UPDATE") !== -1) {
        // For writing the new request
        const req = REQUESTS.find((x) => x.id === values[values.length - 1]);
        if (req === undefined) {
          throw Error("Not Found");
        }
        req.pairing = values[0];
        req.status = values[1];
        NEW_REQUESTS.push(req);
        return {affectedRows: 1};
      } else if (query.search(new RegExp("^SELECT \\* FROM `idle_pairs`")) !== -1) {
        // For finding available pairs
        return PAIRING;
      } else if (query.search(new RegExp("^SELECT .* FROM `volunteers`")) !== -1) {
        // For finding the volunteer's data
        return [VOLUNTEERS.find((x) => x.id === values[0])];
      } else if (query.search(new RegExp("^SELECT \\* FROM `requests`")) !== -1) {
        // For finding unfulfilled requests
        return REQUESTS.filter((x) => x.status === values[0] && x.archived === values[1])
          .slice(values[2], values[2] + values[3]);
      }

      // Default fallback
      throw Error("Unhandled query");
    };

    return this.scheduler.scheduleRequests().then(() => {
      NEW_REQUESTS.sort((a, b) => b.id - a.id)
      .should.deep.equal(EXPECTED.sort((a, b) => b.id - a.id));
    });
  }

  @test("When there are no volunteers with location, no matching should happen")
  public volunteersWithoutLocation() {
    const VOLUNTEERS = [
      {id: 1, first_name: "John", last_name: "Doe", uwo_id: "jdoe1", disabled: false},
      {id: 2, first_name: "Jane", last_name: "Doe", uwo_id: "jdoe2", disabled: false},
      {id: 3, first_name: "Josh", last_name: "Doe", uwo_id: "jdoe3", disabled: false},
      {id: 4, first_name: "Jillian", last_name: "Doe", uwo_id: "jdoe4", disabled: false}
    ];
    const PAIRING = this.PAIRING.slice(0, this.PAIRING.length);
    const REQUESTS = this.REQUESTS.slice(0, this.REQUESTS.length);
    const NEW_REQUESTS: any[] = [];
    const EXPECTED: any[] = [];

    FakeSQL.response = (query: string, values: any[]) => {
      if (query.search("UPDATE") !== -1) {
        // For writing the new request
        const req = REQUESTS.find((x) => x.id === values[values.length - 1]);
        if (req === undefined) {
          throw Error("Not Found");
        }
        req.pairing = values[0];
        req.status = values[1];
        NEW_REQUESTS.push(req);
        return {affectedRows: 1};
      } else if (query.search(new RegExp("^SELECT \\* FROM `idle_pairs`")) !== -1) {
        // For finding available pairs
        return PAIRING;
      } else if (query.search(new RegExp("^SELECT .* FROM `volunteers`")) !== -1) {
        // For finding the volunteer's data
        return [VOLUNTEERS.find((x) => x.id === values[0])];
      } else if (query.search(new RegExp("^SELECT \\* FROM `requests`")) !== -1) {
        // For finding unfulfilled requests
        return REQUESTS.filter((x) => x.status === values[0] && x.archived === values[1])
          .slice(values[2], values[2] + values[3]);
      }

      // Default fallback
      throw Error("Unhandled query");
    };

    return this.scheduler.scheduleRequests().then(() => {
      NEW_REQUESTS.sort((a, b) => b.id - a.id)
      .should.deep.equal(EXPECTED.sort((a, b) => b.id - a.id));
    });
  }
}
