import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import config from 'src/utils/config';

const PATH_CONFIG = config.get('dir_path');

@Injectable()
export class CommandsJsonProvider {
  private readonly logger: Logger;

  private readonly name: string;

  private readonly url: string;

  constructor(name, url) {
    this.name = name;
    this.url = url;
    this.logger = new Logger(`CommandsJsonProvider:${this.name}`);
  }

  /**
   * Get latest json from external resource and save it locally
   */
  async updateLatestJson() {
    try {
      this.logger.debug(`Trying to update ${this.name} commands...`);
      const { data } = await axios.get(this.url, {
        responseType: 'text',
        transformResponse: [(raw) => raw],
      });

      await fs.ensureDir(PATH_CONFIG.commands);

      await fs.writeFile(
        path.join(PATH_CONFIG.commands, `${this.name}.json`),
        JSON.stringify(JSON.parse(data)), // check that we received proper json object
      );
      this.logger.debug(`Successfully updated ${this.name} commands`);
    } catch (error) {
      this.logger.error(`Unable to update ${this.name} commands`, error);
    }
  }

  /**
   * Try to return latest commands
   * In case of any errors will return default one
   */
  async getCommands() {
    try {
      return {
        [this.name]: JSON.parse(
          await fs.readFile(
            path.join(PATH_CONFIG.commands, `${this.name}.json`),
            'utf8',
          ),
        ),
      };
    } catch (error) {
      this.logger.warn(
        `Unable to get latest ${this.name} commands. Return default.`,
        error,
      );
      return this.getDefaultCommands();
    }
  }

  /**
   * Try to get default json that was delivered with build
   * In case when no default data we will return empty object to not fail api call
   */
  async getDefaultCommands() {
    try {
      return {
        [this.name]: JSON.parse(
          await fs.readFile(
            path.join(PATH_CONFIG.defaultCommandsDir, `${this.name}.json`),
            'utf8',
          ),
        ),
      };
    } catch (error) {
      this.logger.error(`Unable to get default ${this.name} commands.`, error);
      return {};
    }
  }
}
