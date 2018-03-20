import { inject, injectable } from "inversify";
import { IFACES } from "../ids";
import { IVolunteerPairingManager } from "../interfaces/ipairing-manager";
import { IRequestsManager } from "../interfaces/irequests-manager";
import { ITask } from "../interfaces/itask";
import { TravelStatus } from "../models/travel-request";
import { Volunteer } from "../models/volunteer";

@injectable()
class SchedulerTask implements ITask {
  private pairMgr: IVolunteerPairingManager;
  private reqMgr: IRequestsManager;

  constructor(
    @inject(IFACES.IVOLUNTEERPAIRINGMANAGER) pairMgr: IVolunteerPairingManager,
    @inject(IFACES.IREQUESTSMANAGER) reqMgr: IRequestsManager,
  ) {
    // Get database (envvars were checked by index.js)
    this.pairMgr = pairMgr;
    this.reqMgr = reqMgr;
  }

  public register(): NodeJS.Timer {
    throw new Error("Method not implemented.");
  }
  public unregister(): void {
    throw new Error("Method not implemented.");
  }

  public scheduleRequests() {
    // Get volunteer pairs that aren't disabled or busy
    return this.pairMgr.getUnassignedPairs()
    .then((pairs) => {
      const pairLocations: {[int: string]: {latitude: number, longitude: number}} = {};

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
    .then((data) => {
      // TODO: Pairing algorithm
    });

    // Pairing algorithm
    // for all request, calculate distance to all available pairs, and save the highest
    // for all requests, starting from highest possible distance, find the lowest distance volunteer and assign
    // Write assignments to DB
  }

  private avg(first: number, second: number) {
    return first + second / 2;
  }
}
