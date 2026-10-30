import type { NoteService } from "../services/note-service.js";
import type { CreateNoteRequest } from "../dtos/requests/v1/create-note-request.js";
import type { ListNotesRequest } from "../dtos/requests/v1/list-notes-request.js";
import type { NoteListResponse } from "../dtos/responses/v1/note-list-response.js";
import type { CreatedNoteResponse } from "../dtos/responses/v1/created-note-response.js";
import { toNoteResponse } from "../mappers/note-mapper.js";

export class NoteController {
  constructor(private readonly service: NoteService) {}
  async create(input: CreateNoteRequest): Promise<CreatedNoteResponse> {
    return { data: toNoteResponse(await this.service.create(input)) };
  }
  async list(query: ListNotesRequest): Promise<NoteListResponse> {
    const result = await this.service.list(query);
    return { data: result.data.map(toNoteResponse), meta: { nextCursor: result.nextCursor } };
  }
}
