/**
 * Interfaces marked as Injectable.
 */
export const IFACES = {
  IROUTE: Symbol("IROUTE"),
  ISANITIZER: Symbol("ISANITIZER"),
  ISQLSERVICE: Symbol("ISQLSERVICE"),
  IREQUESTSMANAGER: Symbol("IREQUESTSMANAGER"),
  IVOLUNTEERSMANAGER: Symbol("IVOLUNTEERSMANAGER")
};

/**
 * Names to retrieve specific implementations of interfaces.
 */
export const TAGS = {
  REQUESTS: Symbol("REQUESTS")
};
