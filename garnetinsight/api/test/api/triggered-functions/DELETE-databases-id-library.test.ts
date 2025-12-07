import {
  Joi,
  expect,
  describe,
  before,
  deps,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
  requirements,
} from '../deps';

const { request, server, constants, rte } = deps;

const endpoint = (instanceId = constants.TEST_INSTANCE_ID) =>
  request(server).delete(
    `/${constants.API.DATABASES}/${instanceId}/triggered-functions/library`,
  );

// input data schema
const dataSchema = Joi.object({
  libraryName: Joi.string().required(),
}).strict();

const validInputData = {
  libraryName: constants.getRandomString(),
};

const mainCheckFn = getMainCheckFn(endpoint);

describe(`DELETE /databases/:id/triggered-functions/library`, () => {
  requirements('rte.modules.redisgears_2');

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    before(async () => {
      await rte.data.generateTriggeredFunctionsLibrary();
    });

    [
      {
        name: 'Should remove library by library name',
        data: {
          libraryName: constants.TEST_TRIGGERED_FUNCTIONS_LIBRARY_NAME,
        },
        before: async () => {
          const libraries = await rte.data.sendCommand('TFUNCTION', [
            'LIST',
            'LIBRARY',
            constants.TEST_TRIGGERED_FUNCTIONS_LIBRARY_NAME,
          ]);
          expect(libraries.length).to.eq(1);
        },
        after: async () => {
          const libraries = await rte.data.sendCommand('TFUNCTION', [
            'LIST',
            'LIBRARY',
            constants.TEST_TRIGGERED_FUNCTIONS_LIBRARY_NAME,
          ]);
          expect(libraries.length).to.eq(0);
        },
      },
    ].map(mainCheckFn);
  });
});
