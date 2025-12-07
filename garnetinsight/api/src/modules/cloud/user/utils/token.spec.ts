import { sign } from 'jsonwebtoken';
import { isValidToken } from './token';

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
