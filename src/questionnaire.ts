import type { Interface } from "node:readline/promises";
import { supportedProfiles, validateOptions } from "./validate-options.js";
import type { SetupOptions } from "./setup-options.js";

export async function questionnaire(
  terminal: Pick<Interface, "question">,
  initialName?: string,
): Promise<SetupOptions> {
  const name = initialName ?? (await terminal.question("Project name (kebab-case): "));
  const description = await terminal.question("Description (optional): ");
  const clients = (
    await terminal.question("Client names, comma-separated (e.g. user,driver,admin): ")
  )
    .split(",")
    .map((item) => item.trim());
  const selected = await terminal.question(
    `Planning profiles [${supportedProfiles.join(",")}], comma-separated or empty: `,
  );
  const dataHosting = await terminal.question(
    "Production data hosting [pending/self-hosted/external] (pending): ",
  );
  return validateOptions({
    schemaVersion: 1,
    name,
    description,
    clients,
    profiles: selected.trim() ? selected.split(",").map((item) => item.trim()) : [],
    dataHosting: dataHosting.trim() || "pending",
  });
}
