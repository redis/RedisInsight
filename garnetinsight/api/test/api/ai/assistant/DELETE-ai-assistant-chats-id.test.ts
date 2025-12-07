import { describe, deps, getMainCheckFn, serverConfig } from '../../deps';
import { nock } from '../../../helpers/test';
import { mockAiChatId } from 'src/__mocks__';

const { server, request } = deps;

// endpoint to test
const endpoint = (id: string = mockAiChatId) =>
  request(server).delete(`/ai/assistant/chats/${id}`);

const aiAssistantNock = nock(serverConfig.get('ai').convAiApiUrl)
  .post('/reset')
  .reply(200);

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /ai/assistant/chats/:id', () => {
  [
    {
      name: 'Should reset chat by id',
      responseBody: {},
    },
    {
      name: 'Should return Unauthorized error',
      before: () => {
        aiAssistantNock.post('/reset').replyWithError({
          response: { status: 401 },
          message: 'Custom unauthorized message',
        });
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
