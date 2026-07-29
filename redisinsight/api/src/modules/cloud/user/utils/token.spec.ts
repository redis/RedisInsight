import { sign } from 'jsonwebtoken';
import { isTokenExpired, isValidToken } from './token';

describe('isValidToken', () => {
  it('should return false if no token has been provided', () => {
    expect(isValidToken()).toEqual(false);
  });

  it('should be falsy if token has been expired', () => {
    const expired = sign({ exp: Math.trunc(Date.now() / 1000) - 3600 }, 'test');
    expect(isValidToken(expired)).toBe(false);
  });

  it('should return true if token has not been expired', () => {
    const valid = sign({ exp: Math.trunc(Date.now() / 1000) + 3600 }, 'test');
    expect(isValidToken(valid)).toBe(true);
  });
});

describe('isTokenExpired', () => {
  it('should treat a missing token as expired', () => {
    expect(isTokenExpired()).toBe(true);
  });

  it('should be false for an unexpired token', () => {
    const valid = sign({ exp: Math.trunc(Date.now() / 1000) + 3600 }, 'test');
    expect(isTokenExpired(valid)).toBe(false);
  });

  it('should be true for an expired token', () => {
    const expired = sign({ exp: Math.trunc(Date.now() / 1000) - 3600 }, 'test');
    expect(isTokenExpired(expired)).toBe(true);
  });

  it('should treat a token without an exp claim as expired', () => {
    const noExp = sign({ sub: 'user' }, 'test');
    expect(isTokenExpired(noExp)).toBe(true);
  });
});
