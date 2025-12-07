import { HttpException, Injectable } from '@nestjs/common';
import { SshTunnel } from 'src/modules/ssh/models/ssh-tunnel';
import { UnableToCreateTunnelException } from 'src/modules/ssh/exceptions';
import { Endpoint } from 'src/common/models';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';
import { createTunnel } from 'tunnel-ssh';

@Injectable()
export class SshTunnelProvider {
  public async createTunnel(target: Endpoint, sshOptions: SshOptions) {
    try {
      const [server, client] = await createTunnel(
        {
          autoClose: true,
        },
        {
          host: '127.0.0.1',
        },
        {
          ...sshOptions,
        },
        {
          dstAddr: target.host,
          dstPort: target.port,
        },
      );

      return new SshTunnel(server, client, {
        targetHost: target.host,
        targetPort: target.port,
      });
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new UnableToCreateTunnelException(e.message);
    }
  }
}
