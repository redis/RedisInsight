import { describe, it, deps, validateApiCall } from '../deps';
import { Joi } from '../../helpers/test';
const { request, server } = deps;

const endpoint = () => request(server).get(`/plugins`);

const responseSchema = Joi.object()
  .keys({
    static: Joi.string().required(),
    plugins: Joi.array()
      .items(
        Joi.object().keys({
          internal: Joi.boolean(),
          name: Joi.string().required(),
          baseUrl: Joi.string().required(),
          main: Joi.string().required(),
          styles: Joi.string(),
          visualizations: Joi.array()
            .items(
              Joi.object()
                .keys({
                  id: Joi.string().required(),
                  name: Joi.string().required(),
                  activationMethod: Joi.string().required(),
                  matchCommands: Joi.array()
                    .items(Joi.string().required())
                    .required(),
                  default: Joi.boolean(),
                  iconDark: Joi.string(),
                  iconLight: Joi.string(),
                })
                .required(),
            )
            .required(),
        }),
      )
      .required(),
  })
  .required();

const mainCheckFn = async (testCase) => {
  it(testCase.name, async () => {
    await validateApiCall({
      endpoint,
      ...testCase,
    });
  });
};

describe('GET /plugins', () => {
  [
    {
      name: 'Should get plugin commands whitelist',
      responseSchema,
      checkFn: ({ body }) => {
        console.log('body', body);
      },
    },
  ].map(mainCheckFn);
});
