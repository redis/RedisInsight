import {
  describe,
  deps,
  expect,
  Joi,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  _,
} from '../deps';
const { server, request, constants } = deps;

// endpoint to test
const endpoint = () => request(server).post('/analytics/send-event');

// input data schema
const dataSchema = Joi.object({
  event: Joi.string().required(),
  eventData: Joi.object()
    .allow(null)
    .messages({ 'object.base': 'eventData must be an object' }),
}).strict();

const validInputData = {
  event: constants.TEST_ANALYTICS_EVENT,
  eventData: constants.TEST_ANALYTICS_EVENT_DATA,
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /analytics/send-event', () => {
  describe('Main', () => {
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );

      [
        {
          name: 'Should not allow an event name outside of the known naming scheme',
          data: {
            ...validInputData,
            event: 'SOME_EVENT; curl http://example.com',
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
          checkFn: ({ body }: { body: { message: string[] } }) => {
            expect(body.message).to.contain(
              'event must contain only uppercase letters, digits and underscores (128 characters max)',
            );
          },
        },
        {
          name: 'Should not allow user traits to be passed in the request body',
          data: {
            ...validInputData,
            traits: { telemetry: 'enabled' },
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
          checkFn: ({ body }: { body: { message: string[] } }) => {
            expect(body.message).to.contain('property traits should not exist');
          },
        },
        {
          name: 'Should not allow the analytics consent to be overridden from the request body',
          data: {
            ...validInputData,
            nonTracking: true,
          },
          statusCode: 400,
          responseBody: {
            statusCode: 400,
            error: 'Bad Request',
          },
          checkFn: ({ body }: { body: { message: string[] } }) => {
            expect(body.message).to.contain(
              'property nonTracking should not exist',
            );
          },
        },
      ].map(mainCheckFn);
    });

    describe('Common', () => {
      [
        {
          name: 'Should send telemetry event',
          data: {
            event: constants.TEST_ANALYTICS_EVENT,
            eventData: constants.TEST_ANALYTICS_EVENT_DATA,
          },
          statusCode: 204,
        },
      ].map(mainCheckFn);
    });
  });
});
