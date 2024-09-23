import crypto from "node:crypto";

/**
 * Returns the sha1sum as a hex string.
 *
 * @param buffer
 * @returns hexadecimal string
 */
export function sha1sum(buffer: Buffer) {
  const hash = crypto.createHash("sha1");
  hash.update(buffer);
  const hexStr = hash.digest("hex");
  return hexStr;
}
