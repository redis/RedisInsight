import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import config, { Config } from 'src/utils/config';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

const aiConfig = config.get('ai') as Config['ai'];

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface LlmResponse {
  content: string | null;
  toolCalls: LlmToolCall[];
}

@Injectable()
export class AiAgentLlmProvider {
  private readonly logger = new Logger('AiAgentLlmProvider');

  private readonly client: OpenAI;

  private readonly model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.agent.apiKey,
      baseURL: aiConfig.agent.apiUrl,
    });
    this.model = aiConfig.agent.model;
  }

  async chatWithTools(
    messages: ChatCompletionMessageParam[],
    tools: ChatCompletionTool[],
  ): Promise<LlmResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      stream: false,
    });

    const choice = response.choices[0];
    const toolCalls: LlmToolCall[] = (choice.message.tool_calls || [])
      .filter(
        (
          tc,
        ): tc is typeof tc & {
          type: 'function';
          function: { name: string; arguments: string };
        } => tc.type === 'function',
      )
      .map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      }));

    return {
      content: choice.message.content,
      toolCalls,
    };
  }

  async *chatStream(
    messages: ChatCompletionMessageParam[],
  ): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}
