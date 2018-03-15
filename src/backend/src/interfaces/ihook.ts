/**
 * Enum for specifying hook run time.
 */
export enum RunPosition {
  PRE,
  POST
}

/**
 * Interface for specifying hook configuration
 */
export interface IHook {
  /**
   * Specify when hook should run
   */
  time: RunPosition;

  /**
   * Specify if the hook runs asynchronously
   */
  async: boolean;

  /**
   * Specify the function to be run for the hook
   */
  callback: (request: Express.Request) => void;
}
