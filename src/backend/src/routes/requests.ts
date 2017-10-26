import { NextFunction, Request, Response, Router } from "express";
import { MySQLService } from "../mysql_service";
import { Server } from "../server";
import { StatusError } from "../status_error";

export class RequestsRoute {

  public router: Router;
  private db: MySQLService;

  /**
   * Constructor
   *
   * @class RequestsRoute
   * @constructor
   */
  constructor() {
    // Log
    console.log("[RequestsRoute::create] Creating requests route.");

    // Get database (envvars were checked by index.js)
    this.db = new MySQLService(
      process.env.MYSQL_HOST as string,
      process.env.MYSQL_USER as string,
      process.env.MYSQL_PASS as string,
      process.env.MYSQL_DB as string
    );

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
   * @class RequestsRoute
   * @method getRequests
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
   * @apiSuccess {string} requests.from Escort start location.
   * @apiSuccess {string} requests.to Escort destination.
   * @apiSuccess {string} [requests.additional_info] Additional request information.
   * @apiSuccess {boolean} requests.archived Specifies if this request completed and archived.
   * @apiSuccess {object} meta The parameters used to generate the response.
   * @apiSuccess {number} meta.offset The offset from the start of the dataset.
   * @apiSuccess {number} meta.count The max number of elements requested.
   * @apiSuccess {boolean} meta.archived Whether archived requests were included in the response.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/requests?offset=0&count=10&archived=true
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        requests: [{id: 1, name: "John Doe", from: "SEB", to: "UCC", additional_info: null, archived: false}],
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

    if (isNaN(offset) || isNaN(count) || offset < 0 || count < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    // Stub data right now TODO: Fix
    const meta = {offset, count, archived};

    // Query for data
    this.db.makeQuery("SELECT * FROM `requests_view` WHERE archived = false||? LIMIT ?, ?", [archived, offset, count])
    .then((requests) => res.send({requests, meta})) // Send results
    .catch((err) => next(new Error(err.sqlMessage))); // Send generic error
  }

  /**
   * Get specific request
   *
   * @class RequestsRoute
   * @method getRequests
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
   * @apiSuccess {string} from Escort start location.
   * @apiSuccess {string} to Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   *
   * @apiExample Example usage:
   * curl -i http://localhost/requests/1
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from: "SEB",
   *        to: "UCC",
   *        additional_info: null
   *        archived: false
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

    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    // Query for data
    this.db.makeQuery("SELECT * FROM `requests_view` WHERE id=?", [id])
    .then((request) => {
      if (request.length > 0) {
        res.send(request[0]);
      } else {
        next(new StatusError(404, "Request Not Found", `The requested id '${id}' was not found.`));
      }
    }) // Send results
    .catch((err) => next(new Error(err.sqlMessage))); // Send generic error
  }

  /**
   * Post new walk escort request.
   *
   * @class RequestsRoute
   * @method postRequest
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
   * @apiParam {string} from Escort start location.
   * @apiParam {string} to Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {string} from Escort start location.
   * @apiSuccess {string} to Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from: "SEB",
   *        to: "UCC",
   *        archived: false
   *     }
   *
   * @apiError (Error 400) MissingParameters One of the post request parameters was missing.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "MissingParameters",
   *        message: "'from' and 'to' are required parameters."
   *     }
   */
  public postRequest(req: Request, res: Response, next: NextFunction) {
    // Catch missing data
    if (req.body.from === undefined || req.body.to === undefined) {
      next (new StatusError(400, "Missing Parameters", "'from' and 'to' are required parameters."));
      return;
    }

    const newData = {
      id: 1,  // TODO: Stop stubbing
      additional_info: Server.sanitize(req.body.additional_info),
      from_location: Server.sanitize(req.body.from),
      name: Server.sanitize(req.body.name),
      to_location: Server.sanitize(req.body.to),
      archived: false // TODO: Stop stubbing
    };

    // TODO: Save data
    res.status(201).send(newData);
  }

  /**
   * Replace a walk escort request.
   *
   * @class RequestsRoute
   * @method putRequest
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
   * @apiParam {string} from Escort start location.
   * @apiParam {string} to Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   * @apiParam {boolean} archived Specifies if this request is completed and archived.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {string} from Escort start location.
   * @apiSuccess {string} to Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from: "SEB",
   *        to: "UCC",
   *        archived: false
   *     }
   *
   * @apiError (Error 400) MissingParameters One of the request parameters was missing.
   * @apiError (Error 404) RequestNotFound The request ID was not found.
   * @apiErrorExample Error Response:
   *     HTTP/1.1 400 BAD REQUEST
   *     {
   *        error: "MissingParameters",
   *        message: "'from' parameter is missing."
   *     }
   */
  public putRequest(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    // Catch invalid id
    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    // Catch missing data
    if (req.body.from === undefined || req.body.to === undefined) {
      next (new StatusError(400, "Missing Parameters", "'from' and 'to' are required parameters."));
      return;
    }

    const newData = {
      id: 1,  // TODO: Stop stubbing
      additional_info: Server.sanitize(req.body.additional_info),
      from_location: Server.sanitize(req.body.from),
      name: Server.sanitize(req.body.name),
      to_location: Server.sanitize(req.body.to),
      archived: false // TODO: Stop stubbing
    };

    // TODO: Save data
    res.status(200).send(newData);
  }

  /**
   * Update a walk escort request.
   *
   * @class RequestsRoute
   * @method patchRequest
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
   * @apiParam {string} [from] Escort start location.
   * @apiParam {string} [to] Escort destination.
   * @apiParam {string} [additional_info] Additional request information.
   * @apiParam {boolean} [archived] Specifies if this request is completed and archived.
   *
   * @apiSuccess {number} id The record ID.
   * @apiSuccess {string} [name] Name of the requester.
   * @apiSuccess {string} from Escort start location.
   * @apiSuccess {string} to Escort destination.
   * @apiSuccess {string} [additional_info] Additional request information.
   * @apiSuccess {boolean} archived Specifies if this request completed and archived.
   *
   * @apiSuccessExample Success Response:
   *     HTTP/1.1 200 OK
   *     {
   *        id: 1,
   *        name: "John Doe",
   *        from: "SEB",
   *        to: "UCC",
   *        archived: false
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

    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    const newData = {
      id: 1,  // TODO: Stop stubbing
      additional_info: Server.sanitize(req.body.additional_info),
      from_location: Server.sanitize(req.body.from),
      name: Server.sanitize(req.body.name),
      to_location: Server.sanitize(req.body.to),
      archived: false // TODO: Stop stubbing
    };

    // TODO: Save data
    res.status(200).send(newData);
  }

  /**
   * Get specific request
   *
   * @class RequestsRoute
   * @method getRequests
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

    if (isNaN(id) || id < 0) {
      next(new StatusError(400, "Invalid Query Parameter", "Offset and/or count are not numbers >= 0."));
      return;
    }

    // TODO: Actually return stuff
    if (id !== 1) {
      next(new StatusError(404, "RequestNotFound", "Request ID ${id} was not found."));
    } else {
      res.sendStatus(204);
    }
  }
}
