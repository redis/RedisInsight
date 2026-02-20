import * as fs from 'fs';
import * as path from 'path';
import { TlsCertConfig, TlsClientCertConfig } from 'e2eSrc/types';
import { getEnvNumber, getEnvOptional } from '../env';

// Path to certificates in the RTE folder
// __dirname is tests/e2e-playwright/config/databases
// We need to go up 3 levels to tests/, then into e2e/rte/...
const CERTS_PATH = path.resolve(__dirname, '../../../e2e/rte/oss-standalone-tls/certs');

/**
 * Read certificate file content (lazy - only when called)
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

// Lazy-loaded TLS certificates to avoid crashing tests that don't need TLS
// if the cert files don't exist (e.g., RTE not started yet)
let _tlsCaCert: TlsCertConfig | null = null;
let _tlsClientCert: TlsClientCertConfig | null = null;
let _uniqueSuffix: string | null = null;

function getUniqueSuffix(): string {
  if (!_uniqueSuffix) {
    _uniqueSuffix = generateUniqueSuffix();
  }
  return _uniqueSuffix;
}

/**
 * Get CA Certificate for TLS connection (lazy-loaded)
 * Uses unique name to avoid conflicts with existing certificates
 */
export function getTlsCaCert(): TlsCertConfig {
  if (!_tlsCaCert) {
    _tlsCaCert = {
      name: getEnvOptional('TLS_CA_CERT_NAME') || `test-ca-${getUniqueSuffix()}`,
      certificate: getEnvOptional('TLS_CA_CERT') || readCertFile('redisCA.crt'),
    };
  }
  return _tlsCaCert;
}

/**
 * Get Client Certificate for TLS connection (lazy-loaded)
 * Uses unique name to avoid conflicts with existing certificates
 */
export function getTlsClientCert(): TlsClientCertConfig {
  if (!_tlsClientCert) {
    _tlsClientCert = {
      name: getEnvOptional('TLS_CLIENT_CERT_NAME') || `test-client-${getUniqueSuffix()}`,
      certificate: getEnvOptional('TLS_CLIENT_CERT') || readCertFile('user.crt'),
      key: getEnvOptional('TLS_CLIENT_KEY') || readCertFile('user.key'),
    };
  }
  return _tlsClientCert;
}
