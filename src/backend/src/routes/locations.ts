import { NextFunction, Request, Response, Router } from "express";
import { Container, inject, injectable } from "inversify";
import { IFACES, TAGS } from "../ids";
import { ISQLService } from "../services/isqlservice";
import { IRoute } from "./iroute";

@injectable()
export class LocationsRoute implements IRoute {
  public router: Router;
  private database: ISQLService;

  /**
   * Constructor
   */
  constructor(@inject(IFACES.ISQLSERVICE) db: ISQLService) {
    // Log
    console.log("[LocationsRoute::create] Creating index route.");

    // Get database (envvars were checked by index.js)
    this.database = db;

    // Create router
    this.router = Router();

    // Add to router
    this.router.get("/", this.locations.bind(this));
  }

  /**
   * The locations route
   * 
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/locations Request all Foot Patrol destinations.
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
    // Query the database and get results
    this.database.makeQuery("SELECT * FROM `locations`")
    .then((results) => res.send({locations: results.map((val) => val.location)})) // Convert results into array and send
    .catch((err) => next(err)); // Send generic error
  }
}
