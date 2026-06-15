import { describe, deps, before, expect, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants } = deps;

const endpoint = (id = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${id}/dangerous-commands`);

const responseSchema = Joi.array().items(Joi.string()).required();

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /databases/:id/dangerous-commands`, () => {
  before(localDb.createDatabaseInstances);

  [
    {
      name: 'Should return an array of dangerous command names (upper-case)',
      responseSchema,
      checkFn: ({ body }) => {
        expect(Array.isArray(body)).to.eql(true);
        body.forEach((cmd: string) => {
          expect(cmd).to.eql(cmd.toUpperCase());
        });
      },
    },
    {
      name: 'Should return NotFound error if instance id does not exist',
      endpoint: () => endpoint(constants.TEST_NOT_EXISTED_INSTANCE_ID),
      statusCode: 404,
      responseBody: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Invalid database instance id.',
      },
    },
  ].map(mainCheckFn);
});
