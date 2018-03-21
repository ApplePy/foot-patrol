import { inject, injectable } from "inversify";
import * as PriorityQueue from "js-priority-queue";
import { IFACES } from "../ids";
import { IVolunteerPairingManager } from "../interfaces/ipairing-manager";
import { IRequestsManager } from "../interfaces/irequests-manager";
import { ITask } from "../interfaces/itask";
import { TravelRequest, TravelStatus } from "../models/travel-request";
import { Volunteer } from "../models/volunteer";
import { VolunteerPairing } from "../models/volunteer-pairing";

@injectable()
class SchedulerTask implements ITask {
  private interval = 10;  // 10 seconds
  private pairMgr: IVolunteerPairingManager;
  private reqMgr: IRequestsManager;
  private timer: number | undefined;

  constructor(
    @inject(IFACES.IVOLUNTEERPAIRINGMANAGER) pairMgr: IVolunteerPairingManager,
    @inject(IFACES.IREQUESTSMANAGER) reqMgr: IRequestsManager,
  ) {
    // Get database (envvars were checked by index.js)
    this.pairMgr = pairMgr;
    this.reqMgr = reqMgr;
  }

  /**
   * Registration function to setup a task (can be recurrent).
   */
  public register() {
    this.timer = setInterval(this.scheduleRequests.bind(this), this.interval * 1000);
  }

  /**
   * Registration function to stop a task (can be recurrent).
   */
  public unregister(): void {
    // Sanity check
    if (typeof(this.timer) !== "number") {
      throw new Error("Trying to unregister an inactive task");
    }

    clearTimeout(this.timer as number);
  }

  public scheduleRequests() {
    // Get volunteer pairs that aren't disabled or busy
    return this.pairMgr.getUnassignedPairs()
    .then((pairs) => {
      const pairLocations: {[id: number]: {latitude: number, longitude: number}} = {};

      // Go through pairs and get their average location
      for (const pair of pairs) {
        const latConv = [
          Number(pair.volunteer_one.latitude),
          Number(pair.volunteer_two.longitude),
          Number(pair.volunteer_one.latitude),
          Number(pair.volunteer_two.longitude)
        ];

        // If this pair has a location, then compute their average
        if (latConv.findIndex((x) => isNaN(x)) === -1) {
          pairLocations[pair.id] = {
            latitude: this.avg(latConv[0], latConv[2]),
            longitude: this.avg(latConv[1], latConv[3])
          };
        }
      }

      return pairLocations;
    })
    .then((pairLocations) => {
      // Get first pairs to assign
      return this.reqMgr.getRequests(
        0,
        Object.keys(pairLocations).length,
        new Map([["status", TravelStatus.REQUESTED]]))
      .then((requests) => ({pairLocations, requests}));
    })
    .then((data) => this.pairingAlgorithm(data.pairLocations, data.requests));
  }

  /**
   * Pairing algorithm:
   * For all request, calculate distance to all available pairs, and save the
   * highest for all requests, starting from highest possible distance, find the
   * lowest distance volunteer and assign. Then write assignments to DB.
   *
   * @param volunteerPairs The volunteer pairs to be paired
   * @param requests The requests to be matched to volunteer pairs
   */
  private pairingAlgorithm(
    volunteerPairs: {[id: number]: {latitude: number, longitude: number}},
    requests: TravelRequest[]
  ) {
    // Get Priority Queue
    const comparator = (a: RequestPairing, b: RequestPairing) => b.distance - a.distance;
    const queue = new PriorityQueue<RequestPairing>({comparator});

    // Calculate distances between requests and the volunteers
    for (const req of requests) {
      for (const id of Object.keys(volunteerPairs)) {
        const volPair = volunteerPairs[Number(id)];
        const reqPos = this.getLatLon(req.from_location);
        const volPos = {latitude: volPair.latitude, longitude: volPair.longitude};

        // Create RequestPairing to save distance
        const pair = {id: Number(id), ...volPair};
        queue.queue(new RequestPairing(
          pair,
          req,
          this.calculateNYDistance(volPos, reqPos)
        ));
      }
    }

    // Loop through the requests that could get burned the worst
    const updates: Array<Promise<void>> = [];
    while (queue.length > 0) {
      const pair = queue.dequeue();

      // Save to db
      pair.request.pairing = pair.volunteerPair.id;
      pair.request.status = TravelStatus.ASSIGNED;
      updates.push(this.reqMgr.updateRequest(pair.request, ["pairing", "status"]));
    }

    // Send out the updates
    return Promise.all(updates);
  }

  private avg(first: number, second: number) {
    return first + second / 2;
  }

  private calculateNYDistance(
    a: {latitude: number, longitude: number},
    b: {latitude: number, longitude: number}
  ) {
    return Math.abs(b.latitude - a.latitude) + Math.abs(b.longitude - a.longitude);
  }

  private getLatLon(gpsString: string) {
    const position = gpsString.split(" ");
    return {latitude: Number(position[0]), longitude: Number(position[1])};
  }
}

// tslint:disable-next-line:max-classes-per-file
class RequestPairing {
  public volunteerPair: {id: number, latitude: number, longitude: number};
  public request: TravelRequest;
  public distance: number;

  constructor(
    pair: {id: number, latitude: number, longitude: number},
    req: TravelRequest, dist: number
  ) {
    this.volunteerPair = pair;
    this.request = req;
    this.distance = dist;
  }
}
