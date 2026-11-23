import * as net from 'net';
import { EventEmitter } from 'events';
import { Server, utils, Connection } from 'ssh2';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { SshTunnel } from 'src/modules/ssh/models/ssh-tunnel';

const connectOnce = (port: number): Promise<net.Socket> =>
  new Promise((resolve, reject) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.once('connect', () => resolve(socket));
    socket.once('error', reject);
  });

const waitFor = async (condition: () => boolean, timeout = 3000) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

describe('SshTunnel (real ssh2 server)', () => {
  const hostKey = utils.generateKeyPairSync('ed25519').private;
  const provider = new SshTunnelProvider();

  let sshServer: Server;
  let sshConnections: Connection[];
  let answerChannels: boolean;
  let tunnel: SshTunnel;
  let uncaught: Error[];
  let originalListeners: NodeJS.UncaughtExceptionListener[];

  const startSshServer = () =>
    new Promise<number>((resolve) => {
      sshServer = new Server({ hostKeys: [hostKey] }, (connection) => {
        sshConnections.push(connection);
        connection.on('error', () => {});
        connection.on('authentication', (ctx) => ctx.accept());
        connection.on('ready', () => {
          connection.on('tcpip', (accept) => {
            // when not answering, the channel open stays pending
            if (answerChannels) {
              accept();
            }
          });
        });
      });
      sshServer.listen(0, '127.0.0.1', () =>
        resolve((sshServer.address() as net.AddressInfo).port),
      );
    });

  const createTunnel = async (sshPort: number) => {
    tunnel = await provider.createTunnel({ host: '127.0.0.1', port: 6379 }, {
      id: 'ssh-id',
      host: '127.0.0.1',
      port: sshPort,
      username: 'user',
      password: 'password',
    } as any);
  };

  beforeEach(async () => {
    sshConnections = [];
    answerChannels = true;
    uncaught = [];

    originalListeners = process.listeners('uncaughtException');
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', (e) => uncaught.push(e));

    await createTunnel(await startSshServer());
  });

  afterEach(async () => {
    tunnel.close();
    sshConnections.forEach((c) => c.end());
    await new Promise((resolve) => sshServer.close(resolve));

    process.removeAllListeners('uncaughtException');
    originalListeners.forEach((l) => process.on('uncaughtException', l));
  });

  it('should stop accepting local connections and not throw when the ssh connection drops', async () => {
    const { port } = tunnel.serverAddress;

    sshConnections.forEach((c) => c.end());
    // let the client notice the closed connection
    await new Promise((resolve) => setTimeout(resolve, 200));

    const socket = await connectOnce(port).catch((e) => e);
    if (socket instanceof net.Socket) {
      socket.destroy();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    expect(uncaught).toEqual([]);
    expect(socket).toMatchObject({ code: 'ECONNREFUSED' });
  });

  it('should not throw when the ssh connection drops with a pending channel request', async () => {
    answerChannels = false;
    const socket = await connectOnce(tunnel.serverAddress.port);
    socket.on('error', () => {});
    await waitFor(() => sshConnections.length > 0);
    await new Promise((resolve) => setTimeout(resolve, 100));

    sshConnections.forEach((c) => c.end());
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(uncaught).toEqual([]);
    expect(socket.destroyed).toBe(true);
  });

  it('should end the ssh connection on close()', async () => {
    const closed = new Promise((resolve) =>
      (sshConnections[0] as EventEmitter).once('close', resolve),
    );

    tunnel.close();

    await closed;
  });
});
