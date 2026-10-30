import type { Endpoint } from "../../../../platform/http/endpoint.js";
import { createNoteSchema } from "../../schemas/v1/create-note-schema.js";
import { createdNoteSchema } from "../../schemas/v1/created-note-schema.js";
import { noteListSchema } from "../../schemas/v1/note-list-schema.js";

const example = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Example note",
  createdAt: "2026-01-01T00:00:00.000Z",
};
export const noteEndpoints = [
  {
    method: "get",
    path: "/api/v1/notes",
    purpose: "List sample notes in stable UUID order",
    permission: "notes:read",
    status: 200,
    document: "doc/api/v1/notes.md",
    response: noteListSchema,
    example: { data: [example], meta: { nextCursor: null } },
  },
  {
    method: "post",
    path: "/api/v1/notes",
    purpose: "Create a sample note",
    permission: "notes:write",
    status: 201,
    document: "doc/api/v1/notes.md",
    request: createNoteSchema,
    response: createdNoteSchema,
    example: { data: example },
  },
] satisfies Endpoint[];
