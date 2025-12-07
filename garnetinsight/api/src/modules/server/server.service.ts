import { Injectable, Logger } from '@nestjs/common';
import {
  AppType,
  BuildType,
  PackageType,
} from 'src/modules/server/models/server';
import { GetServerInfoResponse } from 'src/modules/server/dto/server.dto';
import { SessionMetadata } from 'src/common/models';
import config, { Config } from 'src/utils/config';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export abstract class ServerService {
  protected logger = new Logger(this.constructor.name);

  protected sessionId: number = new Date().getTime();

  static getSupportedAppType(): AppType {
    if (SERVER_CONFIG.appType) {
      const predefinedAppType = SERVER_CONFIG.appType.toUpperCase();
      const enumValues = Object.values(AppType);

      return enumValues.find((value) => value === predefinedAppType);
    }
  }

  static getAppType(buildType: string): AppType {
    const appType = ServerService.getSupportedAppType();

    if (appType) {
      return appType;
    }

    switch (buildType) {
      case BuildType.DockerOnPremise:
        return AppType.Docker;
      case BuildType.Electron:
        return AppType.Electron;
      case BuildType.RedisStack:
        return AppType.RedisStackWeb;
      case BuildType.VSCode:
        return AppType.VSCode;
      default:
        return AppType.Unknown;
    }
  }

  static getPackageType(buildType: string): PackageType {
    if (buildType === BuildType.Electron) {
      // Darwin
      if (process.platform === 'darwin') {
        if (process.env.mas || process['mas']) {
          return PackageType.Mas;
        }

        return PackageType.UnknownDarwin;
      }

      // Linux
      if (process.platform === 'linux') {
        if (process.env.APPIMAGE) {
          return PackageType.AppImage;
        }

        if (process.env.SNAP_INSTANCE_NAME || process.env.SNAP_DATA) {
          return PackageType.Snap;
        }

        if (process.env.container) {
          return PackageType.Flatpak;
        }

        return PackageType.UnknownLinux;
      }

      // Windows
      if (process.platform === 'win32') {
        if (process.env.windowsStore || process['windowsStore']) {
          return PackageType.WindowsStore;
        }

        return PackageType.UnknownWindows;
      }

      return PackageType.Unknown;
    }

    return undefined;
  }

  /**
   * Initialize Server module.
   * Note: should be called once
   */
  public abstract init(): Promise<boolean>;

  /**
   * Get general server info
   * @param sessionMetadata
   */
  public abstract getInfo(
    sessionMetadata: SessionMetadata,
  ): Promise<GetServerInfoResponse>;
}
