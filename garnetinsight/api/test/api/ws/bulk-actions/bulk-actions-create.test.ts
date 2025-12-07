import { describe, it, deps, expect } from '../../deps';
import { Socket } from 'socket.io-client';
const { getSocket, constants, rte } = deps;

const getClient = async (): Promise<Socket> => {
  return getSocket('bulk-actions');
};

const createDto = {
  databaseId: constants.TEST_INSTANCE_ID,
  id: '1',
  type: 'delete',
  filter: {
    match: `${constants.TEST_RUN_ID}*`,
  },
};

let client;

describe('bulk-actions', function () {
  this.timeout(20000);
  beforeEach(async () => {
    client = await getClient();
    await rte.data.generateKeys(true);
  });

  afterEach(async () => {
    client.close();
  });

  describe('Connection edge cases', () => {
    it('should not crash on 100 the same concurrent bulk-actions create events', async () => {
      let errors = 0;
      let created = 0;
      await Promise.all(
        new Array(10).fill(1).map(
          () =>
            new Promise((res, rej) => {
              client.emit('create', createDto, (ack, err) => {
                if (ack.status === 'error') {
                  errors += 1;
                } else {
                  created += 1;
                  expect(ack.id).to.eq(createDto.id);
                  expect(ack.type).to.eq(createDto.type);
                  expect(['running', 'ready'].includes(ack.status)).to.eq(true);
                  expect(ack.filter.match).to.eq(createDto.filter.match);
                  expect(ack.filter.type).to.eq(null);
                  expect(ack.progress.total).to.gt(0);
                  expect(ack.progress.scanned).to.gte(0);
                  expect(ack.summary.processed).to.gte(0);
                  expect(ack.summary.succeed).to.gte(0);
                  expect(ack.summary.failed).to.eq(0);
                  expect(ack.summary.errors).to.deep.eq([]);
                }
                res(ack);
              });
              client.on('exception', rej);
            }),
        ),
      );

      expect(errors).to.eq(9);
      expect(created).to.eq(1);
    });
  });
  describe('abort', () => {
    it('should abort just started bulk action', (done) => {
      client.emit('create', createDto, (ack) => {
        if (ack.status === 'error') {
          fail(ack.message);
        }
        client.emit('abort', { id: createDto.id }, (ack) => {
          expect(ack.id).to.eq(createDto.id);
          expect(ack.type).to.eq(createDto.type);
          expect(['aborted', 'completed'].includes(ack.status)).to.eq(true);
          expect(ack.filter.match).to.eq(createDto.filter.match);
          expect(ack.filter.type).to.eq(null);
          expect(ack.progress.total).to.gt(0);
          expect(ack.progress.scanned).to.gte(0);
          expect(ack.summary.processed).to.gte(0);
          expect(ack.summary.succeed).to.gte(0);
          expect(ack.summary.failed).to.eq(0);
          expect(ack.summary.errors).to.deep.eq([]);
          done();
        });
      });
    });
  });
  describe('get', () => {
    it('should get just started bulk action', (done) => {
      client.emit('create', createDto, (ack) => {
        if (ack.status === 'error') {
          fail(ack.message);
        }
        client.emit('get', { id: createDto.id }, (ack) => {
          expect(ack.id).to.eq(createDto.id);
          expect(ack.type).to.eq(createDto.type);
          expect(ack.filter.match).to.eq(createDto.filter.match);
          expect(ack.filter.type).to.eq(null);
          expect(ack.progress.total).to.gt(0);
          expect(ack.progress.scanned).to.gte(0);
          expect(ack.summary.processed).to.gte(0);
          expect(ack.summary.succeed).to.gte(0);
          expect(ack.summary.failed).to.eq(0);
          expect(ack.summary.errors).to.deep.eq([]);
          done();
        });
      });
    });
  });
  describe('overview', () => {
    it('should receive overview', async () => {
      client.emit('create', createDto, (ack) => {
        if (ack.status === 'error') {
          fail(ack.message);
        }
      });

      const overview: any = await new Promise((res, rej) => {
        client.on('overview', (overview) => {
          res(overview);
        });

        setTimeout(() => {
          rej(new Error('Timedout'));
        }, 3000);
      });

      expect(overview.id).to.eq(createDto.id);
      expect(overview.type).to.eq(createDto.type);
      expect(overview.filter.match).to.eq(createDto.filter.match);
      expect(overview.filter.type).to.eq(null);
      expect(overview.progress.total).to.gt(0);
      expect(overview.progress.scanned).to.gte(0);
      expect(overview.summary.processed).to.gte(0);
      expect(overview.summary.succeed).to.gte(0);
      expect(overview.summary.failed).to.eq(0);
      expect(overview.summary.errors).to.deep.eq([]);
    });
  });
});
