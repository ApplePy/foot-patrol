#! /usr/bin/env node
"use strict";

////////////////////////////
//                        //
//       ENV SETUP        //
//                        //
////////////////////////////

// Set NODE_ENV if not set
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = "development";
}

// Ensure database connection variables exist
if (process.env.MYSQL_HOST === undefined ||
  process.env.MYSQL_PASS === undefined ||
  process.env.MYSQL_USER === undefined ||
  process.env.MYSQL_DB === undefined) {
    if (process.env.NODE_ENV === "test") {
      console.warn("WARNING: Database connection environment variables do not exist! (test env)");
    } else {
      throw new Error("ERROR: Database connection environment variables do not exist!");
    }
}

////////////////////////////
//                        //
//        IMPORTS         //
//                        //
////////////////////////////

// Imports
import * as http from "http";
import * as inversify from "inversify";
import "reflect-metadata";
import { IFACES, TAGS } from "./ids";
import { IRoute } from "./routes/iroute";
import { LocationsRoute } from "./routes/locations";
import { RequestsRoute } from "./routes/requests";
import { Server } from "./server";
import { ISanitizer } from "./services/isanitizer";
import { ISQLService } from "./services/isqlservice";
import { MySQLService } from "./services/mysql_service";
import { Sanitizer } from "./services/sanitizer";
// TODO: IoC Loggers and Status Error and import

/**
 * Setup server with environment
 */
class ServerEnvironmentSetup {
  public expressServer: Server;
  public nodeServer: any;
  public container: inversify.Container;  // IoC Container

  /**
   * Constructor
   */
  constructor() {
    // Setup container
    this.container = new inversify.Container();

    this.container.bind<IRoute>(IFACES.IROUTE).to(RequestsRoute).whenTargetNamed(TAGS.REQUESTS);
    this.container.bind<ISanitizer>(IFACES.ISANITIZER).to(Sanitizer);
    this.container.bind<ISQLService>(IFACES.ISQLSERVICE).to(MySQLService).inSingletonScope();
    this.container.bind<Server>(Server).toSelf();
  }

  /**
   * Start connection to MySQL and setup Node HTTP server.
   */
  public startServer() {
    // Initialize MySQL singleton
    this.container.get<ISQLService>(IFACES.ISQLSERVICE).initialize(
      process.env.MYSQL_HOST as string,
      process.env.MYSQL_USER as string,
      process.env.MYSQL_PASS as string,
      process.env.MYSQL_DB as string
    );

    // Pick the environment port or default to 8080
    const httpPort = this.normalizePort(process.env.PORT || 8080);
    this.expressServer = this.container.get<Server>(Server);
    this.expressServer.app.set("port", httpPort);
    this.nodeServer = http.createServer(this.expressServer.app as any).listen(httpPort);

    // Add error handler and start listening on port
    this.nodeServer.on("error", this.onErrorGen(httpPort));
    this.nodeServer.on("listening", this.onListening.bind(this, this.nodeServer));

    return this.nodeServer;
  }

  /**
   * Normalize a port into a number or string. Throw if not valid.
   * @param {string | number} val Proposed port value
   * @returns {string | number} Normalized port
   */
  private normalizePort(val: string | number): string | number {
    const port = parseInt(val as string, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    throw new Error(`Invalid port ${port}`);
  }

  /**
   * Event listener for HTTP server "error" event.
   * @param {string|number} port Port number to use in error
   */
  private onErrorGen(port: string | number) {
    return (error: any) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case "EACCES":
          console.error(bind + " requires elevated privileges");
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(bind + " is already in use");
          process.exit(1);
          break;
        default:
          throw error;
      }
    };
  }

  /**
   * Event listener for HTTP server "listening" event.
   * @param {http.httpServer} httpServer The server to listen to
   */
  private onListening(httpServer: http.Server) {
    const addr = httpServer.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Listening on " + bind);
  }
}

const server = new ServerEnvironmentSetup();

// Start server if not testing  (gives tests time to replace binds in container)
if (process.env.NODE_ENV !== "test") {
  server.startServer();
}

export default server;   // For supporting tests
