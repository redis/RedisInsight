import { describe, expect, deps, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';

const { localDb, request, server, constants } = deps;

const endpoint = () => request(server).get(`/${constants.API.RDI}`);

const responseSchema = Joi.array()
  .items(
    Joi.object().keys({
      id: Joi.string().required(),
      url: Joi.string().required(),
      name: Joi.string().max(500).required(),
      username: Joi.string().required(),
      lastConnection: Joi.string().isoDate().required(),
      version: Joi.string().required(),
    }),
  )
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi', () => {
  [
    {
      name: 'Should return empty array if no rdis yet',
      responseSchema,
      checkFn: ({ body }) => {
        expect(body).to.eql([]);
      },
      before: async () => {
        await (await localDb.getRepository(localDb.repositories.RDI)).clear();
        await request(server).get('/rdi');
      },
    },
    {
      name: 'Should get rdis list',
      responseSchema,
      before: async () => {
        await localDb.generateRdis({}, 2);
        await request(server).get('/rdi');
      },
      checkFn: ({ body }) => {
        expect(body.length).to.eql(2);
        expect(body[0].name).to.eql('Rdi');
      },
    },
  ].forEach(mainCheckFn);
});
