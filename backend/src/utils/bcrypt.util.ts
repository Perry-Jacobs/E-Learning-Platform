import bcrypt from 'bcryptjs';

/** Number of salt rounds for bcrypt hashing (10 is the default) */
const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password using bcrypt
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Password hashing failed: ${errorMessage}`);
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} plainPassword - Plain text password to compare
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} If comparison fails
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Password comparison failed: ${errorMessage}`);
  }
};

/**
 * Generates a cryptographically secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Hex-encoded random token
 */
export const generateRandomToken = (length: number = 32): string => {
  return require('crypto').randomBytes(length).toString('hex');
};