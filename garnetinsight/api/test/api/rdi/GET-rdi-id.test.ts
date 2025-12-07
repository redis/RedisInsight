import { v4 as uuidv4 } from 'uuid';
import { describe, expect, deps, getMainCheckFn } from '../deps';
import { Joi } from '../../helpers/test';

const { localDb, request, server, constants } = deps;

const testRdiId = uuidv4();
const notExistedRdiId = 'not-existed-rdi-id';

const endpoint = (rdiId) =>
  request(server).get(`/${constants.API.RDI}/${rdiId || testRdiId}`);

const responseSchema = Joi.object()
  .keys({
    id: Joi.string().required(),
    url: Joi.string().required(),
    name: Joi.string().max(500).required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    lastConnection: Joi.string().isoDate().required(),
    version: Joi.string().required(),
  })
  .required()
  .strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi/:id', () => {
  [
    {
      name: 'Should return rdi data by id',
      responseSchema,
      statusCode: 200,
      checkFn: ({ body }) => {
        expect(body.id).to.eql(testRdiId);
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId }, 1);
      },
    },
    {
      name: 'Should throw error if no rdi found in a db',
      statusCode: 404,
      endpoint: () => endpoint(notExistedRdiId),
      checkFn: ({ body }) => {
        expect(body).to.eql({
          message: `RDI with id ${notExistedRdiId} was not found`,
          statusCode: 404,
          error: 'RdiNotFound',
          errorCode: 11405,
        });
      },
      before: async () => {
        await (await localDb.getRepository(localDb.repositories.RDI)).clear();
      },
    },
  ].forEach(mainCheckFn);
});
