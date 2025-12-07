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
  mockAddRedisEnterpriseDatabasesDto,
  mockRedisEnterpriseService,
  mockSessionService,
} from 'src/__mocks__';
import { SingleUserAuthMiddleware } from 'src/common/middlewares/single-user-auth.middleware';
import { SessionService } from 'src/modules/session/session.service';
import config, { Config } from 'src/utils/config';
import { RedisEnterpriseController } from 'src/modules/redis-enterprise/redis-enterprise.controller';
import { RedisEnterpriseService } from 'src/modules/redis-enterprise/redis-enterprise.service';

const mockServerConfig = config.get('server') as Config['server'];

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

@Module({
  controllers: [RedisEnterpriseController],
  providers: [
    {
      provide: RedisEnterpriseService,
      useFactory: mockRedisEnterpriseService,
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

describe('RedisEnterpriseController', () => {
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

  describe('POST /redis-enterprise/cluster/databases', () => {
    it('should succeed when database management enabled', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .post('/redis-enterprise/cluster/databases')
        .send(mockAddRedisEnterpriseDatabasesDto)
        .expect(200);
    });

    it('should fail when database management disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .post('/redis-enterprise/cluster/databases')
        .send(mockAddRedisEnterpriseDatabasesDto)
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });
});
