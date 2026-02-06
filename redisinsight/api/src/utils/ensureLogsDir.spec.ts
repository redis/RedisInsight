import * as fs from 'fs';
import { ensureLogsDir } from './ensureLogsDir';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('ensureLogsDir', () => {
  const mockExistsSync = fs.existsSync as jest.Mock;
  const mockMkdirSync = fs.mkdirSync as jest.Mock;
  const testLogsPath = '/test/path/.redis-insight/logs';
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('when file logging is enabled', () => {
    it('should create logs directory with recursive option if it does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = ensureLogsDir(testLogsPath, true);

      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(testLogsPath);
      expect(mockMkdirSync).toHaveBeenCalledWith(testLogsPath, {
        recursive: true,
      });
    });

    it('should not create logs directory if it already exists', () => {
      mockExistsSync.mockReturnValue(true);

      const result = ensureLogsDir(testLogsPath, true);

      expect(result).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledWith(testLogsPath);
      expect(mockMkdirSync).not.toHaveBeenCalled();
    });

    it('should return false and log error if directory creation fails', () => {
      const testError = new Error('ENOENT: permission denied');
      mockExistsSync.mockReturnValue(false);
      mockMkdirSync.mockImplementation(() => {
        throw testError;
      });

      const result = ensureLogsDir(testLogsPath, true);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to create logs directory at "${testLogsPath}". File logging will be disabled.`,
        testError,
      );
    });
  });

  describe('when file logging is disabled', () => {
    it('should not check or create logs directory and return true', () => {
      const result = ensureLogsDir(testLogsPath, false);

      expect(result).toBe(true);
      expect(mockExistsSync).not.toHaveBeenCalled();
      expect(mockMkdirSync).not.toHaveBeenCalled();
    });
  });
});
