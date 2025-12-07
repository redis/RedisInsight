export const mockKeyDto = {
  keyName: Buffer.from('keyName'),
};

export const mockScannerStrategy = {
  getKeys: jest.fn().mockResolvedValue([]),
  getKeyInfo: jest.fn().mockResolvedValue({}),
  getKeysInfo: jest.fn().mockResolvedValue([]),
  getKeysTtl: jest.fn().mockResolvedValue([]),
  getKeysType: jest.fn().mockResolvedValue([]),
  getKeysSize: jest.fn().mockResolvedValue([]),
};

export const mockTypeInfoStrategy = {
  getInfo: jest.fn().mockResolvedValue([]),
};

export const mockScanner = jest.fn(() => ({
  getStrategy: jest.fn().mockReturnValue(mockScannerStrategy),
}));
