// AES-256-GCM encryption for Google OAuth tokens at rest

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

function getKeyMaterial(): ArrayBuffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length < 64) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(keyHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    getKeyMaterial(),
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return Buffer.from(combined).toString("base64");
}

export async function decrypt(ciphertext: string): Promise<string> {
  const key = await importKey();
  const combined = Buffer.from(ciphertext, "base64");
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  return new TextDecoder().decode(plaintext);
}
