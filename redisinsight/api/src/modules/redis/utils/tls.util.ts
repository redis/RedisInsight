import { readFile } from 'fs/promises';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';

/**
 * Get certificate content from either the stored content or by reading from file path.
 * When certificatePath is specified, the certificate is read from disk at connection time.
 *
 * @param certificate - CA or Client certificate object
 * @returns Certificate content as string
 */
export const getCertificateContent = async (
  certificate: CaCertificate | ClientCertificate,
): Promise<string> => {
  if (certificate.certificatePath) {
    return readFile(certificate.certificatePath, 'utf8');
  }
  return certificate.certificate;
};

/**
 * Get private key content from either the stored content or by reading from file path.
 * When keyPath is specified, the key is read from disk at connection time.
 *
 * @param clientCertificate - Client certificate object containing key information
 * @returns Key content as string
 */
export const getKeyContent = async (
  clientCertificate: ClientCertificate,
): Promise<string> => {
  if (clientCertificate.keyPath) {
    return readFile(clientCertificate.keyPath, 'utf8');
  }
  return clientCertificate.key;
};
