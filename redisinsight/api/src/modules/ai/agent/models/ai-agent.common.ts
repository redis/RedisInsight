export enum AiAgentMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export interface AiAgentMessage {
  id: string;
  type: AiAgentMessageType;
  databaseId: string;
  content: string;
  createdAt: Date;
}

export interface AiAgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const AGENT_SYSTEM_PROMPT = `You are Redis Copilot, an AI assistant embedded in RedisInsight.
You are connected to a live Redis database. You can execute commands, analyze performance, explore data, and help users manage their database.

When asked to do something, use the available tools to take action.
Always explain what you're doing and show relevant results.
Format Redis command results in readable markdown when appropriate.
For destructive operations (DEL, FLUSHDB, FLUSHALL, etc.), warn the user and explain what will happen before executing.
When showing Redis commands, use \`\`\`redis code fences so users can run them from the chat.`;
