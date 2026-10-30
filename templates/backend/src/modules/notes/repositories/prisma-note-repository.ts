import type { PrismaClient } from "@prisma/client";
import type { NoteRepository } from "../interfaces/note-repository.js";
import type { ListNotesRequest } from "../dtos/requests/v1/list-notes-request.js";

export class PrismaNoteRepository implements NoteRepository {
  constructor(private readonly database: PrismaClient) {}
  create(title: string) {
    return this.database.note.create({ data: { title } });
  }
  list(query: ListNotesRequest) {
    return this.database.note.findMany({
      where: query.cursor ? { id: { gt: query.cursor } } : {},
      orderBy: { id: "asc" },
      take: query.limit + 1,
    });
  }
}
