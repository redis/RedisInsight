import { RdiPipelineStatus } from 'src/modules/rdi/models';
import { GetStatusResponse } from 'src/modules/rdi/client/api/v1/responses';
import { transformStatus } from './status.transformers';

describe('status.transformers', () => {
  describe('transformStatus', () => {
    it('should return RdiPipelineStatus instance with status and state', () => {
      const data: GetStatusResponse = {
        components: {
          'collector-source': {
            status: 'ready',
            connected: true,
            version: '3.3.1.Final-rdi.1',
          },
          processor: {
            status: 'ready',
            version: '0.0.202512301417',
          },
        },
        pipelines: {
          default: {
            status: 'ready',
            state: 'cdc',
            tasks: [
              {
                name: 'deploy',
                status: 'completed',
                created_at: '2026-01-06T14:35:28',
              },
            ],
          },
        },
      };

      const result = transformStatus(data);

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBe('ready');
      expect(result.state).toBe('cdc');
    });

    it('should handle different pipeline states', () => {
      const data: GetStatusResponse = {
        components: {
          'collector-source': {
            status: 'stopped',
            connected: false,
            version: '3.3.1.Final-rdi.1',
          },
          processor: {
            status: 'stopped',
            version: '0.0.202512301417',
          },
        },
        pipelines: {
          default: {
            status: 'stopped',
            state: 'not-running',
            tasks: [],
          },
        },
      };

      const result = transformStatus(data);

      expect(result.status).toBe('stopped');
      expect(result.state).toBe('not-running');
    });

    it('should handle initial-sync state', () => {
      const data: GetStatusResponse = {
        components: {
          'collector-source': {
            status: 'ready',
            connected: true,
            version: '3.3.1.Final-rdi.1',
          },
          processor: {
            status: 'ready',
            version: '0.0.202512301417',
          },
        },
        pipelines: {
          default: {
            status: 'ready',
            state: 'initial-sync',
            tasks: [],
          },
        },
      };

      const result = transformStatus(data);

      expect(result.status).toBe('ready');
      expect(result.state).toBe('initial-sync');
    });

    it('should handle undefined pipelines gracefully', () => {
      const data = {
        components: {
          'collector-source': {
            status: 'ready',
            connected: true,
            version: '3.3.1.Final-rdi.1',
          },
          processor: {
            status: 'ready',
            version: '0.0.202512301417',
          },
        },
        pipelines: undefined,
      } as unknown as GetStatusResponse;

      const result = transformStatus(data);

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBeUndefined();
      expect(result.state).toBeUndefined();
    });

    it('should handle undefined default pipeline gracefully', () => {
      const data = {
        components: {
          'collector-source': {
            status: 'ready',
            connected: true,
            version: '3.3.1.Final-rdi.1',
          },
          processor: {
            status: 'ready',
            version: '0.0.202512301417',
          },
        },
        pipelines: {
          default: undefined,
        },
      } as unknown as GetStatusResponse;

      const result = transformStatus(data);

      expect(result).toBeInstanceOf(RdiPipelineStatus);
      expect(result.status).toBeUndefined();
      expect(result.state).toBeUndefined();
    });
  });
});
