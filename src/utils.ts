export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) {
    throw new Error('Hex string must have an even length');
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

export function formatHexView(hex: string, maxBytes: number = 64): string {
  if (!hex) return '';
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const chunks: string[] = [];
  const limit = Math.min(clean.length, maxBytes * 2);
  for (let i = 0; i < limit; i += 32) {
    const slice = clean.substring(i, Math.min(i + 32, limit));
    const formatted = slice.match(/.{1,2}/g)?.join(' ') || slice;
    chunks.push(formatted);
  }
  if (clean.length > limit) {
    chunks.push(`... (${Math.floor(clean.length / 2)} bytes total)`);
  }
  return chunks.join('\n');
}

export function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
