import { describe, it, deps, expect, validateApiCall } from '../deps';
import { Joi } from '../../helpers/test';
import { createDefaultNotifications } from '../../helpers/local-db';
import { constants } from '../../helpers/constants';
const { request, server } = deps;

const endpoint = () => request(server).get(`/notifications`);

const responseSchema = Joi.object()
  .keys({
    totalUnread: Joi.number().integer().min(0).required(),
    notifications: Joi.array()
      .items(
        Joi.object().keys({
          title: Joi.string().required(),
          category: Joi.string().allow(null),
          categoryColor: Joi.string().allow(null),
          body: Joi.string().required(),
          timestamp: Joi.number().integer().required(),
          read: Joi.boolean().required(),
          type: Joi.string().valid('global').required(),
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

describe('GET /notifications', () => {
  beforeEach(async () => {
    await createDefaultNotifications(true);
  });

  [
    {
      name: 'Should get ordered notifications list',
      responseSchema,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          totalUnread: 2,
          notifications: [
            constants.TEST_NOTIFICATION_3,
            constants.TEST_NOTIFICATION_2,
            constants.TEST_NOTIFICATION_1,
          ],
        });
      },
    },
  ].map(mainCheckFn);
});
