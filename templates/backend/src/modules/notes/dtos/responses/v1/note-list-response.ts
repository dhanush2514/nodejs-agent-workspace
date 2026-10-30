import type { NoteResponse } from "./note-response.js";
export interface NoteListResponse {
  data: NoteResponse[];
  meta: { nextCursor: string | null };
}
