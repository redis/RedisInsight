import { Injectable, Logger } from '@nestjs/common';
import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { RedisClient } from 'src/modules/redis/client';
import { ClientMetadata } from 'src/common/models';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import { RUN_COMMAND_DEFINITION, executeRunCommand } from './run-command.tool';
import {
  GET_SLOW_LOGS_DEFINITION,
  executeGetSlowLogs,
} from './get-slow-logs.tool';
import {
  GET_DATABASE_OVERVIEW_DEFINITION,
  executeGetDatabaseOverview,
} from './get-database-overview.tool';
import { SCAN_KEYS_DEFINITION, executeScanKeys } from './scan-keys.tool';
import {
  LOAD_SAMPLE_DATA_DEFINITION,
  executeLoadSampleData,
} from './load-sample-data.tool';

export interface ToolContext {
  client: RedisClient;
  clientMetadata: ClientMetadata;
  bulkImportService: BulkImportService;
}

@Injectable()
export class AiAgentToolRegistry {
  private readonly logger = new Logger('AiAgentToolRegistry');

  getToolDefinitions(): ChatCompletionTool[] {
    return [
      RUN_COMMAND_DEFINITION,
      GET_DATABASE_OVERVIEW_DEFINITION,
      GET_SLOW_LOGS_DEFINITION,
      SCAN_KEYS_DEFINITION,
      LOAD_SAMPLE_DATA_DEFINITION,
    ];
  }

  async execute(
    toolName: string,
    argsJson: string,
    context: ToolContext,
  ): Promise<string> {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(argsJson);
    } catch {
      return `Error: Invalid JSON arguments for tool ${toolName}`;
    }

    this.logger.debug(`Executing tool: ${toolName}`);

    try {
      switch (toolName) {
        case 'run_redis_command':
          return await executeRunCommand(
            args as { command: string },
            context.client,
          );

        case 'get_database_overview':
          return await executeGetDatabaseOverview(args, context.client);

        case 'get_slow_logs':
          return await executeGetSlowLogs(
            args as { count?: number },
            context.client,
          );

        case 'scan_keys':
          return await executeScanKeys(
            args as { match?: string; count?: number; type?: string },
            context.client,
          );

        case 'load_sample_data':
          return await executeLoadSampleData(args, context.client, {
            bulkImportService: context.bulkImportService,
            clientMetadata: context.clientMetadata,
          });

        default:
          return `Error: Unknown tool "${toolName}"`;
      }
    } catch (e) {
      this.logger.warn(`Tool execution error: ${toolName}`, e);
      return `Error executing ${toolName}: ${e.message}`;
    }
  }
}
