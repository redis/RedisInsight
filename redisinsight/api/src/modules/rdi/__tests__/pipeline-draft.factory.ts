import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { PipelineDraft } from '../models/pipeline-draft';
import { PipelineDraftEntity } from '../entities/pipeline-draft.entity';
import { CreatePipelineDraftDto } from '../dto/create.pipeline-draft.dto';

export const pipelineDraftFactory = Factory.define<PipelineDraft>(() => ({
  id: faker.string.uuid(),
  rdiInstanceId: faker.string.uuid(),
  data: { [faker.word.noun()]: faker.word.words(3) },
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
}));

// Entity-level `data` is the persisted string form (what DataAsJsonString
// produces before encryption), not the parsed object the API model exposes.
export const pipelineDraftEntityFactory = Factory.define<PipelineDraftEntity>(
  () => {
    const draft = pipelineDraftFactory.build();

    return {
      ...draft,
      data: JSON.stringify(draft.data),
    };
  },
);

export const createPipelineDraftDtoFactory =
  Factory.define<CreatePipelineDraftDto>(() => {
    const { data } = pipelineDraftFactory.build();

    return { data };
  });
