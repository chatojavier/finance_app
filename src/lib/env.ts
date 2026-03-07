export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and set required values.`
    );
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}
