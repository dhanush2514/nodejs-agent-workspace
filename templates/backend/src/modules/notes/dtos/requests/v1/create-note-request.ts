import type { z } from "zod";
import type { createNoteSchema } from "../../../schemas/v1/create-note-schema.js";
export type CreateNoteRequest = z.infer<typeof createNoteSchema>;
