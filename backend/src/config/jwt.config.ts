import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

export const jwtConfig: JWTConfig = {
  accessSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  accessExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  issuer: process.env.JWT_ISSUER || 'e-learning-platform',
  audience: process.env.JWT_AUDIENCE || 'e-learning-platform-users',
};

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
}

/**
 * Generate access and refresh tokens
 */
export function generateTokens(user: { id: string; email: string; role: string }) {
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
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Invalid access token: ${err.message}`);
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Invalid refresh token: ${err.message}`);
  }
}

/**
 * Decode token without verification
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}

export default jwtConfig;