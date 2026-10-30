export interface AppConfig {
  environment: "development" | "test" | "production";
  port: number;
  databaseUrl: string;
  trustProxy: false | string;
  otlpEndpoint?: string;
}
