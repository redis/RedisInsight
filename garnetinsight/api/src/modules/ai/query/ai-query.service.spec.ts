import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockAiQueryAiIntermediateStep,
  mockAiQueryAiIntermediateStep2,
  mockAiQueryAiResponse,
  mockAiQueryContextRepository,
  mockAiQueryDatabaseId,
  mockAiQueryHistory,
  mockAiQueryIndex,
  mockAiQueryIndexContext,
  mockAiQueryMessageRepository,
  mockAiQueryProvider,
  mockCloudUserApiService,
  mockDatabaseClientFactory,
  mockSendAiChatMessageDto,
  mockSessionMetadata,
  mockStandaloneRedisClient,
  MockType,
} from 'src/__mocks__';
import { LocalAiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/local.ai-query-auth.provider';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { AiQueryService } from 'src/modules/ai/query/ai-query.service';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { AiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/ai-query-auth.provider';
import { AiQueryMessageRepository } from 'src/modules/ai/query/repositories/ai-query.message.repository';
import { AiQueryContextRepository } from 'src/modules/ai/query/repositories/ai-query.context.repository';
import {
  AiQueryServerErrors,
  AiQueryWsEvents,
} from 'src/modules/ai/query/models';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { AiQueryRateLimitRequestException } from 'src/modules/ai/query/exceptions';
import * as ContextUtil from './utils/context.util';

describe('AiQueryService', () => {
  let wsServer;
  let serverSocket;
  let clientSocket;
  let mockResponse;
  let httpServer;
  let service: AiQueryService;
  let aiQueryProvider: MockType<AiQueryProvider>;
  let cloudUserApiService: MockType<CloudUserApiService>;
  let aiQueryContextRepository: MockType<AiQueryContextRepository>;

  beforeAll((done) => {
    httpServer = createServer();
    wsServer = new Server(httpServer);
    httpServer.listen(() => {
      done();
    });
  });

  afterAll(() => {
    clientSocket.disconnect();
    serverSocket.disconnect();
    wsServer.close();
    httpServer?.stop?.();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiQueryService,
        {
          provide: AiQueryProvider,
          useFactory: mockAiQueryProvider,
        },
        {
          provide: AiQueryAuthProvider,
          useClass: LocalAiQueryAuthProvider,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: AiQueryMessageRepository,
          useFactory: mockAiQueryMessageRepository,
        },
        {
          provide: AiQueryContextRepository,
          useFactory: mockAiQueryContextRepository,
        },
        {
          provide: AiQueryMessageRepository,
          useFactory: mockAiQueryMessageRepository,
        },
        {
          provide: CloudUserApiService,
          useFactory: mockCloudUserApiService,
        },
      ],
    }).compile();

    service = module.get(AiQueryService);
    aiQueryProvider = module.get(AiQueryProvider);
    cloudUserApiService = module.get(CloudUserApiService);
    aiQueryContextRepository = module.get(AiQueryContextRepository);
  });

  describe('stream', () => {
    let getIndexContextSpy;

    beforeEach((done) => {
      mockResponse = {
        content: '',
        write(chunk) {
          this.content += chunk;
        },
        end: jest.fn(),
        reset() {
          this.content = '';
        },
      };

      getIndexContextSpy = jest.spyOn(ContextUtil, 'getIndexContext');
      getIndexContextSpy.mockResolvedValue(mockAiQueryIndexContext);

      clientSocket = io(
        `http://localhost:${(httpServer.address() as AddressInfo).port}`,
      );
      wsServer.on('connection', (socket) => {
        serverSocket = socket;
      });

      aiQueryProvider.getSocket.mockResolvedValue(clientSocket);

      clientSocket.on('connect', done);
    });

    afterEach(() => {
      expect(clientSocket.connected).toEqual(false);
    });

    it('should stream an answer', async () => {
      serverSocket.once(
        AiQueryWsEvents.STREAM,
        (_content, _context, _history, _opts, cb) => {
          serverSocket.emit(
            AiQueryWsEvents.REPLY_CHUNK,
            mockAiQueryAiResponse.content,
          );
          cb({ status: 'ok' });
        },
      );

      await expect(
        service.stream(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockSendAiChatMessageDto,
          mockResponse as any,
        ),
      ).resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiQueryAiResponse.content);
    });
    it('should not fail in case of empty ack', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([
        'aggregate',
        'results',
      ]);
      serverSocket.once(
        AiQueryWsEvents.STREAM,
        (_content, _context, _history, _opts, cb) => {
          serverSocket.emit(
            AiQueryWsEvents.TOOL_CALL,
            JSON.stringify(mockAiQueryAiIntermediateStep),
          );
          serverSocket.emit(
            AiQueryWsEvents.TOOL_REPLY,
            JSON.stringify(mockAiQueryAiIntermediateStep2),
          );
          serverSocket
            .emitWithAck(AiQueryWsEvents.GET_INDEX, mockAiQueryIndex)
            .then((indexContext) => {
              expect(indexContext).toEqual(mockAiQueryIndexContext);

              return serverSocket.emitWithAck(AiQueryWsEvents.RUN_QUERY, [
                'ft.aggregate',
              ]);
            })
            .then((queryResult) => {
              expect(queryResult).toEqual(['aggregate', 'results']);
              serverSocket.emit(
                AiQueryWsEvents.REPLY_CHUNK,
                mockAiQueryAiResponse.content,
              );
              cb();
            });
        },
      );

      await expect(
        service.stream(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockSendAiChatMessageDto,
          mockResponse as any,
        ),
      ).resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiQueryAiResponse.content);
    });
    it('should calculate index and get from cache on 2nd attempt and send error on 3d attempt', async () => {
      serverSocket.once(
        AiQueryWsEvents.STREAM,
        (_content, _context, _history, _opts, cb) => {
          aiQueryContextRepository.getIndexContext.mockResolvedValueOnce(null);
          aiQueryContextRepository.getIndexContext.mockResolvedValueOnce({
            cached: 'cached',
          });
          aiQueryContextRepository.getIndexContext.mockRejectedValueOnce(
            new Error('Something is wrong'),
          );
          serverSocket
            .emitWithAck(AiQueryWsEvents.GET_INDEX, mockAiQueryIndex)
            .then((indexContext) => {
              // calculated
              expect(indexContext).toEqual(mockAiQueryIndexContext);

              return serverSocket.emitWithAck(
                AiQueryWsEvents.GET_INDEX,
                mockAiQueryIndex,
              );
            })
            .then((indexContext) => {
              // cached
              expect(indexContext).toEqual({ cached: 'cached' });

              return serverSocket.emitWithAck(
                AiQueryWsEvents.GET_INDEX,
                mockAiQueryIndex,
              );
            })
            .then((error) => {
              // error
              expect(error).toEqual('Something is wrong');
              serverSocket.emit(
                AiQueryWsEvents.REPLY_CHUNK,
                mockAiQueryAiResponse.content,
              );
              cb();
            });
        },
      );

      await expect(
        service.stream(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockSendAiChatMessageDto,
          mockResponse as any,
        ),
      ).resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiQueryAiResponse.content);
    });
    it('should return errors for run queries', async () => {
      serverSocket.once(
        AiQueryWsEvents.STREAM,
        (_content, _context, _history, _opts, cb) => {
          when(mockStandaloneRedisClient.sendCommand)
            .calledWith(
              expect.arrayContaining(['FT.AGGREGATE', 'BAD ARGS']),
              expect.anything(),
            )
            .mockRejectedValue(new Error('ERR: invalid command syntax'));

          serverSocket
            .emitWithAck(AiQueryWsEvents.RUN_QUERY, ['FLUSHALL'])
            .then((result) => {
              // error due to white list
              expect(result).toEqual('-ERR: This command is not allowed');

              return serverSocket.emitWithAck(AiQueryWsEvents.RUN_QUERY, null);
            })
            .then((result) => {
              // error due to white list when no query was sent
              expect(result).toEqual('-ERR: This command is not allowed');

              return serverSocket.emitWithAck(AiQueryWsEvents.RUN_QUERY, [
                'FT.AGGREGATE',
                'BAD ARGS',
              ]);
            })
            .then((result) => {
              // execution error
              expect(result).toEqual('ERR: invalid command syntax');
              serverSocket.emit(
                AiQueryWsEvents.REPLY_CHUNK,
                mockAiQueryAiResponse.content,
              );
              cb();
            });
        },
      );

      await expect(
        service.stream(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockSendAiChatMessageDto,
          mockResponse as any,
        ),
      ).resolves.toEqual(undefined);

      expect(mockResponse.content).toEqual(mockAiQueryAiResponse.content);
    });
    it('should fail when ack has error property', async () => {
      serverSocket.once(
        AiQueryWsEvents.STREAM,
        (_content, _context, _history, _opts, cb) => {
          cb({ error: { error: AiQueryServerErrors.RateLimitRequest } });
        },
      );

      await expect(
        service.stream(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockSendAiChatMessageDto,
          mockResponse as any,
        ),
      ).rejects.toThrow(AiQueryRateLimitRequestException);
    });
  });

  describe('getHistory', () => {
    it('should get history', async () => {
      expect(
        await service.getHistory(mockSessionMetadata, mockAiQueryDatabaseId),
      ).toEqual(mockAiQueryHistory);
    });

    it('should get history from 2nd attempt', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );

      expect(
        await service.getHistory(mockSessionMetadata, mockAiQueryDatabaseId),
      ).toEqual(mockAiQueryHistory);
    });

    it('throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      cloudUserApiService.getUserSession.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );

      await expect(
        service.getHistory(mockSessionMetadata, mockAiQueryDatabaseId),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });

  describe('clearHistory', () => {
    it('should clear history', async () => {
      expect(
        await service.clearHistory(mockSessionMetadata, mockAiQueryDatabaseId),
      ).toEqual(undefined);
    });

    it('should clear history from 2nd attempt', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );

      expect(
        await service.clearHistory(mockSessionMetadata, mockAiQueryDatabaseId),
      ).toEqual(undefined);
    });

    it('throw CloudApiUnauthorizedException exception', async () => {
      cloudUserApiService.getUserSession.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      cloudUserApiService.getUserSession.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );

      await expect(
        service.clearHistory(mockSessionMetadata, mockAiQueryDatabaseId),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
});
