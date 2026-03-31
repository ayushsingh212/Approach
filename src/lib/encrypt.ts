import crypto from "crypto";

// ─── Config ───────────────────────────────────────────────────────────────────
// Generate your key once with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Then add to .env.local as ENCRYPTION_KEY=<output>

const ALGORITHM = "aes-256-cbc";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("❌ ENCRYPTION_KEY is not set in .env.local");
  if (key.length !== 64)
    throw new Error("❌ ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  return Buffer.from(key, "hex");
}

// ─── Encrypt ──────────────────────────────────────────────────────────────────

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(16); // fresh IV every time
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  // Store as "iv_hex:encrypted_hex"
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// ─── Decrypt ──────────────────────────────────────────────────────────────────

export function decrypt(encryptedText: string): string {
  const [ivHex, dataHex] = encryptedText.split(":");
  if (!ivHex || !dataHex) throw new Error("❌ Invalid encrypted format");

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}