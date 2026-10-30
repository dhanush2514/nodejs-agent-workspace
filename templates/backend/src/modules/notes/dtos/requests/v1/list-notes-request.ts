import type { z } from "zod";
import type { listNotesSchema } from "../../../schemas/v1/list-notes-schema.js";
export type ListNotesRequest = z.infer<typeof listNotesSchema>;
