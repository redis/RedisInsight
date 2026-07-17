import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WindowsAuthAdapter } from 'src/modules/auth/window-auth/adapters/window-auth.adapter';
import { WindowAuthService } from 'src/modules/auth/window-auth/window-auth.service';
import { mockDefaultSessionMetadata } from 'src/__mocks__';

const AUTHORIZED_WINDOW_ID = 'window-1';

const createBaseBindMessageHandlersMock = () => {
  const mockBaseBindMessageHandlers = jest.fn();

  jest
    .spyOn(IoAdapter.prototype, 'bindMessageHandlers')
    .mockImplementation(() => {
      mockBaseBindMessageHandlers();
    });

  return mockBaseBindMessageHandlers;
};

const createMockSocket = (windowId?: string) =>
  ({
    request: {},
    disconnect: jest.fn(),
    data: {},
    join: jest.fn(),
    handshake: { headers: windowId ? { 'x-window-id': windowId } : {} },
  }) as unknown as Socket;

describe('WindowsAuthAdapter', () => {
  let app: INestApplication;
  let adapter: WindowsAuthAdapter;
  let windowAuthService: WindowAuthService;
  let mockBaseBindMessageHandlers: ReturnType<
    typeof createBaseBindMessageHandlersMock
  >;

  const mockWindowAuthService = {
    isAuthorized: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockBaseBindMessageHandlers = createBaseBindMessageHandlersMock();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: WindowAuthService, useValue: mockWindowAuthService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    adapter = new WindowsAuthAdapter(app);
    app.useWebSocketAdapter(adapter);
    await app.init();
    windowAuthService = app.get(WindowAuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should attach session metadata, join the user room and bind handlers when the window id is authorized', async () => {
    (windowAuthService.isAuthorized as jest.Mock).mockResolvedValue(true);
    const socket = createMockSocket(AUTHORIZED_WINDOW_ID);

    await adapter.bindMessageHandlers(socket, [], jest.fn());

    expect(windowAuthService.isAuthorized).toHaveBeenCalledWith(
      AUTHORIZED_WINDOW_ID,
    );
    expect(mockBaseBindMessageHandlers).toHaveBeenCalledTimes(1);
    expect(socket.data).toEqual({
      sessionMetadata: mockDefaultSessionMetadata,
    });
    expect(socket.join).toHaveBeenCalledTimes(1);
    expect(socket.join).toHaveBeenCalledWith('user:1');
  });

  it('should disconnect the socket and bind nothing when the window id is not authorized', async () => {
    (windowAuthService.isAuthorized as jest.Mock).mockResolvedValue(false);
    const socket = createMockSocket();

    await adapter.bindMessageHandlers(socket, [], jest.fn());

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(mockBaseBindMessageHandlers).not.toHaveBeenCalled();
    expect(socket.data).toEqual({});
    expect(socket.join).not.toHaveBeenCalled();
  });
});
