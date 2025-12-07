import { when } from 'jest-when';
import {
  cleanupTestEnvs,
  mockDatabaseToImportFromEnvsInput,
  mockDatabaseToImportFromEnvsPrepared,
  mockDatabaseToImportFromFileInput,
  mockDatabaseToImportFromFilePrepared,
  mockDatabaseToImportWithCertsFromEnvsInput,
  mockDatabaseToImportWithCertsFromEnvsPrepared,
  mockDatabaseToImportWithCertsFromFileInput,
  mockDatabaseToImportWithCertsFromFilePrepared,
  mockDefaultDatabaseFields,
} from 'src/__mocks__';
import * as fsExtra from 'fs-extra';
import { Database } from 'src/modules/database/models/database';
import * as preSetupUtil from './pre-setup.discovery.util';
import {
  scanProcessEnv,
  populateDefaultValues,
  getCertificateData,
  prepareDatabaseFromEnvs,
  discoverEnvDatabasesToAdd,
  discoverFileDatabasesToAdd,
} from './pre-setup.discovery.util';

describe('preSetupDiscoveryUtil', () => {
  let fsReadFileSpy: jest.SpyInstance;
  let fsPathExistsSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanupTestEnvs();

    fsReadFileSpy = jest.spyOn(fsExtra, 'readFile');
    when(fsReadFileSpy)
      .calledWith('/ca.crt', 'utf8')
      .mockResolvedValue(
        Buffer.from(
          mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
          'utf8',
        ),
      )
      .calledWith('/user.crt', 'utf8')
      .mockResolvedValue(
        Buffer.from(
          mockDatabaseToImportWithCertsFromEnvsInput.clientCert.certificate,
          'utf8',
        ),
      )
      .calledWith('/user.key', 'utf8')
      .mockResolvedValue(
        Buffer.from(
          mockDatabaseToImportWithCertsFromEnvsInput.clientCert.key,
          'utf8',
        ),
      );

    fsPathExistsSpy = jest.spyOn(fsExtra, 'pathExists');
    when(fsPathExistsSpy)
      .calledWith('/not-existing.json')
      .mockResolvedValue(false)
      .calledWith('/databases.json')
      .mockResolvedValue(true);
  });

  describe('scanProcessEnv', () => {
    it('should return 3 discovered env names', () => {
      process.env.RI_REDIS_HOST = 'host';
      process.env.RI_REDIS_HOST_1 = 'host1';
      process.env.RI_REDIS_HOST_2 = 'host2';
      process.env.RI_REDIS_HHOST = 'host3';

      expect(scanProcessEnv()).toEqual([
        'RI_REDIS_HOST',
        'RI_REDIS_HOST_1',
        'RI_REDIS_HOST_2',
      ]);
    });
    it('should not discover any envs and not fail', () => {
      expect(scanProcessEnv()).toEqual([]);
    });
  });

  describe('populateDefaultValues', () => {
    it('should set default port and calculate database name based on host and port', () => {
      expect(
        populateDefaultValues({
          host: 'host',
        } as Database),
      ).toMatchObject({
        name: 'host:6379',
      });
    });
    it('should prepare object with default values for not specified fields', () => {
      expect(populateDefaultValues(mockDatabaseToImportFromEnvsInput)).toEqual(
        mockDatabaseToImportFromEnvsPrepared,
      );
    });
    it('should prepare object with default values and certificates', () => {
      expect(
        populateDefaultValues(mockDatabaseToImportWithCertsFromEnvsInput),
      ).toEqual(mockDatabaseToImportWithCertsFromEnvsPrepared);
    });
    it('should prepare object with default values for not specified fields', () => {
      expect(populateDefaultValues(mockDatabaseToImportFromFileInput)).toEqual(
        mockDatabaseToImportFromFilePrepared,
      );
    });
    it('should prepare object with default values and certificates (from file flow)', () => {
      expect(
        populateDefaultValues(mockDatabaseToImportWithCertsFromFileInput),
      ).toEqual(mockDatabaseToImportWithCertsFromFilePrepared);
    });
  });

  describe('getCertificateData', () => {
    it('should get base64 certificate from env', async () => {
      process.env.RI_REDIS_TLS_CA_BASE64_1 = Buffer.from(
        mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
        'utf8',
      ).toString('base64');

      await expect(
        getCertificateData('RI_REDIS_TLS_CA', '_1'),
      ).resolves.toEqual(
        mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
      );
      expect(fsReadFileSpy).not.toHaveBeenCalled();
    });
    it('should read certificate from path', async () => {
      process.env.RI_REDIS_TLS_CA_PATH_1 = '/ca.crt';

      await expect(
        getCertificateData('RI_REDIS_TLS_CA', '_1'),
      ).resolves.toEqual(
        mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
      );
      expect(fsReadFileSpy).toHaveBeenCalledWith('/ca.crt', 'utf8');
    });
    it('should return null and not fail when there is an error while reading file', async () => {
      process.env.RI_REDIS_TLS_CA_PATH_1 = '/path/ca.crt';
      fsReadFileSpy.mockRejectedValueOnce(new Error('read file error'));
      await expect(
        getCertificateData('RI_REDIS_TLS_CA', '_1'),
      ).resolves.toEqual(null);
      expect(fsReadFileSpy).toHaveBeenCalledWith('/path/ca.crt', 'utf8');
    });
    it('should return null when no proper envs specified', async () => {
      await expect(
        getCertificateData('RI_REDIS_TLS_CA', '_1'),
      ).resolves.toEqual(null);
      expect(fsReadFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('prepareDatabaseFromEnvs', () => {
    it('should discover database without specific id provided', async () => {
      process.env.RI_REDIS_HOST = mockDatabaseToImportFromEnvsInput.host;
      process.env.RI_REDIS_POST = `${mockDatabaseToImportFromEnvsInput.port}`;
      process.env.RI_REDIS_ALIAS = mockDatabaseToImportFromEnvsInput.name;

      await expect(prepareDatabaseFromEnvs('RI_REDIS_HOST')).resolves.toEqual(
        mockDatabaseToImportFromEnvsPrepared,
      );
    });
    it('should return null because of validation error', async () => {
      // no host field
      process.env.RI_REDIS_POST = `${mockDatabaseToImportFromEnvsInput.port}`;
      process.env.RI_REDIS_ALIAS = mockDatabaseToImportFromEnvsInput.name;

      await expect(prepareDatabaseFromEnvs('RI_REDIS_HOST')).resolves.toEqual(
        null,
      );
    });
    it('should return database with minimal fields specified via envs', async () => {
      process.env.RI_REDIS_HOST = mockDatabaseToImportFromEnvsInput.host;

      await expect(prepareDatabaseFromEnvs('RI_REDIS_HOST')).resolves.toEqual({
        ...mockDatabaseToImportFromEnvsPrepared,
        port: 6379, // default port
        name: `${mockDatabaseToImportFromEnvsPrepared.host}:6379`, // auto generated name
      });
    });
    it('should discover database with certs in base64 format', async () => {
      process.env.RI_REDIS_HOST_1 =
        mockDatabaseToImportWithCertsFromEnvsInput.host;
      process.env.RI_REDIS_PORT_1 = `${mockDatabaseToImportWithCertsFromEnvsInput.port}`;
      process.env.RI_REDIS_ALIAS_1 =
        mockDatabaseToImportWithCertsFromEnvsInput.name;
      process.env.RI_REDIS_TLS_1 = 'true';
      process.env.RI_REDIS_TLS_CA_BASE64_1 = Buffer.from(
        mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
        'utf8',
      ).toString('base64');
      process.env.RI_REDIS_TLS_CERT_BASE64_1 = Buffer.from(
        mockDatabaseToImportWithCertsFromEnvsInput.clientCert.certificate,
        'utf8',
      ).toString('base64');
      process.env.RI_REDIS_TLS_KEY_BASE64_1 = Buffer.from(
        mockDatabaseToImportWithCertsFromEnvsInput.clientCert.key,
        'utf8',
      ).toString('base64');

      await expect(prepareDatabaseFromEnvs('RI_REDIS_HOST_1')).resolves.toEqual(
        mockDatabaseToImportWithCertsFromEnvsPrepared,
      );
    });
    it('should discover database with certs from file', async () => {
      process.env.RI_REDIS_HOST_1 =
        mockDatabaseToImportWithCertsFromEnvsInput.host;
      process.env.RI_REDIS_PORT_1 = `${mockDatabaseToImportWithCertsFromEnvsInput.port}`;
      process.env.RI_REDIS_ALIAS_1 =
        mockDatabaseToImportWithCertsFromEnvsInput.name;
      process.env.RI_REDIS_TLS_1 = 'true';
      process.env.RI_REDIS_TLS_CA_PATH_1 = '/ca.crt';
      process.env.RI_REDIS_TLS_CERT_PATH_1 = '/user.crt';
      process.env.RI_REDIS_TLS_KEY_PATH_1 = '/user.key';

      await expect(prepareDatabaseFromEnvs('RI_REDIS_HOST_1')).resolves.toEqual(
        mockDatabaseToImportWithCertsFromEnvsPrepared,
      );
    });
  });

  describe('discoverEnvDatabasesToAdd', () => {
    it('should discover 2 out of 3 env databases due to validation', async () => {
      process.env.RI_REDIS_HOST = 'host1';
      process.env.RI_REDIS_HOST_1 = 'host2';
      process.env.RI_REDIS_HOST_2 = '';

      await expect(discoverEnvDatabasesToAdd()).resolves.toEqual([
        {
          ...mockDefaultDatabaseFields,
          id: '0',
          host: 'host1',
          port: 6379,
          name: 'host1:6379',
        },
        {
          ...mockDefaultDatabaseFields,
          id: '_1',
          host: 'host2',
          port: 6379,
          name: 'host2:6379',
        },
      ]);
    });
    it('should not fail in case of an error', async () => {
      const scanProcessEnvSpy = jest.spyOn(preSetupUtil, 'scanProcessEnv');
      scanProcessEnvSpy.mockImplementation(() => {
        throw new Error('Some error');
      });

      await expect(discoverEnvDatabasesToAdd()).resolves.toEqual([]);
    });
  });

  describe('discoverFileDatabasesToAdd', () => {
    it("should return null when file doesn't exist", async () => {
      await expect(
        discoverFileDatabasesToAdd('/not-existing.json'),
      ).resolves.toEqual([]);
      expect(fsReadFileSpy).not.toHaveBeenCalled();
    });
    it('should return null when unexpected file received', async () => {
      fsReadFileSpy.mockResolvedValueOnce(Buffer.from('not a "" json {}'));
      await expect(
        discoverFileDatabasesToAdd('/databases.json'),
      ).resolves.toEqual([]);
      expect(fsReadFileSpy).toHaveBeenCalledWith('/databases.json', 'utf8');
    });
    it('should prepare 2 out of 3 database because of validation error', async () => {
      fsReadFileSpy.mockResolvedValueOnce(
        Buffer.from(
          JSON.stringify([
            {
              password: 'incorrect database',
            },
            mockDatabaseToImportFromFileInput,
            mockDatabaseToImportWithCertsFromFileInput,
          ]),
        ),
      );
      await expect(
        discoverFileDatabasesToAdd('/databases.json'),
      ).resolves.toEqual([
        mockDatabaseToImportFromFilePrepared,
        mockDatabaseToImportWithCertsFromFilePrepared,
      ]);
      expect(fsReadFileSpy).toHaveBeenCalledWith('/databases.json', 'utf8');
    });
  });
});
