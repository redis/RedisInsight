import { describe, deps, getMainCheckFn, serverConfig } from '../../deps';
import { nock } from '../../../helpers/test';
import {
  mockAiChatId,
  mockAiMessage1Response,
  mockHumanMessage1Response,
  mockSendAiChatMessageDto,
} from 'src/__mocks__';

const { server, request } = deps;

// endpoint to test
const endpoint = (id: string = mockAiChatId) =>
  request(server).post(`/ai/assistant/chats/${id}/messages`);

const aiAssistantNock = nock(serverConfig.get('ai').convAiApiUrl)
  .post('/chat')
  .query(true)
  .reply(200, mockAiMessage1Response.content);

const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /ai/assistant/chats/:id/messages', () => {
  [
    {
      name: 'Should respond with text',
      data: mockSendAiChatMessageDto,
      // todo: find a way to check response
      // responseBody: mockAiMessage1Response.content,
    },
    {
      name: 'Should return Unauthorized error',
      before: () => {
        aiAssistantNock
          .post('/chat')
          .query(true)
          .replyWithError({
            message: 'Custom unauthorized message',
            response: { status: 401 },
          });
      },
      data: {
        content: mockHumanMessage1Response.content,
      },
      statusCode: 401,
      responseBody: {
        statusCode: 401,
        error: 'ConvAiUnauthorized',
        message: 'Custom unauthorized message',
        errorCode: 11301,
      },
    },
  ].map(mainCheckFn);
});
