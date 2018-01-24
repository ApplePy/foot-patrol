import { NextFunction, Request, Response, Router } from "express";
import { Container, inject, injectable } from "inversify";
import { Issuer } from "openid-client";
import { isNull, isNullOrUndefined } from "util";
import { initCheck } from "../decorators/initCheck";
import { IFACES, TAGS } from "../ids";
import { IRoute } from "../interfaces/iroute";
import { ISanitizer } from "../interfaces/isanitizer";
import { ISQLService } from "../interfaces/isql-service";
import { StatusError } from "../models/status-error";

@injectable()
export class OAuth2Route implements IRoute {

  public router: Router;
  private oidIssuer: any;
  private oidClient: any;

  get Router(): Router {
    return this.router;
  }

  /**
   * Constructor
   */
  constructor() {
    // Log
    console.log("[Oauth2Route::create] Creating Oauth2 route.");

    // Setup OpenID
    Issuer.discover("https://adfs.murrayweb.ca/adfs")
    .then((issuer: any) => {
      console.log("Discovered %s", issuer.inspect());
      this.oidIssuer = issuer;
      this.oidClient = new issuer.Client({
        // Live in test environment for staging.capstone.incode.ca
        client_id: "REPLACE",  // TODO: Pull this into an environment variable
        client_secret: "ME"
      });
    });

    // Create router
    this.router = Router();

    // Add to router
    this.router.get("/authorize", this.authorize.bind(this));
    this.router.get("/callback", this.verify.bind(this));
    // this.router.post("/", this.postRequest.bind(this));
    // this.router.get("/:id", this.getRequest.bind(this));
    // this.router.put("/:id", this.putRequest.bind(this));
    // this.router.patch("/:id", this.patchRequest.bind(this));
    // this.router.delete("/:id", this.deleteRequest.bind(this));
  }

  @initCheck
  private authorize(req: Request, res: Response, next: NextFunction) {
    // If OID is initialized, send the authorization URL to use to get Oauth2 authentication
    res.send(
      this.oidClient.authorizationUrl({
        // TODO: Pull out into base URL and callback const
        redirect_uri: "https://staging.capstone.incode.ca/api/v1/auth/callback",
        scope: "openid email",
      })
    );
  }

  @initCheck
  private verify(req: Request, res: Response, next: NextFunction) {
    this.oidClient.authorizationCallback("https://staging.capstone.incode.ca/api/v1/auth/callback", req.query)
    .then((tokenSet: any) => {
      console.log("received and validated tokens %j", tokenSet);
      console.log("validated id_token claims %j", tokenSet.claims);
      res.sendStatus(200);
    })
    .catch(() => next(new StatusError(403, "Callback Verify Failed")));
  }
}
