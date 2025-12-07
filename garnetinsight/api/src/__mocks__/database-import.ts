import {
  DatabaseImportResponse,
  DatabaseImportStatus,
} from 'src/modules/database-import/dto/database-import.response';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  mockDatabase,
  mockSentinelDatabaseWithTlsAuth,
} from 'src/__mocks__/databases';
import { ValidationException } from 'src/common/exceptions';
import {
  mockCaCertificate,
  mockClientCertificate,
} from 'src/__mocks__/certificates';
import {
  InvalidCaCertificateBodyException,
  InvalidCertificateNameException,
} from 'src/modules/database-import/exceptions';
import { mockSshOptionsPrivateKey } from 'src/__mocks__/ssh';

export const mockDatabasesToImportArray = new Array(10).fill(
  mockSentinelDatabaseWithTlsAuth,
);

export const mockDatabaseImportFile = {
  originalname: 'filename.json',
  mimetype: 'application/json',
  size: 1,
  buffer: Buffer.from(JSON.stringify(mockDatabasesToImportArray)),
};

export const mockDatabaseImportResultSuccess = {
  index: 0,
  status: DatabaseImportStatus.Success,
  host: mockDatabase.host,
  port: mockDatabase.port,
};

export const mockDatabaseImportResultFail = {
  index: 0,
  status: DatabaseImportStatus.Fail,
  host: mockDatabase.host,
  port: mockDatabase.port,
  errors: [new BadRequestException()],
};

export const mockDatabaseImportResultPartial = {
  index: 0,
  status: DatabaseImportStatus.Partial,
  host: mockDatabase.host,
  port: mockDatabase.port,
  errors: [new InvalidCaCertificateBodyException()],
};

export const mockDatabaseImportResponse = Object.assign(
  new DatabaseImportResponse(),
  {
    total: 10,
    success: new Array(5)
      .fill(mockDatabaseImportResultSuccess)
      .map((v, index) => ({
        ...v,
        index: index + 5,
      })),
    partial: [
      [
        new InvalidCaCertificateBodyException(),
        new InvalidCertificateNameException(),
      ],
      [new InvalidCertificateNameException()],
    ].map((errors, index) => ({
      ...mockDatabaseImportResultPartial,
      index: index + 3,
      errors,
    })),
    fail: [
      new ValidationException('Bad request'),
      new BadRequestException(),
      new ForbiddenException(),
    ].map((error, index) => ({
      ...mockDatabaseImportResultFail,
      index,
      errors: [error],
    })),
  },
);

export const mockDatabaseImportPartialAnalyticsPayload = {
  partially: mockDatabaseImportResponse.partial.length,
  errors: [
    'InvalidCaCertificateBodyException',
    'InvalidCertificateNameException',
  ],
};

export const mockDatabaseImportFailedAnalyticsPayload = {
  failed: mockDatabaseImportResponse.fail.length,
  errors: ['ValidationException', 'BadRequestException', 'ForbiddenException'],
};

export const mockDatabaseImportSucceededAnalyticsPayload = {
  succeed: mockDatabaseImportResponse.success.length,
};

export const mockDatabaseImportAnalytics = jest.fn(() => ({
  sendImportResults: jest.fn(),
  sendImportFailed: jest.fn(),
}));

export const mockCertificateImportService = jest.fn(() => ({
  processCaCertificate: jest.fn().mockResolvedValue(mockCaCertificate),
  processClientCertificate: jest.fn().mockResolvedValue(mockClientCertificate),
}));

export const mockSshImportService = jest.fn(() => ({
  processSshOptions: jest.fn().mockResolvedValue({
    ...mockSshOptionsPrivateKey,
    id: undefined,
  }),
}));

export const mockDatabaseImportService = jest.fn(() => ({
  import: jest.fn(),
}));
