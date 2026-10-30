import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/bootstrap/create-app.js";
import { createLogger } from "../../src/platform/logging/logger.js";
import { UnconfiguredAuthenticator } from "../../src/platform/security/unconfigured-authenticator.js";
import type { NoteRepository } from "../../src/modules/notes/interfaces/note-repository.js";
import type { Authenticator } from "../../src/platform/security/authenticator.js";
import { noteEndpoints } from "../../src/modules/notes/routes/v1/note-endpoints.js";
import { healthEndpoints } from "../../src/platform/http/health-endpoints.js";
import { registerEndpoint } from "../../src/platform/http/register-endpoint.js";

const note = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Example note",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};
function fixture(
  authenticator: Authenticator = {
    authenticate: async () => ({ id: "test", permissions: ["notes:read", "notes:write"] }),
  },
) {
  const notes: NoteRepository = {
    create: vi.fn(async () => note),
    list: vi.fn(async () => [note]),
  };
  const ready = vi.fn(async () => undefined);
  const logger = createLogger("silent");
  return {
    app: createApp({ notes, authenticator, ready, logger, trustProxy: false }),
    notes,
    ready,
  };
}
describe("HTTP contract and middleware", () => {
  it("rejects ambiguous public status and never trusts arbitrary proxy addresses", () => {
    const { app, notes, ready } = fixture();
    expect(() =>
      registerEndpoint(
        app,
        { ...noteEndpoints[0], permission: "" },
        new UnconfiguredAuthenticator(),
        () => undefined,
      ),
    ).toThrow("nonempty permission");
    const proxied = createApp({
      notes,
      ready,
      authenticator: new UnconfiguredAuthenticator(),
      logger: createLogger("silent"),
      trustProxy: "172.28.0.0/24",
    });
    const policy: unknown = proxied.get("trust proxy fn");
    if (typeof policy !== "function") throw new Error("Missing proxy policy");
    expect(policy("172.28.0.2")).toBe(true);
    expect(policy("203.0.113.1")).toBe(false);
  });
  it("denies sample endpoints when auth is not configured", async () => {
    const { app, notes } = fixture(new UnconfiguredAuthenticator());
    const response = await request(app)
      .post("/api/v1/notes")
      .set("Authorization", "Bearer invented")
      .send({ title: "Example" });
    expect(response.status).toBe(401);
    expect(response.type).toBe("application/problem+json");
    expect(notes.create).not.toHaveBeenCalled();
  });
  it("denies permission before validation/repository access", async () => {
    const { app, notes } = fixture({ authenticate: async () => ({ id: "test", permissions: [] }) });
    expect((await request(app).post("/api/v1/notes").send({})).status).toBe(403);
    expect(notes.create).not.toHaveBeenCalled();
  });
  it("creates and validates a response without leaking persistence types", async () => {
    const { app } = fixture();
    const response = await request(app).post("/api/v1/notes").send({ title: "Example note" });
    expect(response.status).toBe(201);
    expect(noteEndpoints[1].response.parse(response.body)).toEqual({
      data: { ...note, createdAt: note.createdAt.toISOString() },
    });
  });
  it("rejects extra fields, empty title, invalid limits/cursors and malformed JSON", async () => {
    const { app } = fixture();
    for (const body of [
      { title: "" },
      { title: "ok", role: "admin" },
      { title: "x".repeat(121) },
    ]) {
      expect((await request(app).post("/api/v1/notes").send(body)).status).toBe(400);
    }
    for (const query of ["limit=0", "limit=101", "limit=abc", "cursor=bad", "unknown=value"]) {
      expect((await request(app).get(`/api/v1/notes?${query}`)).status).toBe(400);
    }
    expect((await request(app).post("/api/v1/notes").type("json").send("{")).status).toBe(400);
    expect(
      (
        await request(app)
          .post("/api/v1/notes")
          .send({ title: "x".repeat(70000) })
      ).status,
    ).toBe(413);
  });
  it("enforces default and maximum page size and emits a continuation cursor", async () => {
    const { app, notes } = fixture();
    await request(app).get("/api/v1/notes");
    expect(notes.list).toHaveBeenLastCalledWith({ limit: 20 });
    await request(app).get("/api/v1/notes?limit=100");
    expect(notes.list).toHaveBeenLastCalledWith({ limit: 100 });
    vi.mocked(notes.list).mockResolvedValue([
      note,
      { ...note, id: "00000000-0000-4000-8000-000000000002" },
    ]);
    const page = await request(app).get("/api/v1/notes?limit=1");
    expect(page.body.meta.nextCursor).toBe(note.id);
    expect(page.body.data).toHaveLength(1);
    vi.mocked(notes.list).mockResolvedValue([]);
    expect((await request(app).get("/api/v1/notes")).body).toEqual({
      data: [],
      meta: { nextCursor: null },
    });
  });
  it("sanitizes internal failures and distinguishes readiness from liveness", async () => {
    const { app, notes, ready } = fixture();
    vi.mocked(notes.list).mockRejectedValue(new Error("secret database password"));
    const failed = await request(app).get("/api/v1/notes");
    expect(failed.status).toBe(500);
    expect(JSON.stringify(failed.body)).not.toContain("password");
    ready.mockRejectedValue(new Error("offline"));
    expect((await request(app).get("/health/ready")).status).toBe(503);
    expect((await request(app).get("/health/live")).status).toBe(200);
  });
  it("accounts for every registered endpoint and overwrites untrusted request IDs", async () => {
    const { app } = fixture();
    for (const endpoint of [...noteEndpoints, ...healthEndpoints]) {
      const response =
        endpoint.method === "get"
          ? await request(app).get(endpoint.path)
          : await request(app).post(endpoint.path).send({ title: "Example note" });
      expect(response.status).toBe(endpoint.status);
      expect(endpoint.response.safeParse(response.body).success).toBe(true);
    }
    const response = await request(app).get("/health/live").set("x-request-id", "untrusted");
    expect(response.headers["x-request-id"]).not.toBe("untrusted");
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect((await request(app).get("/missing")).status).toBe(404);
  });
});
