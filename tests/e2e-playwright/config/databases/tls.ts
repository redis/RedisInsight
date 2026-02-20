import * as fs from 'fs';
import * as path from 'path';
import { TlsCertConfig, TlsClientCertConfig } from 'e2eSrc/types';
import { getEnvNumber, getEnvOptional } from '../env';

// Path to certificates in the RTE folder
const CERTS_PATH = path.resolve(__dirname, '../../../e2e/rte/oss-standalone-tls/certs');

function readCertFile(filename: string): string {
  return fs.readFileSync(path.join(CERTS_PATH, filename), 'utf-8');
}

// Generate unique suffix once per test run to avoid "already in use" errors
const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

/**
 * TLS Redis connection configuration
 */
export const tlsRedisConfig = {
  host: getEnvOptional('OSS_STANDALONE_TLS_HOST') || '127.0.0.1',
  port: getEnvNumber('OSS_STANDALONE_TLS_PORT', 8104),
};

/**
 * CA Certificate for TLS connection
 */
export const tlsCaCert: TlsCertConfig = {
  name: getEnvOptional('TLS_CA_CERT_NAME') || `test-ca-${uniqueSuffix}`,
  certificate: getEnvOptional('TLS_CA_CERT') || readCertFile('redisCA.crt'),
};

/**
 * Client Certificate for TLS connection (mutual TLS)
 */
export const tlsClientCert: TlsClientCertConfig = {
  name: getEnvOptional('TLS_CLIENT_CERT_NAME') || `test-client-${uniqueSuffix}`,
  certificate: getEnvOptional('TLS_CLIENT_CERT') || readCertFile('user.crt'),
  key: getEnvOptional('TLS_CLIENT_KEY') || readCertFile('user.key'),
};
