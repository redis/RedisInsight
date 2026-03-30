import { Module } from '@nestjs/common';
import { BulkActionsModule } from 'src/modules/bulk-actions/bulk-actions.module';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { AiAgentLlmProvider } from './providers/ai-agent-llm.provider';
import { AiAgentToolRegistry } from './tools/ai-agent.tools';

@Module({
  imports: [BulkActionsModule],
  controllers: [AiAgentController],
  providers: [AiAgentService, AiAgentLlmProvider, AiAgentToolRegistry],
})
export class AiAgentModule {}
