import { v4 as uuidv4 } from 'uuid';
import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import {
  ClientContext,
  ClientMetadata,
  SessionMetadata,
} from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import config, { Config } from 'src/utils/config';
import { AiAgentLlmProvider } from './providers/ai-agent-llm.provider';
import { AiAgentToolRegistry } from './tools/ai-agent.tools';
import { SendAiAgentMessageDto } from './dto/send.ai-agent.message.dto';
import {
  AiAgentMessage,
  AiAgentMessageType,
  AGENT_SYSTEM_PROMPT,
} from './models';
import { wrapAgentError } from './exceptions';

const aiConfig = config.get('ai') as Config['ai'];

interface ConversationStore {
  messages: AiAgentMessage[];
}

const conversationStore = new Map<string, ConversationStore>();

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger('AiAgentService');

  constructor(
    private readonly llmProvider: AiAgentLlmProvider,
    private readonly toolRegistry: AiAgentToolRegistry,
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly bulkImportService: BulkImportService,
  ) {}

  async stream(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: SendAiAgentMessageDto,
    res: Response,
  ): Promise<void> {
    try {
      const clientMetadata: ClientMetadata = {
        sessionMetadata,
        databaseId,
        context: ClientContext.AI,
      };

      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      const store = this.getOrCreateStore(databaseId);

      const question: AiAgentMessage = {
        id: uuidv4(),
        type: AiAgentMessageType.HumanMessage,
        databaseId,
        content: dto.content,
        createdAt: new Date(),
      };
      store.messages.push(question);

      const llmMessages = this.buildLlmMessages(store.messages);
      const toolDefs = this.toolRegistry.getToolDefinitions();
      const maxRounds = aiConfig.agent.maxToolRounds;

      let answerContent = '';
      let toolRounds = 0;

      while (toolRounds < maxRounds) {
        const response = await this.llmProvider.chatWithTools(
          llmMessages,
          toolDefs,
        );

        if (response.toolCalls.length > 0) {
          llmMessages.push({
            role: 'assistant',
            content: response.content,
            tool_calls: response.toolCalls.map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          });

          for (const toolCall of response.toolCalls) {
            const statusMsg = `\n> **Tool:** ${this.formatToolName(toolCall.name)}...\n\n`;
            res.write(statusMsg);
            answerContent += statusMsg;

            const result = await this.toolRegistry.execute(
              toolCall.name,
              toolCall.arguments,
              {
                client,
                clientMetadata,
                bulkImportService: this.bulkImportService,
              },
            );

            llmMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: result,
            });
          }

          toolRounds++;
        } else {
          const finalMessages = [...llmMessages];
          if (response.content) {
            res.write(response.content);
            answerContent += response.content;
          } else {
            for await (const chunk of this.llmProvider.chatStream(
              finalMessages,
            )) {
              res.write(chunk);
              answerContent += chunk;
            }
          }
          break;
        }
      }

      if (toolRounds >= maxRounds) {
        const maxMsg = '\n\n*Reached maximum tool execution rounds.*';
        res.write(maxMsg);
        answerContent += maxMsg;
      }

      const answer: AiAgentMessage = {
        id: uuidv4(),
        type: AiAgentMessageType.AiMessage,
        databaseId,
        content: answerContent,
        createdAt: new Date(),
      };
      store.messages.push(answer);

      res.end();
    } catch (e) {
      this.logger.error('Agent stream error', e);
      throw wrapAgentError(e, 'Unable to process agent request');
    }
  }

  async getHistory(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<AiAgentMessage[]> {
    const store = conversationStore.get(databaseId);
    return store?.messages ?? [];
  }

  async clearHistory(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    conversationStore.delete(databaseId);
  }

  private getOrCreateStore(databaseId: string): ConversationStore {
    let store = conversationStore.get(databaseId);
    if (!store) {
      store = { messages: [] };
      conversationStore.set(databaseId, store);
    }
    return store;
  }

  private buildLlmMessages(
    history: AiAgentMessage[],
  ): ChatCompletionMessageParam[] {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
    ];

    for (const msg of history) {
      switch (msg.type) {
        case AiAgentMessageType.HumanMessage:
          messages.push({ role: 'user', content: msg.content });
          break;
        case AiAgentMessageType.AiMessage:
          messages.push({ role: 'assistant', content: msg.content });
          break;
        default:
          break;
      }
    }

    return messages;
  }

  private formatToolName(name: string): string {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
