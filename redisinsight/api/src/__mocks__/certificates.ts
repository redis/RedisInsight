import { pick, omit } from 'lodash';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';

// ================== CA Certificate ==================
export const mockCaCertificateId = 'a77b23c1-7816-4ea4-b61f-d37795a0f805';

export const mockCaCertificateCertificateEncrypted =
  'caCertificate.certificate_ENCRYPTED';

export const mockCaCertificateCertificatePlain =
  '-----BEGIN CERTIFICATE-----\nMIIDejCCAmKgAwIBAgIUehUr5AHdJM';

export const mockCaCertificate = Object.assign(new CaCertificate(), {
  id: mockCaCertificateId,
  name: 'ca-cert',
  certificate: mockCaCertificateCertificatePlain,
});

export const mockCreateCaCertificateDto = Object.assign(
  new CreateCaCertificateDto(),
  {
    ...omit(mockCaCertificate, 'id'),
  },
);

export const mockCaCertificateEntity = Object.assign(
  new CaCertificateEntity(),
  {
    ...mockCaCertificate,
    certificate: mockCaCertificateCertificateEncrypted,
    encryption: EncryptionStrategy.KEYTAR,
  },
);

export const mockCaCertificateRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockCaCertificate),
  list: jest
    .fn()
    .mockResolvedValueOnce([
      pick(mockCaCertificate, 'id', 'name'),
      pick(mockCaCertificate, 'id', 'name'),
    ]),
  create: jest.fn().mockResolvedValue(mockCaCertificate),
  delete: jest.fn().mockResolvedValue(undefined),
  cleanupPreSetup: jest.fn().mockResolvedValue({ affected: 0 }),
}));

export const mockCaCertificateService = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockCaCertificate),
}));

// ================== Client Certificate ==================
export const mockClientCertificateId = 'a77b23c1-7816-4ea4-b61f-d37f2915f805';

export const mockClientCertificateCertificateEncrypted =
  'clientCertificate.certificate_ENCRYPTED';

export const mockClientCertificateCertificatePlain =
  '-----BEGIN CERTIFICATE-----\nMICLIENTCERTIDejCCAmKgAwIB';

export const mockClientCertificateKeyEncrypted =
  'clientCertificate.key_ENCRYPTED';

export const mockClientCertificateKeyPlain =
  '-----BEGIN PRIVATE KEY-----\nMICLIENTCERTIDejCCAmKgAwIB';

export const mockClientCertificate = Object.assign(new ClientCertificate(), {
  id: mockClientCertificateId,
  name: 'client-cert',
  certificate: mockClientCertificateCertificatePlain,
  key: mockClientCertificateKeyPlain,
});

export const mockCreateClientCertificateDto = Object.assign(
  new CreateClientCertificateDto(),
  {
    ...omit(mockClientCertificate, 'id'),
  },
);

export const mockClientCertificateEntity = Object.assign(
  new ClientCertificateEntity(),
  {
    ...mockClientCertificate,
    certificate: mockClientCertificateCertificateEncrypted,
    key: mockClientCertificateKeyEncrypted,
    encryption: EncryptionStrategy.KEYTAR,
  },
);

export const mockClientCertificateRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockClientCertificate),
  list: jest
    .fn()
    .mockResolvedValueOnce([
      pick(mockClientCertificate, 'id', 'name'),
      pick(mockClientCertificate, 'id', 'name'),
    ]),
  create: jest.fn().mockResolvedValue(mockClientCertificate),
  delete: jest.fn().mockResolvedValue(undefined),
  cleanupPreSetup: jest.fn().mockResolvedValue({ affected: 0 }),
}));

export const mockClientCertificateService = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockClientCertificate),
}));

// ================== Path-based Certificates ==================
export const mockCaCertificatePath = '/path/to/ca.pem';
export const mockClientCertificatePath = '/path/to/client.pem';
export const mockClientKeyPath = '/path/to/client-key.pem';

export const mockCaCertificateWithPath = Object.assign(new CaCertificate(), {
  id: mockCaCertificateId,
  name: 'ca-cert-with-path',
  certificatePath: mockCaCertificatePath,
});

export const mockClientCertificateWithPath = Object.assign(
  new ClientCertificate(),
  {
    id: mockClientCertificateId,
    name: 'client-cert-with-path',
    certificatePath: mockClientCertificatePath,
    keyPath: mockClientKeyPath,
  },
);
