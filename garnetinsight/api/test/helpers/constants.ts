import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { randomBytes } from 'crypto';
import {
  getASCIISafeStringFromBuffer,
  getBufferFromSafeASCIIString,
} from 'src/utils/cli-helper';
import { RECOMMENDATION_NAMES, TelemetryEvents } from 'src/constants';
import { Compressor } from 'src/modules/database/entities/database.entity';
import { Vote } from 'src/modules/database-recommendation/models';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import { TagEntity } from 'src/modules/tag/entities/tag.entity';

const API = {
  DATABASES: 'databases',
  RDI: 'rdi',
};

const TEST_RUN_ID = `=${uuidv4()}`;
const KEY_TTL = 100;
const CLUSTER_HASH_SLOT = '{slot1}';
const APP_DEFAULT_SETTINGS = {
  scanThreshold: 10000,
  batchSize: 5,
  theme: null,
  dateFormat: null,
  timezone: null,
  agreements: null,
  acceptTermsAndConditionsOverwritten: false,
};
const TEST_LIBRARY_NAME = 'lib';
const TEST_ANALYTICS_PAGE = 'Settings';

const unprintableBuf = Buffer.concat([
  Buffer.from('acedae', 'hex'),
  Buffer.from(CLUSTER_HASH_SLOT),
]);

const CERTS_FOLDER = process.env.CERTS_FOLDER || './coverage';
const TEST_PRE_SETUP_DATABASES_PATH =
  process.env.RI_PRE_SETUP_DATABASES_PATH || './databases.json';

const TEST_RUN_DIR = '.test_run';
const TEST_ENCRYPTION_STRATEGY = 'KEYTAR';

const TEST_TAGS: TagEntity[] = [
  Object.assign(new TagEntity(), {
    id: uuidv4(),
    key: 'environment',
    value: 'production',
    createdAt: new Date(),
    updatedAt: new Date(),
    encryption: TEST_ENCRYPTION_STRATEGY,
  }),
  Object.assign(new TagEntity(), {
    id: uuidv4(),
    key: 'environment',
    value: 'staging',
    createdAt: new Date(),
    updatedAt: new Date(),
    encryption: TEST_ENCRYPTION_STRATEGY,
  }),
  Object.assign(new TagEntity(), {
    id: uuidv4(),
    key: 'size',
    value: 'large',
    createdAt: new Date(),
    updatedAt: new Date(),
    encryption: TEST_ENCRYPTION_STRATEGY,
  }),
];

