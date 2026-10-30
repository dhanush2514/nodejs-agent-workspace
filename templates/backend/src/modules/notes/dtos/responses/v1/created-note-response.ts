import type { z } from "zod";
import type { createdNoteSchema } from "../../../schemas/v1/created-note-schema.js";
export type CreatedNoteResponse = z.infer<typeof createdNoteSchema>;
