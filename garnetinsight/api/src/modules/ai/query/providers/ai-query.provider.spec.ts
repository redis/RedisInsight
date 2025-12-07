import { Test, TestingModule } from '@nestjs/testing';
import { io } from 'socket.io-client';
import * as MockedSocket from 'socket.io-mock';
import { mockAiQueryAuth } from 'src/__mocks__';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { AiQueryWsEvents } from 'src/modules/ai/query/models';
import { BadRequestException } from '@nestjs/common';
import { AiQueryBadRequestException } from 'src/modules/ai/query/exceptions';

const mockSocketClient = new MockedSocket();
jest.mock('socket.io-client');

describe('AiQueryProvider', () => {
  let service: AiQueryProvider;

  beforeEach(async () => {
    (io as jest.Mock).mockReturnValue(mockSocketClient);

    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiQueryProvider],
    }).compile();

    service = module.get(AiQueryProvider);
  });

  describe('getSocket', () => {
    it('should successfully connect', (done) => {
      service
        .getSocket(mockAiQueryAuth)
        .then((socket) => {
          expect(socket).toEqual(mockSocketClient);
          done();
        })
        .catch(done);

      mockSocketClient.socketClient.emit(AiQueryWsEvents.CONNECT);
    });
    it('should fail with AiQueryBadRequestException', (done) => {
      service
        .getSocket(mockAiQueryAuth)
        .then(() => {
          done('Should fail');
        })
        .catch((e) => {
          expect(e).toEqual(
            new AiQueryBadRequestException('Unable to establish connection'),
          );
          done();
        });

      mockSocketClient.socketClient.emit(
        AiQueryWsEvents.CONNECT_ERROR,
        new BadRequestException(),
      );
    });
  });
});
