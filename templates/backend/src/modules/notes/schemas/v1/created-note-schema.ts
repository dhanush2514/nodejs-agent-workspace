import { z } from "zod";
import { noteResponseSchema } from "./note-response-schema.js";
export const createdNoteSchema = z.strictObject({ data: noteResponseSchema });
