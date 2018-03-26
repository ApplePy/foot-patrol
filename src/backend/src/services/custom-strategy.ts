import { Strategy } from "passport-strategy";
import * as util from "util";

export class CustomStrategy extends Strategy {
  public name = "custom";

  public authenticate(req: any, options: any) {
    this.success({username: "johndoe", id: 59}, null);
  }
}
