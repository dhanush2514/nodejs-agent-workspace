export function requireExternalDatabaseTls(database: URL): void {
  if (
    database.searchParams.getAll("sslmode").length !== 1 ||
    database.searchParams.getAll("sslaccept").length !== 1 ||
    database.searchParams.get("sslmode") !== "require" ||
    database.searchParams.get("sslaccept") !== "strict"
  ) {
    throw new Error(
      "External PostgreSQL requires sslmode=require and sslaccept=strict for Prisma.",
    );
  }
  if (database.searchParams.getAll("sslcert").length > 1) {
    throw new Error("Specify at most one database certificate path.");
  }
}
