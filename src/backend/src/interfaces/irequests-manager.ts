import { TravelRequest } from "../models/travel-request";

/**
 * Interface for objects that interact with persistent storage to handle storing requests.
 */
export interface IRequestsManager {
  /**
   * Get a request from the backend.
   *
   * @param id The id of the user to get
   */
  getRequest(id: number): Promise<TravelRequest>;

  /**
   * Get a list of requests from the backend.
   *
   * Defaults to returning archived results.
   *
   * @param offset Number >= 0 of results to skip before returning results.
   * @param count  Number >= 0 results to return.
   * @param filter Dictionary to be plugged into the SQL `WHERE` parameter as "AND". Parameters cannot equal null.
   */
  getRequests(offset: number, count: number, filter?: Map<string, any>): Promise<TravelRequest[]>;

  /**
   * Create a new request. Returns new ID.
   *
   * @param request The new travel request to store.
   */
  createRequest(req: TravelRequest): Promise<number>;

  /**
   * Delete a request
   *
   * @param id The id to delete
   */
  deleteRequest(id: number): Promise<void>;

  /**
   * Update a travel request with new information.
   *
   * @param request The request to be updated.
   * @param columnUpdate [Optional] Update only specific columns.
   */
  updateRequest(request: TravelRequest, columnUpdate?: string[]): Promise<void>;
}
