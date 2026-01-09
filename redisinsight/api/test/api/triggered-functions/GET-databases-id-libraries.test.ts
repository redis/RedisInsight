import { describe, deps, requirements, _, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { request, server, constants } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/triggered-functions/libraries`,
  );

const responseSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      user: Joi.string().required(),
      totalFunctions: Joi.number().required(),
      pendingJobs: Joi.number().required(),
    }),
  )
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`GET /databases/:instanceId/history`, () => {
  requirements('rte.modules.redisgears_2');

  [
    {
      name: 'Should get triggered functions libraries',
      responseSchema,
    },
  ].map(mainCheckFn);
});
