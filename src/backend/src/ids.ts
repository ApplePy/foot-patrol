/**
 * Interfaces marked as Injectable.
 */
export const IFACES = {
  IROUTE: Symbol("IROUTE"),
  ISANITIZER: Symbol("ISANITIZER"),
  ISQLSERVICE: Symbol("ISQLSERVICE")
};

/**
 * Names to retrieve specific implementations of interfaces.
 */
export const TAGS = {
  LOCATIONS: Symbol("LOCATIONS"),
  REQUESTS: Symbol("REQUESTS")
};
