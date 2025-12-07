import { Test, TestingModule } from '@nestjs/testing';
import { WindowAuthService } from './window-auth.service';
import { AbstractWindowAuthStrategy } from './strategies/abstract.window.auth.strategy';

export class TestAuthStrategy extends AbstractWindowAuthStrategy {
  async isAuthorized(): Promise<boolean> {
    return true;
  }
}

const testStrategy = new TestAuthStrategy();

describe('WindowAuthService', () => {
  let windowAuthService: WindowAuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WindowAuthService],
      exports: [WindowAuthService],
    }).compile();

    windowAuthService = module.get<WindowAuthService>(WindowAuthService);
  });
  it('Should set strategy to window auth service and call it', async () => {
    windowAuthService.setStrategy(testStrategy);
    expect(await windowAuthService.isAuthorized('')).toEqual(true);
  });
});
