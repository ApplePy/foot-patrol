import { NextFunction, Request, Response, Router } from "express";
import { Container, inject, injectable } from "inversify";
import { isNull, isNullOrUndefined } from "util";
import { IFACES, TAGS } from "../ids";
import { ISanitizer } from "../services/isanitizer";
import { ISQLService } from "../services/isqlservice";
import { StatusError } from "../services/status_error";
import { IRoute } from "./iroute";

@injectable()
export class RequestsRoute implements IRoute {

  public router: Router;
  private db: ISQLService;
  private sanitizer: ISanitizer;

  get Router(): Router {
    return this.router;
  }

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
   * Sanitizes a flat map with the mapped sanitize functions
   * 
   * @param sanitizeMap The functions to use to sanitize different keys
   * @param newData The flat map to sanitize
   * @returns an array of key-value objects
   */
  public sanitizeMap(sanitizeMap: any, newData: any) {
    const updateList: any[] = [];

    for (const key in sanitizeMap) {
      // Don't look down the prototype chain
      if (!sanitizeMap.hasOwnProperty(key)) { continue; }

      // If a property with that column is found, sanitize and add to updateList
      if (newData[key] !== undefined) {
        const sanFunc = sanitizeMap[key];
        updateList.push({
          key: key as string,
          value: sanFunc(newData[key])
        });
        // Final structure of updateList: [{key: column, value: value}, ...]
      }
    }

    // Return data
    return updateList as [{key: string, value: any}];
  }

  /**
   * Creates an SQL update query. Data must be pre-sanitized!
   * 
   * @param id The id to update
   * @param updateList The list of columns and their new values to be updated in the SQL query
   * @param table The table to update
   * @returns an object with the query string and the values array
   */
  public constructSQLUpdateQuery(id: number, table: string, updateList: [{key: string, value: any}]):
   {query: string, values: any[]} | null {

    // Construct prepared columns
    let kvPairs = "";
    updateList.forEach((pair) => kvPairs = kvPairs.concat(`${pair.key}=?, `));

    if (kvPairs.length <= 0) {
      return null;
    } else {
      // Create prepared query string
      kvPairs = kvPairs.substring(0, kvPairs.length - 2); // Chop off the trailing ', '
      const query = `UPDATE ${table} SET ${kvPairs} WHERE ID=?`;
      const values = [...updateList.map((pair) => pair.value), id];

      return {query, values};
    }
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

    // Query for data
    this.db.makeQuery("SELECT * FROM `requests` WHERE archived = false||? LIMIT ?, ?", [archived, offset, count]) // TODO: Why false||? ???
    .then((requests) => requests.map((val) => { // Convert int back to bool
      val.archived = Boolean(val.archived);
      return val;
    }))
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
      isNullOrUndefined(req.body.from_location) ||
      isNullOrUndefined(req.body.to_location) ||
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

    // Insert into database and get resulting record
    this.db.makeQuery(
      "INSERT INTO `requests` (name, from_location, to_location, additional_info) VALUES(?,?,?,?)",
      [req.body.name, req.body.from_location, req.body.to_location, req.body.additional_info])
    .catch(this.checkBadForeignKey(next))
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
   * @apiError (Error 400) MissingOrInvalidParameters One of the request parameters was missing.
   * @apiError (Error 400) InvalidLocation One of the location parameters refer to a non-existent location.
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
      isNullOrUndefined(req.body.from_location) ||
      isNullOrUndefined(req.body.to_location) ||
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

    // Replace records via an UPDATE
    this.db.makeQuery(
      "UPDATE requests SET name=?, from_location=?, to_location=?, additional_info=?, archived=? WHERE id=?",
      [req.body.name, req.body.from_location, req.body.to_location, req.body.additional_info, req.body.archived, id])
      .catch(this.checkBadForeignKey(next))
      .then(this.checkRowUpdated(id, next))
      .then(() => this.getId(id))
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
   * @apiError (Error 400) InvalidLocation One of the location parameters equal or refer to a non-existent location.
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
      name: this.sanitizer.sanitize,
      from_location: this.sanitizer.sanitize,
      to_location: this.sanitizer.sanitize,
      additional_info: this.sanitizer.sanitize,
      archived: Boolean
    };

    // List of sanitized data
    const updateList = this.sanitizeMap(sanitizeMap, req.body);

    // Locaion check
    const from = updateList.find((val: {key: string, value: any}) => val.key === "from_location");
    const to = updateList.find((val: {key: string, value: any}) => val.key === "to_location");
    if (from !== undefined && to !== undefined && from.value === to.value) {
      next(new StatusError(400, "Invalid Location", "Locations should not equal."));
    }

    // Construct SQL query
    const sqlQueryData = this.constructSQLUpdateQuery(id, "requests", updateList);
    let prom = Promise.resolve();

    // Issue update if there's updates
    if (!isNull(sqlQueryData)) {
      // Make patch query
      prom = this.db.makeQuery(sqlQueryData.query, sqlQueryData.values)
      .catch(this.checkBadForeignKey(next))
      .then(this.checkRowUpdated(id, next));
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
    this.db.makeQuery("DELETE FROM `requests` WHERE id=?", [id])
    .then(this.checkRowUpdated(id, next))
    .then(() => res.sendStatus(204))
    .catch((err) => next(err));
  }

  /**
   * Get the request_view for an ID number.
   * 
   * @param id The id to retrieve
   */
  private getId(id: number) {
    // Query for data
    return this.db.makeQuery("SELECT * FROM `requests` WHERE id=?", [id])
    .then((request) => {
      if (request.length > 0) {
        return request[0];
      } else {
        return Promise.reject(new StatusError(404, "Request Not Found", `The requested id '${id}' was not found.`));
      }
    })
    .then((val) => { // Convert int back to bool
      val.archived = Boolean(val.archived);
      return val;
    });
  }

  /**
   * Check for invalid foreign key SQL error. Call in promise 'catch'
   * 
   * @param next The function to call on error
   */
  private checkBadForeignKey(next: NextFunction) {
    return (err: any) => {
      // Catch invalid locations
      if (err.message.search("ER_NO_REFERENCED_ROW_2") >= 0) {
        next(new StatusError(400, "Invalid Location", "Location does not exist."));
      } else {
        next(err);
      }
    };
  }

  /**
   * Check to make sure a row was updated. Call in promise 'then'
   * 
   * @param id ID that was supposed to be updated
   * @param next Function to call on error
   */
  private checkRowUpdated(id: number, next: NextFunction) {
    return (results: any) => {  // Make sure a record was updated
      if (results.affectedRows === 0) {
        return Promise.reject(new StatusError(404, "RequestNotFound", `Request ID ${id} was not found.`));
      }
      return Promise.resolve();
    };
  }
}
