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
 * @apiDeprecated
 *
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

/**
 * Get requests
 *
 * @param req {Request} The express Request object.
 * @param res {Response} The express Response object.
 * @param next {NextFunction} Execute the next method.
 *
 * @api {get} /api/v1/requests Get walking escort requests
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

/**
 * Post new walk escort request.
 *
 * @param req {Request} The express Request object.
 * @param res {Response} The express Response object.
 * @param next {NextFunction} Execute the next method.
 *
 * @api {post} /api/v1/requests Create a new walk escort request
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
 * @apiError (Error 400) InvalidLocationOne of the location parameters equal or does not exist.
 * @apiErrorExample Error Response:
 *     HTTP/1.1 400 BAD REQUEST
 *     {
 *        error: "MissingParameters",
 *        message: "'from_location' and 'to' are required parameters."
 *     }
 */

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
 * @apiError (Error 400) MissingOrInvalidParameters One of the request parameters was missing.
 * @apiError (Error 400) InvalidLocationOne of the location parameters equal or does not exist.
 * @apiError (Error 404) RequestNotFound The request ID was not found.
 * @apiErrorExample Error Response:
 *     HTTP/1.1 400 BAD REQUEST
 *     {
 *        error: "MissingParameters",
 *        message: "'from_location' parameter is missing."
 *     }
 */

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
 * @apiError (Error 400) InvalidLocation  One of the location parameters equals or does not exist.
 * @apiError (Error 404) RequestNotFound The request ID was not found.
 * @apiErrorExample Error Response:
 *     HTTP/1.1 404 NOT FOUND
 *     {
 *        error: "RequestNotFound",
 *        message: "Request ID 1 was not found."
 *     }
 */

/**
 * Get specific request
 *
 * @param req {Request} The express Request object.
 * @param res {Response} The express Response object.
 * @param next {NextFunction} Execute the next method.
 *
 * @api {delete} /api/v1/requests/:id Delete specific request
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

/**
 * Get requests
 *
 * @param req {Request} The express Request object.
 * @param res {Response} The express Response object.
 * @param next {NextFunction} Execute the next method.
 *
 * @api {get} /api/v1/requests Get walking escort requests
 * @apiVersion 1.1.1
 * @apiName GetRequests
 * @apiGroup Requests
 *
 * @apiParam (Query Parameter) {number} offset The number of elements to skip when filling request.
 * @apiParam (Query Parameter) {number} count The maximum number of elements return; capped at 100.
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
 * @apiSuccess (Created 201) {number} id The record ID.
 * @apiSuccess (Created 201) {string} [name] Name of the requester.
 * @apiSuccess (Created 201) {string} from_location Escort start location.
 * @apiSuccess (Created 201) {string} to_location Escort destination.
 * @apiSuccess (Created 201) {string} [additional_info] Additional request information.
 * @apiSuccess (Created 201) {boolean} archived Specifies if this request completed and archived.
 * @apiSuccess (Created 201) {string} timestamp Timestamp the record was created.
 *
 * @apiSuccessExample Success Response:
 *     HTTP/1.1 201 CREATED
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

/**
 * Delete specific request.
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
