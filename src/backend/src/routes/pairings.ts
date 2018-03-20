import { NextFunction, Request, Response, Router } from "express";
import { Container, inject, injectable } from "inversify";
import { IFACES, TAGS } from "../ids";
import { IVolunteerPairingManager } from "../interfaces/ipairing-manager";
import { IRoute } from "../interfaces/iroute";
import { ISanitizer } from "../interfaces/isanitizer";
import { IVolunteersManager } from "../interfaces/ivolunteers-manager";
import { StatusError } from "../models/status-error";
import { Volunteer } from "../models/volunteer";
import { VolunteerPairing } from "../models/volunteer-pairing";
import { default as errStrings } from "../strings";
import { AbstractRoute } from "./abstract-route";

@injectable()
export class VolunteerPairingsRoute extends AbstractRoute implements IRoute {

  public router: Router;
  private data: IVolunteerPairingManager;
  private volmgr: IVolunteersManager;
  private sanitizer: ISanitizer;

  /**
   * Constructor
   */
  constructor(
    @inject(IFACES.IVOLUNTEERSMANAGER) volmgr: IVolunteersManager,
    @inject(IFACES.IVOLUNTEERPAIRINGMANAGER) data: IVolunteerPairingManager,
    @inject(IFACES.ISANITIZER) sanitizer: ISanitizer
  ) {
    super();

    // Log
    console.log("[VolunteerPairingsRoute::create] Creating volunteer pairings route.");

    // Save sanitizer
    this.sanitizer = sanitizer;

    // Get database (envvars were checked by index.js)
    this.data = data;
    this.volmgr = volmgr;

    // Create router
    this.router = Router();

    // Add to router
    this.router.get("/", this.getPairings.bind(this));
    this.router.post("/", this.postPairing.bind(this));
    this.router.get("/:id", this.getPairing.bind(this));
    this.router.post("/:id/active", this.togglePairing.bind(this));
  }

