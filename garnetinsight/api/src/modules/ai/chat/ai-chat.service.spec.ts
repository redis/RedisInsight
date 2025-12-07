import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockAiChat,
  mockAiChatId,
  mockAiResponseStream,
  mockConvAiProvider,
  mockSendAiChatMessageDto,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { AiChatService } from 'src/modules/ai/chat/ai-chat.service';
import { ConvAiProvider } from 'src/modules/ai/chat/providers/conv-ai.provider';
import { AiChat, AiChatMessage } from 'src/modules/ai/chat/models';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('AiChatService', () => {
  let service: AiChatService;
  let convAiProvider: MockType<ConvAiProvider>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiChatService,
        {
          provide: ConvAiProvider,
          useFactory: mockConvAiProvider,
        },
      ],
    }).compile();

    service = module.get(AiChatService);
    convAiProvider = module.get(ConvAiProvider);
  });

  describe('create', () => {
    it('should create chat and return id', async () => {
      const result = await service.create(mockSessionMetadata);
      expect(result).toEqual({ id: mockAiChatId });
      expect(result).toBeInstanceOf(AiChat);
      expect(convAiProvider.auth).toHaveBeenCalledWith(mockSessionMetadata);
    });
  });
  describe('postMessage', () => {
    it('should send message and return stream as result', async () => {
      const result = await service.postMessage(
        mockSessionMetadata,
        mockAiChatId,
        mockSendAiChatMessageDto,
      );
      expect(result).toEqual(mockAiResponseStream);
      expect(convAiProvider.postMessage).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockAiChatId,
        mockSendAiChatMessageDto.content,
      );
    });
  });
  describe('getHistory', () => {
    it('should get history', async () => {
      const result = await service.getHistory(
        mockSessionMetadata,
        mockAiChatId,
      );
      expect(result).toEqual(mockAiChat);
      expect(result).toBeInstanceOf(AiChat);
      result.messages.forEach((message) => {
        expect(message).toBeInstanceOf(AiChatMessage);
      });
      expect(convAiProvider.getHistory).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockAiChatId,
      );
    });
  });
  describe('delete', () => {
    it('should delete chat', async () => {
      expect(await service.delete(mockSessionMetadata, mockAiChatId)).toEqual(
        undefined,
      );
      expect(convAiProvider.reset).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockAiChatId,
      );
    });
  });
});
