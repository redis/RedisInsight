import { Joi } from '../../helpers/test';
import { caCertSchema, clientCertSchema } from '../certificate/constants';

const providers = [
  'REDIS_SOFTWARE',
  'REDIS_CLOUD',
  'REDIS_STACK',
  'OTHER_REDIS_MANAGED',
  'AZURE_CACHE',
  'AZURE_CACHE_REDIS_ENTERPRISE',
  'REDIS_COMMUNITY_EDITION',
  'AWS_ELASTICACHE',
  'AWS_MEMORYDB',
  'VALKEY',
  'MEMORYSTORE',
  'DRAGONFLY',
  'KEYDB',
  'GARNET',
  'KVROCKS',
  'REDICT',
  'UPSTASH',
  'UNKNOWN_LOCALHOST',
  'UNKNOWN',
];

export const databaseSchema = Joi.object().keys({
  id: Joi.string().required(),
  name: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().integer().required(),
  db: Joi.number().integer().allow(null),
  connectionType: Joi.string()
    .valid('STANDALONE', 'CLUSTER', 'SENTINEL')
    .required(),
  username: Joi.string().allow(null),
  password: Joi.boolean().allow(null),
  timeout: Joi.number().integer().allow(null),
  compressor: Joi.string()
    .valid('NONE', 'LZ4', 'GZIP', 'ZSTD', 'SNAPPY')
    .required(),
  nameFromProvider: Joi.string().allow(null),
  lastConnection: Joi.string().isoDate().allow(null),
  createdAt: Joi.string().isoDate(),
  provider: Joi.string().valid(...providers),
  new: Joi.boolean().allow(null),
  tls: Joi.boolean().allow(null),
  tlsServername: Joi.string().allow(null),
  verifyServerCert: Joi.boolean().allow(null),
  caCert: caCertSchema.strict(true).allow(null),
  clientCert: clientCertSchema.strict(true).allow(null),
  keyNameFormat: Joi.string().valid('Unicode', 'HEX').allow(null),
  sentinelMaster: Joi.object({
    name: Joi.string().required(),
    username: Joi.string().allow(null),
    password: Joi.boolean().allow(null),
  }).allow(null),
  nodes: Joi.array()
    .items({
      host: Joi.string().required(),
      port: Joi.number().integer().required(),
    })
    .allow(null),
  modules: Joi.array()
    .items({
      name: Joi.string().required(),
      version: Joi.number().integer(),
      semanticVersion: Joi.string(),
    })
    .allow(null),
  ssh: Joi.boolean().allow(null),
  forceStandalone: Joi.boolean().allow(null),
  sshOptions: Joi.object({
    id: Joi.string().allow(null),
    host: Joi.string().required(),
    port: Joi.number().required(),
    username: Joi.string().required(),
    password: Joi.boolean().allow(null),
    privateKey: Joi.boolean().allow(null),
    passphrase: Joi.boolean().allow(null),
  }).allow(null),
  version: Joi.string().allow(null),
  cloudDetails: Joi.object()
    .keys({
      cloudId: Joi.number().required(),
      subscriptionType: Joi.string().valid('fixed', 'flexible').required(),
      planMemoryLimit: Joi.number(),
      memoryLimitMeasurementUnit: Joi.string(),
    })
    .allow(null),
  tags: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.string().required(),
        key: Joi.string().required(),
        value: Joi.string().required(),
        createdAt: Joi.string().isoDate(),
        updatedAt: Joi.string().isoDate(),
      }),
    )
    .allow(null),
});