  /**
   * Get volunteer pairs
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/volunteerpairs Get walking escort volunteer pairs.
   * @apiVersion 1.2.0
   * @apiName GetVolunteerPairs
   * @apiGroup VolunteerPairs
   *
   * @apiParam (Query Parameter) {boolean} [inactive=false] Include inactive pairs in the response.
   *
   * @apiSuccess {object[]} pairs Array of volunteer pairs.
   * @apiSuccess {number} pairs.id The record ID.
   * @apiSuccess {boolean} pairs.active Designates if the pair is currently working.
   * @apiSuccess {object[]} pairs.volunteers The volunteers in the pair.
   * @apiSuccess {number} pairs.volunteers.id The record ID.
   * @apiSuccess {string} pairs.volunteers.uwo_id UWO ID of the volunter.
   * @apiSuccess {string} pairs.volunteers.first_name First name of the volunteer.
   * @apiSuccess {string} pairs.volunteers.last_name First name of the volunteer.
   * @apiSuccess {boolean} pairs.volunteers.disabled Designates if the volunteer has left Foot Patrol.
   * @apiSuccess {string} pairs.volunteers.latitude Last known volunteer latitude.
   * @apiSuccess {string} pairs.volunteers.longitude Last known volunteer longitude.
   * @apiSuccess {string} pairs.volunteers.timestamp Timestamp of last update to volunteer location.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/volunteerpairs?inactive=true
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        pairs: [
   *          {
   *            id: 1,
   *            active: true
   *            volunteers: [
   *              {
   *                id: 1,
   *                uwo_id: "jdoe37",
   *                first_name: "John",
   *                last_name: "Doe",
   *                disabled: false,
   *                latitude: "42.9849",
   *                longitude: "81.2453",
   *                timestamp: "2017-10-26T06:51:05.000Z"
   *              },
   *              {
   *                id: 2,
   *                uwo_id: "jdoe38",
   *                first_name: "Jane",
   *                last_name: "Doe",
   *                disabled: false,
   *                latitude: "42.9849",
   *                longitude: "81.2453",
   *                timestamp: "2017-10-26T06:51:05.000Z"
   *              }
   *            ]
   *          }
   *        ]
   *     }
   *
   * @apiError (Error 400) InvalidQueryParameter One of the URL query parameters was invalid.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "Invalid Query Parameter",
   *        message: "A required query parameter is missing or out of range."
   *     }
   */
  public getPairings(req: Request, res: Response, next: NextFunction) {

    // Test to ensure archived is valid
    if (this.validValues(req.query.inactive, undefined, "true", "false") === false) {
      next(new StatusError(400,
        errStrings.InvalidQueryParameter.Title,
        errStrings.InvalidQueryParameter.Msg));
      return;
    }

    const inactive = (req.query.inactive === "true") ? true : false;
    const filterMap = (inactive === false) ? new Map([["active", !inactive]]) : undefined;

    // If archived records are not requested, filter by 'false'. Otherwise, don't filter to get both true and false
    this.data.getPairings(filterMap)
    .then((pairings) => pairings.map((pairing) => this.formatPair(pairing)))
    .then((pairs) => res.send({pairs})) // Send results
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Get specific volunteer pair
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/volunteerpairs/:id Get specific volunteer pair
   * @apiVersion 1.2.0
   * @apiName GetVolunteerPair
   * @apiGroup VolunteerPairs
   *
   * @apiParam (URL Parameter) {number} id The id of the volunteer pair to retrieve.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {boolean} active Designates if the pair is currently working.
   * @apiSuccess {object[]} volunteers The volunteers in the pair.
   * @apiSuccess {number} volunteers.id The record ID.
   * @apiSuccess {string} volunteers.uwo_id UWO ID of the volunter.
   * @apiSuccess {string} volunteers.first_name First name of the volunteer.
   * @apiSuccess {string} volunteers.last_name First name of the volunteer.
   * @apiSuccess {boolean} volunteers.disabled Designates if the volunteer has left Foot Patrol.
   * @apiSuccess {string} volunteers.latitude Last known volunteer latitude.
   * @apiSuccess {string} volunteers.longitude Last known volunteer longitude.
   * @apiSuccess {string} volunteers.timestamp Timestamp of last update to volunteer location.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/volunteerpairs/1
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        active: true
   *        volunteers: [
   *          {
   *            id: 1,
   *            uwo_id: "jdoe37",
   *            first_name: "John",
   *            last_name: "Doe",
   *            disabled: false,
   *            latitude: "42.9849",
   *            longitude: "81.2453",
   *            timestamp: "2017-10-26T06:51:05.000Z"
   *          },
   *          {
   *            id: 2,
   *            uwo_id: "jdoe38",
   *            first_name: "Jane",
   *            last_name: "Doe",
   *            disabled: false,
   *            latitude: "42.9849",
   *            longitude: "81.2453",
   *            timestamp: "2017-10-26T06:51:05.000Z"
   *          }
   *        ]
   *     }
   *
   * @apiError (Error 400) InvalidURLParameter The requested ID was invalid format.
   * @apiError (Error 404) NotFoundError The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 404 NOT FOUND
   *     {
   *        error: "Not Found Error",
   *        message: "The requested data was not found."
   *     }
   */
  public getPairing(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Ensure valid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400,
        errStrings.InvalidURLParameter.Title,
        errStrings.InvalidURLParameter.Msg));
      return;
    }

    this.data.getPairing(id)
    .then((pairing) => this.formatPair(pairing))
    .then((data) => res.send(data))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Post new volunteer pair
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {post} /api/v1/volunteerpairs Create a new volunteer pair
   * @apiVersion 1.2.0
   * @apiName PostVolunteerPair
   * @apiGroup VolunteerPairs
   *
   * @apiParam {boolean} active Designates if the pair is currently working.
   * @apiParam {number[]} volunteers The IDs of the volunteers in the pair (must be 2, in ascending order).
   *
   * @apiSuccess (Created 201) {number} id The record ID.
   * @apiSuccess (Created 201) {boolean} active Designates if the pair is currently working.
   * @apiSuccess (Created 201) {object[]} volunteers The volunteers in the pair.
   * @apiSuccess (Created 201) {number} volunteers.id The record ID.
   * @apiSuccess (Created 201) {string} volunteers.uwo_id UWO ID of the volunter.
   * @apiSuccess (Created 201) {string} volunteers.first_name First name of the volunteer.
   * @apiSuccess (Created 201) {string} volunteers.last_name First name of the volunteer.
   * @apiSuccess (Created 201) {boolean} volunteers.disabled Designates if the volunteer has left Foot Patrol.
   * @apiSuccess (Created 201) {string} volunteers.latitude Last known volunteer latitude.
   * @apiSuccess (Created 201) {string} volunteers.longitude Last known volunteer longitude.
   * @apiSuccess (Created 201) {string} volunteers.timestamp Timestamp of last update to volunteer location.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 201 CREATED
   *     {
   *        id: 1,
   *        active: true
   *        volunteers: [
   *          {
   *            id: 1,
   *            uwo_id: "jdoe37",
   *            first_name: "John",
   *            last_name: "Doe",
   *            disabled: false,
   *            latitude: "42.9849",
   *            longitude: "81.2453",
   *            timestamp: "2017-10-26T06:51:05.000Z"
   *          },
   *          {
   *            id: 2,
   *            uwo_id: "jdoe38",
   *            first_name: "Jane",
   *            last_name: "Doe",
   *            disabled: false,
   *            latitude: "42.9849",
   *            longitude: "81.2453",
   *            timestamp: "2017-10-26T06:51:05.000Z"
   *          }
   *        ]
   *     }
   *
   * @apiError (Error 400) InvalidBodyParameter One of the post request parameters was missing or invalid.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "Invalid Body Parameter",
   *        message: "A required body parameter is missing or out of range."
   *     }
   */
  public postPairing(req: Request, res: Response, next: NextFunction) {
    // Sanitize data
    const cleanData = this.checkRecordData(req);

    // Check that the strings aren't empty
    if (cleanData === false) {
      next(new StatusError(400,
        errStrings.InvalidBodyParameter.Title,
        errStrings.InvalidBodyParameter.Msg));
      return;
    }

    // Create volunteer pairing object
    Promise.all(cleanData.volunteers)
    .then((volunteers) => new VolunteerPairing(
        volunteers[0],
        volunteers[1],
        cleanData.active))

    // Insert into database and get resulting record
    .then((postData) => this.data.createPairing(postData))
    .then((id) => this.data.getPairing(id))
    .then((pairing) => this.formatPair(pairing))
    .then((getRes) => res.status(201).send(getRes))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Toggle active state of a volunteer pairing record.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {post} /api/v1/volunteerpairs/:id/active Toggle active state of a volunteer pairing record
   * @apiVersion 1.2.0
   * @apiName ToggleVolunteerPairState
   * @apiGroup VolunteerPairs
   *
   * @apiParam (URL Parameter) {number} id The id of the volunter pairing record to replace.
   *
   * @apiParam {boolean} active Designates if the pair is currently working.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 204 NO CONTENT
   *
   * @apiError (Error 400) InvalidURLParameter The ID was invalid.
   * @apiError (Error 400) InvalidBodyParameter One of the request parameters was missing or invalid.
   * @apiError (Error 404) NotFoundError The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "Invalid Body Parameter",
   *        message: "A required body parameter is missing or out of range."
   *     }
   */
  public togglePairing(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Catch invalid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400,
        errStrings.InvalidURLParameter.Title,
        errStrings.InvalidURLParameter.Msg));
      return;
    }

    // Check active status
    if (this.validValues(req.body.active, "false", "true", true, false) === false) {
      next(new StatusError(400,
        errStrings.InvalidBodyParameter.Title,
        errStrings.InvalidBodyParameter.Msg));
      return;
    }

    // Toggle state in DB
    this.data.toggleActive(id, Boolean(req.body.active))
    .then(() => res.sendStatus(204))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Check a request to ensure all data is added.
   *
   * @param req The request to check for missing data.
   */
  private checkRecordData(req: Request) {
    // Check types
    if (
      req.body.active === undefined ||
      Array.isArray(req.body.volunteers) === false ||
      req.body.volunteers.length !== 2
    ) {
      return false;
    }

    // Check values
    const dupChecker = new Set<number>();
    for (const val of req.body.volunteers) {
      if (Number.isSafeInteger(val) === false || val <= 0 || dupChecker.has(Number(val))) {
        return false;
      }

      // Add to set to check for duplicates
      dupChecker.add(Number(val));
    }

    // Sort volunter IDs
    const ids: number[] = req.body.volunteers.map((val: any) => Number(val)).sort();

    return {
      active: Boolean(req.body.active),
      volunteers: ids.map((x) => this.volmgr.getVolunteer(x))
    };
  }

  /**
   * Converts a VolunteerPairing into the format used in the api
   *
   * @param pair The pair to be converted
   */
  private formatPair(pair: VolunteerPairing) {
    return {
      id: pair.id,
      volunteers: [pair.volunteer_one, pair.volunteer_two],
      active: pair.active
    };
  }
}
