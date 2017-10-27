import { NextFunction, Request, Response, Router } from "express";
import { Container, inject, injectable } from "inversify";
import { IFACES, TAGS } from "../ids";
import { ISanitizer } from "../services/isanitizer";
import { ISQLService } from "../services/isqlservice";
import { StatusError } from "../services/status_error";

@injectable()
export class RequestsRoute {

  public router: Router;
  private db: ISQLService;
  private sanitizer: ISanitizer;

  /**
   * Constructor
   */
  constructor(
    @inject(IFACES.ISQLSERVICE) db: ISQLService,
    @inject(IFACES.ISANITIZER) sanitizer: ISanitizer) {
    // Log
    console.log("[RequestsRoute::create] Creating requests route.");

    // Save sanitizer
    this.sanitizer = sanitizer;

    // Get database (envvars were checked by index.js)
    this.db = db;

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
   * Get requests
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /requests Get walking escort requests
   * @apiVersion 1.0.0
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
    const offset = Number(req.query.offset);
    const count = Number(req.query.count);
    const archived = Boolean(req.query.archived);

    // Ensure valid parameters
    if (isNaN(offset) || isNaN(count) || offset < 0 || count < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    // Stub data right now TODO: Fix
    const meta = {offset, count, archived};

    // Query for data
    this.db.makeQuery("SELECT * FROM `requests_view` WHERE archived = false||? LIMIT ?, ?", [archived, offset, count])
    .then((requests) => res.send({requests, meta})) // Send results
    .catch((err) => next(err)); // Send generic error
  }

  /**
   * Get specific request
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {get} /requests/:id Get specific request
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

    this.getId(id)
    .then((data) => res.send(data))
    .catch((err) => next(err)); // Send generic error
  }

  /**
   * Post new walk escort request.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {post} /requests Create a new walk escort request
   * @apiVersion 1.0.0
   * @apiName PostRequest
   * @apiGroup Requests
   *
   * @apiParam {string} [name] Name of the requester.
   * @apiParam {number} from_location Escort start location.
   * @apiParam {number} to_location Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {number} from_location Escort start location.
   * @apiSuccess {number} to_location Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   * @apiSuccess {string} timestamp Timestamp the record was created.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from_location: 1,
   *        to_location: 2,
   *        archived: false,
   *        timestamp: "2017-10-26T06:51:05.000Z"
   *     }
   *
   * @apiError (Error 400) MissingParameters One of the post request parameters was missing.
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
      isNaN(req.body.from_location) ||
      isNaN(req.body.to_location) ||
      req.body.from_location <= 0 ||
      req.body.to_location <= 0) {
      next (new StatusError(
        400,
        "Missing Parameters",
        "'from_location' and 'to_location' greater than 0 are required parameters."));
      return;
    }

    // Sanitize data
    req.body.name = this.sanitizer.sanitize(req.body.name);
    req.body.additional_info = this.sanitizer.sanitize(req.body.additional_info);

    // Insert into database and get resulting record
    this.db.makeQuery(
      "INSERT INTO `requests` (name, from_location, to_location, additional_info) VALUES(?,?,?,?)",
      [req.body.name, req.body.from_location, req.body.to_location, req.body.additional_info])
    .catch((err) => next(err))
    .then((results: any) => this.getId(results.insertId))
    .then((getRes) => res.status(201).send(getRes))
    .catch((err) => next(err));
  }

  /**
   * Replace a walk escort request.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {put} /requests/:id Replace a walk escort request
   * @apiDescription Omitting a parameter from the new object will delete the
   *                  field if it currently exists.
   *                  Other parameters (e.g. id), if specified, will be ignored.
   * @apiVersion 1.0.0
   * @apiName PutRequest
   * @apiGroup Requests
   *
   * @apiParam (URL Parameter) {number} id The id of the request to replace.
   *
   * @apiParam {string} [name] Name of the requester.
   * @apiParam {number} from_location Escort start location.
   * @apiParam {number} to_location Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   * @apiParam {boolean} archived Specifies if this request is completed and archived.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {number} from_location Escort start location.
   * @apiSuccess {number} to_location Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   * @apiSuccess {string} timestamp Timestamp the record was created.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from_location: 1,
   *        to_location: 2,
   *        archived: false,
   *        timestamp: "2017-10-26T06:51:05.000Z"
   *     }
   *
   * @apiError (Error 400) MissingParameters One of the request parameters was missing.
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
      isNaN(req.body.from_location) ||
      isNaN(req.body.to_location) ||
      req.body.from_location <= 0 ||
      req.body.to_location <= 0) {
      next (new StatusError(
        400,
        "Missing Parameters",
        "A required valid parameter is missing."));
      return;
    }

    // Sanitize data
    req.body.archived = Boolean(req.body.archived);
    req.body.name = this.sanitizer.sanitize(req.body.name);
    req.body.additional_info = this.sanitizer.sanitize(req.body.additional_info);

    // Replace records via an UPDATE
    this.db.makeQuery(
      "UPDATE requests SET name=?, from_location=?, to_location=?, additional_info=?, archived=? WHERE id=?",
      [req.body.name, req.body.from_location, req.body.to_location, req.body.additional_info, req.body.archived, id])
      .then((update: any) => {  // Make sure a record was updated
        if (update.affectedRows === 0) {
          return Promise.reject(new StatusError(404, "RequestNotFound", `Request ID ${id} was not found.`));
        } else {
          return this.getId(id);
        }
      })
      .then((row) => res.send(row))
      .catch((err) => next(err));
  }

  /**
   * Update a walk escort request.
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {patch} /requests/:id Update a walk escort request
   * @apiDescription Omitting a parameter from the new object will preserve the
   *                  existing value (if it exists).
   *                  Other parameters (e.g. id), if specified, will be ignored.
   * @apiVersion 1.0.0
   * @apiName PatchRequest
   * @apiGroup Requests
   *
   * @apiParam (URL Parameter) {number} id The id of the request to update.
   *
   * @apiParam {string} [name] Name of the requester.
   * @apiParam {number} [from_location] Escort start location.
   * @apiParam {number} [to_location] Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   * @apiParam {boolean} [archived] Specifies if this request is completed and archived.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {number} from_location Escort start location.
   * @apiSuccess {number} to_location Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   * @apiSuccess {string} timestamp Timestamp the record was created.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from_location: 1,
   *        to_location: 2,
   *        archived: false,
   *        timestamp: "2017-10-26T06:51:05.000Z"
   *     }
   * @apiError (Error 400) InvalidQueryParameters The requested ID was invalid format.
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
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    // Valid columns
    const columnList = ["name", "from_location", "to_location", "additional_info", "archived"];

    // List of sanitized data
    const updateList: any[] = [];

    // Maps column to sanitizing function
    const sanitizeMap: any = {
      name: this.sanitizer.sanitize,
      from_location: Number,
      to_location: Number,
      additional_info: this.sanitizer.sanitize,
      archived: Boolean
    };

    columnList.forEach((val) => {
      // If a property with that column is found, sanitize and add to updateList
      if (req.body[val] !== undefined) {
        const sanFunc = sanitizeMap[val];
        updateList.push({
          key: val,
          value: sanFunc(req.body[val])
        });
        // Final structure of updateList: [{key: column, value: value}, ...]
      }
    });

    let prom = Promise.resolve();

    // Construct prepared columns
    let kvPairs = "";
    updateList.forEach((pair) => kvPairs = kvPairs.concat(`${pair.key}=? `));

    if (kvPairs.length > 0) {
      // Create prepared query string
      const queryString = `UPDATE requests SET ${kvPairs} WHERE ID=?`;

      // Make patch query
      prom = this.db.makeQuery(queryString, [...updateList.map((pair) => pair.value), id])
      .then((patch: any) => {  // Make sure a record was updated
        if (patch.affectedRows === 0) {
          return Promise.reject(new StatusError(404, "RequestNotFound", `Request ID ${id} was not found.`));
        }
        return Promise.resolve();
      });
    }

    // Return updated object
    prom.then(() => this.getId(id))
    .then((data) => res.send(data))
    .catch((err) => next(err)); // Send generic error
  }

  /**
   * Get specific request
   *
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @param next {NextFunction} Execute the next method.
   *
   * @api {delete} /requests/:id Delete specific request
   * @apiVersion 1.0.0
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
    this.db.makeQuery("DELETE FROM `requests` WHERE id=?", [id])
    .then((del: any) => {
      if (del.affectedRows === 0) {
        next(new StatusError(404, "RequestNotFound", `Request ID ${id} was not found.`));
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => next(err));
  }

  /**
   * Get the request_view for an ID number.
   * 
   * @param id The id to retrieve
   */
  private getId(id: number) {
    // Query for data
    return this.db.makeQuery("SELECT * FROM `requests_view` WHERE id=?", [id])
    .then((request) => {
      if (request.length > 0) {
        return request[0];
      } else {
        return Promise.reject(new StatusError(404, "Request Not Found", `The requested id '${id}' was not found.`));
      }
    });
  }
}
