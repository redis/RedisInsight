import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
import config from 'src/utils/config';
import * as AdmZip from 'adm-zip';
import axios from 'axios';
import { wrapHttpError } from 'src/common/utils';
import ERROR_MESSAGES from 'src/constants/error-messages';

const PATH_CONFIG = config.get('dir_path');

const TMP_FOLDER = `${PATH_CONFIG.tmpDir}/Garnetinsight/custom-tutorials`;

const UPLOAD_FROM_REMOTE_ORIGINS_WHITELIST = [
  'https://github.com',
  'https://raw.githubusercontent.com',
];

@Injectable()
export class CustomTutorialFsProvider {
  private logger = new Logger('CustomTutorialFsProvider');

  /**
   * Custom implementation of AdmZip.extractAllTo to ignore __MACOSX folder in the root of archive
   * In some cases when we try to delete __MACOSX folder Electron app might crash
   * As workaround we will never extract this folder to user's FS
   * @param zip
   * @param targetPath
   * @param overwrite
   * @param keepOriginalPermission
   * @private
   */
  private async extractAll(
    zip: AdmZip,
    targetPath,
    overwrite = true,
    keepOriginalPermission = false,
  ) {
    zip.getEntries().forEach((entry) => {
      if (!entry.entryName.includes('__MACOSX')) {
        zip.extractEntryTo(
          entry,
          targetPath,
          true,
          overwrite,
          keepOriginalPermission,
        );
      }
    });
  }

  /**
   * Unzip custom tutorials archive to temporary folder
   * @param zip
   */
  public async unzipToTmpFolder(zip: AdmZip): Promise<string> {
    try {
      const path = await CustomTutorialFsProvider.prepareTmpFolder();

      await fs.remove(path);
      await this.extractAll(zip, path, true);

      return CustomTutorialFsProvider.prepareTutorialFolder(path);
    } catch (e) {
      this.logger.error('Unable to unzip archive', e);
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * Unzip archive from multipart/form-data file input
   * @param file
   */
  public async unzipFromMemoryStoredFile(
    file: MemoryStoredFile,
  ): Promise<string> {
    return this.unzipToTmpFolder(new AdmZip(file.buffer));
  }

  /**
   * Download zip archive from external source and unzip it to temporary directory
   * @param link
   */
  public async unzipFromExternalLink(link: string): Promise<string> {
    try {
      const url = new URL(link);

      if (!UPLOAD_FROM_REMOTE_ORIGINS_WHITELIST.includes(url.origin)) {
        return Promise.reject(
          new BadRequestException(
            ERROR_MESSAGES.CUSTOM_TUTORIAL_UNSUPPORTED_ORIGIN,
          ),
        );
      }

      // false positive. we have whitelist checks above.
      const { data } = await axios.get(link, {
        // lgtm[js/request-forgery]
        responseType: 'arraybuffer',
      });

      return this.unzipToTmpFolder(new AdmZip(data));
    } catch (e) {
      this.logger.error('Unable to fetch zip file from external source');
      throw wrapHttpError(
        e,
        ERROR_MESSAGES.CUSTOM_TUTORIAL_UNABLE_TO_FETCH_FROM_EXTERNAL,
      );
    }
  }

  /**
   * Move custom tutorial from tmp folder to proper path to serve static files
   * force - default false, will remove existing folder
   * @param tmpPath
   * @param dest
   * @param force
   */
  public async moveFolder(tmpPath: string, dest: string, force = false) {
    try {
      if (force && (await fs.pathExists(dest))) {
        await fs.remove(dest);
      }

      await fs.move(tmpPath, dest);
    } catch (e) {
      this.logger.error('Unable to move tutorial to a folder', e);
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * Delete Tutorial folder
   * Will silently log an error if any
   * @param path
   */
  public async removeFolder(path: string) {
    try {
      await fs.remove(path);
    } catch (e) {
      this.logger.warn('Unable to delete tutorial folder', e);
    }
  }

  /**
   * Create tmp folder in user's temporary directory and return path to it
   */
  static async prepareTmpFolder(): Promise<string> {
    const path = join(TMP_FOLDER, uuidv4());
    await fs.ensureDir(path);

    return path;
  }

  /**
   * Check for data structure
   * in case when and a single folder presented on the root level
   * we will ignore it and work with everything inside it
   * @private
   */
  static async prepareTutorialFolder(path: string): Promise<string> {
    const entries = await fs.readdir(path);
    const firstEntryPath = join(path, entries[0] || '');

    if (
      entries?.length === 1 &&
      (await fs.lstat(firstEntryPath)).isDirectory()
    ) {
      const newPath = await CustomTutorialFsProvider.prepareTmpFolder();

      await fs.copy(firstEntryPath, newPath);

      return newPath;
    }

    return path;
  }
}
