import { sanitizeMessage } from './error-message';

describe('SSH exception error message helper', () => {
  it('should return "Cannot parse privateKey" when the message contains "Cannot parse privateKey"', () => {
    const message = 'Cannot parse privateKey some sensitive data';
    const result = sanitizeMessage(message);
    expect(result).toBe('Cannot parse privateKey');
  });

  it('should extract core error message for known patterns like "getaddrinfo ENOTFOUND"', () => {
    const message = 'getaddrinfo ENOTFOUND domain.com';
    const result = sanitizeMessage(message);
    expect(result).toBe('getaddrinfo ENOTFOUND');
  });

  it('should extract core error message for known patterns like "connect EHOSTDOWN"', () => {
    const message = 'connect EHOSTDOWN 127.0.0.1:22';
    const result = sanitizeMessage(message);
    expect(result).toBe('connect EHOSTDOWN');
  });

  it('should remove IP addresses and ports from the message', () => {
    const message = 'Error occurred at 192.168.1.1:8080';
    const result = sanitizeMessage(message);
    expect(result).toBe('Error occurred at');
  });

  it('should remove hostnames and domains from the message', () => {
    const message = 'Unable to resolve host example.com';
    const result = sanitizeMessage(message);
    expect(result).toBe('Unable to resolve host');
  });

  it('should handle messages with multiple sensitive patterns', () => {
    const message = 'connect ECONNREFUSED 192.168.1.1:22 example.com';
    const result = sanitizeMessage(message);
    expect(result).toBe('connect ECONNREFUSED');
  });

  it('should return the original message if no sensitive patterns are found', () => {
    const message = 'An unknown error occurred';
    const result = sanitizeMessage(message);
    expect(result).toBe('An unknown error occurred');
  });
});
