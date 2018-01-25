import { Request } from "express";
import { injectable } from "inversify";
import { IAuthModule } from "../interfaces/iauth-module";
import { User } from "../models/user";
import { Role } from "../roles";

/**
 * Dummy authorization module that says ok to (almost) anything.
 */
@injectable()
export class HeaderAuth implements IAuthModule {
  /**
   * Provides a fake user as long as an authorization header is provided that doesn't equal "false".
   *
   * @param req The incoming request to validate
   */
  public processRequest(req: Request): User | null {
    // Make sure that an authorization header exists
    if (req.headers.authorization != null && req.headers.authorization !== "false") {
      const fakeUser = new User();
      fakeUser.firstName = "John";
      fakeUser.lastName = "Doe";
      fakeUser.role = Role.STUDENT;
      fakeUser.id = 59;
      return fakeUser;
    }

    return null;
  }
}
