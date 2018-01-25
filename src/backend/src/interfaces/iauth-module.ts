import { Request } from "express";
import { User } from "../models/user";

/**
 * Interface for objects that authenticate incoming requests.
 */
export interface IAuthModule {
  processRequest(req: Request): User | null;
}
