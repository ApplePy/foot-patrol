import { NextFunction, Request, Response, Router } from "express";

export class LocationsRoute {

  public router: Router;

  /**
   * Constructor
   *
   * @class LocationsRoute
   * @constructor
   */
  constructor() {
    // Log
    console.log("[LocationsRoute::create] Creating index route.");

    // Create router
    this.router = Router();

    // Add to router
    this.router.get("/", (req: Request, res: Response, next: NextFunction) => {
      this.locations(req, res, next);
    });
  }

  /**
   * The locations route
   *
   * @class LocationsRoute
   * @method locations
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /locations Request all Foot Patrol destinations.
   * @apiDescription Currently not paginated.
   * @apiVersion 1.0.0
   * @apiName GetLocations
   * @apiGroup Locations
   *
   * @apiExample Example usage:
   * curl -i http://localhost/locations
   *
   * @apiSuccess {string[]} locations Array of locations.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        locations: ["SEB", "UCC"]
   *     }
   */
  public locations(req: Request, res: Response, next: NextFunction) {
    // Stub data right now TODO: Fix
    res.send( {locations: ["SEB", "UCC", "NS", "TEB"]});
  }
}
