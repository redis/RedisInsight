import { Injectable, Logger } from '@nestjs/common';
import { join, parse } from 'path';
import { isPlainObject } from 'lodash';
import * as fs from 'fs-extra';
import { CustomTutorial } from 'src/modules/custom-tutorial/models/custom-tutorial';
import {
  CustomTutorialManifest,
  CustomTutorialManifestType,
  RootCustomTutorialManifest,
} from 'src/modules/custom-tutorial/models/custom-tutorial.manifest';
import { plainToInstance } from 'class-transformer';
import { winPathToNormalPath } from 'src/utils';

const MANIFEST_FILE = 'manifest.json';
const SYS_MANIFEST_FILE = '_manifest.json';

@Injectable()
export class CustomTutorialManifestProvider {
  private logger = new Logger('CustomTutorialManifestProvider');

  /**
   * Auto generate system manifest json (_manifest.json)
   * @param path
   * @private
   */
  private async generateManifestFile(
    path: string,
  ): Promise<Partial<RootCustomTutorialManifest>> {
    try {
      const manifest = {
        children: await this.generateManifestEntry(path, '/'),
      };

      await fs.writeFile(
        join(path, SYS_MANIFEST_FILE),
        JSON.stringify(manifest),
        'utf8',
      );

      return manifest;
    } catch (e) {
      this.logger.warn('Unable to automatically generate manifest file', e);
      return null;
    }
  }

  /**
   * Discover all .md files and folders and generate manifest based on it
   * Manifest labels will be created based on files and folders names
   * For files [.md] will be excluded
   * All folders and files which starts from "_" and "." will be excluded also
   * @param path
   * @param relativePath
   * @private
   */
  private async generateManifestEntry(
    path: string,
    relativePath: string = '/',
  ): Promise<CustomTutorialManifest[]> {
    const manifest = [];
    const entries = await fs.readdir(path);

    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];

      if (entry.startsWith('.') || entry.startsWith('_')) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const isDirectory = (await fs.lstat(join(path, entry))).isDirectory();

      const { name, ext } = parse(entry);

      if (isDirectory) {
        manifest.push({
          id: entry,
          label: name,
          type: CustomTutorialManifestType.Group,
          children: await this.generateManifestEntry(
            join(path, entry),
            join(relativePath, entry),
          ),
        });
      } else if (ext === '.md') {
        manifest.push({
          id: entry,
          label: name,
          type: CustomTutorialManifestType.InternalLink,
          args: {
            path: winPathToNormalPath(join(relativePath, entry)),
          },
        });
      }
    }

    return manifest;
  }

  public async isOriginalManifestExists(path: string): Promise<boolean> {
    return fs.existsSync(join(path, MANIFEST_FILE));
  }

  public async getOriginalManifestJson(
    path: string,
  ): Promise<RootCustomTutorialManifest> {
    try {
      return JSON.parse(await fs.readFile(join(path, MANIFEST_FILE), 'utf8'));
    } catch (e) {
      this.logger.warn('Unable to find original manifest.json');
    }

    return null;
  }

  private async getManifestJsonFile(
    path,
  ): Promise<Partial<RootCustomTutorialManifest>> {
    const manifest = await this.getOriginalManifestJson(path);

    if (manifest) {
      return manifest;
    }

    try {
      return JSON.parse(
        await fs.readFile(join(path, SYS_MANIFEST_FILE), 'utf8'),
      );
    } catch (e) {
      this.logger.warn('Unable to get _manifest for tutorial');
    }

    return await this.generateManifestFile(path);
  }

  /**
   * Try to get and parse manifest.json
   * In case of any error will not throw an error but return null
   * In this case tutorial will be displayed but without anything inside
   * So user will be able to fix (re-import) tutorial or remove it
   * @param path
   */
  public async getManifestJson(
    path: string,
  ): Promise<RootCustomTutorialManifest> {
    try {
      const manifestJson = await this.getManifestJsonFile(path);

      if (!isPlainObject(manifestJson)) {
        return null;
      }

      return plainToInstance(RootCustomTutorialManifest, manifestJson, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.warn('Unable to get manifest for tutorial');
      return null;
    }
  }

  /**
   * Generate custom manifest based on manifest.json inside tutorial folder and
   * additional data from local database
   * @param tutorial
   */
  public async generateTutorialManifest(
    tutorial: CustomTutorial,
  ): Promise<RootCustomTutorialManifest> {
    try {
      const manifest =
        (await this.getManifestJson(tutorial.absolutePath)) ||
        ({} as RootCustomTutorialManifest);

      return {
        ...manifest,
        _actions: tutorial.actions,
        _path: tutorial.path,
        type: CustomTutorialManifestType.Group,
        id: tutorial.id,
        label: tutorial.name || manifest?.label,
        children: manifest?.children || [],
      };
    } catch (e) {
      this.logger.warn('Unable to generate manifest for tutorial', e);
      return null;
    }
  }
}
