import { NextFunction } from "express";
import { StatusError } from "../models/status-error";

/**
 * Decorator to ensure that oidClient object has been initialized before running the function.
 *
 * @param target
 * @param propertyKey
 * @param descriptor
 */
export function initCheck(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>) {
  const originalMethod = descriptor.value; // save a reference to the original method

  // NOTE: Do not use arrow syntax here. Use a function expression in
  // order to use the correct value of `this` in this method
  descriptor.value = function(req: Request, res: Response, next: NextFunction) {
    const obj: any = this;  // To get around type system

    if (obj.oidClient !== null && originalMethod != null) {
      // run and store result
      originalMethod.call(this, req, res, next);
    } else {
      next(new StatusError(503, "Initializating", "OpenID initializing..."));
    }
  };

  return descriptor;
}
