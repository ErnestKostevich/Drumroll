import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM authenticated encryption for secrets stored in the DB
 * (currently: owner Resend API key). Master key from WAITLISTKIT_SECRET.
 *
 * Format: `<iv_b64>:<authtag_b64>:<ciphertext_b64>`
 *
 * If WAITLISTKIT_SECRET is unset, we derive an ephemeral random key for the
 * process and log a one-time warning — fine for local dev but means values
 * encrypted in that process cannot be decrypted after a restart. Set the env
 * var in production.
 */
const globalForKey = globalThis as unknown as {
  __waitlistkitKey?: Buffer;
  __waitlistkitKeyWarned?: boolean;
};

function getKey(): Buffer {
  if (globalForKey.__waitlistkitKey) return globalForKey.__waitlistkitKey;
  const secret = process.env.WAITLISTKIT_SECRET;
  if (secret && secret.length >= 16) {
    globalForKey.__waitlistkitKey = createHash("sha256").update(secret).digest();
  } else {
    if (!globalForKey.__waitlistkitKeyWarned) {
      console.warn(
        "[wk/crypto] WAITLISTKIT_SECRET not set — using ephemeral key. Encrypted secrets won't survive a restart.",
      );
      globalForKey.__waitlistkitKeyWarned = true;
    }
    globalForKey.__waitlistkitKey = randomBytes(32);
  }
  return globalForKey.__waitlistkitKey;
}

export function encrypt(plain: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":");
}

export function decrypt(payload: string | null | undefined): string | null {
  if (!payload) return null;
  const parts = payload.split(":");
  if (parts.length !== 3) return null;
  try {
    const key = getKey();
    const iv = Buffer.from(parts[0], "base64");
    const tag = Buffer.from(parts[1], "base64");
    const ct = Buffer.from(parts[2], "base64");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
