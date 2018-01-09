import { NextFunction, Request, Response, Router } from "express";
import { Container, inject, injectable } from "inversify";
import { IFACES, TAGS } from "../ids";
import { IRequestsManager } from "../interfaces/irequests-manager";
import { IRoute } from "../interfaces/iroute";
import { ISanitizer } from "../interfaces/isanitizer";
import { StatusError } from "../models/status-error";
import { TravelRequest } from "../models/travel-request";

@injectable()
export class RequestsRoute implements IRoute {

  public router: Router;
  private data: IRequestsManager;
  private sanitizer: ISanitizer;

  get Router(): Router {
    return this.router;
  }

  /**
   * Constructor
   */
  constructor(
    @inject(IFACES.IREQUESTSMANAGER) data: IRequestsManager,
    @inject(IFACES.ISANITIZER) sanitizer: ISanitizer) {
    // Log
    console.log("[RequestsRoute::create] Creating requests route.");

    // Save sanitizer
    this.sanitizer = sanitizer;

    // Get database (envvars were checked by index.js)
    this.data = data;

    // Create router
    this.router = Router();

    // Add to router
    this.router.get("/", this.getRequests.bind(this));
    this.router.post("/", this.postRequest.bind(this));
    this.router.get("/:id", this.getRequest.bind(this));
    this.router.put("/:id", this.putRequest.bind(this));
    this.router.patch("/:id", this.patchRequest.bind(this));
    this.router.delete("/:id", this.deleteRequest.bind(this));
  }

  /**
   * Sanitizes a flat map with the mapped sanitize functions
   *
   * @param sanitizeMap The functions to use to sanitize different keys
   * @param newData The flat map to sanitize
   * @returns an array of key-value objects
   */
  public sanitizeMap(sanitizeMap: any, newData: any) {
    const updateList: {[key: string]: any} = {};

    for (const key in sanitizeMap) {
      // Don't look down the prototype chain
      if (!sanitizeMap.hasOwnProperty(key)) { continue; }

      // If a property with that column is found, sanitize and add to updateList
      if (newData[key] !== undefined) {
        const sanFunc = sanitizeMap[key];
        updateList[key as string] = sanFunc(newData[key]);
        // Final structure of updateList: {column: value, ...}
      }
    }

    // Return data
    return updateList;
  }

