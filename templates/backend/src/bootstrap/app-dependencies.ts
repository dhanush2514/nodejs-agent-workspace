import type { Logger } from "pino";
import type { NoteRepository } from "../modules/notes/interfaces/note-repository.js";
import type { Authenticator } from "../platform/security/authenticator.js";
export interface AppDependencies {
  notes: NoteRepository;
  authenticator: Authenticator;
  ready: () => Promise<void>;
  logger: Logger;
  trustProxy: false | string;
}
