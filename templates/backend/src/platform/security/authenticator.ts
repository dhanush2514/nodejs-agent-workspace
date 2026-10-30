import type { IncomingHttpHeaders } from "node:http";
import type { Principal } from "./principal.js";

export interface Authenticator {
  authenticate(headers: IncomingHttpHeaders): Promise<Principal | undefined>;
}