  /**
   * Get requests
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/requests Get walking escort requests
   * @apiVersion 1.1.0
   * @apiName GetRequests
   * @apiGroup Requests
   *
   * @apiParam (Query Parameter) {number} offset The number of elements to skip when filling request.
   * @apiParam (Query Parameter) {number} count The maximum number of elements return.
   * @apiParam (Query Parameter) {boolean} [archived=false] Include archived requests in the response.
   *
   * @apiSuccess {string[]} requests Array of requests.
   * @apiSuccess {number} requests.id The record ID.
   * @apiSuccess {string} [requests.name] Name of the requester.
   * @apiSuccess {string} requests.from_location Escort start location.
   * @apiSuccess {string} requests.to_location Escort destination.
   * @apiSuccess {string} [requests.additional_info] Additional request information.
   * @apiSuccess {boolean} requests.archived Specifies if this request completed and archived.
   * @apiSuccess {string} requests.timestamp Timestamp the record was created.
   * @apiSuccess {object} meta The parameters used to generate the response.
   * @apiSuccess {number} meta.offset The offset from_location the start of the dataset.
   * @apiSuccess {number} meta.count The max number of elements requested.
   * @apiSuccess {boolean} meta.archived Whether archived requests were included in the response.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/requests?offset=0&count=10&archived=true
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        requests: [
   *          {
   *            id: 1,
   *            name: "John Doe",
   *            from_location: "SEB",
   *            to_location: "UCC",
   *            additional_info: null,
   *            archived: false,
   *            timestamp: "2017-10-26T06:51:05.000Z"
   *          }
   *        ],
   *        meta: {offset: 0, count: 10, archived: true}
   *     }
   *
   * @apiError (Error 400) InvalidQueryParameters One of the URL query parameters was invalid.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "InvalidQueryParameters",
   *        message: "Offset and/or count are not numbers >= 0."
   *     }
   */
  public getRequests(req: Request, res: Response, next: NextFunction) {

    // Test to ensure archived is valid
    if (req.query.archived !== undefined) {

      req.query.archived = req.query.archived.toLowerCase();  // Normalize text

      // Check valid value
      if (req.query.archived !== "true" && req.query.archived !== "false") {
        next(new StatusError(400, "Invalid Query Parameter", "Archived must be 'true', 'false' or undefined."));
        return;
      }

    }

    const offset = Number(req.query.offset);
    const count = Number(req.query.count);
    const archived = (req.query.archived === "true") ? true : false;  // Capitalization fix done in previous `if`

    // Ensure valid parameters
    if (isNaN(offset) || isNaN(count) || offset < 0 || count < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    const meta = {offset, count, archived};

    // If archived records are not requested, filter by 'false'. Otherwise, don't filter to get both true and false
    this.data.getRequests(offset, count, (archived === false) ? new Map([["archived", archived]]) : undefined)
    .then((requests) => res.send({requests, meta})) // Send results
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Get specific request
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /api/v1/requests/:id Get specific request
   * @apiVersion 1.0.0
   * @apiName GetRequest
   * @apiGroup Requests
   *
   * @apiParam (URL Parameter) {number} id The id of the request to retrieve.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {string} from_location Escort start location.
   * @apiSuccess {string} to_location Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   * @apiSuccess {string} timestamp Timestamp the record was created.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/requests/1
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from_location: "SEB",
   *        to_location: "UCC",
   *        additional_info: null,
   *        archived: false,
   *        timestamp: "2017-10-26T06:51:05.000Z"
   *     }
   *
   * @apiError (Error 400) InvalidQueryParameters The requested ID was invalid format.
   * @apiError (Error 404) RequestNotFound The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 404 NOT FOUND
   *     {
   *        error: "RequestNotFound",
   *        message: "Request ID '1' was not found."
   *     }
   */
  public getRequest(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Ensure valid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    this.data.getRequest(id)
    .then((data) => res.send(data))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Post new walk escort request.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {post} /api/v1/requests Create a new walk escort request
   * @apiVersion 1.1.0
   * @apiName PostRequest
   * @apiGroup Requests
   *
   * @apiParam {string} [name] Name of the requester.
   * @apiParam {string} from_location Escort start location.
   * @apiParam {string} to_location Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {string} from_location Escort start location.
   * @apiSuccess {string} to_location Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   * @apiSuccess {string} timestamp Timestamp the record was created.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from_location: "UCC",
   *        to_location: "SEB",
   *        archived: false,
   *        timestamp: "2017-10-26T06:51:05.000Z"
   *     }
   *
   * @apiError (Error 400) MissingParameters One of the post request parameters was missing or invalid.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "MissingParameters",
   *        message: "'from_location' and 'to' are required parameters."
   *     }
   */
  public postRequest(req: Request, res: Response, next: NextFunction) {
    // Catch missing data
    if (
      req.body.from_location === null || req.body.from_location === undefined ||
      req.body.to_location === null || req.body.to_location === undefined ||
      req.body.from_location === req.body.to_location
    ) {
      next (new StatusError(
        400,
        "Missing Parameters",
        "'from_location' and 'to_location' must be supplied and not equal to each other" +
        " are required parameters."));
      return;
    }

    // Sanitize data
    req.body.name = this.sanitizer.sanitize(req.body.name);
    req.body.additional_info = this.sanitizer.sanitize(req.body.additional_info);
    req.body.from_location = this.sanitizer.sanitize(req.body.from_location);
    req.body.to_location = this.sanitizer.sanitize(req.body.to_location);

    const postData = new TravelRequest(req.body);

    // Insert into database and get resulting record
    this.data.createRequest(postData)
    .then((id) => this.data.getRequest(id))
    .then((getRes) => res.status(201).send(getRes))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Replace a walk escort request.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {put} /api/v1/requests/:id Replace a walk escort request
   * @apiDescription Omitting a parameter from the new object will delete the
   *                  field if it currently exists.
   *                  Other parameters (e.g. id), if specified, will be ignored.
   * @apiVersion 1.1.0
   * @apiName PutRequest
   * @apiGroup Requests
   *
   * @apiParam (URL Parameter) {number} id The id of the request to replace.
   *
   * @apiParam {string} [name] Name of the requester.
   * @apiParam {string} from_location Escort start location.
   * @apiParam {string} to_location Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   * @apiParam {boolean} archived Specifies if this request is completed and archived.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {string} from_location Escort start location.
   * @apiSuccess {string} to_location Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   * @apiSuccess {string} timestamp Timestamp the record was created.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from_location: "UCC",
   *        to_location: "SEB",
   *        archived: false,
   *        timestamp: "2017-10-26T06:51:05.000Z"
   *     }
   *
   * @apiError (Error 400) MissingOrInvalidParameters One of the request parameters was missing or invalid.
   * @apiError (Error 404) RequestNotFound The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "MissingParameters",
   *        message: "'from_location' parameter is missing."
   *     }
   */
  public putRequest(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Catch invalid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid URL Parameter", "Id is not a number >= 0."));
      return;
    }

    // Catch missing data
    if (
      req.body.archived === undefined ||
      req.body.from_location === null || req.body.from_location === undefined ||
      req.body.to_location === null || req.body.to_location === undefined ||
      req.body.from_location === req.body.to_location) {
      next (new StatusError(
        400,
        "Missing Or Invalid Parameters",
        "A required valid parameter is missing."));
      return;
    }

    // Sanitize data
    req.body.archived = (req.body.archived === true || req.body.archived === "true") ? true : false;
    req.body.name = this.sanitizer.sanitize(req.body.name);
    req.body.additional_info = this.sanitizer.sanitize(req.body.additional_info);
    req.body.from_location = this.sanitizer.sanitize(req.body.from_location);
    req.body.to_location = this.sanitizer.sanitize(req.body.to_location);

    // Replace records
    const putData = new TravelRequest(req.body);
    putData.id = id;

    this.data.updateRequest(putData)
    .then(() => this.data.getRequest(id))
    .then((row) => res.send(row))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Update a walk escort request.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {patch} /api/v1/requests/:id Update a walk escort request
   * @apiDescription Omitting a parameter from the new object will preserve the
   *                  existing value (if it exists).
   *                  Other parameters (e.g. id), if specified, will be ignored.
   * @apiVersion 1.1.0
   * @apiName PatchRequest
   * @apiGroup Requests
   *
   * @apiParam (URL Parameter) {number} id The id of the request to update.
   *
   * @apiParam {string} [name] Name of the requester.
   * @apiParam {string} [from_location] Escort start location.
   * @apiParam {string} [to_location] Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   * @apiParam {boolean} [archived] Specifies if this request is completed and archived.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {string} from_location Escort start location.
   * @apiSuccess {string} to_location Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   * @apiSuccess {string} timestamp Timestamp the record was created.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from_location: "UCC",
   *        to_location: "SEB",
   *        archived: false,
   *        timestamp: "2017-10-26T06:51:05.000Z"
   *     }
   * @apiError (Error 400) InvalidQueryParameters The requested ID was invalid format.
   * @apiError (Error 400) InvalidLocation One of the location parameters equal.
   * @apiError (Error 404) RequestNotFound The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 404 NOT FOUND
   *     {
   *        error: "RequestNotFound",
   *        message: "Request ID 1 was not found."
   *     }
   */
  public patchRequest(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Check for invalid ID
    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "ID is required"));
      return;
    }

    // Maps column to sanitizing function
    const sanitizeMap: any = {
      additional_info: this.sanitizer.sanitize,
      archived: Boolean,
      from_location: this.sanitizer.sanitize,
      name: this.sanitizer.sanitize,
      to_location: this.sanitizer.sanitize
    };

    // List of sanitized data
    const updateDict = this.sanitizeMap(sanitizeMap, req.body);

    // Locaion check
    if (updateDict.from_location !== undefined
        && updateDict.to_location !== undefined
        && updateDict.from_location === updateDict.to_location
    ) {
      next(new StatusError(400, "Invalid Location", "Locations should not equal."));
      return;
    }

    const patchData = new TravelRequest(updateDict);
    patchData.id = id;

    // Update object
    this.data.updateRequest(patchData, Object.keys(updateDict))
    .then(() => this.data.getRequest(id))
    .then((data) => res.send(data))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Get specific request
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {delete} /api/v1/requests/:id Delete specific request
   * @apiVersion 1.1.0
   * @apiName DeleteRequest
   * @apiGroup Requests
   *
   * @apiParam (URL Parameter) {number} id The id of the request to delete.
   *
   * @apiExample Example usage:
   * curl -X DELETE -i http://localhost/requests/1
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 204 NO CONTENT
   *
   * @apiError (Error 400) InvalidQueryParameters The requested ID was invalid format.
   * @apiError (Error 404) RequestNotFound The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 404 NOT FOUND
   *     {
   *        error: "RequestNotFound",
   *        message: "Request ID 1 was not found."
   *     }
   */
  public deleteRequest(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Check for invalid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    // Make delete query
    this.data.deleteRequest(id)
    .then(() => res.sendStatus(204))
    .catch((err) => next(this.translateErrors(err))); // Send generic error
  }

  /**
   * Translate generic errors from data layer into HTTP errors.
   *
   * @param err
   */
  private translateErrors(err: Error) {
    if (err.message === "Not Found") {
      return new StatusError(404, "Not Found", `ID was not found.`);
    } else {
      return new StatusError(500, "Internal Server Error", "An error has occurred.");
    }
  }
}
