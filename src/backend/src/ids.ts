/**
 * Interfaces marked as Injectable.
 */
export const IFACES = {
  IROUTE: Symbol("IROUTE"),
  ISANITIZER: Symbol("ISANITIZER"),
  ISQLSERVICE: Symbol("ISQLSERVICE"),
  IREQUESTSMANAGER: Symbol("IREQUESTSMANAGER"),
  IVOLUNTEERSMANAGER: Symbol("IVOLUNTEERSMANAGER"),
  IVOLUNTEERPAIRINGMANAGER: Symbol("IVOLUNTEERPAIRINGMANAGER")
};

/**
 * Names to retrieve specific implementations of interfaces.
 */
export const TAGS = {
  REQUESTS: Symbol("REQUESTS"),
  VOLUNTEERS: Symbol("VOLUNTEERS"),
  PAIRINGS: Symbol("PAIRINGS")
};
