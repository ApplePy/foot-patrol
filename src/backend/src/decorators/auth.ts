import { NextFunction, Request, Response } from "express";
import { IFACES } from "../ids";
import server from "../index";
import { IAuthModule } from "../interfaces/iauth-module";
import { StatusError } from "../models/status-error";
import { Role } from "../roles";

// tslint:disable:no-bitwise

/**
 * Decorator to ensure that oidClient object has been initialized before running the function.
 *
 * @param target
 * @param propertyKey
 * @param descriptor
 */
export function auth(validRoles: Role, appendUserInfo: boolean = false) {
  // tslint:disable-next-line:only-arrow-functions
  return function(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value; // save a reference to the original method

    // NOTE: Do not use arrow syntax here. Use a function expression in
    // order to use the correct value of `this` in this method
    descriptor.value = function(req: Request, res: Response, next: NextFunction) {
      const obj: any = this;  // To get around type system

      // Get auth module
      const authModule = server.container.get<IAuthModule>(IFACES.IAUTHMODULE);

      const user = authModule.processRequest(req);

      // If role is not ok, throw a status error.
      if (user === null) {
        return next(new StatusError(401, "Unauthorized", "Access to the requested resource is disallowed."));
      } else if ((user.role & validRoles) === Role.ANONYMOUS) {
        return next(new StatusError(403, "Forbidden", "Access to the requested resource is disallowed."));
      }

      // Setup additional args if requested
      const args: any[] = [req, res, next];
      if (appendUserInfo) {
        args.push(user);
      }

      // Call initial function
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
