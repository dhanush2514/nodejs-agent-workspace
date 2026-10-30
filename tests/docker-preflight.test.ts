import { describe, expect, it, vi } from "vitest";
import { checkDockerTarget } from "../src/docker-preflight.js";

describe("Docker opt-in scope", () => {
  it("rejects remote contexts before contacting the engine", () => {
    const read = vi.fn(() => "");
    expect(() => checkDockerTarget("example", { DOCKER_HOST: "tcp://remote:2376" }, read)).toThrow(
      "local unix/npipe",
    );
    expect(read).not.toHaveBeenCalled();
  });
  it("checks all resource types on a local context", () => {
    const read = vi.fn((args: string[]) =>
      args[0] === "context" ? "npipe:////./pipe/docker_engine" : "",
    );
    expect(() => checkDockerTarget("example", {}, read)).not.toThrow();
    expect(read).toHaveBeenCalledTimes(4);
  });
  it("honors explicit context precedence and refuses existing stacks", () => {
    const read = vi.fn((args: string[]) => (args[0] === "context" ? "ssh://remote" : ""));
    expect(() =>
      checkDockerTarget(
        "example",
        { DOCKER_CONTEXT: "production", DOCKER_HOST: "unix:///var/run/docker.sock" },
        read,
      ),
    ).toThrow("Remote/TCP");
    expect(() =>
      checkDockerTarget(
        "example",
        { DOCKER_HOST: "unix:///var/run/docker.sock" },
        () => "existing-resource",
      ),
    ).toThrow("already owns");
  });
});
