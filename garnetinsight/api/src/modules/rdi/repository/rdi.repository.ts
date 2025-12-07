import { Rdi } from 'src/modules/rdi/models';

export abstract class RdiRepository {
  /**
   * List of RDIs (limited fields only)
   * Fields: ['id', 'name', 'host', 'port', 'type', 'lastConnection']
   * @return Rdi[]
   */
  abstract list(): Promise<Rdi[]>;

  /**
   * Get RDI connection details by id
   * @param id
   * @param ignoreEncryptionErrors
   * @return Rdi
   */
  abstract get(id: string, ignoreEncryptionErrors?: boolean): Promise<Rdi>;

  /**
   * Create RDI connection
   * @param rdi
   */
  abstract create(rdi: Rdi): Promise<Rdi>;

  /**
   * Update RDI connection config
   * @param id
   * @param rdi
   */
  abstract update(id: string, rdi: Partial<Rdi>): Promise<Rdi>;

  /**
   * Delete RDI by id
   * @param ids
   */
  abstract delete(ids: string[]): Promise<void>;
}
