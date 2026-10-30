import { z } from "zod";
export const noteResponseSchema = z.strictObject({
  id: z.uuid(),
  title: z.string(),
  createdAt: z.iso.datetime(),
});
