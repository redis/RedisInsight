import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';

export abstract class ClientCertificateRepository {
  /**
   * Get full ClientCertificate by id with all fields
   * @param id
   * @return ClientCertificate
   */
  abstract get(id: string): Promise<ClientCertificate>;
  /**
   * Get list of certificates with [id, name] fields only
   */
  abstract list(): Promise<ClientCertificate[]>;
  /**
   * Create a new client certificate.
   * @param clientCertificate
   * @param uniqueCheck
   * @return ClientCertificate
   * @throws BadRequestException with ERROR_MESSAGES.CLIENT_CERT_EXIST when such CA exists
   */
  abstract create(
    clientCertificate: ClientCertificate,
    uniqueCheck?: boolean,
  ): Promise<ClientCertificate>;

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
