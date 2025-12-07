import { describe, it, deps, Joi, expect, validateApiCall } from '../deps';
import { constants } from '../../helpers/constants';
const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).get('/settings/agreements/spec');

const agreementItemSchema = Joi.object().keys({
  defaultValue: Joi.bool().required(),
  required: Joi.bool().required(),
  disabled: Joi.bool().required(),
  displayInSetting: Joi.bool().required(),
  editable: Joi.bool().required(),
  since: Joi.string().required(),
  title: Joi.string().required(),
  label: Joi.string().required(),
  category: Joi.string().optional(),
  description: Joi.string().optional(),
  requiredText: Joi.string().optional(),
  linkToPrivacyPolicy: Joi.boolean().required(),
});

const responseSchema = Joi.object()
  .keys({
    version: Joi.string().required(),
    agreements: Joi.object()
      .keys({
        eula: agreementItemSchema.required(),
        analytics: agreementItemSchema.required(),
        encryption: agreementItemSchema.required(),
        notifications: agreementItemSchema.required(),
      })
      .pattern(/./, agreementItemSchema)
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

describe('GET /settings/agreements/spec', () => {
  [
    {
      name: 'Should return valid JSON',
      statusCode: 200,
      responseSchema,
      checkFn: ({ body }) => {
        const encryptionAgreements = body.agreements.encryption;
        expect(encryptionAgreements.since).to.eql('1.0.3');
        expect(encryptionAgreements.defaultValue).to.eql(
          constants.TEST_ENCRYPTION_STRATEGY === 'KEYTAR',
        );
      },
    },
  ].map(mainCheckFn);
});
