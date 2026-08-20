import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Hash a plain text password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare a plain text password with a hashed password
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Generate a random secure token (for password reset, email verification, etc.)
export const generateRandomToken = (length: number = 32): string => {
  return require('crypto').randomBytes(length).toString('hex');
};