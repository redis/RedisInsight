import { describe, deps, before, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { localDb, request, server, constants } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(`/${constants.API.DATABASES}/${instanceId}/analysis`);

const responseSchema = Joi.array()
  .items(
    Joi.object({
      createdAt: Joi.date().required(),
      id: Joi.string().required(),
      db: Joi.number().integer().allow(null),
    }),
  )
  .required()
  .max(5);
const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /databases/:id/analysis', () => {
  before(
    async () =>
      await localDb.generateNDatabaseAnalysis(
        {
          databaseId: constants.TEST_INSTANCE_ID,
        },
        30,
        true,
      ),
  );

  [
    {
      name: 'Should get list of database analyses',
      responseSchema,
    },
  ].map(mainCheckFn);
});
