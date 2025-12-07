import { expect, describe, deps, Joi, getMainCheckFn } from '../deps';
const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).get('/health');

const responseSchema = Joi.object()
  .keys({
    status: Joi.string().required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /health', () => {
  [
    {
      name: 'Should return server health',
      statusCode: 200,
      responseSchema,
      checkFn: ({ body }) => {
        expect(body.status).to.eql('up');
      },
    },
  ].map(mainCheckFn);
});
