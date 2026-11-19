import { AddressInfo } from 'net';
import { createServer, Server, TLSSocket } from 'tls';
import { Test } from '@nestjs/testing';
import { mockClientMetadata, mockSshTunnelProvider } from 'src/__mocks__';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { RedisConnectionStrategy } from 'src/modules/redis/connection/redis.connection.strategy';
import { RedisClientConnectionType } from 'src/modules/redis/client';
import { Database } from 'src/modules/database/models/database';
import {
  LOCALHOST_ONLY_CERT,
  LOCALHOST_ONLY_KEY,
} from 'src/modules/redis/connection/__fixtures__/localhost-only-tls';

jest.mock('redis', () => ({
  ...(jest.requireActual('redis') as object),
}));

const CRLF = '\r\n';
const NODE_ID = '0'.repeat(40);
const CLUSTER_HOSTNAME = 'localhost';
const MAX_SLOT = 16383;
const TEST_TIMEOUT_MS = 15_000;

const bulk = (value: string): string =>
  `$${value.length}${CRLF}${value}${CRLF}`;

/**
 * Parses RESP arrays of bulk strings, which is all a Redis client sends.
 */
const parseCommands = (chunk: string): string[][] =>
  chunk
    .split(/(?=\*\d+\r\n)/)
    .filter(Boolean)
    .map((message) => {
      const parts = message.split(CRLF);
      const args: string[] = [];
      for (let i = 1; i < parts.length; i += 1) {
        if (parts[i].startsWith('$')) {
          args.push(parts[i + 1]);
          i += 1;
        }
      }
      return args;
    });

/**
 * A one node "cluster" that advertises its hostname the way managed clusters
 * (e.g. AWS MemoryDB) do, behind a certificate that names no IP address.
 */
const startClusterNode = (): Promise<Server> =>
  new Promise((resolve) => {
    const server = createServer(
      { key: LOCALHOST_ONLY_KEY, cert: LOCALHOST_ONLY_CERT },
      (socket: TLSSocket) => {
        socket.on('error', () => {});
        socket.on('data', (data) => {
          const { port } = server.address() as AddressInfo;

          parseCommands(data.toString()).forEach(([command, subcommand]) => {
            const name = `${command} ${subcommand ?? ''}`.trim().toLowerCase();

            if (name === 'cluster slots') {
              socket.write(
                `*1${CRLF}*3${CRLF}:0${CRLF}:${MAX_SLOT}${CRLF}` +
                  `*3${CRLF}${bulk(CLUSTER_HOSTNAME)}:${port}${CRLF}${bulk(NODE_ID)}`,
              );
            } else if (command.toLowerCase() === 'info') {
              socket.write(bulk(`loading:0${CRLF}cluster_enabled:1${CRLF}`));
            } else {
              socket.write(`+OK${CRLF}`);
            }
          });
        });
      },
    );

    server.listen(0, () => resolve(server));
  });

describe.each([
  ['ioredis', IoredisRedisConnectionStrategy],
  ['node-redis', NodeRedisConnectionStrategy],
])('%s strategy against a TLS cluster named by hostname', (_, Strategy) => {
  let service: RedisConnectionStrategy;
  let server: Server;

  beforeAll(async () => {
    server = await startClusterNode();
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        Strategy,
        {
          provide: SshTunnelProvider,
          useFactory: mockSshTunnelProvider,
        },
      ],
    }).compile();

    service = module.get(Strategy);
  });

  it(
    'should connect as a cluster when the certificate only names the hostname',
    async () => {
      const { port } = server.address() as AddressInfo;
      const database = {
        id: 'tls-cluster',
        host: CLUSTER_HOSTNAME,
        port,
        tls: true,
        verifyServerCert: true,
        caCert: { certificate: LOCALHOST_ONLY_CERT },
      } as Database;

      const client = await service.createClusterClient(
        mockClientMetadata,
        database,
        {},
      );

      expect(client.getConnectionType()).toEqual(
        RedisClientConnectionType.CLUSTER,
      );

      await client.disconnect();
    },
    TEST_TIMEOUT_MS,
  );
});
