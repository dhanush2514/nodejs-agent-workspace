import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaNoteRepository } from "../../src/modules/notes/repositories/prisma-note-repository.js";
import { randomUUID } from "node:crypto";

if (!process.env.DATABASE_URL)
  throw new Error(
    "Integration tests require an explicitly configured disposable PostgreSQL database.",
  );
const database = new PrismaClient();
const created: string[] = [];
afterAll(async () => {
  await database.note.deleteMany({ where: { id: { in: created } } });
  await database.$disconnect();
});
describe("PostgreSQL repository", () => {
  it("persists and retrieves a note through parameterized Prisma operations", async () => {
    const repository = new PrismaNoteRepository(database);
    const note = await repository.create(`test-${randomUUID()}`);
    created.push(note.id);
    expect(await database.note.findUnique({ where: { id: note.id } })).toEqual(note);
    expect(await repository.list({ limit: 100 })).toHaveLength(
      Math.min(await database.note.count(), 101),
    );
  });
  it("rolls back a failed transaction", async () => {
    const id = randomUUID();
    await expect(
      database.$transaction(async (transaction) => {
        await transaction.note.create({ data: { id, title: "rollback-fixture" } });
        throw new Error("intentional rollback");
      }),
    ).rejects.toThrow("intentional rollback");
    expect(await database.note.findUnique({ where: { id } })).toBeNull();
  });
});
