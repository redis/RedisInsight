import * as net from 'net';
import * as tls from 'tls';
import { describe, it, deps, requirements, expect } from '../deps';

const { constants } = deps;
const rte = deps.rte as any;

// Encode a command as a RESP array so any argument (colons, etc.) is safe.
const encode = (...args: string[]): string =>
  args.reduce(
    (acc, a) => `${acc}$${Buffer.byteLength(a)}\r\n${a}\r\n`,
    `*${args.length}\r\n`,
  );

// Read exactly one RESP reply (enough for +OK / :int / $bulk / errors) and
// resolve with its raw bytes — so we can inspect the leading type byte.
const readReply = (socket: net.Socket): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    let buf = Buffer.alloc(0);
    const done = (fn: () => void) => {
      socket.removeListener('data', onData);
      socket.removeListener('error', reject);
      fn();
    };
    const onData = (chunk: Buffer) => {
      buf = Buffer.concat([buf, chunk]);
      const type = String.fromCharCode(buf[0]);
      const headerEnd = buf.indexOf('\r\n');
      if (headerEnd === -1) return; // wait for the first line

      if (type === '+' || type === '-' || type === ':') {
        return done(() => resolve(buf));
      }
      if (type === '$') {
        const len = parseInt(buf.slice(1, headerEnd).toString(), 10);
        if (len < 0 || buf.length >= headerEnd + 2 + len + 2) {
          return done(() => resolve(buf));
        }
        return; // wait for the rest of the bulk payload
      }
      return done(() => reject(new Error(`Unexpected reply type "${type}"`)));
    };
    socket.on('data', onData);
    socket.on('error', reject);
  });

describe('Array u64 integer reply — RESP wire encoding', () => {
  // Array commands are Redis 8.8 preview; the raw single-socket probe below
  // can't address a cluster, so this runs only on a standalone 8.8 server.
  requirements('rte.version>=8.8');
  requirements('rte.type<>CLUSTER');

  // 2^53 = 9007199254740992 (highest exactly-representable index);
  // length becomes 2^53 + 1 = 9007199254740993 — a u64 inside i64 range, so
  // Redis encodes it as a RESP integer (`:`), which ioredis would round.
  const gapMaxIndex = '9007199254740992';
  const gapLength = '9007199254740993';
  // 2^63 + 10: a u64 beyond i64 range, so Redis must encode the length as a
  // bulk string (`$`) — exact on the wire without any client opt-in.
  const aboveI64MaxIndex = '9223372036854775818';

  it('encodes (2^53, 2^63) lengths as RESP integers and >= 2^63 as bulk strings', async () => {
    const connect = (): Promise<net.Socket> =>
      new Promise((resolve, reject) => {
        const onReady = () => resolve(socket);
        const socket: net.Socket = rte.env.tls
          ? tls.connect(
              {
                host: constants.TEST_REDIS_HOST,
                port: constants.TEST_REDIS_PORT,
                ca: constants.TEST_REDIS_TLS_CA,
                cert: rte.env.tlsAuth
                  ? constants.TEST_USER_TLS_CERT
                  : undefined,
                key: rte.env.tlsAuth ? constants.TEST_USER_TLS_KEY : undefined,
                rejectUnauthorized: false,
              },
              onReady,
            )
          : net.connect(
              {
                host: constants.TEST_REDIS_HOST,
                port: constants.TEST_REDIS_PORT,
              },
              onReady,
            );
        socket.once('error', reject);
      });

    const socket = await connect();
    const gapKey = constants.getRandomString();
    const bigKey = constants.getRandomString();
    try {
      if (constants.TEST_REDIS_PASSWORD) {
        const authArgs = constants.TEST_REDIS_USER
          ? [constants.TEST_REDIS_USER, constants.TEST_REDIS_PASSWORD]
          : [constants.TEST_REDIS_PASSWORD];
        socket.write(encode('AUTH', ...authArgs));
        await readReply(socket);
      }

      socket.write(encode('ARMSET', gapKey, gapMaxIndex, 'x'));
      await readReply(socket);
      socket.write(encode('ARMSET', bigKey, aboveI64MaxIndex, 'x'));
      await readReply(socket);

      socket.write(encode('ARLEN', gapKey));
      const gapReply = await readReply(socket);
      socket.write(encode('ARLEN', bigKey));
      const bigReply = await readReply(socket);

      socket.write(encode('DEL', gapKey, bigKey));
      await readReply(socket);

      // The contract this whole feature rests on, asserted from the wire:
      expect(String.fromCharCode(gapReply[0])).to.eql(':'); // RESP integer
      expect(gapReply.toString().trim()).to.eql(`:${gapLength}`); // exact on the wire
      expect(String.fromCharCode(bigReply[0])).to.eql('$'); // RESP bulk string
    } finally {
      socket.destroy();
    }
  });
});
