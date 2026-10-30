import type { Note } from "../models/note.js";
import type { NoteResponse } from "../dtos/responses/v1/note-response.js";
export function toNoteResponse(note: Note): NoteResponse {
  return { id: note.id, title: note.title, createdAt: note.createdAt.toISOString() };
}
