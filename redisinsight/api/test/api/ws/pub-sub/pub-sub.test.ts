import {
  describe,
  it,
  before,
  deps,
  expect,
  requirements,
  _,
  sleep,
} from '../../deps';
import { Socket } from 'socket.io-client';
const { getSocket, constants, rte } = deps;

const getClient = async (instanceId): Promise<Socket> => {
  return getSocket('pub-sub', {
    query: { instanceId },
  });
};

const subscription = {
  channel: 'channel-a',
  type: 's',
};

const subscriptionB = {
  channel: 'channel-b',
  type: 's',
};

const pSubscription = {
  channel: '*',
  type: 'p',
};

let client;

describe('pub-sub', function () {
  this.timeout(10000);
  beforeEach(async () => {
    client = await getClient(constants.TEST_INSTANCE_ID);
  });

  afterEach(async () => {
    client.close();
  });

  describe('Connection edge cases', () => {
    it('should not crash on 100 concurrent pub-sub connections to the same db', async () => {
      await Promise.all(
        new Array(10).fill(1).map(
          () =>
            new Promise((res, rej) => {
              client.emit(
                'subscribe',
                { subscriptions: [pSubscription, subscription] },
                (ack) => {
                  expect(ack).to.eql({ status: 'ok' });
                  res(ack);
                },
              );
              client.on('exception', rej);
            }),
        ),
      );
    });
  });

  describe('Client creation', () => {
    it('Should successfully create a client', async () => {
      expect(client instanceof Socket).to.eql(true);
    });
    it('Should successfully create a client even when incorrect instanceId provided', async () => {
      const client = await getClient(constants.TEST_NOT_EXISTED_INSTANCE_ID);
      expect(client instanceof Socket).to.eql(true);
      await client.close();
    });
  });

  describe('subscribe', () => {
    it('Should successfully subscribe', async () => {
      await new Promise((resolve) => {
        client.emit('subscribe', { subscriptions: [pSubscription] }, (ack) => {
          expect(ack).to.eql({ status: 'ok' });
          resolve(ack);
        });
      });
    });
    it('Should return Not Found acknowledge when incorrect instanceId', async () => {
      const client = await getClient(constants.TEST_NOT_EXISTED_INSTANCE_ID);
      await new Promise((resolve, reject) => {
        client.emit('subscribe', { subscriptions: [pSubscription] }, (ack) => {
          try {
            expect(ack.status).to.eql('error');
            expect(ack.error.status).to.eql(404);
            expect(ack.error.message).to.eql('Invalid database instance id.');
            expect(ack.error.name).to.eql('NotFoundException');
            resolve(null);
          } catch (e) {
            reject(e);
          }
        });
      });
    });
  });

  describe('on message', () => {
    it('Should receive message on particular channel only', async () => {
      await new Promise((resolve, reject) => {
        client.emit(
          'subscribe',
          { subscriptions: [subscription, subscriptionB] },
          async (ack) => {
            expect(ack).to.eql({ status: 'ok' });

            client.on('s:channel-a', (data) => {
              expect(data.count).to.be.eql(1);
              expect(data.messages.length).to.be.eql(1);
              const [message] = data.messages;
              expect(message.channel).to.eq('channel-a');
              expect(message.message).to.eq('message-a');
              expect(message.time).to.be.a('number');
              resolve(null);
            });

            client.on('s:channel-b', () => {
              reject(
                new Error('Should not receive message-a in this listener-b'),
              );
            });

            await rte.data.sendCommand('publish', ['channel-c', 'message-c']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
          },
        );
      });
    });
    describe('on message [unstable test]', () => {
      requirements('!rte.tls'); // tls works slower. skip test to not add additional wait time. todo: rewrite test
      requirements('rte.type<>SENTINEL'); // sentinel too

      it('Should receive bunch of logs for many subscriptions', async () => {
        const messages = {
          'channel-a': [],
          'channel-b': [],
          '*': [],
        };

        client.on('s:channel-a', (data) =>
          messages['channel-a'].push(...data.messages),
        );
        client.on('s:channel-b', (data) =>
          messages['channel-b'].push(...data.messages),
        );
        client.on('p:*', (data) => messages['*'].push(...data.messages));

        await new Promise((resolve) => {
          client.emit(
            'subscribe',
            { subscriptions: [subscription, subscriptionB, pSubscription] },
            (ack) => {
              expect(ack).to.eql({ status: 'ok' });

              client.on('s:channel-b', resolve);

              rte.data.sendCommand('publish', ['channel-a', 'message-a']);
              rte.data.sendCommand('publish', ['channel-a', 'message-a']);
              rte.data.sendCommand('publish', ['channel-a', 'message-a']);
              rte.data.sendCommand('publish', ['channel-a', 'message-a']);
              rte.data.sendCommand('publish', ['channel-b', 'message-b']);
            },
          );
        });

        await sleep(3000);

        expect(messages['channel-a'].length).to.eql(4);
        messages['channel-a'].forEach((message) => {
          expect(message.channel).to.eql('channel-a');
        });
        expect(messages['channel-b'].length).to.eql(1);
        expect(messages['*'].length).to.eql(5);
      });
    });
  });

  describe('unsubscribe', () => {
    it('Should still receive messages on subscriptions left', async () => {
      const messages = {
        'channel-a': [],
        'channel-b': [],
        '*': [],
      };

      client.on('s:channel-a', (data) =>
        messages['channel-a'].push(...data.messages),
      );
      client.on('s:channel-b', (data) =>
        messages['channel-b'].push(...data.messages),
      );
      client.on('p:*', (data) => messages['*'].push(...data.messages));

      await new Promise((resolve) => {
        client.emit(
          'subscribe',
          { subscriptions: [subscription, subscriptionB, pSubscription] },
          async (ack) => {
            expect(ack).to.eql({ status: 'ok' });

            client.on('s:channel-b', resolve);

            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-b', 'message-b']);
          },
        );
      });

      await new Promise((resolve) => {
        client.emit(
          'unsubscribe',
          { subscriptions: [subscription, pSubscription] },
          async (ack) => {
            expect(ack).to.eql({ status: 'ok' });

            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-b', 'message-b']);

            client.on('s:channel-b', resolve);
          },
        );
      });

      expect(messages['channel-a'].length).to.eql(4);
      messages['channel-a'].forEach((message) => {
        expect(message.channel).to.eql('channel-a');
      });
      expect(messages['channel-b'].length).to.eql(2);
      expect(messages['*'].length).to.eql(5);
    });

    it('Should receive bunch of messages when subscribed only', async () => {
      const messages = {
        'channel-a': [],
        'channel-b': [],
        '*': [],
      };

      client.on('s:channel-a', (data) =>
        messages['channel-a'].push(...data.messages),
      );
      client.on('s:channel-b', (data) =>
        messages['channel-b'].push(...data.messages),
      );
      client.on('p:*', (data) => messages['*'].push(...data.messages));

      await new Promise((resolve) => {
        client.emit(
          'subscribe',
          { subscriptions: [subscription, subscriptionB, pSubscription] },
          async (ack) => {
            expect(ack).to.eql({ status: 'ok' });

            client.on('s:channel-b', resolve);

            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-b', 'message-b']);
          },
        );
      });

      await new Promise((resolve) => {
        client.emit(
          'unsubscribe',
          { subscriptions: [subscription, subscriptionB, pSubscription] },
          async (ack) => {
            expect(ack).to.eql({ status: 'ok' });

            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-a', 'message-a']);
            await rte.data.sendCommand('publish', ['channel-b', 'message-b']);

            resolve(null);
          },
        );
      });

      expect(messages['channel-a'].length).to.eql(4);
      messages['channel-a'].forEach((message) => {
        expect(message.channel).to.eql('channel-a');
      });
      expect(messages['channel-b'].length).to.eql(1);
      expect(messages['*'].length).to.eql(5);
    });
  });

  describe('ACL', () => {
    requirements('rte.acl');
    // todo: investigate cluster behaviour. tmp disabled ACL checks for cluster databases
    requirements('rte.type<>CLUSTER');
    before(async () => rte.data.setAclUserRules('~* +@all'));

    it('should throw an error on connect without permissions (subscribe)', async () => {
      await rte.data.setAclUserRules('~* +@all -subscribe');

      const client = await getClient(constants.TEST_INSTANCE_ACL_ID);

      expect(client instanceof Socket).to.eql(true);

      await new Promise((resolve) => {
        client.emit('subscribe', { subscriptions: [subscription] }, (ack) => {
          expect(ack.status).to.eql('error');
          expect(ack.error.status).to.eql(403);
          expect(ack.error.message).to.have.string('NOPERM');
          resolve(null);
        });
      });
    });

    it('should throw an error on connect without permissions (psubscribe)', async () => {
      await rte.data.setAclUserRules('~* +@all -psubscribe');

      const client = await getClient(constants.TEST_INSTANCE_ACL_ID);

      expect(client instanceof Socket).to.eql(true);

      await new Promise((resolve) => {
        client.emit('subscribe', { subscriptions: [pSubscription] }, (ack) => {
          expect(ack.status).to.eql('error');
          expect(ack.error.status).to.eql(403);
          expect(ack.error.message).to.have.string('NOPERM');
          resolve(null);
        });
      });
    });

    it('should throw an error on connect without permissions (unsubscribe)', async () => {
      await rte.data.setAclUserRules('~* +@all -unsubscribe');

      const client = await getClient(constants.TEST_INSTANCE_ACL_ID);

      expect(client instanceof Socket).to.eql(true);

      await new Promise((resolve) => {
        client.emit('subscribe', { subscriptions: [subscription] }, (ack) => {
          expect(ack).to.deep.eql({ status: 'ok' });
          client.emit(
            'unsubscribe',
            { subscriptions: [subscription] },
            (ack) => {
              expect(ack.status).to.eql('error');
              expect(ack.error.status).to.eql(403);
              expect(ack.error.message).to.have.string('NOPERM');
              resolve(null);
            },
          );
        });
      });
    });

    it('should throw an error on connect without permissions (punsubscribe)', async () => {
      await rte.data.setAclUserRules('~* +@all -punsubscribe');

      const client = await getClient(constants.TEST_INSTANCE_ACL_ID);

      expect(client instanceof Socket).to.eql(true);

      await new Promise((resolve) => {
        client.emit('subscribe', { subscriptions: [pSubscription] }, (ack) => {
          expect(ack).to.deep.eql({ status: 'ok' });
          client.emit(
            'unsubscribe',
            { subscriptions: [pSubscription] },
            (ack) => {
              expect(ack.status).to.eql('error');
              expect(ack.error.status).to.eql(403);
              expect(ack.error.message).to.have.string('NOPERM');
              resolve(null);
            },
          );
        });
      });
    });
  });
});
