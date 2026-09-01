import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { mockSessionMetadata } from 'src/__mocks__';
import { PipelineDraftService } from './pipeline-draft.service';
import { PipelineDraftRepository } from './repository/pipeline-draft.repository';
import {
  pipelineDraftFactory,
  createPipelineDraftDtoFactory,
} from './__tests__/pipeline-draft.factory';

const mockRdiInstanceId = faker.string.uuid();

const mockPipelineDraftRepository = () => ({
  create: jest.fn(),
  list: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('PipelineDraftService', () => {
  let service: PipelineDraftService;
  let repository: ReturnType<typeof mockPipelineDraftRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineDraftService,
        {
          provide: PipelineDraftRepository,
          useFactory: mockPipelineDraftRepository,
        },
      ],
    }).compile();

    service = module.get(PipelineDraftService);
    repository = module.get(PipelineDraftRepository);
  });

  describe('create', () => {
    it('should create a pipeline draft', async () => {
      const draft = pipelineDraftFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      const dto = createPipelineDraftDtoFactory.build({ data: draft.data });
      repository.create.mockResolvedValueOnce(draft);

      const result = await service.create(
        mockSessionMetadata,
        mockRdiInstanceId,
        dto,
      );

      expect(result).toEqual(draft);
      expect(repository.create).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockRdiInstanceId,
        dto,
      );
    });
  });

  describe('list', () => {
    it('should return list of drafts', async () => {
      const drafts = pipelineDraftFactory.buildList(3, {
        rdiInstanceId: mockRdiInstanceId,
      });
      repository.list.mockResolvedValueOnce(drafts);

      const result = await service.list(mockSessionMetadata, mockRdiInstanceId);

      expect(result).toEqual(drafts);
    });

    it('should return empty list', async () => {
      repository.list.mockResolvedValueOnce([]);

      const result = await service.list(mockSessionMetadata, mockRdiInstanceId);

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should return a single draft', async () => {
      const draft = pipelineDraftFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      repository.get.mockResolvedValueOnce(draft);

      const result = await service.get(
        mockSessionMetadata,
        mockRdiInstanceId,
        draft.id,
      );

      expect(result).toEqual(draft);
    });

    it('should throw NotFoundException if draft not found', async () => {
      repository.get.mockRejectedValueOnce(new NotFoundException());

      await expect(
        service.get(
          mockSessionMetadata,
          mockRdiInstanceId,
          faker.string.uuid(),
        ),
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
      repository.update.mockResolvedValueOnce(updatedDraft);

      const result = await service.update(
        mockSessionMetadata,
        mockRdiInstanceId,
        draft.id,
        { data: updatedData },
      );

      expect(result).toEqual(updatedDraft);
    });

    it('should throw NotFoundException if draft not found', async () => {
      repository.update.mockRejectedValueOnce(new NotFoundException());

      await expect(
        service.update(
          mockSessionMetadata,
          mockRdiInstanceId,
          faker.string.uuid(),
          { data: {} },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a pipeline draft', async () => {
      const draft = pipelineDraftFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      repository.delete.mockResolvedValueOnce(undefined);

      await service.delete(mockSessionMetadata, mockRdiInstanceId, draft.id);

      expect(repository.delete).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockRdiInstanceId,
        draft.id,
      );
    });

    it('should throw NotFoundException if draft not found', async () => {
      repository.delete.mockRejectedValueOnce(new NotFoundException());

      await expect(
        service.delete(
          mockSessionMetadata,
          mockRdiInstanceId,
          faker.string.uuid(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
