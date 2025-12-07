import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAppSettings,
  mockFeaturesConfigService,
  mockSessionMetadata,
  mockSettingsService,
  MockType,
} from 'src/__mocks__';
import { SettingsService } from 'src/modules/settings/settings.service';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { knownFeatures } from 'src/modules/feature/constants/known-features';
import { SwitchableFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/switchable.flag.strategy';
import * as fs from 'fs-extra';

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('SwitchableFlagStrategy', () => {
  let service: SwitchableFlagStrategy;
  let settingsService: MockType<SettingsService>;
  let featuresConfigService: MockType<FeaturesConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mockedFs);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
        {
          provide: FeaturesConfigService,
          useFactory: mockFeaturesConfigService,
        },
      ],
    }).compile();

    settingsService = module.get(SettingsService);
    featuresConfigService = module.get(FeaturesConfigService);
    service = new SwitchableFlagStrategy(
      featuresConfigService as unknown as FeaturesConfigService,
      settingsService as unknown as SettingsService,
    );

    settingsService.getAppSettings.mockResolvedValue(mockAppSettings);
  });

  describe('calculate', () => {
    let isInTargetRangeSpy;
    let filterSpy;

    beforeEach(() => {
      isInTargetRangeSpy = jest.spyOn(service as any, 'isInTargetRange');
      filterSpy = jest.spyOn(service as any, 'filter');
    });

    it('should not fail when no featureConfig provided', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(false);
      filterSpy.mockReturnValueOnce(false);

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          null,
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: expect.any(Boolean),
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });

    it('should return flag:true when no force flag defined (default behavior)', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(true);
      filterSpy.mockReturnValueOnce(true);

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 10]],
            flag: true,
            filters: [],
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: true,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });
    it('should return flag:true when unexpected force flag defined', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(true);
      filterSpy.mockReturnValueOnce(true);
      mockedFs.readFile.mockResolvedValueOnce(
        JSON.stringify({
          features: {
            [KnownFeatures.DatabaseChat]: 'something',
          },
        }) as any,
      );

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 10]],
            flag: true,
            filters: [],
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: true,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });
    it('should return flag:false when feature is force disabled', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(true);
      filterSpy.mockReturnValueOnce(true);
      mockedFs.readFile.mockResolvedValueOnce(
        JSON.stringify({
          features: {
            [KnownFeatures.DatabaseChat]: false,
          },
        }) as any,
      );

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 10]],
            flag: true,
            filters: [],
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: false,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });

    it('should return flag:false when no force flag defined (default behavior)', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(false);
      filterSpy.mockReturnValueOnce(true);

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 10]],
            flag: true,
            filters: [],
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: false,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });
    it('should return flag:false when unexpected force flag defined', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(false);
      filterSpy.mockReturnValueOnce(true);
      mockedFs.readFile.mockResolvedValueOnce(
        JSON.stringify({
          feature: {
            [KnownFeatures.DatabaseChat]: 'unexpected value',
          },
        }) as any,
      );

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 10]],
            flag: true,
            filters: [],
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: false,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });
    it('should return flag:true when feature force enabled', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(false);
      filterSpy.mockReturnValueOnce(true);
      mockedFs.readFile.mockResolvedValueOnce(
        JSON.stringify({
          features: {
            [KnownFeatures.DatabaseChat]: true,
          },
        }) as any,
      );

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 10]],
            flag: true,
            filters: [],
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: true,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });

    it('should return flag:false even if feature forced enabled but filter returned false', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(true);
      filterSpy.mockReturnValueOnce(false);
      mockedFs.readFile.mockResolvedValueOnce(
        JSON.stringify({
          features: {
            [KnownFeatures.DatabaseChat]: true,
          },
        }) as any,
      );

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 10]],
            flag: true,
            filters: [],
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: false,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });

    it('should return flag:false even if feature force enabled but flag in config = false', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(true);
      filterSpy.mockReturnValueOnce(true);
      mockedFs.readFile.mockResolvedValueOnce(
        JSON.stringify({
          features: {
            [KnownFeatures.DatabaseChat]: true,
          },
        }) as any,
      );

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.DatabaseChat],
          {
            perc: [[0, 100]],
            flag: false,
          },
        ),
      ).toEqual({
        name: KnownFeatures.DatabaseChat,
        flag: false,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
    });
  });
});
