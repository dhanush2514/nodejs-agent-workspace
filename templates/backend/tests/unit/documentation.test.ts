import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { noteEndpoints } from "../../src/modules/notes/routes/v1/note-endpoints.js";
import {
  validateEndpointDocumentation,
  validateFreshContract,
} from "../../scripts/contract-validation.js";

describe("documentation rejection fixtures", () => {
  it("accepts documented schema-valid endpoint examples", async () => {
    const endpoint = noteEndpoints[0];
    const page = await readFile(endpoint.document, "utf8");
    expect(() => validateEndpointDocumentation(endpoint, page)).not.toThrow();
  });
  it("rejects missing endpoint inventory and auth details", async () => {
    const endpoint = noteEndpoints[0];
    const page = await readFile(endpoint.document, "utf8");
    expect(() => validateEndpointDocumentation(endpoint, "")).toThrow("Missing endpoint");
    expect(() =>
      validateEndpointDocumentation(endpoint, page.replace("## Authorization", "Policy")),
    ).toThrow("Authorization");
  });
  it("rejects invalid examples and stale generated contracts", async () => {
    const endpoint = noteEndpoints[0];
    const page = await readFile(endpoint.document, "utf8");
    expect(() =>
      validateEndpointDocumentation({ ...endpoint, example: { data: "wrong" } }, page),
    ).toThrow();
    expect(() => validateEndpointDocumentation({ ...endpoint, purpose: "" }, page)).toThrow(
      "purpose",
    );
    expect(() => validateEndpointDocumentation({ ...endpoint, permission: "" }, page)).toThrow(
      "permission",
    );
    expect(() => validateFreshContract("old", "new")).toThrow("stale");
    expect(() => validateFreshContract("same", "same")).not.toThrow();
  });
});
