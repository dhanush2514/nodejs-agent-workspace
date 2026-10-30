export interface Manifest {
  schemaVersion: 1;
  generatorVersion: string;
  templateVersion: string;
  files: Record<string, string>;
}
