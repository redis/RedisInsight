import {
  expect,
  describe,
  before,
  Joi,
  deps,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';

const { server, request, constants, localDb } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/query-library`,
  );

const dataSchema = Joi.object({
  indexName: Joi.string().required().messages({
    'string.base': 'indexName must be a string',
    'any.required': 'indexName should not be empty',
  }),
  name: Joi.string().required().messages({
    'string.base': 'name must be a string',
    'any.required': 'name should not be empty',
  }),
  query: Joi.string().required().messages({
    'string.base': 'query must be a string',
    'any.required': 'query should not be empty',
  }),
}).strict();

const validInputData = {
  indexName: 'idx:bikes_vss',
  name: 'Find all bikes',
  query: 'FT.SEARCH idx:bikes_vss "*"',
};

const responseSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    databaseId: Joi.string().required(),
    indexName: Joi.string().required(),
    type: Joi.string().valid('SAMPLE', 'SAVED').required(),
    name: Joi.string().required(),
    description: Joi.string().allow(null).optional(),
    query: Joi.string().required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/query-library', () => {
  before(async () => {
    const rep = await localDb.getRepository(localDb.repositories.QUERY_LIBRARY);
    await rep.clear();
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        data: validInputData,
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
      {
        name: 'Should create a saved query',
        data: validInputData,
        statusCode: 201,
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.indexName).to.eql(validInputData.indexName);
          expect(body.name).to.eql(validInputData.name);
          expect(body.query).to.eql(validInputData.query);
          expect(body.type).to.eql('SAVED');
          expect(body.databaseId).to.eql(constants.TEST_INSTANCE_ID);

          const entity: any = await (
            await localDb.getRepository(localDb.repositories.QUERY_LIBRARY)
          ).findOneBy({ id: body.id });

          expect(entity).to.not.eql(null);
          expect(entity.encryption).to.eql(constants.TEST_ENCRYPTION_STRATEGY);
        },
      },
      {
        name: 'Should always set type to SAVED regardless of input',
        data: {
          ...validInputData,
          name: 'Another query',
          type: 'SAMPLE',
        },
        statusCode: 201,
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.type).to.eql('SAVED');
        },
      },
    ].map(mainCheckFn);
  });
});
