import * as fs from 'fs';
import * as path from 'path';
import { TlsCertConfig, TlsClientCertConfig } from 'e2eSrc/types';
import { getEnvNumber, getEnvOptional } from '../env';

// Path to certificates in the RTE folder
// __dirname is tests/e2e-playwright/config/databases
// We need to go up 3 levels to tests/, then into e2e/rte/...
const CERTS_PATH = path.resolve(__dirname, '../../../e2e/rte/oss-standalone-tls/certs');

/**
 * Read certificate file content
 */
function readCertFile(filename: string): string {
  const filePath = path.join(CERTS_PATH, filename);
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Generate a unique suffix for certificate names to avoid conflicts
 */
function generateUniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * TLS Redis connection configuration
 * Uses oss-standalone-tls from the RTE docker-compose
 */
export const tlsRedisConfig = {
  host: getEnvOptional('REDIS_TLS_HOST') || '127.0.0.1',
  port: getEnvOptional('REDIS_TLS_PORT') ? getEnvNumber('REDIS_TLS_PORT') : 8104,
};

// Generate unique names once per test run to avoid "already in use" errors
const uniqueSuffix = generateUniqueSuffix();

/**
 * CA Certificate for TLS connection
 * Uses unique name to avoid conflicts with existing certificates
 */
export const tlsCaCert: TlsCertConfig = {
  name: getEnvOptional('TLS_CA_CERT_NAME') || `test-ca-${uniqueSuffix}`,
  certificate: getEnvOptional('TLS_CA_CERT') || readCertFile('redisCA.crt'),
};

/**
 * Client Certificate for TLS connection (mutual TLS)
 * Uses unique name to avoid conflicts with existing certificates
 */
export const tlsClientCert: TlsClientCertConfig = {
  name: getEnvOptional('TLS_CLIENT_CERT_NAME') || `test-client-${uniqueSuffix}`,
  certificate: getEnvOptional('TLS_CLIENT_CERT') || readCertFile('user.crt'),
  key: getEnvOptional('TLS_CLIENT_KEY') || readCertFile('user.key'),
};
