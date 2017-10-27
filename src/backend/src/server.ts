import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import { Container, inject, injectable, named } from "inversify";
import * as logger from "morgan";
import * as path from "path";
import { IFACES, TAGS } from "./ids";
import { ErrorMiddleware as ErrMid } from "./services/loggers";

// Routes
import { IRoute } from "./routes/iroute";

/**
 * The Express server.
 */
@injectable()
export class Server {
  public app: express.Application;
  private cookieSecret: "myTotallySecretSecret";

  // Routes
  private locationRoute: IRoute;
  private requestRoute: IRoute;

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor(
    @inject (IFACES.IROUTE) @named(TAGS.LOCATIONS) locationRoute: IRoute,
    @inject (IFACES.IROUTE) @named(TAGS.REQUESTS) requestRoute: IRoute) {
    // Save DI
    this.locationRoute = locationRoute;
    this.requestRoute = requestRoute;

    // create expressjs application
    this.app = express();

    // configure application
    this.config();

    // add api
    this.api();

    // add error handling
    this.errorHandling();
  }

  /**
   * Configure application
   */
  private config() {
    // Loggers and parsers
    if (process.env.NODE_ENV !== "test") {
      // Turn off logging during testing
      this.app.use(logger("dev")); // using 'dev' logger, TODO: Change
    }
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
   * Create REST API routes
   */
  private api() {
    let router: express.Router;
    router = express.Router();

    // Start routes
    router.use("/locations", this.locationRoute.router);
    router.use("/requests", this.requestRoute.router);

    // Greeting page
    router.get("/", (req, res, next) => res.send("Welcome to the Foot Patrol API!"));

    // Default response
    router.use("*", (req, res, next) => res.sendStatus(404));

    // Use router middleware
    if (process.env.NODE_ENV === "development") {
      this.app.use("/api/v1", router);  // Manually change API endpoint when in dev
    } else {
      this.app.use(router); // External systems will handle the path remap in prod
    }

    this.app.use("/", (req, res, next) => res.sendStatus(404));
  }

  /**
   * Create error handling middleware
   */
  private errorHandling() {
    // Log to console
    this.app.use(ErrMid.log);

    // Log StatusError
    this.app.use(ErrMid.statusReport);

    // Default logger
    this.app.use(ErrMid.fallback);
  }
}
