import {
  describe,
  deps,
  Joi,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  _,
} from '../deps';
const { server, request, constants } = deps;

// endpoint to test
const endpoint = () => request(server).post('/analytics/send-page');

// input data schema
const dataSchema = Joi.object({
  event: Joi.string().required(),
  eventData: Joi.object().allow(null),
}).strict();

const validInputData = {
  event: constants.TEST_ANALYTICS_PAGE,
  eventData: constants.TEST_ANALYTICS_EVENT_DATA,
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /analytics/send-page', () => {
  describe('Main', () => {
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should send telemetry page',
          data: {
            event: constants.TEST_ANALYTICS_PAGE,
            eventData: constants.TEST_ANALYTICS_EVENT_DATA,
          },
          statusCode: 204,
        },
      ].map(mainCheckFn);
    });
  });
});
