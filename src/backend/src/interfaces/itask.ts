/**
 * Interface for objects that connect to the task system.
 */
export interface ITask {
  /**
   * Registration function to setup a task (can be recurrent).
   */
  register(): NodeJS.Timer;

  /**
   * Registration function to stop a task (can be recurrent).
   */
  unregister(): void;
}
