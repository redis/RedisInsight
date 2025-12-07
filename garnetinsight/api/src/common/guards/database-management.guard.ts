import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class DatabaseManagementGuard implements CanActivate {
  canActivate(): boolean {
    if (!SERVER_CONFIG.databaseManagement) {
      throw new ForbiddenException(
        ERROR_MESSAGES.DATABASE_MANAGEMENT_IS_DISABLED,
      );
    }

    return true;
  }
}
