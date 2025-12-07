import { merge, cloneDeep } from 'lodash';
import defaultConfig from '../../config/default';
import development from '../../config/development';
import staging from '../../config/staging';
import test from '../../config/test';
import production from '../../config/production';
import stack from '../../config/stack';

const config = cloneDeep(defaultConfig);

let envConfig;
switch (process.env.NODE_ENV) {
  case 'staging':
    envConfig = staging;
    break;
  case 'production':
    envConfig = production;
    break;
  case 'test':
    envConfig = test;
    break;
  default:
    envConfig = development;
    break;
}

let buildTypeConfig;
// eslint-disable-next-line sonarjs/no-small-switch
switch (process.env.RI_BUILD_TYPE) {
  case 'REDIS_STACK':
    buildTypeConfig = stack;
    break;
  default:
    buildTypeConfig = {};
    break;
}

merge(config, envConfig, buildTypeConfig);

export type Config = typeof config;
export type KeyOfConfig = keyof typeof config;
export const get: (key?: KeyOfConfig) => Config | any = (key?: KeyOfConfig) =>
  key ? config[key] : config;

export default {
  get,
};
