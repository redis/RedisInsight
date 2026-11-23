import { AddressInfo, Socket } from 'net';
import { Logger } from '@nestjs/common';
import { createTunnel } from 'tunnel-ssh';
import { Endpoint } from 'src/common/models';

export type SshTunnelServer = Awaited<ReturnType<typeof createTunnel>>[0];
export type SshTunnelClient = Awaited<ReturnType<typeof createTunnel>>[1];

export interface ISshTunnelOptions {
  targetHost: string;
  targetPort: number;
}

export class SshTunnel {
  private readonly logger = new Logger('SshTunnel');

  private readonly sockets = new Set<Socket>();

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

    // tunnel-ssh's own handler throws when the ssh connection is gone
    this.server?.removeAllListeners?.('connection');
    this.server?.on?.('connection', (socket: Socket) =>
      this.forwardSocket(socket),
    );

    this.client?.on?.('error', (e: Error) => {
      this.logger.warn(`SSH connection error: ${e?.message}`);
    });
    this.client?.on?.('close', () => this.close());
  }

  public close() {
    this.sockets.forEach((socket) => socket.destroy());
    this.server?.close?.(() => {
      // ignore any error
    });
    this.client?.end?.();
  }

  private forwardSocket(socket: Socket) {
    this.sockets.add(socket);
    socket.on('error', (e: Error) => {
      this.logger.warn(`Tunnel socket error: ${e?.message}`);
    });
    socket.once('close', () => {
      this.sockets.delete(socket);
      if (!this.sockets.size) {
        this.close();
      }
    });

    try {
      this.client.forwardOut(
        this.serverAddress.host,
        this.serverAddress.port,
        this.options.targetHost,
        this.options.targetPort,
        (err, stream) => {
          if (err) {
            this.logger.warn(`Unable to forward connection: ${err.message}`);
            socket.destroy();
            return;
          }

          stream.on('error', () => socket.destroy());
          socket.pipe(stream).pipe(socket);
        },
      );
    } catch (e) {
      this.logger.warn(`Unable to forward connection: ${e.message}`);
      socket.destroy();
    }
  }
}
