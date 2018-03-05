import { NextFunction, Request, Response, Router } from "express";
import { Container, inject, injectable } from "inversify";
import { IFACES, TAGS } from "../ids";
import { IRoute } from "../interfaces/iroute";
import { ISanitizer } from "../interfaces/isanitizer";
import { IVolunteersManager } from "../interfaces/ivolunteers-manager";
import { StatusError } from "../models/status-error";
import { Volunteer } from "../models/volunteer";
import { default as errStrings } from "../strings";
import { AbstractRoute } from "./abstract-route";

@injectable()
export class VolunteersRoute extends AbstractRoute implements IRoute {

  public router: Router;
  private data: IVolunteersManager;
  private sanitizer: ISanitizer;

  /**
   * Constructor
   */
  constructor(
    @inject(IFACES.IVOLUNTEERSMANAGER) data: IVolunteersManager,
    @inject(IFACES.ISANITIZER) sanitizer: ISanitizer
  ) {
    super();

    // Log
    console.log("[VolunteersRoute::create] Creating volunteers route.");

    // Save sanitizer
    this.sanitizer = sanitizer;

    // Get database (envvars were checked by index.js)
    this.data = data;

    // Create router
    this.router = Router();

    // Add to router
    this.router.get("/", this.getVolunteers.bind(this));
    this.router.post("/", this.postVolunteer.bind(this));
    this.router.get("/active", this.activeVolunteers.bind(this));
    this.router.get("/inactive", this.inactiveVolunteers.bind(this));
    this.router.get("/:id", this.getVolunteer.bind(this));
    this.router.put("/:id", this.putVolunteer.bind(this));
    this.router.patch("/:id", this.patchVolunteer.bind(this));
  }

