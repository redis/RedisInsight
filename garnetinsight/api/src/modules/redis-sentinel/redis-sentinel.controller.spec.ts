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
import { RedisSentinelService } from 'src/modules/redis-sentinel/redis-sentinel.service';
import {
  mockCreateSentinelDatabasesDto,
  mockRedisSentinelService,
  mockSessionService,
} from 'src/__mocks__';
import { RedisSentinelController } from 'src/modules/redis-sentinel/redis-sentinel.controller';
import { SingleUserAuthMiddleware } from 'src/common/middlewares/single-user-auth.middleware';
import { SessionService } from 'src/modules/session/session.service';
import config, { Config } from 'src/utils/config';

const mockServerConfig = config.get('server') as Config['server'];

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

@Module({
  controllers: [RedisSentinelController],
  providers: [
    {
      provide: RedisSentinelService,
      useFactory: mockRedisSentinelService,
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

describe('RedisSentinelController', () => {
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

  describe('POST /redis-sentinel/databases', () => {
    it('should succeed when database management enabled', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .post('/redis-sentinel/databases')
        .send(mockCreateSentinelDatabasesDto)
        .expect(200);
    });

    it('should fail when database management disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .post('/redis-sentinel/databases')
        .send(mockCreateSentinelDatabasesDto)
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });
});
