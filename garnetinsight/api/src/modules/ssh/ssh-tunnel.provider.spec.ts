import { Test, TestingModule } from '@nestjs/testing';
import { mockDatabaseWithSshBasic } from 'src/__mocks__';
import { SshTunnelProvider } from 'src/modules/ssh/ssh-tunnel.provider';
import { EventEmitter } from 'events';
import { UnableToCreateTunnelException } from 'src/modules/ssh/exceptions';
import * as tunnelSsh from 'tunnel-ssh';

jest.mock('tunnel-ssh', () => ({
  ...(jest.requireActual('tunnel-ssh') as object),
}));

describe('SshTunnelProvider', () => {
  let service: SshTunnelProvider;
  let mockClient;
  let mockServer;
  let tunnelSshSpy;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SshTunnelProvider],
    }).compile();

    service = await module.get(SshTunnelProvider);

    mockClient = new EventEmitter();
    mockClient.connect = jest.fn();
    mockServer = new EventEmitter();
    mockServer.listen = jest.fn(() => mockServer.emit('listening'));
    mockServer.address = jest
      .fn()
      .mockReturnValue({ address: '127.0.0.1', port: 50000 });
    tunnelSshSpy = jest.spyOn(tunnelSsh, 'createTunnel');
    tunnelSshSpy.mockImplementationOnce(() => [mockServer, mockClient]);
  });

  describe('createTunnel', () => {
    it('should create tunnel', (done) => {
      service
        .createTunnel(
          mockDatabaseWithSshBasic,
          mockDatabaseWithSshBasic.sshOptions,
        )
        .then((tnl) => {
          expect(tnl['client']).toEqual(mockClient);
          expect(tnl['server']).toEqual(mockServer);
          done();
        })
        .catch(done);
    });
    it('should fail due to server init error', (done) => {
      tunnelSshSpy.mockReset().mockImplementationOnce(() => {
        throw new Error('bb');
      });

      service
        .createTunnel(
          mockDatabaseWithSshBasic,
          mockDatabaseWithSshBasic.sshOptions,
        )
        .catch((e) => {
          expect(e).toBeInstanceOf(UnableToCreateTunnelException);
          done();
        });
    });
    it('should fail with error but not with unable to get property from "undefined"', (done) => {
      tunnelSshSpy.mockReset().mockImplementationOnce(() => {
        throw new Error('bb');
      });

      service.createTunnel(undefined, undefined).catch((e) => {
        expect(e).toBeInstanceOf(UnableToCreateTunnelException);
        done();
      });
    });
    it('should fail due to createServer failed, error "Cannot parse privateKey" message', (done) => {
      tunnelSshSpy.mockReset().mockImplementationOnce(() => {
        throw new Error('Cannot parse privateKey: due to some reason');
      });

      service
        .createTunnel(
          mockDatabaseWithSshBasic,
          mockDatabaseWithSshBasic.sshOptions,
        )
        .catch((e) => {
          expect(e).toBeInstanceOf(UnableToCreateTunnelException);
          expect(e.message).toEqual(
            'Unable to create tunnel. Cannot parse privateKey',
          );
          done();
        });
    });

    it('should fail due to createServer failed, error connect ECONNREFUSED', (done) => {
      const sshClientErrorMessage = 'connect ECONNREFUSED 127.0.0.1:22222';
      tunnelSshSpy.mockReset().mockImplementationOnce(() => {
        throw new Error(sshClientErrorMessage);
      });

      const sanitizedMessage = 'connect ECONNREFUSED';
      service
        .createTunnel(
          mockDatabaseWithSshBasic,
          mockDatabaseWithSshBasic.sshOptions,
        )
        .catch((e) => {
          expect(e).toBeInstanceOf(UnableToCreateTunnelException);
          expect(e.message).toEqual(
            `Unable to create tunnel. ${sanitizedMessage}`,
          );
          done();
        });
    });
  });
});
