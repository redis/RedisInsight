import * as fs from 'fs/promises';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { getCertificateContent, getKeyContent } from './tls.util';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('tls.util', () => {
  const mockReadFile = fs.readFile as jest.Mock;

  beforeEach(() => {
    mockReadFile.mockReset();
  });

  describe('getCertificateContent', () => {
    it('should return stored certificate content when no path is specified', async () => {
      const certificate = Object.assign(new CaCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        certificate: '-----BEGIN CERTIFICATE-----\nSTORED_CONTENT',
      });

      const result = await getCertificateContent(certificate);

      expect(mockReadFile).not.toHaveBeenCalled();
      expect(result).toBe('-----BEGIN CERTIFICATE-----\nSTORED_CONTENT');
    });

    it('should read certificate from file when certificatePath is specified', async () => {
      const mockFileContent = '-----BEGIN CERTIFICATE-----\nFROM_FILE';
      mockReadFile.mockResolvedValue(mockFileContent);

      const certificate = Object.assign(new CaCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        certificatePath: '/path/to/cert.pem',
      });

      const result = await getCertificateContent(certificate);

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/cert.pem', 'utf8');
      expect(result).toBe(mockFileContent);
    });

    it('should prefer certificatePath over stored content when both are present', async () => {
      const mockFileContent = '-----BEGIN CERTIFICATE-----\nFROM_FILE';
      mockReadFile.mockResolvedValue(mockFileContent);

      const certificate = Object.assign(new CaCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        certificate: '-----BEGIN CERTIFICATE-----\nSTORED_CONTENT',
        certificatePath: '/path/to/cert.pem',
      });

      const result = await getCertificateContent(certificate);

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/cert.pem', 'utf8');
      expect(result).toBe(mockFileContent);
    });

    it('should throw error when file cannot be read', async () => {
      const fileError = new Error('ENOENT: no such file or directory');
      mockReadFile.mockRejectedValue(fileError);

      const certificate = Object.assign(new CaCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        certificatePath: '/path/to/nonexistent.pem',
      });

      await expect(getCertificateContent(certificate)).rejects.toThrow(
        fileError,
      );
    });

    it('should work with ClientCertificate as well', async () => {
      const certificate = Object.assign(new ClientCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        certificate: '-----BEGIN CERTIFICATE-----\nCLIENT_CERT',
        key: '-----BEGIN PRIVATE KEY-----\nKEY',
      });

      const result = await getCertificateContent(certificate);

      expect(result).toBe('-----BEGIN CERTIFICATE-----\nCLIENT_CERT');
    });
  });

  describe('getKeyContent', () => {
    it('should return stored key content when no path is specified', async () => {
      const clientCert = Object.assign(new ClientCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        certificate: '-----BEGIN CERTIFICATE-----\nCERT',
        key: '-----BEGIN PRIVATE KEY-----\nSTORED_KEY',
      });

      const result = await getKeyContent(clientCert);

      expect(mockReadFile).not.toHaveBeenCalled();
      expect(result).toBe('-----BEGIN PRIVATE KEY-----\nSTORED_KEY');
    });

    it('should read key from file when keyPath is specified', async () => {
      const mockFileContent = '-----BEGIN PRIVATE KEY-----\nFROM_FILE';
      mockReadFile.mockResolvedValue(mockFileContent);

      const clientCert = Object.assign(new ClientCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        certificate: '-----BEGIN CERTIFICATE-----\nCERT',
        keyPath: '/path/to/key.pem',
      });

      const result = await getKeyContent(clientCert);

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/key.pem', 'utf8');
      expect(result).toBe(mockFileContent);
    });

    it('should throw error when key file cannot be read', async () => {
      const fileError = new Error('ENOENT: no such file or directory');
      mockReadFile.mockRejectedValue(fileError);

      const clientCert = Object.assign(new ClientCertificate(), {
        id: 'test-id',
        name: 'test-cert',
        keyPath: '/path/to/nonexistent.pem',
      });

      await expect(getKeyContent(clientCert)).rejects.toThrow(fileError);
    });
  });
});
