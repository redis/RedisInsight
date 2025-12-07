import { getAnalytics } from '../helpers/analytics';
export { createAnalytics } from '../helpers/analytics';

export * from '../helpers/test';
import * as request from 'supertest';
import * as chai from 'chai';
import * as localDb from '../helpers/local-db';
import { constants } from '../helpers/constants';
import { getServer, getSocket } from '../helpers/server';
import { initRemoteServer } from '../helpers/remote-server';
import { testEnv } from '../helpers/test';
import * as redis from '../helpers/redis';
import { initCloudDatabase } from '../helpers/cloud';

// Just dummy jest module implementation to be able to use common mocked models in UTests and ITests
const dummyJest = (factory: Function) => {
  if (!factory) {
    const dummyMock = () => {};

    dummyMock.mockReturnThis = dummyJest;
    dummyMock.mockReturnValue = dummyJest;
    dummyMock.mockResolvedValue = dummyJest;
    dummyMock.mockImplementation = dummyJest;

    return dummyMock;
  }

  if (typeof factory !== 'function') {
    return () => factory;
  }

  return factory;
};

global['jest'] = {
  // @ts-ignore
  fn: dummyJest,
};

global['expect'] = {
  any: () => {},
};

/**
 * Initialize dependencies
 */
export async function depsInit() {
  // create cloud subscription if needed
  if (constants.TEST_CLOUD_RTE) {
    await initCloudDatabase();
  }

  // initialize analytics module
  deps.analytics = await getAnalytics();

  await initRemoteServer();

  // initializing backend server
  deps.server = await getServer();

  // initializing Redis Test Environment
  deps.rte = await redis.initRTE();

  testEnv.rte = deps.rte.env;

  if (typeof deps.server === 'string') {
    testEnv.rte.serverType = 'docker';
  } else {
    testEnv.rte.serverType = 'local';
  }

  // initializing local database
  await localDb.initLocalDb(deps.rte, deps.server);
}

export const deps = {
  localDb,
  constants,
  request,
  expect: chai.expect,
  server: null,
  analytics: null,
  getSocket,
  rte: null,
  testEnv,
};
