import { when } from 'jest-when';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  ForbiddenException,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import {
  mockDatabase,
  mockDatabaseImportService,
  mockSessionService,
} from 'src/__mocks__';
import { SingleUserAuthMiddleware } from 'src/common/middlewares/single-user-auth.middleware';
import { SessionService } from 'src/modules/session/session.service';
import config, { Config } from 'src/utils/config';
import { DatabaseImportController } from 'src/modules/database-import/database-import.controller';
import { DatabaseImportService } from 'src/modules/database-import/database-import.service';

const mockServerConfig = config.get('server') as Config['server'];

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

@Module({
  controllers: [DatabaseImportController],
  providers: [
    {
      provide: DatabaseImportService,
      useFactory: mockDatabaseImportService,
    },
    {
      provide: SessionService,
      useFactory: mockSessionService,
    },
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SingleUserAuthMiddleware).forRoutes('*');
  }
}

describe('DatabaseImportController', () => {
  let app: INestApplication;
  let configGetSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    configGetSpy = jest.spyOn(config, 'get');

    when(configGetSpy).calledWith('server').mockReturnValue(mockServerConfig);

    const moduleRef = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /databases/import', () => {
    it('should import databases', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .post('/databases/import')
        .send([mockDatabase])
        .expect(200);
    });

    it('should fail to import databases when database management disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .post('/databases/import')
        .send([mockDatabase])
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });
});
