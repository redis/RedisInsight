import {
  describe,
  deps,
  before,
  getMainCheckFn,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
} from '../deps';
import { Joi } from '../../helpers/test';
import { BrowserHistoryMode } from 'src/common/constants';
const { localDb, request, server, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${instanceId}/history`);

// input query schema
const querySchema = Joi.object({
  mode: Joi.string().valid('pattern', 'redisearch').messages({
    'any.only': 'mode must be one of the following values: pattern, redisearch',
  }),
}).strict();

const validInputData = {
  mode: 'pattern',
};

const responseSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      mode: Joi.string().valid('pattern', 'redisearch').required(),
      filter: Joi.object({
        type: Joi.string().allow(null),
        match: Joi.string().required(),
        count: Joi.number().integer().required(),
      }).required(),
    }),
  )
  .required()
  .max(5)
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /databases/:instanceId/history`, () => {
  before(async () => {
    await localDb.createDatabaseInstances();

    await localDb.generateBrowserHistory(
      {
        databaseId: constants.TEST_INSTANCE_ID,
        mode: BrowserHistoryMode.Pattern,
      },
      10,
      true,
    );

    await localDb.generateBrowserHistory(
      {
        databaseId: constants.TEST_INSTANCE_ID,
        mode: BrowserHistoryMode.Redisearch,
      },
      10,
      true,
    );
  });

  [
    {
      name: 'Should get browser history list',
      responseSchema,
    },
  ].map(mainCheckFn);

  describe('Validation', () => {
    generateInvalidDataTestCases(querySchema, validInputData, 'query').map(
      validateInvalidDataTestCase(endpoint, querySchema, 'query'),
    );
  });
});
