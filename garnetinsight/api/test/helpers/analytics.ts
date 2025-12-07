import { EventEmitter } from 'events';
import * as nock from 'nock';
import * as _ from 'lodash';
import { isMatch } from 'lodash';

let analytics;

export class Analytics extends EventEmitter {
  public messages = [];

  constructor() {
    super();
    const scope = nock('https://api.segment.io')
      .post('/v1/batch', (body) => {
        const batchMessages = body?.batch || [];
        this.messages = this.messages.concat(batchMessages);
        this.emit('batch', batchMessages);
        return true;
      })
      .reply(200, {});

    scope.persist();
  }

  public findEvent(event: any, messages = this.messages) {
    return _.find(messages, (message) => {
      return isMatch(message, event);
    });
  }

  public async waitForEvent(event) {
    await new Promise((res, rej) => {
      this.once('batch', (batch) => {
        const exists = this.findEvent(event, batch);

        if (!exists) {
          rej(
            new Error(
              `Unable to find event:\n${JSON.stringify(event)}\nin the events batch:\n${JSON.stringify(batch)}`,
            ),
          );
        }

        res(exists);
      });

      setTimeout(
        () =>
          rej(new Error(`No event ${JSON.stringify(event)} received in 10s`)),
        10000,
      );
    });
  }
}

export const getAnalytics = () => {
  return analytics || createAnalytics();
};

export const createAnalytics = () => {
  return new Analytics();
};
