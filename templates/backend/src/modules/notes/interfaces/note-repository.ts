import type { Note } from "../models/note.js";
import type { ListNotesRequest } from "../dtos/requests/v1/list-notes-request.js";
export interface NoteRepository {
  create(title: string): Promise<Note>;
  list(query: ListNotesRequest): Promise<Note[]>;
}
