/**
 * Centralised, validated access to environment variables.
 *
 * Import `env` anywhere instead of reading `import.meta.env` directly.
 * If a required variable is missing or malformed, the app throws immediately
 * at startup with a clear message rather than failing mysteriously later.
 */

interface Env {
  apiBaseUrl: string;
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env and set a value. See the README for setup.`,
    );
  }
  return value;
}

function validUrl(name: string, value: string): string {
  try {
    // Throws on malformed URLs.
    new URL(value);
    return value;
  } catch {
    throw new Error(`Environment variable ${name} is not a valid URL: "${value}".`);
  }
}

const apiBaseUrl = validUrl(
  'VITE_API_BASE_URL',
  required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
);

export const env: Env = {
  apiBaseUrl,
};
