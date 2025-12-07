import { CloudCapiKey } from 'src/modules/cloud/capi-key/model';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CloudCapiKeyRepository {
  /**
   * Get Cloud CAPI key by id
   * Note: for internal use only
   * @param id
   */
  abstract get(id: string): Promise<CloudCapiKey>;

  /**
   * Update Cloud CAPI key by id
   * Note: for internal use only
   * @param id
   * @param data
   */
  abstract update(
    id: string,
    data: Partial<CloudCapiKey>,
  ): Promise<CloudCapiKey>;

  /**
   * Get current user CAPI key by cloud user id and cloud account id
   * @param userId
   * @param cloudUserId
   * @param cloudAccountId
   */
  abstract getByUserAccount(
    userId: string,
    cloudUserId: number,
    cloudAccountId: number,
  ): Promise<CloudCapiKey>;

  /**
   * Create CAPI key
   * @param model
   * @throws CloudApiBadRequestException - in case of unique constraint error
   */
  abstract create(model: CloudCapiKey): Promise<CloudCapiKey>;

  /**
   * List of CAPI keys for current user
   * @param userId
   */
  abstract list(userId: string): Promise<CloudCapiKey[]>;

  /**
   * Delete current user CAPI key by id
   * @param userId
   * @param id
   */
  abstract delete(userId: string, id: string): Promise<void>;

  /**
   * Delete all CAPI keys for current user
   * @param userId
   */
  abstract deleteAll(userId: string): Promise<void>;
}
