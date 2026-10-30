import type { Authenticator } from "./authenticator.js";

export class UnconfiguredAuthenticator implements Authenticator {
  async authenticate(): Promise<undefined> {
    return undefined;
  }
}