export const constants = {
  // api
  API,
  // common
  TEST_RUN_ID,
  TEST_RUN_NAME: process.env.TEST_RUN_NAME || '',
  KEY_TTL,
  CLUSTER_HASH_SLOT,
  TEST_TAGS,
  getRandomString: () => `${TEST_RUN_ID}_${uuidv4()}_${CLUSTER_HASH_SLOT}`,
  generateRandomKey: () => `${TEST_RUN_ID}_${uuidv4()}_${CLUSTER_HASH_SLOT}`,
  APP_DEFAULT_SETTINGS,
  TEST_KEYTAR_PASSWORD:
    process.env.RI_SECRET_STORAGE_PASSWORD || 'somepassword',
  TEST_INCORRECT_PASSWORD: 'incorrect',
  TEST_ENCRYPTION_STRATEGY,
  TEST_AGREEMENTS_VERSION: '1.0.3',
  TEST_REMOTE_STATIC_PATH: './remote',
  TEST_REMOTE_STATIC_URI: '/remote',
  TEST_FEATURE_FLAG_REMOTE_CONFIG_PATH: './remote/features-config.json',

  // local database
  TEST_LOCAL_DB_FILE_PATH:
    process.env.TEST_LOCAL_DB_FILE_PATH || './garnetinsight.db',
  TEST_NOT_EXISTED_INSTANCE_ID: uuidv4(),
  TEST_INSTANCE_ID: uuidv4(),
  TEST_INSTANCE_NAME: uuidv4(),
  TEST_INSTANCE_ACL_ID: uuidv4(),
  TEST_INSTANCE_ACL_NAME: uuidv4(),
  TEST_INSTANCE_ACL_USER: uuidv4(),
  TEST_INSTANCE_ACL_PASS: uuidv4(),
  TEST_NEW_INSTANCE_NAME: uuidv4(),
  TEST_CLI_UUID_1: uuidv4(),
  TEST_INSTANCE_ID_2: uuidv4(),
  TEST_INSTANCE_NAME_2: uuidv4(),
  TEST_INSTANCE_HOST_2: uuidv4(),
  TEST_INSTANCE_ID_3: uuidv4(),
  TEST_INSTANCE_NAME_3: uuidv4(),
  TEST_INSTANCE_HOST_3: uuidv4(),
  TEST_INSTANCE_ID_4: uuidv4(),
  TEST_INSTANCE_NAME_4: uuidv4(),
  TEST_INSTANCE_ID_5: uuidv4(),
  TEST_INSTANCE_NAME_5: uuidv4(),
  TEST_INSTANCE_HOST_5: uuidv4(),
  TEST_INSTANCE_ID_6: uuidv4(),
  TEST_INSTANCE_NAME_6: uuidv4(),
  TEST_INSTANCE_HOST_6: uuidv4(),
  TEST_INSTANCE_ID_7: uuidv4(),
  TEST_INSTANCE_NAME_7: uuidv4(),
  TEST_INSTANCE_HOST_7: uuidv4(),
  TEST_INSTANCE_PORT_5: 5555,
  TEST_INSTANCE_HOST_4: '127.0.0.1',
  TEST_INSTANCE_PORT_4: 3333,

  // redis client
  TEST_REDIS_HOST: process.env.TEST_REDIS_HOST || 'localhost',
  TEST_REDIS_PORT: parseInt(process.env.TEST_REDIS_PORT) || 6379,
  TEST_REDIS_TIMEOUT: 30_000,
  TEST_REDIS_COMPRESSOR: Compressor.NONE,
  TEST_REDIS_DB_INDEX: 7,
  TEST_REDIS_USER: process.env.TEST_REDIS_USER,
  TEST_REDIS_PASSWORD: process.env.TEST_REDIS_PASSWORD,
  TEST_REDIS_TLS_CA: process.env.TEST_REDIS_TLS_CA,
  TEST_USER_TLS_CERT: process.env.TEST_USER_TLS_CERT,
  TEST_USER_TLS_KEY: process.env.TEST_USER_TLS_KEY,

  TEST_RTE_ON_PREMISE: process.env.TEST_RTE_ON_PREMISE
    ? process.env.TEST_RTE_ON_PREMISE === 'true'
    : true,
  TEST_RTE_SHARED_DATA: process.env.TEST_RTE_SHARED_DATA
    ? process.env.TEST_RTE_SHARED_DATA === 'true'
    : false,
  TEST_RTE_BIG_DATA: process.env.TEST_RTE_BIG_DATA
    ? process.env.TEST_RTE_BIG_DATA === 'true'
    : false,
  TEST_RTE_CRDT: process.env.TEST_RTE_CRDT
    ? process.env.TEST_RTE_CRDT === 'true'
    : false,
  TEST_RTE_TYPE: process.env.TEST_RTE_DISCOVERY_TYPE || 'STANDALONE',
  TEST_RTE_HOST: process.env.TEST_RTE_DISCOVERY_HOST,
  TEST_RTE_PORT: process.env.TEST_RTE_DISCOVERY_PORT,
  TEST_RTE_USER: process.env.TEST_RTE_DISCOVERY_USER,
  TEST_RTE_PASSWORD: process.env.TEST_RTE_DISCOVERY_PASSWORD,

  // sentinel
  TEST_SENTINEL_MASTER_GROUP:
    process.env.TEST_SENTINEL_MASTER_GROUP || 'primary1',
  TEST_SENTINEL_MASTER_USER: process.env.TEST_SENTINEL_MASTER_USER,
  TEST_SENTINEL_MASTER_PASS: process.env.TEST_SENTINEL_MASTER_PASS,

  // re
  TEST_RE_HOST: process.env.TEST_RE_HOST || 'localhost',
  TEST_RE_PORT: parseInt(process.env.TEST_RE_PORT) || 9443,
  TEST_RE_USER: process.env.TEST_RE_USER,
  TEST_RE_PASS: process.env.TEST_RE_PASS,

  // cloud
  TEST_CLOUD_RTE: process.env.TEST_CLOUD_RTE,
  TEST_CLOUD_API:
    process.env.REDIS_CLOUD_URL ||
    process.env.TEST_CLOUD_API ||
    'https://api.qa.redislabs.com/v1',
  TEST_CLOUD_API_KEY: process.env.TEST_CLOUD_API_KEY || 'TEST_CLOUD_API_KEY',
  TEST_CLOUD_API_SECRET_KEY:
    process.env.TEST_CLOUD_API_SECRET_KEY || 'TEST_CLOUD_API_SECRET_KEY',
  TEST_CLOUD_SUBSCRIPTION_NAME:
    process.env.TEST_CLOUD_SUBSCRIPTION_NAME || 'ITests',
  TEST_CLOUD_SUBSCRIPTION_ID: process.env.TEST_CLOUD_SUBSCRIPTION_ID || 1,
  TEST_CLOUD_DATABASE_NAME: process.env.TEST_CLOUD_DATABASE_NAME || 'ITests-db',
  TEST_CLOUD_ID: process.env.TEST_CLOUD_ID || 111,
  TEST_CLOUD_SUBSCRIPTION_TYPE:
    process.env.TEST_CLOUD_SUBSCRIPTION_TYPE || CloudSubscriptionType.Fixed,

  STANDALONE: 'STANDALONE',
  CLUSTER: 'CLUSTER',
  SENTINEL: 'SENTINEL',

  // ssh
  TEST_SSH_HOST: process.env.TEST_SSH_HOST,
  TEST_SSH_PORT: process.env.TEST_SSH_PORT
    ? parseInt(process.env.TEST_SSH_PORT, 10)
    : 22,
  TEST_SSH_USER: process.env.TEST_SSH_USER,
  TEST_SSH_PASSWORD: process.env.TEST_SSH_PASSWORD,
  TEST_SSH_PRIVATE_KEY: process.env.TEST_SSH_PRIVATE_KEY,
  TEST_SSH_PRIVATE_KEY_P: process.env.TEST_SSH_PRIVATE_KEY_P,
  TEST_SSH_PASSPHRASE: process.env.TEST_SSH_PASSPHRASE,

  // certificates
  TEST_USER_CERT_ID: uuidv4(),
  TEST_USER_CERT_NAME: uuidv4(),
  TEST_USER_CERT_FILENAME: 'user.crt',
  TEST_USER_CERT_KEY_FILENAME: 'user.key',

  TEST_CLIENT_CERT_NAME: 'client certificate',
  TEST_CLIENT_CERT:
    '-----BEGIN CERTIFICATE-----\nMIIFJTCCAw0CFCnZUPMfcoAU/VJYA6Qf4cZIJp4iMA0GCSqGSIb3DQEBCwUAMEUx\nCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRl\ncm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMjEwNjIyMTcwMDQ2WhcNMzUwMzAxMTcw\nMDQ2WjBZMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UE\nCgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRIwEAYDVQQDDAlsb2NhbGhvc3Qw\nggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDfRqe8YhMbWSlcbpGcIxXf\ncxYt9IYa1oAhW/KJ7iHwjldy82ht6mdYIvhqSxo8Xo9AUpMl9LT3mZv1aCup8G4u\nS5DXdYNV5KuTTP8zx5pcw0GVKLKB7THOOFV8Fzyx8dQAA24Z7Bz9aRRAeQsm2+tN\nQHL6D71uVPt9D07Tu2GGjivFhT/gHn1VBFbrpGEF+Z5dQbh7fd1j3kBpEtSrMrTh\nQfYVWtpdRW6JvsdG/Y07fkFCWEHbgVGqnVjJEc38ieCImDFK6vR+Q1bFqtvkr1zw\nKx6X6Hol32LeI2TJ+cPtHak8L53cKJyoIe3xu/9uIqhqGL+GUqBGLNsGYVR9RgfF\nwndk3/2ZeRodxKKsjaIMBlLLgmZkXoO6+hmyE3RNZv1fmgrTbjs1XTlxpi+byVs1\nuqHFBKLt2NclAOIXf8IGt9+5cPSOenMEW3pUUUb8yXKUgBKfEU8HO38tbLDpY0hW\n3mS/hIiTzcr5kD1jgoJ17SKZXKgOd0dhilN263YZnpcy0zFTeLNyTBAopte84Mmh\nRoMFVM2r6449P7sbm1YvyUNTGwgwsFpr2eJNcKk8laW4uSelvSLxlm6e4VtQ0FEX\n+7igpL6Mxdu3BUqhJrcoeNzz4AvbwZWie9IbSaIz+FeB1lMXDAt1kis+QCNc1S6a\n4Ulsl2HAApT8u3Fdfs+c3QIDAQABMA0GCSqGSIb3DQEBCwUAA4ICAQClCb7TfzWz\nSMT/6Y9cB4phR/FFQxqumNaE1ER1hLvU1wiGX85KwpAQOpIOS3J8pDYmTIiD2Zl4\n/EoHr//OsfYQQ05LT7pR5qPHyz+pxp/OH35k+LIaPtG3E2PrkjHffG5udRhGAxtr\nP3pampp0NaoFDtVNSjj73jedxhXKQVIPypK34yGOa67ISbDOzWQEoHCUwFPsNIp0\nd3uq8WDb0Er9sX2pCheuHYtxs6jgNaXOmJT8VkAKwaKnpUejfFiA/YPtsGgkSlEX\nhv1G0jmMquhPrMBq/pQrqvnA69dPi009L8m+aO1q1w5HQhH67JPjYSVR8A+OWfJ+\n2oMRO6UP2Ryf3G4STL1sL7GF9rWWsKtQH8T4ESZ3WfHcw7NjuEt2ngH2bplAei/e\nxCVDWgNfAWYQqbJhqv4NMEaIh5L0GkTTCnjxsEq2ByFlka+hQqz+6PQW/gQYScgT\n2+D0DQW7RP1pvheLwYABLDkx1y0eXBOmcthxVn9GyjZOmZFreRIBhlHp2lN6wUiR\n9Qj7UvwJ7Jhocc2mNwNxEmFLRoKku+1uoc/n3b/chaq0WadlDohWmE7hiKA25AG+\nRj54Ou5G78qbWstZPR/sAXQGtUkgXuAkh+RcP8OcfpImUryZ/4cIoSzgAIE+NYX6\nif8fVyASWrgcBKk5RUyFCZKMkJceV9ZGFg==\n-----END CERTIFICATE-----\n',
  TEST_CLIENT_KEY:
    '-----BEGIN RSA PRIVATE KEY-----\n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\n-----END RSA PRIVATE KEY-----\n',

  TEST_CA_ID: uuidv4(),
  TEST_CA_NAME: 'ca certificate',
  TEST_CA_FILENAME: 'redisCA.crt',
  TEST_CA_CERT:
    '-----BEGIN CERTIFICATE-----\nMIIFazCCA1OgAwIBAgIUavmmz7/4r2muhE1He1u/6S1jLXEwDQYJKoZIhvcNAQEL\nBQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM\nGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMTA2MjIxNjMwNTJaFw00ODEx\nMDcxNjMwNTJaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw\nHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggIiMA0GCSqGSIb3DQEB\nAQUAA4ICDwAwggIKAoICAQDGUx5tjluzcotvXlr4XCqAbdO+ehD/djqzb3KxB4p4\nUNE5tqS4TykvbisASOnNj/643J0BSYKEZwNBjy/oAWmc3cVMq30WnWRENGRUKyr+\nqhgjR0OGMHxpAU8DiDgsJAuvvh86SU0xIo6PUWyO38XNIOGt05s61My9fW+Allai\n5/jj6knBej42cRY7B9hUgHfko9NXE5oUVFKE+dpH9IiMUGBm7SDi1ysB1vIMQhcT\n8ugQHdwXAiQfhDODNuDG48z6OprhGgHN5lYNFd3oFlweoFaqE0psFRh9bR5AuqES\nubxEFqMVwEjyJa8BgObRBwdHoipZt1FLDeKTP5/MGUm5n/2X+pcAi4Q7+9i+aVz5\ngFiCz6ndOFEj3X4CXcHHLVzI8ukQ3wQiDFXnomLOcFcuAJ9t+MisUOwts/Nvmqa0\n+copNgXu2N8K01G77HX1qbJ0uyF6pupw2EWW0yJXkoSeOeaFegHPMx6y3RUx1adl\nKu9vQ8JDodK4OwHfQcSBgj8aKA7huBnclgpBmM6B1czC6pw7DN6orLOlsx6cUusP\n4mELM2CNNYLUQuxhghTO8lAQTgvvth5MNSpxA6x/gKFGmLN9XUJIZweQQymeY137\n8elXS2yuoSyppisB+HDvp6MbegN1ldzhI0AjdUj9NDiiO5sDk+XscKA8tsZz/MgW\nMQIDAQABo1MwUTAdBgNVHQ4EFgQU0CzAfHYx+Tr/axoAsurYNR/t2RMwHwYDVR0j\nBBgwFoAU0CzAfHYx+Tr/axoAsurYNR/t2RMwDwYDVR0TAQH/BAUwAwEB/zANBgkq\nhkiG9w0BAQsFAAOCAgEAd6Fqt+Ji1DV/7XA6e5QeCjqhrPxsXaUorbNSy2a4U59y\nRj5lmI8RUPBt6AtSLWpeZ5JU2NQpK+4YfbopSPnVtc8Xipta1VmSr2grjT0n4cjY\nXkMHV4bwaHBhr1OI2REcBOiwNP2QzXK7uFa75nZUyQSC0C3Qi5EJri2+a6xMsuF5\nE8a9eyIvst1ESXJ9IJITc8e/eYFtpGw7WRClcm1UblwqYpO9sW9fFuZDpuBC0UH1\nGXolRnFYN8PstjxmXHtrjHGcmOY+t1yFnyxOgZ01rmaFt+JEFbPOmgN17wcAidrV\nAuXKWal9zrtlJc1J8GPHPpBTlZ+Qq5TlPI7Z3Boj9FCZdl3JEWUZGP7TPjxCWLoH\n2/wJppE7w2bQcnidQngZhf2PN5RNQASUa2QBae7rkztReJ6A/xMWXAOfgkj13IbS\nPIDZnBQYp5DKAxL9PRB/javL57/fUtYAxxzZK4xbvwY/lygv3+NetPqRHnx/IVBj\nuEal2rpdwyFcoJ3DODbh9eh6tWJB4wR8QyYm3ATF1VV+x6XX5u5t5Z4IUt8WJkgn\nHGzepJVYxzJMzjlyjqF1IG9e1da8c4DdRgmOn3R55G5BWQR3i6J+RAQY/O1S3VKA\n0FDYT/EDZRbtXWwStSWUIPxNZt62vNGgwzprQow9OfJHRuOzlzIiK2BqnixboOs=\n-----END CERTIFICATE-----\n',
  CERTS_FOLDER,
  TEST_PRE_SETUP_DATABASES_PATH,
  TEST_CA_CERT_PATH: path.join(CERTS_FOLDER, 'ca.crt'),
  TEST_CLIENT_CERT_PATH: path.join(CERTS_FOLDER, 'client.crt'),
  TEST_CLIENT_KEY_PATH: path.join(CERTS_FOLDER, 'client.key'),

  // Redis Strings
  TEST_STRING_TYPE: 'string',
  TEST_STRING_KEY_1: TEST_RUN_ID + '_string_1' + CLUSTER_HASH_SLOT,
  TEST_STRING_VALUE_1: TEST_RUN_ID + '_value_1',
  GENERATE_BIG_TEST_STRING_VALUE: (sizeInMB = 1) =>
    randomBytes(sizeInMB * 1024 * 1024).toString(),
  TEST_STRING_EXPIRE_1: KEY_TTL,
  TEST_STRING_KEY_2: TEST_RUN_ID + '_string_2' + CLUSTER_HASH_SLOT,
  TEST_STRING_VALUE_2: TEST_RUN_ID + '_value_2',
  TEST_STRING_EXPIRE_2: KEY_TTL,
  TEST_STRING_KEY_ASCII: getASCIISafeStringFromBuffer(
    getBufferFromSafeASCIIString(
      TEST_RUN_ID + '_str_ascii_€' + CLUSTER_HASH_SLOT,
    ),
  ),
  TEST_STRING_KEY_ASCII_BUFFER: getBufferFromSafeASCIIString(
    TEST_RUN_ID + '_str_ascii_€' + CLUSTER_HASH_SLOT,
  ),
  TEST_STRING_KEY_ASCII_UNICODE:
    TEST_RUN_ID + '_str_ascii_€' + CLUSTER_HASH_SLOT,
  TEST_STRING_KEY_ASCII_VALUE: TEST_RUN_ID + '_value_ascii',
  TEST_STRING_KEY_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('strk'),
    unprintableBuf,
  ]),
  TEST_STRING_VALUE_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('strv'),
    unprintableBuf,
  ]),
  TEST_STRING_KEY_START_1: 0,
  TEST_STRING_KEY_START_2: 2,
  TEST_STRING_KEY_END: 9,
  get TEST_STRING_KEY_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_STRING_KEY_BIN_BUFFER_1] };
  },
  get TEST_STRING_VALUE_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_STRING_VALUE_BIN_BUFFER_1] };
  },
  get TEST_STRING_PARTIAL_VALUE_BIN_BUF_OBJ_1() {
    return {
      type: 'Buffer',
      data: [
        ...this.TEST_STRING_VALUE_BIN_BUFFER_1.slice(
          this.TEST_STRING_KEY_START_1,
          this.TEST_STRING_KEY_END + 1,
        ),
      ],
    };
  },
  get TEST_STRING_PARTIAL_VALUE_BIN_BUF_OBJ_2() {
    return {
      type: 'Buffer',
      data: [
        ...this.TEST_STRING_VALUE_BIN_BUFFER_1.slice(
          this.TEST_STRING_KEY_START_2,
          this.TEST_STRING_KEY_END + 1,
        ),
      ],
    };
  },
  get TEST_STRING_KEY_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_STRING_KEY_BIN_BUFFER_1);
  },
  get TEST_STRING_KEY_BIN_UTF8_1() {
    return this.TEST_STRING_KEY_BIN_BUFFER_1.toString('utf-8');
  },
  get TEST_STRING_VALUE_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_STRING_VALUE_BIN_BUFFER_1);
  },
  get TEST_STRING_VALUE_BIN_UTF8_1() {
    return this.TEST_STRING_VALUE_BIN_BUFFER_1.toString('utf-8');
  },

  // Redis List
  TEST_LIST_TYPE: 'list',
  TEST_LIST_KEY_1: TEST_RUN_ID + '_list_1' + CLUSTER_HASH_SLOT,
  TEST_LIST_ELEMENT_1: TEST_RUN_ID + '_list_el_1',
  TEST_LIST_ELEMENT_2: TEST_RUN_ID + '_list_el_2',
  TEST_LIST_EXPIRE_1: KEY_TTL,
  TEST_LIST_KEY_2: TEST_RUN_ID + '_list_2' + CLUSTER_HASH_SLOT,
  TEST_LIST_HUGE_KEY: 'big list 1M',
  TEST_LIST_HUGE_INDEX: 678900,
  TEST_LIST_HUGE_ELEMENT: ' 321099',
  TEST_LIST_KEY_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('listk'),
    unprintableBuf,
  ]),
  get TEST_LIST_KEY_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_LIST_KEY_BIN_BUFFER_1] };
  },
  get TEST_LIST_KEY_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_LIST_KEY_BIN_BUFFER_1);
  },
  get TEST_LIST_KEY_BIN_UTF8_1() {
    return this.TEST_LIST_KEY_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_LIST_ELEMENT_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('liste'),
    unprintableBuf,
  ]),
  get TEST_LIST_ELEMENT_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_LIST_ELEMENT_BIN_BUFFER_1);
  },
  get TEST_LIST_ELEMENT_BIN_UTF8_1() {
    return this.TEST_LIST_ELEMENT_BIN_BUFFER_1.toString('utf-8');
  },
  get TEST_LIST_ELEMENT_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_LIST_ELEMENT_BIN_BUFFER_1] };
  },

  // Redis Set
  TEST_SET_TYPE: 'set',
  TEST_SET_KEY_1: TEST_RUN_ID + '_set_1' + CLUSTER_HASH_SLOT,
  TEST_SET_MEMBER_1: TEST_RUN_ID + '_set_mem_1',
  TEST_SET_MEMBER_2: TEST_RUN_ID + '_set_mem_2',
  TEST_SET_EXPIRE_1: KEY_TTL,
  TEST_SET_KEY_2: TEST_RUN_ID + '_set_2' + CLUSTER_HASH_SLOT,
  TEST_SET_HUGE_KEY: 'big set 1M',
  TEST_SET_HUGE_ELEMENT: ' 356897',
  TEST_SET_KEY_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('setk'),
    unprintableBuf,
  ]),
  get TEST_SET_KEY_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_SET_KEY_BIN_BUFFER_1] };
  },
  get TEST_SET_KEY_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_SET_KEY_BIN_BUFFER_1);
  },
  get TEST_SET_KEY_BIN_UTF8_1() {
    return this.TEST_SET_KEY_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_SET_MEMBER_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('setm'),
    unprintableBuf,
  ]),
  get TEST_SET_MEMBER_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_SET_MEMBER_BIN_BUFFER_1);
  },
  get TEST_SET_MEMBER_BIN_UTF8_1() {
    return this.TEST_SET_MEMBER_BIN_BUFFER_1.toString('utf-8');
  },
  get TEST_SET_MEMBER_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_SET_MEMBER_BIN_BUFFER_1] };
  },

  // Redis ZSet
  TEST_ZSET_TYPE: 'zset',
  TEST_ZSET_KEY_1: TEST_RUN_ID + '_zset_1' + CLUSTER_HASH_SLOT,
  TEST_ZSET_MEMBER_1: TEST_RUN_ID + '_zset_mem_1',
  TEST_ZSET_MEMBER_1_SCORE: 0,
  TEST_ZSET_MEMBER_2: TEST_RUN_ID + '_zset_mem_2',
  TEST_ZSET_MEMBER_2_SCORE: 0.1,
  TEST_ZSET_EXPIRE_1: KEY_TTL,
  TEST_ZSET_KEY_2: TEST_RUN_ID + '_zset_2' + CLUSTER_HASH_SLOT,
  TEST_ZSET_KEY_3: TEST_RUN_ID + '_zset_3' + CLUSTER_HASH_SLOT,
  TEST_ZSET_HUGE_KEY: 'big zset 1M',
  TEST_ZSET_HUGE_MEMBER: ' 356897',
  TEST_ZSET_HUGE_SCORE: 356897,
  TEST_ZSET_TIMESTAMP_KEY: TEST_RUN_ID + '_zset_timestamp' + CLUSTER_HASH_SLOT,
  TEST_ZSET_TIMESTAMP_MEMBER: '1234567891',
  TEST_ZSET_TIMESTAMP_SCORE: 1234567891,
  TEST_ZSET_KEY_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('zsetk'),
    unprintableBuf,
  ]),
  get TEST_ZSET_KEY_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_ZSET_KEY_BIN_BUFFER_1] };
  },
  get TEST_ZSET_KEY_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_ZSET_KEY_BIN_BUFFER_1);
  },
  get TEST_ZSET_KEY_BIN_UTF8_1() {
    return this.TEST_ZSET_KEY_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_ZSET_MEMBER_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('zsetm'),
    unprintableBuf,
  ]),
  get TEST_ZSET_MEMBER_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_ZSET_MEMBER_BIN_BUFFER_1);
  },
  get TEST_ZSET_MEMBER_BIN_UTF8_1() {
    return this.TEST_ZSET_MEMBER_BIN_BUFFER_1.toString('utf-8');
  },
  get TEST_ZSET_MEMBER_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_ZSET_MEMBER_BIN_BUFFER_1] };
  },

  // Redis Hash
  TEST_HASH_TYPE: 'hash',
  TEST_HASH_KEY_1: TEST_RUN_ID + '_hash_1' + CLUSTER_HASH_SLOT,
  TEST_HASH_FIELD_1_NAME: TEST_RUN_ID + '_hash_f_1_name',
  TEST_HASH_FIELD_1_VALUE: TEST_RUN_ID + '_hash_f_1_val',
  TEST_HASH_FIELD_2_NAME: TEST_RUN_ID + '_hash_f_2_name',
  TEST_HASH_FIELD_2_VALUE: TEST_RUN_ID + '_hash_f_2_val',
  TEST_HASH_FIELD_3_NAME: TEST_RUN_ID + '_hash_f_3_name',
  TEST_HASH_FIELD_3_VALUE: TEST_RUN_ID + '_hash_f_3_val',
  TEST_HASH_EXPIRE_1: KEY_TTL,
  TEST_HASH_KEY_2: TEST_RUN_ID + '_hash_2' + CLUSTER_HASH_SLOT,
  TEST_HASH_HUGE_KEY: 'big hash 1M',
  TEST_HASH_HUGE_KEY_FIELD: 'key678900',
  TEST_HASH_HUGE_KEY_VALUE: ' 678900',
  TEST_HASH_KEY_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('hashk'),
    unprintableBuf,
  ]),
  get TEST_HASH_KEY_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_HASH_KEY_BIN_BUFFER_1] };
  },
  get TEST_HASH_KEY_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_HASH_KEY_BIN_BUFFER_1);
  },
  get TEST_HASH_KEY_BIN_UTF8_1() {
    return this.TEST_HASH_KEY_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_HASH_FIELD_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('hashf'),
    unprintableBuf,
  ]),
  get TEST_HASH_FIELD_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_HASH_FIELD_BIN_BUFFER_1] };
  },
  get TEST_HASH_FIELD_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_HASH_FIELD_BIN_BUFFER_1);
  },
  get TEST_HASH_FIELD_BIN_UTF8_1() {
    return this.TEST_HASH_FIELD_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_HASH_VALUE_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('hashv'),
    unprintableBuf,
  ]),
  get TEST_HASH_VALUE_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_HASH_VALUE_BIN_BUFFER_1] };
  },
  get TEST_HASH_VALUE_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_HASH_VALUE_BIN_BUFFER_1);
  },
  get TEST_HASH_VALUE_BIN_UTF8_1() {
    return this.TEST_HASH_VALUE_BIN_BUFFER_1.toString('utf-8');
  },

  // Redis Stream
  TEST_STREAM_TYPE: 'stream',
  TEST_STREAM_KEY_1: TEST_RUN_ID + '_stream_1' + CLUSTER_HASH_SLOT,
  TEST_STREAM_KEY_2: TEST_RUN_ID + '_stream_2' + CLUSTER_HASH_SLOT,
  TEST_STREAM_DATA_1: TEST_RUN_ID + '_stream_data_1',
  TEST_STREAM_DATA_2: TEST_RUN_ID + '_stream_data_2',
  TEST_STREAM_ID_1: '100-0',
  TEST_STREAM_FIELD_1: TEST_RUN_ID + '_stream_field_1',
  TEST_STREAM_VALUE_1: TEST_RUN_ID + '_stream_value_1',
  TEST_STREAM_ID_2: '200-0',
  TEST_STREAM_ID_3: '300-0',
  TEST_STREAM_ID_4: '400-0',
  TEST_STREAM_FIELD_2: TEST_RUN_ID + '_stream_field_2',
  TEST_STREAM_VALUE_2: TEST_RUN_ID + '_stream_value_2',
  TEST_STREAM_EXPIRE_1: KEY_TTL,
  TEST_STREAM_HUGE_KEY: TEST_RUN_ID + '_stream_huge' + CLUSTER_HASH_SLOT,
  TEST_STREAM_GROUP_1: TEST_RUN_ID + '_stream_group_1',
  TEST_STREAM_CONSUMER_1: TEST_RUN_ID + '_stream_consumer_1',
  TEST_STREAM_GROUP_2: TEST_RUN_ID + '_stream_group_2',
  TEST_STREAM_CONSUMER_2: TEST_RUN_ID + '_stream_consumer_2',
  TEST_STREAM_KEY_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('streamk'),
    unprintableBuf,
  ]),
  get TEST_STREAM_KEY_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_STREAM_KEY_BIN_BUFFER_1] };
  },
  get TEST_STREAM_KEY_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_STREAM_KEY_BIN_BUFFER_1);
  },
  get TEST_STREAM_KEY_BIN_UTF8_1() {
    return this.TEST_STREAM_KEY_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_STREAM_FIELD_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('streamf'),
    unprintableBuf,
  ]),
  get TEST_STREAM_FIELD_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_STREAM_FIELD_BIN_BUFFER_1] };
  },
  get TEST_STREAM_FIELD_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_STREAM_FIELD_BIN_BUFFER_1);
  },
  get TEST_STREAM_FIELD_BIN_UTF8_1() {
    return this.TEST_STREAM_FIELD_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_STREAM_VALUE_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('streamv'),
    unprintableBuf,
  ]),
  get TEST_STREAM_VALUE_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_STREAM_VALUE_BIN_BUFFER_1] };
  },
  get TEST_STREAM_VALUE_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_STREAM_VALUE_BIN_BUFFER_1);
  },
  get TEST_STREAM_VALUE_BIN_UTF8_1() {
    return this.TEST_STREAM_VALUE_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_STREAM_GROUP_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('streamg'),
    unprintableBuf,
  ]),
  get TEST_STREAM_GROUP_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_STREAM_GROUP_BIN_BUFFER_1] };
  },
  get TEST_STREAM_GROUP_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_STREAM_GROUP_BIN_BUFFER_1);
  },
  get TEST_STREAM_GROUP_BIN_UTF8_1() {
    return this.TEST_STREAM_GROUP_BIN_BUFFER_1.toString('utf-8');
  },
  TEST_STREAM_CONSUMER_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('streamc'),
    unprintableBuf,
  ]),
  get TEST_STREAM_CONSUMER_BIN_BUF_OBJ_1() {
    return {
      type: 'Buffer',
      data: [...this.TEST_STREAM_CONSUMER_BIN_BUFFER_1],
    };
  },
  get TEST_STREAM_CONSUMER_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_STREAM_CONSUMER_BIN_BUFFER_1);
  },
  get TEST_STREAM_CONSUMER_BIN_UTF8_1() {
    return this.TEST_STREAM_CONSUMER_BIN_BUFFER_1.toString('utf-8');
  },

  // ReJSON-RL
  TEST_REJSON_TYPE: 'ReJSON-RL',
  TEST_REJSON_KEY_1: TEST_RUN_ID + '_rejson_1' + CLUSTER_HASH_SLOT,
  TEST_REJSON_VALUE_1: { test: 'value' },
  TEST_REJSON_EXPIRE_1: KEY_TTL,
  TEST_REJSON_KEY_2: TEST_RUN_ID + '_rejson_2' + CLUSTER_HASH_SLOT,
  TEST_REJSON_VALUE_2: [{ obj: 1 }],
  TEST_REJSON_EXPIRE_2: KEY_TTL,
  TEST_REJSON_KEY_3: TEST_RUN_ID + '_rejson_3' + CLUSTER_HASH_SLOT,
  TEST_REJSON_VALUE_3: {
    array: [{ obj: 1 }, 2, 3],
    object: { some: randomBytes(1024).toString('hex'), field: 'value' },
  },
  TEST_REJSON_EXPIRE_3: KEY_TTL,
  TEST_REJSON_KEY_BIN_BUFFER_1: Buffer.concat([
    Buffer.from(TEST_RUN_ID),
    Buffer.from('setk'),
    unprintableBuf,
  ]),
  get TEST_REJSON_KEY_BIN_BUF_OBJ_1() {
    return { type: 'Buffer', data: [...this.TEST_REJSON_KEY_BIN_BUFFER_1] };
  },
  get TEST_REJSON_KEY_BIN_ASCII_1() {
    return getASCIISafeStringFromBuffer(this.TEST_REJSON_KEY_BIN_BUFFER_1);
  },
  get TEST_REJSON_KEY_BIN_UTF8_1() {
    return this.TEST_REJSON_KEY_BIN_BUFFER_1.toString('utf-8');
  },

  // TSDB-TYPE
  TEST_TS_TYPE: 'TSDB-TYPE',
  TEST_TS_KEY_1: TEST_RUN_ID + '_ts_1' + CLUSTER_HASH_SLOT,
  TEST_TS_TIMESTAMP_1: 1627537290803,
  TEST_TS_VALUE_1: 10,
  TEST_TS_TIMESTAMP_2: 1627537290804,
  TEST_TS_VALUE_2: 20,

  // Graph
  TEST_GRAPH_TYPE: 'graphdata',
  TEST_GRAPH_KEY_1: TEST_RUN_ID + '_graph_1' + CLUSTER_HASH_SLOT,
  TEST_GRAPH_NODE_1: TEST_RUN_ID + 'n1',
  TEST_GRAPH_NODE_2: TEST_RUN_ID + 'n2',

  // RediSearch
  TEST_SEARCH_HASH_TYPE: 'hash',
  TEST_SEARCH_HASH_INDEX_1:
    TEST_RUN_ID + '_hash_search_idx_1' + CLUSTER_HASH_SLOT,
  TEST_SEARCH_HASH_KEY_PREFIX_1: TEST_RUN_ID + '_hash_search:',
  TEST_SEARCH_HASH_INDEX_2:
    TEST_RUN_ID + '_hash_search_idx_2' + CLUSTER_HASH_SLOT,
  TEST_SEARCH_HASH_KEY_PREFIX_2: TEST_RUN_ID + '_hash_search:',
  TEST_SEARCH_JSON_INDEX_1:
    TEST_RUN_ID + '_json_search_idx_1' + CLUSTER_HASH_SLOT,
  TEST_SEARCH_JSON_KEY_PREFIX_1: TEST_RUN_ID + '_json_search:',

  // Command Executions
  TEST_COMMAND_EXECUTION_ID_1: uuidv4(),

  // Plugins
  TEST_PLUGIN_VISUALIZATION_ID_1: uuidv4(),

  // Pub/Sub
  TEST_PUB_SUB_CHANNEL_1: 'channel-a',
  TEST_PUB_SUB_CHANNEL_2: 'channel-b',
  TEST_PUB_SUB_CHANNEL_3: 'channel-c',
  TEST_PUB_SUB_P_CHANNEL_1: '*',
  TEST_PUB_SUB_MESSAGE_1: 'message-a',
  TEST_PUB_SUB_MESSAGE_2: 'message-b',
  TEST_PUB_SUB_MESSAGE_3: 'message-c',

  // Notifications
  TEST_NOTIFICATION_1: {
    timestamp: 1656054100,
    title: 'Title-1',
    category: 'Release',
    categoryColor: '#ea14fd',
    body: 'Body-1',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_2: {
    timestamp: 1656054200,
    title: 'Title-2',
    category: 'News',
    categoryColor: null,
    body: 'Body-2',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_3: {
    timestamp: 1656054300,
    title: 'Title-3',
    category: null,
    categoryColor: null,
    body: 'Body-3',
    read: true,
    type: 'global',
  },
  TEST_NOTIFICATION_NE_1: {
    timestamp: 1656054101,
    title: 'Title-1',
    body: 'Body-1',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_NE_2: {
    timestamp: 1656054201,
    title: 'Title-2',
    body: 'Body-2',
    read: false,
    type: 'global',
  },
  TEST_NOTIFICATION_NE_3: {
    timestamp: 1656054303,
    title: 'Title-3',
    body: 'Body-3',
    read: true,
    type: 'global',
  },

  // Database Analysis
  TEST_DATABASE_ANALYSIS_ID_1: uuidv4(),
  TEST_DATABASE_ANALYSIS_CREATED_AT_1: new Date(),
  TEST_DATABASE_ANALYSIS_DELIMITER_1: ':',
  TEST_DATABASE_ANALYSIS_DB_1: 2,
  TEST_DATABASE_ANALYSIS_FILTER_1: {
    type: null,
    match: '*',
    count: 10_000,
  },
  TEST_DATABASE_ANALYSIS_PROGRESS_1: {
    total: 1_000_000,
    scanned: 10_000,
    processed: 10_000,
  },
  TEST_DATABASE_ANALYSIS_TOTAL_KEYS_1: {
    total: 10_000,
    types: [
      {
        type: 'string',
        total: 50_000,
      },
      {
        type: 'list',
        total: 50_000,
      },
    ],
  },
  TEST_DATABASE_ANALYSIS_TOTAL_MEMORY_1: {
    total: 10_000_000,
    types: [
      {
        type: 'string',
        total: 5_000_000,
      },
      {
        type: 'list',
        total: 5_000_000,
      },
    ],
  },
  TEST_DATABASE_ANALYSIS_TOP_KEYS_NSP_1: {
    nsp: 'Namespace',
    memory: 10_000_000,
    keys: 10_000_000,
    types: [
      {
        type: 'string',
        keys: 5_000,
        memory: 5_000_000,
      },
      {
        type: 'list',
        keys: 5_000,
        memory: 5_000_000,
      },
    ],
  },
  TEST_DATABASE_ANALYSIS_TOP_MEMORY_NSP_1: {
    nsp: 'Namespace',
    memory: 10_000_000,
    keys: 10_000_000,
    types: [
      {
        type: 'string',
        keys: 5_000,
        memory: 5_000_000,
      },
      {
        type: 'list',
        keys: 5_000,
        memory: 5_000_000,
      },
    ],
  },
  TEST_DATABASE_ANALYSIS_TOP_KEYS_1: {
    name: 'Key Name',
    type: 'string',
    memory: 1_000,
    length: 1_000,
    ttl: -1,
  },
  TEST_DATABASE_ANALYSIS_EXPIRATION_GROUP_1: {
    label: '1-4 Hrs',
    total: 10_000_000,
    threshold: 4 * 60 * 60 * 1000,
  },

  // recommendations
  TEST_RECOMMENDATIONS_DATABASE_ID: uuidv4(),
  TEST_RECOMMENDATION_ID_1: uuidv4(),
  TEST_RECOMMENDATION_ID_2: uuidv4(),
  TEST_RECOMMENDATION_ID_3: uuidv4(),

  TEST_RECOMMENDATION_VOTE: Vote.Like,
  TEST_RECOMMENDATION_HIDE: true,

  TEST_RECOMMENDATION_NAME_1: RECOMMENDATION_NAMES.BIG_SETS,
  TEST_RECOMMENDATION_NAME_2: RECOMMENDATION_NAMES.BIG_STRINGS,
  TEST_RECOMMENDATION_NAME_3: RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES,

  TEST_LUA_DATABASE_ANALYSIS_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.LUA_SCRIPT,
  },
  TEST_BIG_HASHES_DATABASE_ANALYSIS_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.BIG_HASHES,
  },
  TEST_SMALLER_KEYS_DATABASE_ANALYSIS_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.USE_SMALLER_KEYS,
  },
  TEST_INCREASE_SET_MAX_INTSET_ENTRIES_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.INCREASE_SET_MAX_INTSET_ENTRIES,
  },
  TEST_COMBINE_SMALL_STRING_TO_HASHES_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.COMBINE_SMALL_STRINGS_TO_HASHES,
  },
  TEST_HASH_HASHTABLE_TO_ZIPLIST_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.HASH_HASHTABLE_TO_ZIPLIST,
  },
  TEST_COMPRESS_HASH_FIELD_NAMES_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.COMPRESS_HASH_FIELD_NAMES,
  },
  TEST_COMPRESSION_FOR_LIST_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.COMPRESSION_FOR_LIST,
  },
  TEST_BIG_STRINGS_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.BIG_STRINGS,
  },

  TEST_ZSET_HASHTABLE_TO_ZIPLIST_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.ZSET_HASHTABLE_TO_ZIPLIST,
  },

  TEST_BIG_SETS_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.BIG_SETS,
  },

  TEST_SET_PASSWORD_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.SET_PASSWORD,
  },

  TEST_RTS_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.RTS,
  },

  TEST_REDIS_VERSION_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.REDIS_VERSION,
  },

  TEST_SEARCH_JSON_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.SEARCH_JSON,
  },

  TEST_SEARCH_INDEXES_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.SEARCH_INDEXES,
  },

  TEST_SEARCH_HASH_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.SEARCH_HASH,
  },

  TEST_LUA_SCRIPT_VOTE_RECOMMENDATION: {
    name: RECOMMENDATION_NAMES.LUA_SCRIPT,
    vote: 'useful',
  },
  TEST_BROWSER_HISTORY_DATABASE_ID: uuidv4(),
  TEST_BROWSER_HISTORY_ID_1: uuidv4(),
  TEST_BROWSER_HISTORY_ID_2: uuidv4(),
  TEST_BROWSER_HISTORY_ID_3: uuidv4(),
  TEST_BROWSER_HISTORY_FILTER_1: {
    type: null,
    match: 'hi',
  },
  TEST_BROWSER_HISTORY_FILTER_2: {
    type: null,
    match: 'hi',
  },
  TEST_TRIGGERED_FUNCTIONS_LIBRARY_NAME: TEST_LIBRARY_NAME,
  TEST_TRIGGERED_FUNCTIONS_CODE: `#!js api_version=1.0 name=${TEST_LIBRARY_NAME}\n redis.registerFunction('foo', ()=>{return 'bar'})`,
  TEST_TRIGGERED_FUNCTIONS_CONFIGURATION: '{}',

  TEST_ANALYTICS_EVENT: TelemetryEvents.RedisInstanceAdded,
  TEST_ANALYTICS_EVENT_DATA: { length: 5 },
  TEST_ANALYTICS_PAGE,

  TEST_DATA_DIR: process.env.TEST_DATA_DIR || `${TEST_RUN_DIR}/data`,
  // etc...
};
