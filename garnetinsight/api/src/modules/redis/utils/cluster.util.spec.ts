import {
  mockRedisClusterFailInfoResponse,
  mockRedisClusterNodesResponse,
  mockRedisClusterOkInfoResponse,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { IRedisClusterNodeAddress, ReplyError } from 'src/models';
import { isCluster, discoverClusterNodes } from './cluster.util';

describe('isCluster', () => {
  it('cluster connection ok', async () => {
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(
      mockRedisClusterOkInfoResponse,
    );
    expect(await isCluster(mockStandaloneRedisClient)).toEqual(true);
  });

  it('cluster connection false', async () => {
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(
      mockRedisClusterFailInfoResponse,
    );
    expect(await isCluster(mockStandaloneRedisClient)).toEqual(false);
  });
  it('cluster not supported', async () => {
    mockStandaloneRedisClient.sendCommand.mockRejectedValue({
      name: 'ReplyError',
      message: 'ERR This instance has cluster support disabled',
      command: 'CLUSTER',
    });
    expect(await isCluster(mockStandaloneRedisClient)).toEqual(false);
  });
});

describe('discoverClusterNodes', () => {
  const mockClusterNodeAddresses: IRedisClusterNodeAddress[] = [
    {
      host: '127.0.0.1',
      port: 30004,
    },
    {
      host: '127.0.0.1',
      port: 30001,
    },
  ];

  it('should return nodes in a defined format', async () => {
    mockStandaloneRedisClient.sendCommand.mockResolvedValue(
      mockRedisClusterNodesResponse,
    );
    expect(await discoverClusterNodes(mockStandaloneRedisClient)).toEqual(
      mockClusterNodeAddresses,
    );
  });
  it('cluster not supported', async () => {
    const replyError: ReplyError = {
      name: 'ReplyError',
      message: 'ERR This instance has cluster support disabled',
      command: 'CLUSTER',
    };
    mockStandaloneRedisClient.sendCommand.mockRejectedValue(replyError);

    try {
      await discoverClusterNodes(mockStandaloneRedisClient);
      fail('Should throw an error');
    } catch (err) {
      expect(err).toEqual(replyError);
    }
  });
});
