import { NextFunction, Request, Response, Router } from "express";
import { PoolConnection } from "mysql";
import { MySQLService } from "../mysql_service";

export class LocationsRoute {
  public router: Router;
  private database: MySQLService;

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
    // Get database (envvars were checked by index.js)
    this.database = new MySQLService(
      process.env.MYSQL_HOST as string,
      process.env.MYSQL_USER as string,
      process.env.MYSQL_PASS as string,
      process.env.MYSQL_DB as string
    );

    // Query the database and get results
    this.database.makeQuery("SELECT * FROM `locations`")
    .then((results) => res.send({locations: results.map((val) => val.location)})) // Convert results into array and send
    .catch((err) => next(new Error(err.sqlMessage))); // Send generic error
  }
}
