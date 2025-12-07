import { Database } from 'src/modules/database/models/database';

export const mockDefaultDatabaseFields = {
  isPreSetup: true,
  compressor: 'NONE',
  connectionType: 'NOT CONNECTED',
  modules: [],
  caCert: null,
  clientCert: null,
  db: 0,
  nameFromProvider: null,
  password: null,
  provider: null,
  ssh: null,
  sshOptions: null,
  tls: false,
  tlsServername: null,
  username: null,
  verifyServerCert: null,
};

export const mockDatabaseToImportFromEnvsInput = {
  id: '0',
  host: 'localhost',
  port: 6379,
  name: 'local database',
  db: 0,
} as Partial<Database>;

export const mockDatabaseToImportFromEnvsPrepared = {
  ...mockDefaultDatabaseFields,
  ...mockDatabaseToImportFromEnvsInput,
} as Database;

export const mockDatabaseToImportWithCertsFromEnvsInput = {
  id: '_1',
  host: 'host1',
  port: 6370,
  name: 'local database',
  tls: true,
  caCert: {
    certificate: 'CA cert',
  },
  clientCert: {
    certificate: 'User cert',
    key: 'User key',
  },
  verifyServerCert: true,
  db: 0,
} as Partial<Database>;

export const mockDatabaseToImportWithCertsFromEnvsPrepared = {
  ...mockDefaultDatabaseFields,
  ...mockDatabaseToImportWithCertsFromEnvsInput,
  caCert: {
    id: mockDatabaseToImportWithCertsFromEnvsInput.id,
    name: `${mockDatabaseToImportWithCertsFromEnvsInput.id}_${mockDatabaseToImportWithCertsFromEnvsInput.name}`,
    certificate: mockDatabaseToImportWithCertsFromEnvsInput.caCert.certificate,
    isPreSetup: true,
  },
  clientCert: {
    id: mockDatabaseToImportWithCertsFromEnvsInput.id,
    name: `${mockDatabaseToImportWithCertsFromEnvsInput.id}_${mockDatabaseToImportWithCertsFromEnvsInput.name}`,
    certificate:
      mockDatabaseToImportWithCertsFromEnvsInput.clientCert.certificate,
    key: mockDatabaseToImportWithCertsFromEnvsInput.clientCert.key,
    isPreSetup: true,
  },
} as Database;

export const mockDatabaseToImportFromFileInput = {
  compressor: 'NONE',
  id: '_3',
  host: '172.30.100.102',
  port: 6379,
  name: 'standalone-auth',
  db: null,
  username: null,
  password: null,
  connectionType: 'NOT CONNECTED',
  nameFromProvider: null,
  provider: null,
  lastConnection: null,
  modules: [],
  tls: false,
  tlsServername: null,
  verifyServerCert: null,
  caCert: null,
  clientCert: null,
  ssh: null,
  sshOptions: null,
} as Partial<Database>;

export const mockDatabaseToImportFromFilePrepared = {
  ...mockDefaultDatabaseFields,
  ...mockDatabaseToImportFromFileInput,
  isPreSetup: true,
} as Database;

export const mockDatabaseToImportWithCertsFromFileInput = {
  compressor: 'Brotli',
  id: '_5',
  host: '172.30.100.103',
  port: 6379,
  name: 'standalone-tls-auth',
  db: null,
  username: 'admin',
  password: 'pass',
  connectionType: 'STANDALONE', // will be overwritten
  nameFromProvider: null,
  provider: null,
  lastConnection: null,
  modules: [],
  tls: true,
  tlsServername: null,
  verifyServerCert: true,
  caCert: {
    id: 'will be overwritten',
    name: 'will be overwritten',
    certificate:
      '-----BEGIN CERTIFICATE-----\nMIIFHzCCAwegAwIBAgIUKeAfHPO6uJBW...',
    isPreSetup: false, // will be overwritten
  },
  clientCert: {
    id: 'will be overwritten',
    name: 'will be overwritten',
    certificate:
      '-----BEGIN CERTIFICATE-----\nMIIEzTCCArWgAwIBAgIUALiX/81ndGTG...',
    key: '-----BEGIN PRIVATE KEY-----\nMIIJQgIBADANBgkqhkiG9w0BAQEFAASCCSwwggko...',
    isPreSetup: false, // will be overwritten
  },
  ssh: null,
  sshOptions: null,
  isPreSetup: false, // will be overwritten
} as Partial<Database>;

export const mockDatabaseToImportWithCertsFromFilePrepared = {
  ...mockDatabaseToImportWithCertsFromFileInput,
  isPreSetup: true,
  compressor: 'Brotli',
  connectionType: 'NOT CONNECTED',
  modules: [],
  caCert: {
    id: mockDatabaseToImportWithCertsFromFileInput.id,
    name: `${mockDatabaseToImportWithCertsFromFileInput.id}_${mockDatabaseToImportWithCertsFromFileInput.name}`,
    certificate: mockDatabaseToImportWithCertsFromFileInput.caCert.certificate,
    isPreSetup: true,
  },
  clientCert: {
    id: mockDatabaseToImportWithCertsFromFileInput.id,
    name: `${mockDatabaseToImportWithCertsFromFileInput.id}_${mockDatabaseToImportWithCertsFromFileInput.name}`,
    certificate:
      mockDatabaseToImportWithCertsFromFileInput.clientCert.certificate,
    key: mockDatabaseToImportWithCertsFromFileInput.clientCert.key,
    isPreSetup: true,
  },
  db: null,
  nameFromProvider: null,
  provider: null,
  ssh: null,
  sshOptions: null,
  tlsServername: null,
} as Database;

export const cleanupTestEnvs = () => {
  delete process.env.RI_REDIS_HOST;
  delete process.env.RI_REDIS_PORT;
  delete process.env.RI_REDIS_ALIAS;
  delete process.env.RI_REDIS_USENAME;
  delete process.env.RI_REDIS_PASSWORD;

  delete process.env.RI_REDIS_HOST_1;
  delete process.env.RI_REDIS_PORT_1;
  delete process.env.RI_REDIS_ALIAS_1;
  delete process.env.RI_REDIS_TLS_1;
  delete process.env.RI_REDIS_TLS_CA_PATH_1;
  delete process.env.RI_REDIS_TLS_CA_BASE64_1;
  delete process.env.RI_REDIS_TLS_CERT_PATH_1;
  delete process.env.RI_REDIS_TLS_CERT_BASE64_1;
  delete process.env.RI_REDIS_TLS_KEY_PATH_1;
  delete process.env.RI_REDIS_TLS_KEY_BASE64_1;

  delete process.env.RI_REDIS_HOST_2;
  delete process.env.RI_REDIS_HHOST;
};

export const mockPreSetupDatabaseDiscoveryService = () => ({
  discover: jest.fn().mockResolvedValue({ discovered: 0 }),
});

export const mockAutoDatabaseDiscoveryService = () => ({
  discover: jest.fn(),
});

export const mockDatabaseDiscoveryService = () => ({
  discover: jest.fn(),
});
