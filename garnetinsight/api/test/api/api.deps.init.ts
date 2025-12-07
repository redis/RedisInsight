import { depsInit } from './deps';

/**
 * Mocha hooks
 * Initiate dependencies before all tests
 */
export const mochaHooks = async () => {
  await depsInit();
};
