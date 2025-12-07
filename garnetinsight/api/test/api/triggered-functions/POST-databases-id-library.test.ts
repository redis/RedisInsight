import {
  expect,
  describe,
  deps,
  Joi,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  _,
} from '../deps';
const { server, request, constants, rte } = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).post(
    `/${constants.API.DATABASES}/${instanceId}/triggered-functions/library`,
  );

// input data schema
const dataSchema = Joi.object({
  code: Joi.string().required(),
  configuration: Joi.string().allow(null),
}).strict();

const validInputData = {
  code: constants.TEST_TRIGGERED_FUNCTIONS_CODE,
  configuration: constants.TEST_TRIGGERED_FUNCTIONS_CONFIGURATION,
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:instanceId/triggered-functions/library', () => {
  requirements('rte.modules.redisgears_2');

  describe('Main', () => {
    describe('Validation', () => {
      generateInvalidDataTestCases(dataSchema, validInputData).map(
        validateInvalidDataTestCase(endpoint, dataSchema),
      );
    });

    describe('Common', () => {
      [
        {
          name: 'Should upload library',
          data: {
            code: constants.TEST_TRIGGERED_FUNCTIONS_CODE,
            configuration: constants.TEST_TRIGGERED_FUNCTIONS_CONFIGURATION,
          },
          statusCode: 201,
          before: async () => {
            // Triggered and functions did not have ability to remove all libraries
            try {
              await rte.data.sendCommand('TFUNCTION', [
                'DELETE',
                constants.TEST_TRIGGERED_FUNCTIONS_LIBRARY_NAME,
              ]);
            } catch (err) {
              // ignore
            }
            const libraries = await rte.data.sendCommand('TFUNCTION', [
              'LIST',
              'LIBRARY',
              constants.TEST_TRIGGERED_FUNCTIONS_LIBRARY_NAME,
            ]);
            expect(libraries.length).to.eq(0);
          },
          after: async () => {
            const libraries = await rte.data.sendCommand('TFUNCTION', [
              'LIST',
              'LIBRARY',
              constants.TEST_TRIGGERED_FUNCTIONS_LIBRARY_NAME,
            ]);
            expect(libraries.length).to.eq(1);
          },
        },
      ].map(mainCheckFn);
    });
  });
});
