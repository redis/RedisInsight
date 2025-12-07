import { Module } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { WindowAuthModule } from './window-auth/window-auth.module';
import { BuildType } from '../server/models/server';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Module({})
export class AuthModule {
  static register() {
    const imports = [];

    if (SERVER_CONFIG.buildType === BuildType.Electron) {
      imports.push(WindowAuthModule);
    }

    return {
      module: AuthModule,
      imports,
    };
  }
}
