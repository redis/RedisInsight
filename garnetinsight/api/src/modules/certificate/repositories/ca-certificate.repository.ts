import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';

export abstract class CaCertificateRepository {
  /**
   * Get full CaCertificate by id with all fields
   * @param id
   * @return CaCertificate
   */
  abstract get(id: string): Promise<CaCertificate>;

  /**
   * Get list of certificates with [id, name] fields only
   */
  abstract list(): Promise<CaCertificate[]>;

  /**
   * Create a new CA certificate.
   * @param caCertificate
   * @param uniqueCheck
   * @return CaCertificate
   * @throws BadRequestException with ERROR_MESSAGES.CA_CERT_EXIST when such CA exists
   */
  abstract create(
    caCertificate: CaCertificate,
    uniqueCheck?: boolean,
  ): Promise<CaCertificate>;

  /**
   * Delete certificate by id
   * @param id
   * @throws NotFoundException in case when try to delete not existing cert (?)
   */
  abstract delete(id: string): Promise<{ affectedDatabases: string[] }>;

  /**
   * Cleanup CA certificates which were created on startup from a file or env variables
   * @param excludeIds
   */
  abstract cleanupPreSetup(
    excludeIds?: string[],
  ): Promise<{ affected: number }>;
}
