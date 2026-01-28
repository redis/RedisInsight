import { describe, deps, requirements, _, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';
const { request, server, constants } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).get(
    `/${constants.API.DATABASES}/${instanceId}/triggered-functions/functions`,
  );

const responseSchema = Joi.array()
  .items(
    Joi.object({
      type: Joi.string()
        .valid(
          'functions',
          'cluster_functions',
          'keyspace_triggers',
          'stream_triggers',
        )
        .required(),
      name: Joi.string().required(),
      library: Joi.string(),
      success: Joi.number(),
      fail: Joi.number(),
      total: Joi.number(),
      flags: Joi.array().items(Joi.string()),
      isAsync: Joi.boolean(),
      description: Joi.string(),
      lastError: Joi.string(),
      lastExecutionTime: Joi.number(),
      totalExecutionTime: Joi.number(),
      prefix: Joi.string(),
      trim: Joi.boolean(),
      window: Joi.number(),
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
