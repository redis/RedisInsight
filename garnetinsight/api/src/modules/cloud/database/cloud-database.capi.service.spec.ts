import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudCapiAuthDto,
  mockCloudCapiDatabaseTags,
  mockCloudCapiSubscriptionDatabasesFixed,
  mockCloudDatabase,
  mockCloudDatabaseCapiProvider,
  mockCloudDatabaseFromList,
  mockCloudDatabaseFromListFixed,
  mockCloudTaskInit,
  mockCreateFreeCloudDatabaseDto,
  mockGetCloudSubscriptionDatabaseDto,
  mockGetCloudSubscriptionDatabasesDto,
  mockGetCloudSubscriptionDatabasesDtoFixed,
  MockType,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';

describe('CloudDatabaseCapiService', () => {
  let service: CloudDatabaseCapiService;
  let capi: MockType<CloudDatabaseCapiProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudDatabaseCapiService,
        {
          provide: CloudDatabaseCapiProvider,
          useFactory: mockCloudDatabaseCapiProvider,
        },
      ],
    }).compile();

    service = module.get(CloudDatabaseCapiService);
    capi = module.get(CloudDatabaseCapiProvider);
  });

  describe('getDatabase', () => {
    it('successfully get cloud databases', async () => {
      expect(
        await service.getDatabase(
          mockCloudCapiAuthDto,
          mockGetCloudSubscriptionDatabaseDto,
        ),
      ).toEqual({
        ...mockCloudDatabase,
        tags: mockCloudCapiDatabaseTags,
      });
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capi.getDatabase.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.getDatabase(
          mockCloudCapiAuthDto,
          mockGetCloudSubscriptionDatabaseDto,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
  describe('getDatabases', () => {
    it('successfully get cloud databases', async () => {
      expect(
        await service.getDatabases(
          mockCloudCapiAuthDto,
          mockGetCloudSubscriptionDatabasesDto,
        ),
      ).toEqual([mockCloudDatabaseFromList]);
    });
    it('successfully get cloud fixed databases', async () => {
      capi.getDatabases.mockResolvedValueOnce(
        mockCloudCapiSubscriptionDatabasesFixed,
      );
      expect(
        await service.getDatabases(
          mockCloudCapiAuthDto,
          mockGetCloudSubscriptionDatabasesDtoFixed,
        ),
      ).toEqual([mockCloudDatabaseFromListFixed]);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capi.getDatabases.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.getDatabases(
          mockCloudCapiAuthDto,
          mockGetCloudSubscriptionDatabasesDto,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
  describe('createFreeDatabase', () => {
    it('successfully create free cloud database', async () => {
      expect(
        await service.createFreeDatabase(
          mockCloudCapiAuthDto,
          mockGetCloudSubscriptionDatabasesDtoFixed,
        ),
      ).toEqual(mockCloudTaskInit);
      expect(capi.createFreeDatabase).toHaveBeenCalledWith(
        mockCloudCapiAuthDto,
        mockCreateFreeCloudDatabaseDto,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      capi.createFreeDatabase.mockRejectedValueOnce(
        new CloudApiUnauthorizedException(),
      );
      await expect(
        service.createFreeDatabase(
          mockCloudCapiAuthDto,
          mockGetCloudSubscriptionDatabaseDto,
        ),
      ).rejects.toThrow(CloudApiUnauthorizedException);
    });
  });
});