  /**
   * Get volunteers
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/volunteers Get walking escort volunteers
   * @apiVersion 1.2.0
   * @apiName GetVolunteers
   * @apiGroup Volunteers
   *
   * @apiParam (Query Parameter) {boolean} [disabled=false] Include disabled volunteers in the response.
   *
   * @apiSuccess {object[]} volunteers Array of volunteers.
   * @apiSuccess {number} volunteers.id The record ID.
   * @apiSuccess {string} volunteers.uwo_id UWO ID of the volunter.
   * @apiSuccess {string} volunteers.first_name First name of the volunteer.
   * @apiSuccess {string} volunteers.last_name First name of the volunteer.
   * @apiSuccess {boolean} volunteers.disabled Designates if the volunteer has left Foot Patrol.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/volunteers?disabled=true
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        volunteers: [
   *          {
   *            id: 1,
   *            uwo_id: "jdoe37",
   *            first_name: "John",
   *            last_name: "Doe",
   *            disabled: false
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
  public getVolunteers(req: Request, res: Response, next: NextFunction) {

    // Test to ensure archived is valid
    if (this.validValues(req.query.disabled, undefined, "true", "false") === false) {
      next(new StatusError(400,
        errStrings.InvalidQueryParameter.Title,
        errStrings.InvalidQueryParameter.Msg));
      return;
    }

    const disabled = (req.query.disabled === "true") ? true : false;
    const filterMap = (disabled === false) ? new Map([["disabled", disabled]]) : undefined;

    // If archived records are not requested, filter by 'false'. Otherwise, don't filter to get both true and false
    this.data.getVolunteers(filterMap)
    .then((volunteers) => res.send({volunteers})) // Send results
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Get specific volunteer
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/volunteers/:id Get specific volunteer
   * @apiVersion 1.2.0
   * @apiName GetVolunteer
   * @apiGroup Volunteers
   *
   * @apiParam (URL Parameter) {number} id The id of the volunteer to retrieve.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} uwo_id UWO ID of the volunter.
   * @apiSuccess {string} first_name First name of the volunteer.
   * @apiSuccess {string} last_name First name of the volunteer.
   * @apiSuccess {boolean} disabled Designates if the volunteer has left Foot Patrol.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/volunteers/1
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        uwo_id: "jdoe37",
   *        first_name: "John",
   *        last_name: "Doe",
   *        disabled: false
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
  public getVolunteer(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Ensure valid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400,
        errStrings.InvalidURLParameter.Title,
        errStrings.InvalidURLParameter.Msg));
      return;
    }

    this.data.getVolunteer(id)
    .then((data) => res.send(data))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Post new volunteer.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {post} /api/v1/volunteers Create a new volunteer
   * @apiVersion 1.2.0
   * @apiName PostVolunteer
   * @apiGroup Volunteers
   *
   * @apiParam {string} uwo_id UWO ID of the new volunteer.
   * @apiParam {string} first_name First name of the new volunteer.
   * @apiParam {string} last_name Last name of the new volunteer.
   * @apiParam {boolean} [disabled] Whether the volunteer should be created disabled.
   *
   * @apiSuccess (Created 201) {number} id The record ID.
   * @apiSuccess (Created 201) {string} uwo_id UWO ID of the new volunteer.
   * @apiSuccess (Created 201) {string} first_name First name of the new volunteer.
   * @apiSuccess (Created 201) {string} last_name Last name of the new volunteer.
   * @apiSuccess (Created 201) {boolean} disabled Whether the volunteer is disabled.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 201 CREATED
   *     {
   *        id: 1,
   *        uwo_id: "jdoe37",
   *        first_name: "John",
   *        last_name: "Doe",
   *        disabled: false
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
  public postVolunteer(req: Request, res: Response, next: NextFunction) {
    // Sanitize data
    const cleanData = this.checkRecordData(req);

    // Check that the strings aren't empty
    if (cleanData === false) {
      next(new StatusError(400,
        errStrings.InvalidBodyParameter.Title,
        errStrings.InvalidBodyParameter.Msg));
      return;
    }

    // Create volunteer object
    const postData = new Volunteer(cleanData);

    // Insert into database and get resulting record
    this.data.createVolunteer(postData)
    .then((id) => this.data.getVolunteer(id))
    .then((getRes) => res.status(201).send(getRes))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Replace a volunteer record.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {put} /api/v1/volunteers/:id Replace a volunteer record
   * @apiDescription Omitting a parameter from the new object will delete the
   *                  field if it currently exists.
   *                  Other parameters (e.g. id), if specified, will be ignored.
   * @apiVersion 1.2.0
   * @apiName PutVolunteer
   * @apiGroup Volunteers
   *
   * @apiParam (URL Parameter) {number} id The id of the volunter record to replace.
   *
   * @apiParam {string} uwo_id UWO ID of the volunteer.
   * @apiParam {string} first_name First name of the volunteer.
   * @apiParam {string} last_name Last name of the volunteer.
   * @apiParam {boolean} [disabled] Whether the volunteer should be disabled.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} uwo_id UWO ID of the volunter.
   * @apiSuccess {string} first_name First name of the volunteer.
   * @apiSuccess {string} last_name First name of the volunteer.
   * @apiSuccess {boolean} disabled Designates if the volunteer has left Foot Patrol.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        uwo_id: "jdoe37",
   *        first_name: "John",
   *        last_name: "Doe",
   *        disabled: false
   *     }
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
  public putVolunteer(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Catch invalid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400,
        errStrings.InvalidURLParameter.Title,
        errStrings.InvalidURLParameter.Msg));
      return;
    }

    // Sanitize data
    const cleanData = this.checkRecordData(req);

    // Check that the strings aren't empty
    if (cleanData === false) {
      next(new StatusError(400,
        errStrings.InvalidBodyParameter.Title,
        errStrings.InvalidBodyParameter.Msg));
      return;
    }

    // Replace records
    const putData = new Volunteer(cleanData);
    putData.id = id;

    this.data.updateVolunteer(putData)
    .then(() => this.data.getVolunteer(id))
    .then((row) => res.send(row))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Update a volunteer record.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {patch} /api/v1/volunteers/:id Update a volunteer record
   * @apiDescription Omitting a parameter from the new object will preserve the
   *                  existing value (if it exists).
   *                  Other parameters (e.g. id), if specified, will be ignored.
   * @apiVersion 1.2.0
   * @apiName PatchVolunteer
   * @apiGroup Volunteers
   *
   * @apiParam (URL Parameter) {number} id The id of the volunteer to update.
   *
   * @apiParam {string} [uwo_id] UWO ID of the volunteer.
   * @apiParam {string} [first_name] First name of the volunteer.
   * @apiParam {string} [last_name] Last name of the volunteer.
   * @apiParam {boolean} [disabled] Whether the volunteer should be disabled.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} uwo_id UWO ID of the volunter.
   * @apiSuccess {string} first_name First name of the volunteer.
   * @apiSuccess {string} last_name First name of the volunteer.
   * @apiSuccess {boolean} disabled Designates if the volunteer has left Foot Patrol.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        uwo_id: "jdoe37",
   *        first_name: "John",
   *        last_name: "Doe",
   *        disabled: false
   *     }
   *
   * @apiError (Error 400) InvalidURLParameter The ID was invalid.
   * @apiError (Error 400) InvalidBodyParameter A parameter was invalid.
   * @apiError (Error 404) NotFoundError The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "Not Found Error",
   *        message: "The requested data was not found."
   *     }
   */
  public patchVolunteer(req: Request, res: Response, next: NextFunction) {
    // Check for invalid ID
    if (isNaN(Number(req.params.id)) || Number(req.params.id) < 0) {
      next(new StatusError(400,
        errStrings.InvalidURLParameter.Title,
        errStrings.InvalidURLParameter.Msg));
      return;
    }

    // Maps column to sanitizing function
    const sanitizeMap: any = {
      uwo_id: this.sanitizer.sanitize,
      first_name: this.sanitizer.sanitize,
      last_name: this.sanitizer.sanitize,
      disabled: Boolean
    };

    // List of sanitized data
    let updateDict: any;
    try {
      updateDict = this.sanitizer.sanitizeMap(sanitizeMap, req.body);
    } catch (err) {
      next(new StatusError(400,
        errStrings.InvalidBodyParameter.Title,
        errStrings.InvalidBodyParameter.Msg));
      return;
    }

    // Empty string check
    for (const prop of ["uwo_id", "first_name", "last_name"]) {
      if (updateDict[prop] !== undefined && updateDict[prop].length <= 0) {
        next(new StatusError(400,
          errStrings.InvalidBodyParameter.Title,
          errStrings.InvalidBodyParameter.Msg));
        return;
      }
    }

    // Construct object ID
    const patchData = new Volunteer(updateDict);
    patchData.id = Number(req.params.id);

    // Update object
    this.data.updateVolunteer(patchData, Object.keys(updateDict))
    .then(() => this.data.getVolunteer(patchData.id))
    .then((data) => res.send(data))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Get list of inactive, not-disabled volunteers
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/volunteers/inactive Get list of inactive, not-disabled volunteers
   * @apiVersion 1.2.0
   * @apiName GetInactiveVolunteers
   * @apiGroup Volunteers
   *
   * @apiSuccess {object[]} volunteers Array of volunteers.
   * @apiSuccess {number} volunteers.id The record ID.
   * @apiSuccess {string} volunteers.uwo_id UWO ID of the volunter.
   * @apiSuccess {string} volunteers.first_name First name of the volunteer.
   * @apiSuccess {string} volunteers.last_name First name of the volunteer.
   * @apiSuccess {boolean} volunteers.disabled Designates if the volunteer has left Foot Patrol.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/volunteers/inactive
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        volunteers: [
   *          {
   *            id: 1,
   *            uwo_id: "jdoe37",
   *            first_name: "John",
   *            last_name: "Doe",
   *            disabled: false
   *          }
   *        ]
   *     }
   */
  public inactiveVolunteers(req: Request, res: Response, next: NextFunction) {
    // Make query
    this.data.getUnpairedVolunteers()
    .then((volunteers) => res.send({volunteers}))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Get list of actively patrolling volunteers
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/volunteers/active Get list of actively patrolling volunteers
   * @apiVersion 1.2.0
   * @apiName GetActiveVolunteers
   * @apiGroup Volunteers
   *
   * @apiSuccess {object[]} volunteers Array of volunteers.
   * @apiSuccess {number} volunteers.id The record ID.
   * @apiSuccess {string} volunteers.uwo_id UWO ID of the volunter.
   * @apiSuccess {string} volunteers.first_name First name of the volunteer.
   * @apiSuccess {string} volunteers.last_name First name of the volunteer.
   * @apiSuccess {boolean} volunteers.disabled Designates if the volunteer has left Foot Patrol.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/volunteers/active
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        volunteers: [
   *          {
   *            id: 1,
   *            uwo_id: "jdoe37",
   *            first_name: "John",
   *            last_name: "Doe",
   *            disabled: false
   *          }
   *        ]
   *     }
   */
  public activeVolunteers(req: Request, res: Response, next: NextFunction) {
    // Make query
    this.data.getPairedVolunteers()
    .then((volunteers) => res.send({volunteers}))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Check a request to ensure all data is added.
   *
   * @param req The request to check for missing data.
   */
  private checkRecordData(req: Request) {
    try {
      // tslint:disable:variable-name
      const uwo_id = this.sanitizer.sanitize(req.body.uwo_id);
      const first_name = this.sanitizer.sanitize(req.body.first_name);
      const last_name = this.sanitizer.sanitize(req.body.last_name);
      const disabled = (req.body.disabled === true || req.body.disabled === "true") ? true : false;
      // tslint:enable:variable-name

      // Check that the strings aren't empty
      for (const prop of [uwo_id, first_name, last_name]) {
        if (prop.length <= 0) {
          return false;
        }
      }

      return {uwo_id, first_name, last_name, disabled};
    } catch (err) {
      return false;
    }
  }
}
