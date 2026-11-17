import { SessionMetadata } from 'src/common/models';
import { PipelineDraft } from 'src/modules/rdi/models';

export abstract class PipelineDraftRepository {
  abstract create(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    data: Partial<PipelineDraft>,
  ): Promise<PipelineDraft>;

  abstract list(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
  ): Promise<PipelineDraft[]>;

  abstract get(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
  ): Promise<PipelineDraft>;

  abstract update(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
    data: Partial<PipelineDraft>,
  ): Promise<PipelineDraft>;

  abstract delete(
    sessionMetadata: SessionMetadata,
    rdiInstanceId: string,
    id: string,
  ): Promise<void>;
}
