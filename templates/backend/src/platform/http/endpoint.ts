import type { z } from "zod";
export interface Endpoint {
  method: "get" | "post";
  path: string;
  purpose: string;
  permission: string | null;
  status: number;
  document: string;
  request?: z.ZodType;
  response: z.ZodType;
  example: unknown;
}
