import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import { Container, inject, injectable, named } from "inversify";
import * as logger from "morgan";
import * as path from "path";
import { stringify } from "querystring";
import { IFACES, TAGS } from "./ids";
import { ErrorMiddleware as ErrMid } from "./services/loggers";

// Routes
import { IHook, RunPosition } from "./interfaces/ihook";
import { IRoute } from "./interfaces/iroute";
import { ITask } from "./interfaces/itask";

/**
 * The Express server.
 */
@injectable()
export class Server {
  public app: express.Application;
  private cookieSecret = "myTotallySecretSecret";

  // Routes
  private requestRoute: IRoute;
  private volunteerRoute: IRoute;
  private pairingRoute: IRoute;
  private hooks: IHook[];
  private tasks: ITask[];

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor(
    @inject (IFACES.IROUTE) @named(TAGS.REQUESTS) requestRoute: IRoute,
    @inject (IFACES.IROUTE) @named(TAGS.VOLUNTEERS) volunteerRoute: IRoute,
    @inject (IFACES.IROUTE) @named(TAGS.PAIRINGS) pairingRoute: IRoute
  ) {
    // Save DI
    this.requestRoute = requestRoute;
    this.volunteerRoute = volunteerRoute;
    this.pairingRoute = pairingRoute;
    this.hooks = [];
    this.tasks = [];

    // create expressjs application
    this.app = express();

    // configure application
    this.config();

    // add api
    this.api();

    // Add post-api configuration
    this.postConfig();

    // add error handling
    this.errorHandling();
  }

  /**
   * Configure application
   */
  private config() {
    // Loggers and parsers
    if (process.env.NODE_ENV === "development") {
      this.app.use(logger("dev")); // using 'dev' logger
    } else if (process.env.NODE_ENV !== "test") {
      // Don't log during tests
      this.app.use(logger("combined")); // using apache combined logger
    }
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser(this.cookieSecret));

    // Control response headers
    this.app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
      // Leave the dual server system in place for everything except production
      response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      response.header("Access-Control-Allow-Methods", "POST, PATCH, GET, PUT, DELETE, OPTIONS");
      next();
    });

    // Set json header and API routes
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.setHeader("Content-Type", "application/json");
      next();
    });

    // Register tasks
    for (const task of this.tasks) {
      task.register();
    }

    // Get pre-hooks
    const hooks = this.hooks.filter((x) => x.time === RunPosition.PRE);

    // Attach all hooks
    this.app.use((req, res, next) => {
      for (const hook of hooks) {
        this.callHook(hook, req);
      }
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
    router.use("/requests", this.requestRoute.Router);
    router.use("/volunteers", this.volunteerRoute.Router);
    router.use("/volunteerpairs", this.pairingRoute.Router);

    // Greeting page
    router.get("/", (req, res, next) => res.send({greeting: "Welcome to the Foot Patrol API!"}));

    // Default response
    router.use("*", (req, res, next) => res.sendStatus(404));

    // Accept api base and redirect during development
    if (process.env.NODE_ENV !== "production") {
      // Redirect /api/v1 calls to root
      this.app.use("/api/v1", router);
    }

    // Use router middleware
    this.app.use("/", router);
  }

  /**
   * Call an API hook
   */
  private callHook(hook: IHook, req: express.Request) {
    // Create new function to automatically call next
    const wrap = (request: express.Request, nextFunc: express.NextFunction) => {
      hook.callback(request); nextFunc();
    };

    // Call async if requested, normal otherwise
    if (hook.async) {
      setTimeout(wrap.bind(hook), 0, req);
    } else {
      wrap.call(hook, req);
    }
  }

  /**
   * Run configuration after the API routes
   */
  private postConfig() {
    // Get post-hooks
    const hooks = this.hooks.filter((x) => x.time === RunPosition.POST);

    // Call post-API hooks
    this.app.use((req, res, next) => {
      for (const hook of hooks) {
        this.callHook(hook, req);
      }
      next();
    });
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
