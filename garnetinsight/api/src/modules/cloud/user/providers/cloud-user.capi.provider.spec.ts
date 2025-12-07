import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockCapiUnauthorizedError,
  mockCloudCapiAccount,
  mockCloudCapiAuthDto,
} from 'src/__mocks__';
import { CloudUserCapiProvider } from 'src/modules/cloud/user/providers/cloud-user.capi.provider';
import { CloudCapiUnauthorizedException } from 'src/modules/cloud/common/exceptions';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudUserCapiProvider', () => {
  let service: CloudUserCapiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudUserCapiProvider],
    }).compile();

    service = module.get(CloudUserCapiProvider);
  });

  describe('getCurrentAccount', () => {
    it('successfully get cloud capi account', async () => {
      const response = {
        status: 200,
        data: { account: mockCloudCapiAccount },
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getCurrentAccount(mockCloudCapiAuthDto)).toEqual(
        mockCloudCapiAccount,
      );
    });
    it('throw CloudCapiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(
        service.getCurrentAccount(mockCloudCapiAuthDto),
      ).rejects.toThrow(CloudCapiUnauthorizedException);
    });
  });
});
