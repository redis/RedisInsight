import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { mockSessionMetadata } from 'src/__mocks__';
import { PipelineDraftController } from './pipeline-draft.controller';
import { PipelineDraftService } from './pipeline-draft.service';
import { pipelineDraftFactory } from './__tests__/pipeline-draft.factory';

const mockRdiInstanceId = faker.string.uuid();

const mockRdiClientMetadata = {
  sessionMetadata: mockSessionMetadata,
  id: mockRdiInstanceId,
};

const mockPipelineDraftService = () => ({
  create: jest.fn(),
  list: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('PipelineDraftController', () => {
  let controller: PipelineDraftController;
  let service: ReturnType<typeof mockPipelineDraftService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelineDraftController],
      providers: [
        {
          provide: PipelineDraftService,
          useFactory: mockPipelineDraftService,
        },
      ],
    }).compile();

    controller = module.get(PipelineDraftController);
    service = module.get(PipelineDraftService);
  });

  describe('create', () => {
    it('should create a pipeline draft', async () => {
      const draft = pipelineDraftFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      service.create.mockResolvedValueOnce(draft);

      const result = await controller.create(mockRdiClientMetadata as any, {
        data: draft.data,
      });

      expect(result).toEqual(draft);
      expect(service.create).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockRdiInstanceId,
        { data: draft.data },
      );
    });
  });

  describe('list', () => {
    it('should return list of drafts', async () => {
      const drafts = pipelineDraftFactory.buildList(3, {
        rdiInstanceId: mockRdiInstanceId,
      });
      service.list.mockResolvedValueOnce(drafts);

      const result = await controller.list(mockRdiClientMetadata as any);

      expect(result).toEqual(drafts);
      expect(service.list).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockRdiInstanceId,
      );
    });
  });

  describe('get', () => {
    it('should return a single draft', async () => {
      const draft = pipelineDraftFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      service.get.mockResolvedValueOnce(draft);

      const result = await controller.get(
        mockRdiClientMetadata as any,
        draft.id,
      );

      expect(result).toEqual(draft);
    });

    it('should throw NotFoundException when draft not found', async () => {
      service.get.mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.get(mockRdiClientMetadata as any, faker.string.uuid()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a pipeline draft', async () => {
      const draft = pipelineDraftFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      const updatedData = { updated: true };
      const updatedDraft = { ...draft, data: updatedData };
      service.update.mockResolvedValueOnce(updatedDraft);

      const result = await controller.update(
        mockRdiClientMetadata as any,
        draft.id,
        { data: updatedData },
      );

      expect(result).toEqual(updatedDraft);
    });
  });

  describe('delete', () => {
    it('should delete a pipeline draft', async () => {
      const draft = pipelineDraftFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      service.delete.mockResolvedValueOnce(undefined);

      await controller.delete(mockRdiClientMetadata as any, draft.id);

      expect(service.delete).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockRdiInstanceId,
        draft.id,
      );
    });

    it('should throw NotFoundException when draft not found', async () => {
      service.delete.mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.delete(mockRdiClientMetadata as any, faker.string.uuid()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
