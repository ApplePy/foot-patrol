import { Request } from "express";
import { User } from "../models/user";

/**
 * Interface for objects that interact with persistent storage to handle storing requests.
 */
export interface IAuthModule {
  processRequest(req: Request): User | null;
}
