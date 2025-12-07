import {
  describe,
  deps,
  requirements,
  Joi,
  getMainCheckFn,
  expect,
} from './../../deps';
import { mockCloudUserSafe } from 'src/__mocks__';
import { initApiUserProfileNockScope } from '../constants';

const { request, server } = deps;

const endpoint = () => request(server).get(`/cloud/me`);

const responseSchema = Joi.object()
  .keys({
    id: Joi.number().required(),
    name: Joi.string().required(),
    currentAccountId: Joi.number().required(),
    accounts: Joi.array()
      .items(
        Joi.object().keys({
          id: Joi.number().required(),
          name: Joi.string().required(),
        }),
      )
      .required(),
  })
  .required();

const mainCheckFn = getMainCheckFn(endpoint);

initApiUserProfileNockScope();

describe('GET /cloud/me', () => {
  requirements('rte.serverType=local');

  describe('Common', () => {
    [
      {
        name: 'Should get user profile',
        responseSchema,
        checkFn: ({ body }) => {
          expect(body).to.deepEqualIgnoreUndefined(mockCloudUserSafe);
        },
      },
    ].map(mainCheckFn);
  });
});
