/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamicModule, Module, Type } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DatabaseSettingsController } from './database-settings.controller';
import { DatabaseSettingsService } from './database-settings.service';
import { DatabaseSettingsRepository } from './repositories/database-settings.repository';
import { LocalDatabaseSettingsRepository } from './repositories/local-database-settings.repository';

const route = '/databases/:dbInstance/settings';

@Module({})
export class DatabaseSettingsModule {
  static register(
    databaseSettingsRepository: Type<DatabaseSettingsRepository> = LocalDatabaseSettingsRepository,
  ): DynamicModule {
    return {
      module: DatabaseSettingsModule,
      imports: [
        RouterModule.register([
          {
            path: route,
            module: DatabaseSettingsModule,
          },
        ]),
      ],
      controllers: [DatabaseSettingsController],
      providers: [
        DatabaseSettingsService,
        {
          provide: DatabaseSettingsRepository,
          useClass: databaseSettingsRepository,
        },
      ],
      exports: [DatabaseSettingsService],
    };
  }
}
