import { Module, Type } from '@nestjs/common';
import { AiQueryController } from 'src/modules/ai/query/ai-query.controller';
import { AiQueryProvider } from 'src/modules/ai/query/providers/ai-query.provider';
import { AiQueryService } from 'src/modules/ai/query/ai-query.service';
import { AiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/ai-query-auth.provider';
import { LocalAiQueryAuthProvider } from 'src/modules/ai/query/providers/auth/local.ai-query-auth.provider';
import { AiQueryMessageRepository } from 'src/modules/ai/query/repositories/ai-query.message.repository';
import { LocalAiQueryMessageRepository } from 'src/modules/ai/query/repositories/local.ai-query.message.repository';
import { AiQueryContextRepository } from 'src/modules/ai/query/repositories/ai-query.context.repository';
import { InMemoryAiQueryContextRepository } from 'src/modules/ai/query/repositories/in-memory.ai-query.context.repository';

@Module({})
export class AiQueryModule {
  static register(
    aiQueryAuthProvider: Type<AiQueryAuthProvider> = LocalAiQueryAuthProvider,
    aiQueryMessageRepository: Type<AiQueryMessageRepository> = LocalAiQueryMessageRepository,
    aiQueryContextRepository: Type<AiQueryContextRepository> = InMemoryAiQueryContextRepository,
  ) {
    return {
      module: AiQueryModule,
      controllers: [AiQueryController],
      providers: [
        AiQueryProvider,
        AiQueryService,
        {
          provide: AiQueryAuthProvider,
          useClass: aiQueryAuthProvider,
        },
        {
          provide: AiQueryMessageRepository,
          useClass: aiQueryMessageRepository,
        },
        {
          provide: AiQueryContextRepository,
          useClass: aiQueryContextRepository,
        },
      ],
    };
  }
}
