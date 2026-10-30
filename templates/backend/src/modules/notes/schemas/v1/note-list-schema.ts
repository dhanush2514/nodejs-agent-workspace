import { z } from "zod";
import { noteResponseSchema } from "./note-response-schema.js";
export const noteListSchema = z.strictObject({
  data: z.array(noteResponseSchema),
  meta: z.strictObject({ nextCursor: z.uuid().nullable() }),
});
