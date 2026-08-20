import jwt from 'jsonwebtoken';
import { jwtConfig, TokenPayload } from '../config/jwt.config';

/**
 * Generates access and refresh tokens for a user
 * @param {Object} user - User object containing id, email, and role
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.role - User role
 * @returns {Object} Object containing accessToken and refreshToken
 */
export const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'access' as const,
    },
    jwtConfig.accessSecret,
    {
      expiresIn: jwtConfig.accessExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: 'refresh' as const,
    },
    jwtConfig.refreshSecret,
    {
      expiresIn: jwtConfig.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Verifies and decodes an access token
 * @param {string} token - JWT access token to verify
 * @returns {TokenPayload} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid access token';
    throw new Error(`Invalid access token: ${errorMessage}`);
  }
};

/**
 * Verifies and decodes a refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {TokenPayload} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid refresh token';
    throw new Error(`Invalid refresh token: ${errorMessage}`);
  }
};

/**
 * Decodes a JWT token without verification
 * Useful for checking token expiry or structure without verifying signature
 * @param {string} token - JWT token to decode
 * @returns {TokenPayload | null} Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Checks if a JWT token has expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};