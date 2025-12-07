import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Validator } from 'class-validator';
import { readdirSync, existsSync, readFileSync } from 'fs';
import config, { Config } from 'src/utils/config';
import * as path from 'path';
import { filter } from 'lodash';
import { PluginsResponse, Plugin } from 'src/modules/plugin/plugin.response';

const PATH_CONFIG = config.get('dir_path') as Config['dir_path'];
const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class PluginService {
  private logger = new Logger('PluginService');

  private validator = new Validator();

  /**
   * Get all plugins
   */
  async getAll(): Promise<PluginsResponse> {
    return {
      static: path.posix.join(SERVER_CONFIG.pluginsAssetsUri),
      plugins: [
        ...(await this.scanPluginsFolder(
          PATH_CONFIG.defaultPlugins,
          SERVER_CONFIG.defaultPluginsUri,
          true,
        )),
        ...(await this.scanPluginsFolder(
          PATH_CONFIG.customPlugins,
          SERVER_CONFIG.customPluginsUri,
        )),
      ],
    };
  }

  private async scanPluginsFolder(
    pluginsFolder: string,
    urlPrefix: string,
    internal: boolean = false,
  ): Promise<Plugin[]> {
    const plugins = existsSync(pluginsFolder) ? readdirSync(pluginsFolder) : [];
    return filter(
      await Promise.all(
        plugins.map(async (pluginFolder) => {
          try {
            const manifest = JSON.parse(
              readFileSync(
                path.join(pluginsFolder, pluginFolder, 'package.json'),
                'utf8',
              ),
            );

            // const plugin = plainToInstance(Plugin, manifest, { excludeExtraneousValues: true, strategy: 'exposeAll' });
            const plugin = plainToInstance(Plugin, manifest);
            await this.validator.validateOrReject(plugin, {
              whitelist: true,
            });

            plugin.internal = internal || undefined;
            plugin.baseUrl = path.posix.join(urlPrefix, pluginFolder, '/');
            plugin.main = path.posix.join(
              urlPrefix,
              pluginFolder,
              manifest.main,
            );
            if (plugin.styles) {
              plugin.styles = path.posix.join(
                urlPrefix,
                pluginFolder,
                manifest.styles,
              );
            }

            return plugin;
          } catch (error) {
            this.logger.error(
              `Error when trying to process plugin ${pluginFolder}`,
              error,
            );
            return undefined;
          }
        }),
      ),
      (plugin) => !!plugin,
    );
  }
}
