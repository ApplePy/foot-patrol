#! /usr/bin/env node
"use strict";

// Set NODE_ENV if not set
if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = "development";
}

// Ensure database connection variables exist
if (process.env.MYSQL_HOST === undefined ||
    process.env.MYSQL_PASS === undefined ||
    process.env.MYSQL_USER === undefined ||
    process.env.MYSQL_DB === undefined) {
        throw new Error("ERROR: Database connection environment variables do not exist!");
}

// Imports
let server = require("./server");
let http = require("http");

// Pick the environment port or default to 8080
let httpPort = normalizePort(process.env.PORT || 8080);
let app = server.Server.bootstrap().app; // Why the bootstrap function??
app.set("port", httpPort);
let httpServer = http.createServer(app).listen(httpPort);

//add error handler and start listening on port
httpServer.on("error", onErrorGen(httpPort));
httpServer.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 * @param {int} val Proposed port value
 */
function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onErrorGen(port) {
  return (error) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

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
 */
function onListening() {
  let addr = httpServer.address();
  let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}

module.exports.httpServer = httpServer;   // For supporting tests
