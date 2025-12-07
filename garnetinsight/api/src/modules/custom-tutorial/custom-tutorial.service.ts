import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/custom-tutorial.repository';
import {
  CustomTutorial,
  CustomTutorialActions,
} from 'src/modules/custom-tutorial/models/custom-tutorial';
import { UploadCustomTutorialDto } from 'src/modules/custom-tutorial/dto/upload.custom-tutorial.dto';
import { plainToInstance } from 'class-transformer';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomTutorialFsProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.fs.provider';
import { CustomTutorialManifestProvider } from 'src/modules/custom-tutorial/providers/custom-tutorial.manifest.provider';
import {
  CustomTutorialManifestType,
  RootCustomTutorialManifest,
} from 'src/modules/custom-tutorial/models/custom-tutorial.manifest';
import { wrapHttpError } from 'src/common/utils';
import { parse } from 'path';
import { isPlainObject } from 'lodash';
import * as URL from 'url';
import { Validator } from 'class-validator';
import { CustomTutorialAnalytics } from 'src/modules/custom-tutorial/custom-tutorial.analytics';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class CustomTutorialService {
  private logger = new Logger('CustomTutorialService');

  private validator = new Validator();

  private exceptionFactory = new ValidationPipe().createExceptionFactory();

  constructor(
    private readonly customTutorialRepository: CustomTutorialRepository,
    private readonly customTutorialFsProvider: CustomTutorialFsProvider,
    private readonly customTutorialManifestProvider: CustomTutorialManifestProvider,
    private readonly analytics: CustomTutorialAnalytics,
  ) {}

  private async validateManifestJson(path: string): Promise<void> {
    const manifest =
      await this.customTutorialManifestProvider.getOriginalManifestJson(path);

    if (
      !manifest &&
      (await this.customTutorialManifestProvider.isOriginalManifestExists(path))
    ) {
      throw new BadRequestException('Unable to parse manifest.json file');
    }

    if (manifest) {
      if (!isPlainObject(manifest)) {
        throw new BadRequestException('Manifest json should be an object');
      }

      const errors = await this.validator.validate(
        plainToInstance(RootCustomTutorialManifest, manifest),
        { whitelist: true },
      );

      if (errors?.length) {
        throw this.exceptionFactory(errors);
      }
    }
  }

  private async determineTutorialName(path: string, link: string) {
    const manifest =
      await this.customTutorialManifestProvider.getManifestJson(path);

    if (!manifest?.label) {
      return parse(URL.parse(link).pathname).name;
    }

    return manifest.label;
  }

  /**
   * Create custom tutorial entity + static files based on input
   * Currently from zip file only
   * @param sessionMetadata
   * @param dto
   */
  public async create(
    sessionMetadata: SessionMetadata,
    dto: UploadCustomTutorialDto,
  ): Promise<RootCustomTutorialManifest> {
    try {
      let tmpPath = '';

      if (dto.file) {
        tmpPath = await this.customTutorialFsProvider.unzipFromMemoryStoredFile(
          dto.file,
        );
      } else if (dto.link) {
        tmpPath = await this.customTutorialFsProvider.unzipFromExternalLink(
          dto.link,
        );
      } else {
        throw new BadRequestException(
          'File or external link should be provided',
        );
      }

      await this.validateManifestJson(tmpPath);

      // create tutorial model
      const model = plainToInstance(CustomTutorial, {
        ...dto,
        id: uuidv4(),
      });

      await this.customTutorialFsProvider.moveFolder(
        tmpPath,
        model.absolutePath,
      );

      model.name = await this.determineTutorialName(
        model.absolutePath,
        dto?.file?.originalName || dto.link,
      );
      const tutorial = await this.customTutorialRepository.create(model);

      this.analytics.sendImportSucceeded(sessionMetadata, {
        manifest:
          !!(await this.customTutorialManifestProvider.getOriginalManifestJson(
            tutorial.absolutePath,
          )),
      });

      return await this.customTutorialManifestProvider.generateTutorialManifest(
        tutorial,
      );
    } catch (e) {
      this.analytics.sendImportFailed(sessionMetadata, e);
      this.logger.error(
        'Unable to create custom tutorials',
        e,
        sessionMetadata,
      );
      throw wrapHttpError(e);
    }
  }

  /**
   * Get global manifest for all custom tutorials
   * In the future will be removed with some kind of partial load
   */
  public async getGlobalManifest(): Promise<RootCustomTutorialManifest> {
    const children = [];

    try {
      const tutorials = await this.customTutorialRepository.list();

      const manifests = (await Promise.all(
        tutorials.map(
          this.customTutorialManifestProvider.generateTutorialManifest.bind(
            this.customTutorialManifestProvider,
          ),
        ),
      )) as Record<string, any>[];

      manifests.forEach((manifest) => {
        if (manifest) {
          children.push(manifest);
        }
      });
    } catch (e) {
      this.logger.warn(
        'Unable to generate entire custom tutorials manifest',
        e,
      );
    }

    return {
      type: CustomTutorialManifestType.Group,
      id: 'custom-tutorials',
      label: 'My tutorials',
      _actions: [CustomTutorialActions.CREATE],
      args: {
        withBorder: true,
        initialIsOpen: false,
      },
      children,
    };
  }

  public async get(id: string): Promise<CustomTutorial> {
    const model = await this.customTutorialRepository.get(id);

    if (!model) {
      this.logger.error(`Custom Tutorial with ${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.CUSTOM_TUTORIAL_NOT_FOUND);
    }

    return model;
  }

  public async delete(id: string): Promise<void> {
    try {
      const tutorial = await this.get(id);
      await this.customTutorialRepository.delete(id);
      await this.customTutorialFsProvider.removeFolder(tutorial.absolutePath);
    } catch (e) {
      this.logger.error('Unable to delete custom tutorial', e);
      throw wrapHttpError(e);
    }
  }
}
