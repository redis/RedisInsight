export const mockAzureTokenRefreshManager = jest.fn(() => ({
  onClientStored: jest.fn().mockResolvedValue(undefined),
  onClientRemoved: jest.fn(),
}));

export const mockAzureAuthService = jest.fn(() => ({
  getRedisTokenByAccountId: jest.fn().mockResolvedValue(null),
  getAuthorizationUrl: jest.fn().mockResolvedValue('https://login.microsoft.com/...'),
  handleCallback: jest.fn(),
  getSession: jest.fn(),
  isLoggedIn: jest.fn().mockReturnValue(false),
  logout: jest.fn(),
}));

