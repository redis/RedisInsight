import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockCapiUnauthorizedError,
  mockCloudTaskInit,
  mockCloudCapiAuthDto,
  mockCloudCapiHeaders,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudTaskCapiProvider } from 'src/modules/cloud/task/providers/cloud-task.capi.provider';

const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');
mockedAxios.create = jest.fn(() => mockedAxios);

describe('CloudTaskCapiProvider', () => {
  let service: CloudTaskCapiProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudTaskCapiProvider],
    }).compile();

    service = module.get(CloudTaskCapiProvider);
  });

  describe('getTask', () => {
    it('successfully get capi access key', async () => {
      const response = {
        status: 200,
        data: mockCloudTaskInit,
      };
      mockedAxios.get.mockResolvedValue(response);

      expect(await service.getTask(mockCloudCapiAuthDto, 'id')).toEqual(
        mockCloudTaskInit,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/tasks/id',
        mockCloudCapiHeaders,
      );
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      mockedAxios.get.mockRejectedValue(mockCapiUnauthorizedError);

      await expect(service.getTask(mockCloudCapiAuthDto, 'id')).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
});
