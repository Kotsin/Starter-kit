import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error: any) {
    throw new Error(`Error while hashing password: ${error.message}`);
  }
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    if (!password || !hash) {
      throw new Error('Password cannot be empty');
    }

    return await bcrypt.compare(password, hash);
  } catch (error: any) {
    throw new Error(`Error while hashing password: ${error.message}`);
  }
}
