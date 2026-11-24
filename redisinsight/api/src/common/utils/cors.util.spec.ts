import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { BuildType } from 'src/modules/server/models/server';
import { getCorsOptions } from 'src/common/utils/cors.util';

const ALLOW_ORIGIN_HEADER = 'access-control-allow-origin';

const requestWithOrigin = async (
  corsConfig: Parameters<typeof getCorsOptions>[0],
  buildType: string,
  origin: string,
) => {
  const moduleRef = await Test.createTestingModule({}).compile();
  const app: INestApplication = moduleRef.createNestApplication();
  app.enableCors(getCorsOptions(corsConfig, buildType));
  app
    .getHttpAdapter()
    .get('/ping', (req: unknown, res: { send: (body: string) => void }) =>
      res.send('ok'),
    );
  await app.init();

  try {
    return await request(app.getHttpServer())
      .get('/ping')
      .set('Origin', origin);
  } finally {
    await app.close();
  }
};

describe('CORS response headers', () => {
  const foreignOrigin = faker.internet.url();

  it('should not allow a foreign origin in the Docker build by default', async () => {
    const response = await requestWithOrigin(
      {},
      BuildType.DockerOnPremise,
      foreignOrigin,
    );

    expect(response.headers[ALLOW_ORIGIN_HEADER]).toBeUndefined();
  });

  it('should allow only the configured origin in the Docker build', async () => {
    const allowedOrigin = faker.internet.url();
    const response = await requestWithOrigin(
      { origin: allowedOrigin },
      BuildType.DockerOnPremise,
      allowedOrigin,
    );

    expect(response.headers[ALLOW_ORIGIN_HEADER]).toEqual(allowedOrigin);
  });

  it('should allow any origin in the Electron build', async () => {
    const response = await requestWithOrigin(
      {},
      BuildType.Electron,
      foreignOrigin,
    );

    expect(response.headers[ALLOW_ORIGIN_HEADER]).toEqual('*');
  });
});

describe('getCorsOptions', () => {
  describe('when an origin is configured', () => {
    it.each(Object.values(BuildType))(
      'should use the configured origin and credentials for %s',
      (buildType) => {
        const origin = faker.internet.url();

        expect(
          getCorsOptions({ origin, credentials: true }, buildType),
        ).toEqual({ origin, credentials: true });
      },
    );
  });

  describe('when no origin is configured', () => {
    it('should not allow cross-origin requests in the Docker build', () => {
      expect(
        getCorsOptions({ credentials: false }, BuildType.DockerOnPremise),
      ).toEqual({ origin: false, credentials: false });
    });

    it.each([BuildType.Electron, BuildType.RedisStack, BuildType.VSCode])(
      'should allow any origin in the %s build',
      (buildType) => {
        expect(getCorsOptions({ credentials: false }, buildType)).toEqual({
          origin: '*',
          credentials: false,
        });
      },
    );

    it('should allow any origin when the build type is unknown', () => {
      expect(getCorsOptions({ credentials: false }, undefined)).toEqual({
        origin: '*',
        credentials: false,
      });
    });
  });
});
