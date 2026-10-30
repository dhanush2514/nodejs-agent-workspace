import type { SetupOptions } from "./setup-options.js";

export const supportedProfiles = [
  "redis",
  "bullmq",
  "payments",
  "gps",
  "rust",
  "signoz",
  "grafana",
];

function strings(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((item: unknown) => typeof item === "string")) {
    throw new Error(`${field} must be an array of strings.`);
  }
  const result: string[] = value;
  if (
    new Set(result).size !== result.length ||
    result.some((item) => !item.trim() || /[\r\n\0]/u.test(item))
  ) {
    throw new Error(`${field} must contain unique, nonempty single-line values.`);
  }
  return result;
}

export function validateOptions(value: unknown): SetupOptions {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("Setup configuration must be an object.");
  const data = Object.fromEntries(Object.entries(value));
  const allowed = ["schemaVersion", "name", "description", "clients", "profiles", "dataHosting"];
  if (Object.keys(data).some((key) => !allowed.includes(key)))
    throw new Error("Unknown setup field. Credentials and commands are not accepted.");
  if (data.schemaVersion !== 1) throw new Error("schemaVersion must be 1.");
  if (
    typeof data.name !== "string" ||
    !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(data.name) ||
    data.name.length > 64 ||
    /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/u.test(data.name)
  ) {
    throw new Error("name must be a safe lowercase kebab-case name, at most 64 characters.");
  }
  if (
    typeof data.description !== "string" ||
    data.description.length > 240 ||
    /[\r\n\0]/u.test(data.description)
  ) {
    throw new Error("description must be a single line of at most 240 characters.");
  }
  const clients = strings(data.clients, "clients");
  if (!clients.length || clients.length > 20 || clients.some((client) => client.length > 80))
    throw new Error("Specify 1-20 client names, each at most 80 characters.");
  const profiles = strings(data.profiles, "profiles");
  if (profiles.some((profile) => !supportedProfiles.includes(profile)))
    throw new Error("Unsupported profile.");
  if (profiles.includes("bullmq") && !profiles.includes("redis"))
    throw new Error("bullmq requires redis.");
  if (
    data.dataHosting !== "pending" &&
    data.dataHosting !== "self-hosted" &&
    data.dataHosting !== "external"
  )
    throw new Error("dataHosting must be pending, self-hosted, or external.");
  return {
    schemaVersion: 1,
    name: data.name,
    description: data.description,
    clients,
    profiles,
    dataHosting: data.dataHosting,
  };
}
