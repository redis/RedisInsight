import { Module, Type } from '@nestjs/common';
import { SessionService } from 'src/modules/session/session.service';
import { SessionProvider } from 'src/modules/session/providers/session.provider';
import { SingleUserSessionProvider } from 'src/modules/session/providers/single-user.session.provider';
import { SessionStorage } from 'src/modules/session/providers/storage/session.storage';
import { InMemorySessionStorage } from 'src/modules/session/providers/storage/in-memory.session.storage';

@Module({})
export class SessionModule {
  static async register(
    sessionProvider: Type<SessionProvider> = SingleUserSessionProvider,
    sessionStorage: Type<SessionStorage> = InMemorySessionStorage,
  ) {
    return {
      module: SessionModule,
      providers: [
        SessionService,
        {
          provide: SessionProvider,
          useClass: sessionProvider,
        },
        {
          provide: SessionStorage,
          useClass: sessionStorage,
        },
      ],
      exports: [SessionService],
    };
  }
}
