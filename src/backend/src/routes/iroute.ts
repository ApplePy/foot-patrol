import { Router } from "express";

/**
 * Interface for objects that create an Express Router object.
 */
export interface IRoute {
  /**
   * Completed router object
   */
  readonly Router: Router;
}
