import { RdiPipelineStatus } from 'src/modules/rdi/models';
import { GetStatusResponse } from 'src/modules/rdi/client/api/v1/responses';
import {
  V1PipelineStatusApiResponseFactory,
  V1PipelineDefaultFactory,
} from 'src/__mocks__';
import { transformStatus } from './status.transformers';

describe('status.transformers', () => {
  describe('transformStatus', () => {
    it('should return RdiPipelineStatus instance with status and state', () => {
      const data: GetStatusResponse = V1PipelineStatusApiResponseFactory.build({
        pipelines: {
          default: V1PipelineDefaultFactory.build({
            status: 'ready',
            state: 'cdc',
          }),
        },
      });

      const result = transformStatus(data);

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBe('ready');
      expect(result.state).toBe('cdc');
    });

    it('should handle different pipeline states', () => {
      const data: GetStatusResponse = V1PipelineStatusApiResponseFactory.build({
        pipelines: {
          default: V1PipelineDefaultFactory.build({
            status: 'stopped',
            state: 'not-running',
          }),
        },
      });

      const result = transformStatus(data);

      expect(result.status).toBe('stopped');
      expect(result.state).toBe('not-running');
    });

    it('should handle initial-sync state', () => {
      const data: GetStatusResponse = V1PipelineStatusApiResponseFactory.build({
        pipelines: {
          default: V1PipelineDefaultFactory.build({
            status: 'ready',
            state: 'initial-sync',
          }),
        },
      });

      const result = transformStatus(data);

      expect(result.status).toBe('ready');
      expect(result.state).toBe('initial-sync');
    });

    it('should handle undefined pipelines gracefully', () => {
      const data = V1PipelineStatusApiResponseFactory.build({
        pipelines: undefined,
      }) as unknown as GetStatusResponse;

      const result = transformStatus(data);

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBeUndefined();
      expect(result.state).toBeUndefined();
    });

    it('should handle undefined default pipeline gracefully', () => {
      const data = V1PipelineStatusApiResponseFactory.build({
        pipelines: {
          default: undefined,
        },
      }) as unknown as GetStatusResponse;

      const result = transformStatus(data);

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBeUndefined();
      expect(result.state).toBeUndefined();
    });
  });
});
