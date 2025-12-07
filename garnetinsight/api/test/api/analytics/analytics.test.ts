import {
  expect,
  describe,
  it,
  deps,
  requirements,
  serverConfig,
} from '../deps';
const { analytics } = deps;

describe('Analytics', () => {
  requirements('rte.serverType=local');

  it('APPLICATION_STARTED', () => {
    if (serverConfig.get('server').buildType !== 'ELECTRON') {
      return;
    }

    const appStarted = analytics.findEvent({
      event: 'APPLICATION_STARTED',
    });

    const appFirstStarted = analytics.findEvent({
      event: 'APPLICATION_FIRST_START',
    });

    const found = appStarted || appFirstStarted;

    if (!found) {
      expect.fail(
        'APPLICATION_STARTED or APPLICATION_FIRST_START events were not found',
      );
    }

    expect(found?.properties).to.have.all.keys(
      'appVersion',
      'osPlatform',
      'buildType',
      'controlNumber',
      'controlGroup',
      'port',
    );
    expect(found?.properties?.appVersion).to.be.a('string');
    expect(found?.properties?.osPlatform).to.be.a('string');
    expect(found?.properties?.buildType).to.be.a('string');
    expect(found?.properties?.port).to.be.a('number');
  });
});
