import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SessionMetadataAdapter } from 'src/modules/auth/session-metadata/adapters/session-metadata.adapter';

const createBaseBindMessageHandlersMock = () => {
  const mockBaseBindMessageHandlers = jest.fn();

  jest
    .spyOn(IoAdapter.prototype, 'bindMessageHandlers')
    .mockImplementation(() => {
      mockBaseBindMessageHandlers();
    });

  return mockBaseBindMessageHandlers;
};

const createMockSocket = () =>
  ({
    request: {},
    disconnect: jest.fn(),
    data: {},
    join: jest.fn(),
  }) as unknown as Socket;

describe('Session metadata adapater', () => {
  let app: INestApplication;
  let sessionMetadataAdapter: SessionMetadataAdapter;
  let mockSocket: Socket;
  let mockBaseBindMessageHandlers: ReturnType<
    typeof createBaseBindMessageHandlersMock
  >;

  beforeEach(() => {
    jest.resetAllMocks();
    mockSocket = createMockSocket();
    mockBaseBindMessageHandlers = createBaseBindMessageHandlersMock();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    sessionMetadataAdapter = new SessionMetadataAdapter();
    app.useWebSocketAdapter(sessionMetadataAdapter);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should attach session metadata and join a room for the user id', async () => {
    await sessionMetadataAdapter.bindMessageHandlers(mockSocket, [], jest.fn());

    expect(mockBaseBindMessageHandlers).toHaveBeenCalledTimes(1);
    expect(mockSocket.data).toEqual({
      sessionMetadata: {
        sessionId: '1',
        userId: '1',
      },
    });
    expect(mockSocket.join).toHaveBeenCalledTimes(1);
    expect(mockSocket.join).toHaveBeenCalledWith('user:1');
  });
});
