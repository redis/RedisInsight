import {
  Joi,
  expect,
  describe,
  after,
  deps,
  requirements,
  getMainCheckFn,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  _,
} from '../deps';
const { request, server, constants, localDb } = deps;

const endpoint = () => request(server).post('/redis-sentinel/get-databases');
const mainCheckFn = getMainCheckFn(endpoint);

// input data schema
const dataSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  username: Joi.string().allow(null),
  password: Joi.string().allow(null),
  tls: Joi.boolean().allow(null),
  tlsServername: Joi.string().allow(null),
  verifyServerCert: Joi.boolean().allow(null),
})
  .messages({
    'any.required': '{#label} should not be empty',
  })
  .strict(true);

const validInputData = {
  name: constants.getRandomString(),
  host: constants.getRandomString(),
  port: 111,
};

const responseSchema = Joi.array().items(
  Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().required(),
    name: Joi.string().required(),
    status: Joi.string().required(),
    numberOfSlaves: Joi.number().required(),
    nodes: Joi.array()
      .items(
        Joi.object({
          host: Joi.string().required(),
          port: Joi.number().required(),
        }),
      )
      .required(),
  }),
);

describe('POST /redis-sentinel/get-databases', () => {
  requirements('rte.type=SENTINEL');
  after(localDb.initAgreements);

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).map(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('NO TLS', () => {
    requirements('!rte.tls');

    [
      {
        name: 'Get list of master groups',
        data: {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          username: constants.TEST_REDIS_USER,
          password: constants.TEST_REDIS_PASSWORD,
        },
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.length).to.gte(1);
          const sentinelMaster = _.find(
            body,
            ({ name }) => name === constants.TEST_SENTINEL_MASTER_GROUP,
          );
          // since there is no other sentinel for current RTE
          expect(sentinelMaster.nodes).to.eql([]);
        },
      },
    ].map(mainCheckFn);
  });

  describe('TLS AUTH', () => {
    requirements('rte.tlsAuth');
    let caCerts = 0;
    let clientCerts = 0;

    [
      {
        name: "Get list of master groups but shouldn't create certs on this step (current implementation)",
        data: {
          host: constants.TEST_REDIS_HOST,
          port: constants.TEST_REDIS_PORT,
          username: constants.TEST_REDIS_USER,
          password: constants.TEST_REDIS_PASSWORD,
          tls: true,
          verifyServerCert: true,
          caCert: {
            name: constants.getRandomString(),
            certificate: constants.TEST_REDIS_TLS_CA,
          },
          clientCert: {
            name: constants.getRandomString(),
            certificate: constants.TEST_USER_TLS_CERT,
            key: constants.TEST_USER_TLS_KEY,
          },
        },
        responseSchema,
        before: async () => {
          caCerts = await (
            await localDb.getRepository(localDb.repositories.CA_CERT_REPOSITORY)
          ).count({});
          clientCerts = await (
            await localDb.getRepository(
              localDb.repositories.CLIENT_CERT_REPOSITORY,
            )
          ).count({});
        },
        after: async () => {
          expect(caCerts).to.eq(
            await (
              await localDb.getRepository(
                localDb.repositories.CA_CERT_REPOSITORY,
              )
            ).count({}),
          );
          expect(clientCerts).to.eq(
            await (
              await localDb.getRepository(
                localDb.repositories.CLIENT_CERT_REPOSITORY,
              )
            ).count({}),
          );
        },
        checkFn: async ({ body }) => {
          expect(body.length).to.gte(1);
          const sentinelMaster = _.find(
            body,
            ({ name }) => name === constants.TEST_SENTINEL_MASTER_GROUP,
          );
          expect(sentinelMaster.nodes).to.eql([]); // no other sentinels for this master group
        },
      },
    ].map(mainCheckFn);
  });
});
