export interface SetupOptions {
  schemaVersion: 1;
  name: string;
  description: string;
  clients: string[];
  profiles: string[];
  dataHosting: "pending" | "self-hosted" | "external";
}
