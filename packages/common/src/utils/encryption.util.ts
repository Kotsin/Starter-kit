import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET;

// if (!ENCRYPTION_KEY) {
//   throw new Error(
//     'ENCRYPTION_KEY (API_KEY_ENCRYPTION_SECRET) is not set. Set it in your environment variables.',
//   );
// }
//
// if (Buffer.from(ENCRYPTION_KEY).length !== 32) {
//   throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits) long.');
// }

const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY!),
    iv,
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY!),
    iv,
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
