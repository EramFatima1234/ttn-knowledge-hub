/** Google AI Studio API keys used with generativelanguage.googleapis.com start with AIza. */
export function normalizeGeminiApiKey(raw: string | undefined): string {
  return (raw ?? '').trim().replace(/^['"]|['"]$/g, '');
}

export function isValidGeminiApiKey(key: string): boolean {
  return /^AIza[0-9A-Za-z_-]{10,}$/.test(key);
}

export const GEMINI_KEY_SETUP_HINT =
  'GEMINI_API_KEY must be a Google AI Studio key (starts with AIza). Create one at https://aistudio.google.com/apikey — not GOOGLE_CLIENT_ID or other Google Cloud credentials.';
