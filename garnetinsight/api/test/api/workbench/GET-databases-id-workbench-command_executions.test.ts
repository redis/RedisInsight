import { expect, describe, before, Joi, deps, getMainCheckFn } from '../deps';
const { server, request, constants, localDb } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/workbench/command-executions`,
  );

const responseSchema = Joi.array()
  .items(
    Joi.object().keys({
      id: Joi.string().required(),
      databaseId: Joi.string().required(),
      command: Joi.string().required(),
      role: Joi.string().allow(null),
      mode: Joi.string().required(),
      summary: Joi.string().allow(null),
      resultsMode: Joi.string().allow(null),
      executionTime: Joi.number().required(),
      nodeOptions: Joi.object()
        .keys({
          host: Joi.string().required(),
          port: Joi.number().required(),
          enableRedirection: Joi.boolean().required(),
        })
        .allow(null),
      db: Joi.number().integer().allow(null),
      createdAt: Joi.date().required(),
      type: Joi.string().valid('WORKBENCH', 'SEARCH').required(),
    }),
  )
  .required()
  .max(30);

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:instanceId/workbench/command-executions', () => {
  describe('Common', () => {
    [
      {
        name: 'Should return 0 array when no history items yet',
        responseSchema,
        before: async () => {
          await (
            await localDb.getRepository(localDb.repositories.COMMAND_EXECUTION)
          ).clear();
        },
        checkFn: async ({ body }) => {
          expect(body).to.eql([]);
        },
      },
      {
        name: 'Should get only 30 items',
        responseSchema,
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
            },
            100,
            true,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(30);
          for (let i = 0; i < 30; i++) {
            expect(body[i].command).to.eql('set foo bar');
          }
        },
      },
      {
        name: 'Should return only 10 items that we are able to decrypt',
        responseSchema,
        before: async () => {
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
            },
            10,
            true,
          );
          await localDb.generateNCommandExecutions(
            {
              databaseId: constants.TEST_INSTANCE_ID,
              command: 'invalidaencrypted',
              encryption: 'KEYTAR',
            },
            10,
          );
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(10);

          for (let i = 0; i < 10; i++) {
            expect(body[i].command).to.eql('set foo bar');
          }
        },
      },
      {
        name: 'Should return 404 not found when incorrect instance',
        endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          message: 'Invalid database instance id.',
          error: 'Not Found',
        },
      },
    ].map(mainCheckFn);
  });
  describe('Filter', () => {
    before(async () => {
      await localDb.generateNCommandExecutions(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'WORKBENCH',
        },
        20,
        true,
      );
      await localDb.generateNCommandExecutions(
        {
          databaseId: constants.TEST_INSTANCE_ID,
          type: 'SEARCH',
        },
        10,
        false,
      );
    });

    [
      {
        name: 'Should get only 20 items (workbench by default)',
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(20);
          for (let i = 0; i < 20; i++) {
            expect(body[i].command).to.eql('set foo bar');
            expect(body[i].type).to.eql('WORKBENCH');
          }
        },
      },
      {
        name: 'Should get only 20 items filtered by type (WORKBENCH)',
        query: {
          type: 'WORKBENCH',
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(20);
          for (let i = 0; i < 20; i++) {
            expect(body[i].command).to.eql('set foo bar');
            expect(body[i].type).to.eql('WORKBENCH');
          }
        },
      },
      {
        name: 'Should get only 10 items filtered by type (SEARCH)',
        responseSchema,
        query: {
          type: 'SEARCH',
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.eql(10);
          for (let i = 0; i < 10; i++) {
            expect(body[i].command).to.eql('set foo bar');
            expect(body[i].type).to.eql('SEARCH');
          }
        },
      },
    ].map(mainCheckFn);
  });
});
