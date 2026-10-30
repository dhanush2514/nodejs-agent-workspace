import type { z } from "zod";
import type { noteResponseSchema } from "../../../schemas/v1/note-response-schema.js";
export type NoteResponse = z.infer<typeof noteResponseSchema>;
