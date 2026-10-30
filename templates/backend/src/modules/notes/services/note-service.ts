import { trace } from "@opentelemetry/api";
import type { NoteRepository } from "../interfaces/note-repository.js";
import type { CreateNoteRequest } from "../dtos/requests/v1/create-note-request.js";
import type { ListNotesRequest } from "../dtos/requests/v1/list-notes-request.js";

export class NoteService {
  constructor(private readonly repository: NoteRepository) {}
  async create(input: CreateNoteRequest) {
    return trace.getTracer("notes").startActiveSpan("notes.create", async (span) => {
      try {
        return await this.repository.create(input.title);
      } finally {
        span.end();
      }
    });
  }
  async list(query: ListNotesRequest) {
    const rows = await this.repository.list(query);
    const data = rows.slice(0, query.limit);
    return { data, nextCursor: rows.length > query.limit ? (data.at(-1)?.id ?? null) : null };
  }
}
