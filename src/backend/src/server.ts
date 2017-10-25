import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import {StatusError} from "./status_error";

// Routes
import { LocationsRoute } from "./routes/locations";
import { RequestsRoute } from "./routes/requests";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return { Server } Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Sanitize a user input string to be safe to work with.
   *
   * @class Server
   * @method sanitize
   * @static
   * @param str { String } The string to sanitize
   * @return { String } The sanitized version of the string.
   */
  public static sanitize(str: string) {
    // htmlEscape Source: http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
    if (typeof str !== "string") {
      return str;
    }
    return str
        .replace(/&(?![A-Za-z0-9#]{2,4};)/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\//g, "&#x2F;");
  }

  public app: express.Application;
  private cookieSecret: "myTotallySecretSecret";

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    // create expressjs application
    this.app = express();

    // configure application
    this.config();

    // add routes
    this.routes();

    // add error handling
    this.errorHandling();

    // add api
    this.api();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  private api() {
    // empty for now
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  private config() {
    // Loggers and parsers
    this.app.use(logger("dev")); // using 'dev' logger, TODO: Change
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser(this.cookieSecret));

    // Control response headers
    this.app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
      // Leave the dual server system in place for everything except production
      response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      response.header("Access-Control-Allow-Methods', 'POST, PATCH, GET, PUT, DELETE, OPTIONS");
      next();
    });

    // Set json header and API routes
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.setHeader("Content-Type", "application/json");
      next();
    });
  }

  /**
   * Create router
   *
   * @class Server
   * @method routes
   */
  private routes() {
    let router: express.Router;
    router = express.Router();

    const locations = new LocationsRoute();
    router.use("/locations", locations.router);

    const requests = new RequestsRoute();
    router.use("/requests", requests.router);

    // Greeting page
    router.get("/", (req, res, next) => res.send("Welcome to the Foot Patrol API!"));

    // Default response
    router.use("*", (req, res, next) => res.sendStatus(404));

    // Use router middleware
    this.app.use(router);
  }

  /**
   * Create error handling middleware
   *
   * @class Server
   * @method errorHandling
   */
  private errorHandling() {
    // Log to console
    this.app.use((
      err: Error | StatusError,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction) => {
        // TODO: Better logging
        console.error(err.name);
        console.error(err.message);

        // Turn on stack traces in development mode
        if (process.env.NODE_ENV === "development") {
          console.error(err.stack);
        }

        next(err);
      });

    // Log StatusError
    this.app.use((
      err: Error | StatusError,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction) => {
        if (err instanceof StatusError) {
          const error: any = {error: err.name, message: err.message};

          // Add the stack trace in development mode
          if (process.env.NODE_ENV === "development") {
            error.stack = err.stack;
          }

          res.status(err.status).send(error);
        } else {  // Not a StatusError, fallback logger.
          next(err);
        }
      });

    // Default logger
    this.app.use((
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction) => {
        if (process.env.NODE_ENV === "development") {
          // Send the error in development mode
          res.status(500).send({error: err.name, message: err.message, stack: err.stack});
        } else {
          // Send something generic in production
          res.status(500).send({error: err.name, message: "Undefined error occurred."});
        }
      });
  }
}
