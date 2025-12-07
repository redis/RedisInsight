import { Injectable, Logger } from '@nestjs/common';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudAccountInfo } from 'src/modules/cloud/user/models';
import { parseCloudAccountCapiResponse } from 'src/modules/cloud/user/utils';
import { CloudUserCapiProvider } from 'src/modules/cloud/user/providers/cloud-user.capi.provider';

@Injectable()
export class CloudUserCapiService {
  private logger = new Logger('CloudUserCapiService');

  constructor(private readonly capi: CloudUserCapiProvider) {}

  /**
   * Get cloud account short info
   * @param authDto
   */
  async getCurrentAccount(
    authDto: CloudCapiAuthDto,
  ): Promise<CloudAccountInfo> {
    this.logger.debug('Getting cloud account.');
    try {
      const account = await this.capi.getCurrentAccount(authDto);

      this.logger.debug('Succeed to get cloud account.');

      return parseCloudAccountCapiResponse(account);
    } catch (e) {
      this.logger.error('Failed to get cloud account', e);
      throw wrapHttpError(e);
    }
  }
}
