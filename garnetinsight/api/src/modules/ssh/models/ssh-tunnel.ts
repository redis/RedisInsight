import { AddressInfo } from 'net';
import { createTunnel } from 'tunnel-ssh';
import { Endpoint } from 'src/common/models';

export type SshTunnelServer = Awaited<ReturnType<typeof createTunnel>>[0];
export type SshTunnelClient = Awaited<ReturnType<typeof createTunnel>>[1];

export interface ISshTunnelOptions {
  targetHost: string;
  targetPort: number;
}

export class SshTunnel {
  public readonly serverAddress: Endpoint;

  constructor(
    private readonly server: SshTunnelServer,
    private readonly client: SshTunnelClient,
    public readonly options: ISshTunnelOptions,
  ) {
    const address = this.server?.address() as AddressInfo;
    this.serverAddress = {
      host: '127.0.0.1',
      port: address?.port,
    };
  }

  public close() {
    this.server?.close?.(() => {
      // ignore any error
    });
  }
}
