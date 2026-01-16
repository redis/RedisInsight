/**
 * Utility functions for JWT token handling.
 * Note: These functions decode JWT tokens without verification.
 * The tokens are verified by Azure when used for authentication.
 */

interface JwtPayload {
  exp?: number;
  iat?: number;
  nbf?: number;
  aud?: string;
  iss?: string;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Decode a JWT token payload without verification.
 * @param token - The JWT token string
 * @returns The decoded payload or null if decoding fails
 */
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    // JWT uses base64url encoding, convert to base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Get the expiration time from a JWT token.
 * @param token - The JWT token string
 * @returns The expiration date or null if not available
 */
export const getJwtExpiration = (token: string): Date | null => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return null;
  }

  // exp is in seconds since epoch
  return new Date(payload.exp * 1000);
};

/**
 * Check if a JWT token is expired or will expire within a buffer time.
 * @param token - The JWT token string
 * @param bufferSeconds - Buffer time in seconds before actual expiration (default: 300 = 5 minutes)
 * @returns true if token is expired or will expire within buffer, false otherwise
 */
export const isJwtExpired = (
  token: string,
  bufferSeconds: number = 300,
): boolean => {
  const expiration = getJwtExpiration(token);
  if (!expiration) {
    // If we can't determine expiration, assume it needs refresh
    return true;
  }

  const now = new Date();
  const bufferMs = bufferSeconds * 1000;

  return expiration.getTime() - bufferMs <= now.getTime();
};
