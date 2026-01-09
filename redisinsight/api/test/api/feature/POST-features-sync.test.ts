import {
  expect,
  before,
  describe,
  deps,
  fsExtra,
  getMainCheckFn,
  sleep,
} from '../deps';
import { constants } from '../../helpers/constants';
import * as defaultConfig from '../../../config/features-config.json';
import { getRepository, repositories } from '../../helpers/local-db';

const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).post('/features/sync');

const mainCheckFn = getMainCheckFn(endpoint);

let featureConfigRepository;
describe('POST /features/sync', () => {
  before(async () => {
    featureConfigRepository = await getRepository(repositories.FEATURES_CONFIG);
    await getRepository(repositories.FEATURE);
  });

  [
    {
      name: 'Should sync with default config when db:null and remote:fail',
      before: async () => {
        // remove remote config so BE will get an error during fetching
        await fsExtra
          .remove(constants.TEST_FEATURE_FLAG_REMOTE_CONFIG_PATH)
          .catch(console.error);
        // remove all configs
        await featureConfigRepository.deleteAll();

        const [config] = await featureConfigRepository.find();
        expect(config).to.eq(undefined);
      },
      statusCode: 200,
      checkFn: async () => {
        const [config, empty] = await featureConfigRepository.find();

        expect(empty).to.eq(undefined);
        expect(config.controlNumber).to.gte(0).lt(100);
        expect(config.data).to.eq(JSON.stringify(defaultConfig));
      },
    },
    {
      name: 'Should sync with default config when db:version < default.version and remote:fail',
      before: async () => {
        await fsExtra
          .remove(constants.TEST_FEATURE_FLAG_REMOTE_CONFIG_PATH)
          .catch(console.error);
        await featureConfigRepository.updateAll({
          data: JSON.stringify({
            ...defaultConfig,
            version: defaultConfig.version - 0.1,
          }),
        });

        const [config, empty] = await featureConfigRepository.find();

        expect(empty).to.eq(undefined);
        expect(config.data).to.eq(
          JSON.stringify({
            ...defaultConfig,
            version: defaultConfig.version - 0.1,
          }),
        );
      },
      statusCode: 200,
      checkFn: async () => {
        const [config, empty] = await featureConfigRepository.find();

        expect(empty).to.eq(undefined);
        expect(config.controlNumber).to.gte(0).lt(100);
        expect(config.data).to.eq(JSON.stringify(defaultConfig));
      },
    },
    {
      name: 'Should sync with remote config when db:null and remote:version > default.version',
      before: async () => {
        await fsExtra
          .writeFile(
            constants.TEST_FEATURE_FLAG_REMOTE_CONFIG_PATH,
            JSON.stringify({
              ...defaultConfig,
              version: defaultConfig.version + 3.33,
            }),
          )
          .catch(console.error);

        // remove all configs
        await featureConfigRepository.deleteAll();

        const [config] = await featureConfigRepository.find();

        expect(config).to.eq(undefined);

        // flaky test. wait for a while
        await sleep(1000);
      },
      statusCode: 200,
      checkFn: async () => {
        const [config, empty] = await featureConfigRepository.find();

        expect(empty).to.eq(undefined);
        expect(config.controlNumber).to.gte(0).lt(100);
        expect(config.data).to.eq(
          JSON.stringify({
            ...defaultConfig,
            version: defaultConfig.version + 3.33,
          }),
        );
      },
    },
    {
      name: 'Should sync with remote config when db:version < default and remote:version > default',
      before: async () => {
        await fsExtra
          .writeFile(
            constants.TEST_FEATURE_FLAG_REMOTE_CONFIG_PATH,
            JSON.stringify({
              ...defaultConfig,
              version: defaultConfig.version + 1.11,
            }),
          )
          .catch(console.error);
        // remove all configs
        await featureConfigRepository.updateAll({
          data: JSON.stringify({
            ...defaultConfig,
            version: defaultConfig.version - 0.1,
          }),
        });

        const [config, empty] = await featureConfigRepository.find();

        expect(empty).to.eq(undefined);
        expect(config.data).to.eq(
          JSON.stringify({
            ...defaultConfig,
            version: defaultConfig.version - 0.1,
          }),
        );
      },
      statusCode: 200,
      checkFn: async () => {
        const [config, empty] = await featureConfigRepository.find();

        expect(empty).to.eq(undefined);
        expect(config.controlNumber).to.gte(0).lt(100);
        expect(config.data).to.eq(
          JSON.stringify({
            ...defaultConfig,
            version: defaultConfig.version + 1.11,
          }),
        );
      },
    },
  ].map(mainCheckFn);
});
