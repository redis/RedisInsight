import { Injectable } from '@nestjs/common';
import { isUndefined } from 'lodash';
import { getPemBodyFromFileSync, isValidSshPrivateKey } from 'src/common/utils';
import {
  InvalidSshPrivateKeyBodyException,
  InvalidSshBodyException,
  SshAgentsAreNotSupportedException,
} from 'src/modules/database-import/exceptions';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

@Injectable()
export class SshImportService {
  /**
   * Validate data + prepare CA certificate to be imported along with new database
   * @param data
   */
  async processSshOptions(data: any): Promise<Partial<SshOptions>> {
    let sshOptions: Partial<SshOptions> = {
      host: data.sshHost,
    };

    if (isUndefined(data.sshPort) || isUndefined(data.sshUsername)) {
      throw new InvalidSshBodyException();
    } else {
      sshOptions.port = parseInt(data.sshPort, 10);
      sshOptions.username = data.sshUsername;
    }

    if (data.sshPrivateKey) {
      sshOptions.passphrase = data.sshPassphrase || data.sshPassword || null;

      if (isValidSshPrivateKey(data.sshPrivateKey)) {
        sshOptions.privateKey = data.sshPrivateKey;
      } else {
        try {
          sshOptions.privateKey = getPemBodyFromFileSync(data.sshPrivateKey);
        } catch (e) {
          // ignore error
          sshOptions = null;
        }
      }
    } else {
      sshOptions.password = data.sshPassword || null;
    }

    if (
      !sshOptions ||
      (sshOptions?.privateKey && !isValidSshPrivateKey(sshOptions.privateKey))
    ) {
      throw new InvalidSshPrivateKeyBodyException();
    }

    if (data.sshAgentPath) {
      throw new SshAgentsAreNotSupportedException();
    }

    return sshOptions;
  }
}
