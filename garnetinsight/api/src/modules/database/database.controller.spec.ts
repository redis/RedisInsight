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
  mockCreateDatabaseDto,
  mockDatabase,
  mockDatabaseConnectionService,
  mockDatabaseService,
  mockSessionService,
} from 'src/__mocks__';
import { SingleUserAuthMiddleware } from 'src/common/middlewares/single-user-auth.middleware';
import { SessionService } from 'src/modules/session/session.service';
import config, { Config } from 'src/utils/config';
import { DatabaseController } from 'src/modules/database/database.controller';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';

const mockServerConfig = config.get('server') as Config['server'];

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

@Module({
  controllers: [DatabaseController],
  providers: [
    {
      provide: DatabaseService,
      useFactory: mockDatabaseService,
    },
    {
      provide: DatabaseConnectionService,
      useFactory: mockDatabaseConnectionService,
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

describe('DatabaseController', () => {
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

  describe('POST /databases', () => {
    it('should create database', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .post('/databases')
        .send(mockCreateDatabaseDto)
        .expect(201);
    });

    it('should fail to create database when database management disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .post('/databases')
        .send(mockCreateDatabaseDto)
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });

  describe('PATCH /databases/:id', () => {
    it('should update database', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .patch(`/databases/${mockDatabase.id}`)
        .send(mockCreateDatabaseDto)
        .expect(200);
    });

    it('should fail to update database when database management is disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .patch(`/databases/${mockDatabase.id}`)
        .send(mockCreateDatabaseDto)
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });

  describe('POST /databases/clone/:id', () => {
    it('should clone database', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .post(`/databases/clone/${mockDatabase.id}`)
        .send(mockCreateDatabaseDto)
        .expect(200);
    });

    it('should fail to clone database when database management is disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .post(`/databases/clone/${mockDatabase.id}`)
        .send(mockCreateDatabaseDto)
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });

  describe('POST /databases/test', () => {
    it('should test database connection', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .post('/databases/test')
        .send(mockCreateDatabaseDto)
        .expect(200);
    });

    it('should fail to test database connection when database management disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .post('/databases/test')
        .send(mockCreateDatabaseDto)
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });

  describe('DELETE /databases/:id', () => {
    it('should delete database', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .delete(`/databases/${mockDatabase.id}`)
        .expect(200);
    });

    it('should fail to delete database when database management is disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .delete(`/databases/${mockDatabase.id}`)
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });

  describe('DELETE /databases', () => {
    it('should delete databases', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .delete('/databases')
        .send({ ids: [mockDatabase.id] })
        .expect(200);
    });

    it('should fail to delete databases when database management is disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .delete('/databases')
        .send({ ids: [mockDatabase.id] })
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });

  describe('POST /export', () => {
    it('should export databases', async () => {
      mockServerConfig.databaseManagement = true;

      return request(app.getHttpServer())
        .delete('/databases/export')
        .send({ ids: [mockDatabase.id] })
        .expect(200);
    });

    it('should fail to export databases when database management is disabled', async () => {
      mockServerConfig.databaseManagement = false;

      return request(app.getHttpServer())
        .delete('/databases/export')
        .send({ ids: [mockDatabase.id] })
        .expect(403)
        .expect(
          new ForbiddenException(
            'Database connection management is disabled.',
          ).getResponse(),
        );
    });
  });
});
