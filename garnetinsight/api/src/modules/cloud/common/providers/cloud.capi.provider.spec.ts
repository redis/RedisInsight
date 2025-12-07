import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import config, { Config } from 'src/utils/config';
import { CloudCapiProvider } from './cloud.capi.provider';

const serverConfig = config.get('server') as Config['server'];

const getPrefixTests = [
  {
    input: undefined,
    expected: '',
  },
  {
    input: CloudSubscriptionType.Fixed,
    expected: '/fixed',
  },
  {
    input: CloudSubscriptionType.Flexible,
    expected: '',
  },
];

const userAgent = `Garnetinsight/${serverConfig.version}`;

const getHeadersTests = [
  {
    input: {},
    expected: {
      'x-api-key': undefined,
      'x-api-secret-key': undefined,
      'User-Agent': userAgent,
    },
  },
  {
    input: { capiKey: 'key' },
    expected: {
      'x-api-key': 'key',
      'x-api-secret-key': undefined,
      'User-Agent': userAgent,
    },
  },
  {
    input: { capiSecret: 'secret' },
    expected: {
      'x-api-key': undefined,
      'x-api-secret-key': 'secret',
      'User-Agent': userAgent,
    },
  },
  {
    input: { capiKey: 'key', capiSecret: 'secret' },
    expected: {
      'x-api-key': 'key',
      'x-api-secret-key': 'secret',
      'User-Agent': userAgent,
    },
  },
];

describe('CloudCapiProvider', () => {
  describe('getPrefix', () => {
    test.each(getPrefixTests)('%j', ({ input, expected }) => {
      expect(
        CloudCapiProvider.getPrefix(input as CloudSubscriptionType),
      ).toEqual(expected);
    });
  });

  describe('getHeaders', () => {
    test.each(getHeadersTests)('%j', ({ input, expected }) => {
      expect(
        CloudCapiProvider.getHeaders(input as ICloudCapiCredentials),
      ).toEqual({ headers: expected });
    });
  });
});
