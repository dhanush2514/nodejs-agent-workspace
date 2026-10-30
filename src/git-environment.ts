export function gitEnvironment(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.toUpperCase().startsWith("GIT_")),
  );
}
