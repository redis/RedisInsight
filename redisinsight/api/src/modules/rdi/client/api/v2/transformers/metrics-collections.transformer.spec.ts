import {
  RdiStatisticsBlocksSection,
  RdiStatisticsInfoSection,
  RdiStatisticsTableSection,
  RdiStatisticsViewType,
} from 'src/modules/rdi/models';
import {
  CollectorMetricsResponse,
  GetMetricsCollectionResponse,
  GetStatusResponse,
  ProcessorMetricsResponse,
} from 'src/modules/rdi/client/api/v2/responses';
import {
  transformProcessingPerformance,
  transformComponentStatus,
  transformMetricsCollectionResponse,
} from './metrics-collections.transformer';

describe('metrics-collections.transformer', () => {
  describe('transformProcessingPerformance', () => {
    it('should return RdiStatisticsBlocksSection instance with all blocks including v2 fields', () => {
      const data: ProcessorMetricsResponse['metrics']['processing_performance'] =
        {
          total_batches: 100,
          batch_size_avg: 1.5,
          read_time_avg: 10,
          transform_time_avg: 5,
          write_time_avg: 3,
          process_time_avg: 50,
          ack_time_avg: 0.5,
          total_time_avg: 60,
          rec_per_sec_avg: 1000,
        };

      const result = transformProcessingPerformance(data);

      expect(result).toBeInstanceOf(RdiStatisticsBlocksSection);
      expect(result.name).toBe('Processing performance information');
      expect(result.view).toBe(RdiStatisticsViewType.Blocks);
      expect(result.data).toHaveLength(9);
      // v1 fields first, then v2 fields appended at the end
      expect(result.data).toEqual([
        { label: 'Total batches', value: 100, units: 'Total' },
        { label: 'Batch size average', value: 1.5, units: 'MB' },
        { label: 'Process time average', value: 50, units: 'ms' },
        { label: 'ACK time average', value: 0.5, units: 'sec' },
        { label: 'Read time average', value: 10, units: 'ms' },
        { label: 'Records per second average', value: 1000, units: 'sec' },
        { label: 'Total time average', value: 60, units: 'ms' },
        { label: 'Transform time average', value: 5, units: 'ms' },
        { label: 'Write time average', value: 3, units: 'ms' },
      ]);
    });

    it('should return empty data array when data is undefined', () => {
      const result = transformProcessingPerformance(undefined);

      expect(result).toBeInstanceOf(RdiStatisticsBlocksSection);
      expect(result.data).toEqual([]);
    });

    it('should include only non-nil values', () => {
      const data: Partial<
        ProcessorMetricsResponse['metrics']['processing_performance']
      > = {
        total_batches: 100,
        transform_time_avg: 5,
        write_time_avg: 3,
      };

      const result = transformProcessingPerformance(
        data as ProcessorMetricsResponse['metrics']['processing_performance'],
      );

      expect(result.data).toHaveLength(3);
      expect(result.data[0].label).toBe('Total batches');
      // v2 fields appended at the end
      expect(result.data[1].label).toBe('Transform time average');
      expect(result.data[2].label).toBe('Write time average');
    });

    it('should include zero values', () => {
      const data: ProcessorMetricsResponse['metrics']['processing_performance'] =
        {
          total_batches: 0,
          batch_size_avg: 0,
          read_time_avg: 0,
          transform_time_avg: 0,
          write_time_avg: 0,
          process_time_avg: 0,
          ack_time_avg: 0,
          total_time_avg: 0,
          rec_per_sec_avg: 0,
        };

      const result = transformProcessingPerformance(data);

      expect(result.data).toHaveLength(9);
    });
  });

  describe('transformComponentStatus', () => {
    it('should return RdiStatisticsTableSection with correct columns and data', () => {
      const components: GetStatusResponse['components'] = [
        {
          name: 'processor',
          type: 'stream-processor',
          version: '1.0.0',
          status: 'started',
          errors: [],
          metric_collections: [],
        },
        {
          name: 'collector',
          type: 'source-collector',
          version: '1.0.1',
          status: 'started',
          errors: ['Connection timeout', 'Retry failed'],
          metric_collections: [],
        },
      ];

      const result = transformComponentStatus(components);

      expect(result).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result!.name).toBe('Component Status');
      expect(result!.view).toBe(RdiStatisticsViewType.Table);
      expect(result!.data).toHaveLength(2);
      expect(result!.data[0]).toEqual({
        status: 'started',
        name: 'processor',
        type: 'stream-processor',
        version: '1.0.0',
        errors: '',
      });
      expect(result!.data[1]).toEqual({
        status: 'started',
        name: 'collector',
        type: 'source-collector',
        version: '1.0.1',
        errors: 'Connection timeout, Retry failed',
      });
    });

    it('should return correct column definitions', () => {
      const components: GetStatusResponse['components'] = [
        {
          name: 'processor',
          type: 'stream-processor',
          version: '1.0.0',
          status: 'started',
          errors: [],
          metric_collections: [],
        },
      ];

      const result = transformComponentStatus(components);

      expect(result!.columns).toHaveLength(5);
      // All headers are auto-generated from field names (first letter capitalized)
      expect(result!.columns.map((c) => c.header)).toEqual([
        'Status',
        'Name',
        'Type',
        'Version',
        'Errors',
      ]);
    });

    it('should return null when components is empty', () => {
      const result = transformComponentStatus([]);

      expect(result).toBeNull();
    });

    it('should return null when components is undefined', () => {
      const result = transformComponentStatus(undefined as any);

      expect(result).toBeNull();
    });

    it('should handle components with undefined errors', () => {
      const components: GetStatusResponse['components'] = [
        {
          name: 'processor',
          type: 'stream-processor',
          version: '1.0.0',
          status: 'started',
          errors: undefined as any,
          metric_collections: [],
        },
      ];

      const result = transformComponentStatus(components);

      expect(result!.data[0].errors).toBe('');
    });
  });

  describe('transformMetricsCollectionResponse', () => {
    const mockProcessorMetrics: ProcessorMetricsResponse = {
      name: 'processor_metrics',
      component: 'processor',
      metrics: {
        processing_performance: {
          total_batches: 100,
          batch_size_avg: 1.5,
          read_time_avg: 10,
          transform_time_avg: 5,
          write_time_avg: 3,
          process_time_avg: 50,
          ack_time_avg: 0.5,
          total_time_avg: 60,
          rec_per_sec_avg: 1000,
        },
        rdi_pipeline_status: {
          rdi_version: '1.0.0',
          address: 'redis://localhost:6379',
          run_status: 'running',
          sync_mode: 'streaming',
        },
        connections: {
          target1: {
            type: 'redis',
            host: 'localhost',
            port: 6379,
            database: '0',
            user: 'default',
            password: 'secret',
            status: 'connected',
          },
        },
        data_streams: {
          totals: {
            total: 1000,
            pending: 10,
            inserted: 500,
            updated: 300,
            deleted: 100,
            filtered: 50,
            rejected: 30,
            deduplicated: 10,
          },
          streams: {
            stream1: {
              total: 600,
              pending: 5,
              inserted: 300,
              updated: 200,
              deleted: 50,
              filtered: 25,
              rejected: 15,
              deduplicated: 5,
              last_arrival: '2024-01-01T00:00:00Z',
            },
          },
        },
        clients: {
          client1: {
            id: '1',
            addr: '127.0.0.1:6379',
            user: 'default',
            age_sec: '100',
            idle_sec: '10',
          },
        },
      },
    };

    const mockCollectorMetrics: CollectorMetricsResponse = {
      name: 'collector-source_metrics',
      component: 'collector-source',
      metrics: {
        streaming: { Connected: 1, MilliSecondsSinceLastEvent: 13000 },
        snapshot: { SnapshotCompleted: 1, TotalTableCount: 3 },
      },
    };

    it('should return array of 5 sections in correct order', () => {
      const response: GetMetricsCollectionResponse = [
        mockCollectorMetrics,
        mockProcessorMetrics,
      ];

      const result = transformMetricsCollectionResponse(response);

      expect(result).toHaveLength(5);
      expect(result[0].name).toBe('General info');
      expect(result[0].view).toBe(RdiStatisticsViewType.Info);
      expect(result[1].name).toBe('Processing performance information');
      expect(result[1].view).toBe(RdiStatisticsViewType.Blocks);
      expect(result[2].name).toBe('Target Connections');
      expect(result[2].view).toBe(RdiStatisticsViewType.Table);
      expect(result[3].name).toBe('Data Streams');
      expect(result[3].view).toBe(RdiStatisticsViewType.Table);
      expect(result[4].name).toBe('Clients');
      expect(result[4].view).toBe(RdiStatisticsViewType.Table);
    });

    it('should return correct section types', () => {
      const response: GetMetricsCollectionResponse = [mockProcessorMetrics];

      const result = transformMetricsCollectionResponse(response);

      expect(result[0]).toBeInstanceOf(RdiStatisticsInfoSection);
      expect(result[1]).toBeInstanceOf(RdiStatisticsBlocksSection);
      expect(result[2]).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result[3]).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result[4]).toBeInstanceOf(RdiStatisticsTableSection);
    });

    it('should include extended processing performance fields', () => {
      const response: GetMetricsCollectionResponse = [mockProcessorMetrics];

      const result = transformMetricsCollectionResponse(response);

      const processingPerformance = result[1] as RdiStatisticsBlocksSection;
      expect(processingPerformance.data).toHaveLength(9);

      const labels = processingPerformance.data.map((item) => item.label);
      expect(labels).toContain('Transform time average');
      expect(labels).toContain('Write time average');
    });

    it('should return empty array when no processor metrics found', () => {
      const response: GetMetricsCollectionResponse = [mockCollectorMetrics];

      const result = transformMetricsCollectionResponse(response);

      expect(result).toEqual([]);
    });

    it('should return empty array when response is empty', () => {
      const response: GetMetricsCollectionResponse = [];

      const result = transformMetricsCollectionResponse(response);

      expect(result).toEqual([]);
    });

    it('should include Component Status section when status data is provided', () => {
      const response: GetMetricsCollectionResponse = [mockProcessorMetrics];
      const statusData: GetStatusResponse = {
        status: 'started',
        errors: [],
        components: [
          {
            name: 'processor',
            type: 'stream-processor',
            version: '1.0.0',
            status: 'started',
            errors: [],
            metric_collections: [],
          },
        ],
        current: true,
      };

      const result = transformMetricsCollectionResponse(response, statusData);

      expect(result).toHaveLength(6);
      expect(result[3].name).toBe('Component Status');
      expect(result[3].view).toBe(RdiStatisticsViewType.Table);
    });

    it('should place Component Status after Target Connections', () => {
      const response: GetMetricsCollectionResponse = [mockProcessorMetrics];
      const statusData: GetStatusResponse = {
        status: 'started',
        errors: [],
        components: [
          {
            name: 'processor',
            type: 'stream-processor',
            version: '1.0.0',
            status: 'started',
            errors: [],
            metric_collections: [],
          },
        ],
        current: true,
      };

      const result = transformMetricsCollectionResponse(response, statusData);

      expect(result[0].name).toBe('General info');
      expect(result[1].name).toBe('Processing performance information');
      expect(result[2].name).toBe('Target Connections');
      expect(result[3].name).toBe('Component Status');
      expect(result[4].name).toBe('Data Streams');
      expect(result[5].name).toBe('Clients');
    });

    it('should work without status data (backward compatible)', () => {
      const response: GetMetricsCollectionResponse = [mockProcessorMetrics];

      const result = transformMetricsCollectionResponse(response);

      expect(result).toHaveLength(5);
      expect(result.map((s) => s.name)).not.toContain('Component Status');
    });

    it('should not include Component Status when status data is null', () => {
      const response: GetMetricsCollectionResponse = [mockProcessorMetrics];

      const result = transformMetricsCollectionResponse(response, null);

      expect(result).toHaveLength(5);
      expect(result.map((s) => s.name)).not.toContain('Component Status');
    });

    it('should not include Component Status when components array is empty', () => {
      const response: GetMetricsCollectionResponse = [mockProcessorMetrics];
      const statusData: GetStatusResponse = {
        status: 'started',
        errors: [],
        components: [],
        current: true,
      };

      const result = transformMetricsCollectionResponse(response, statusData);

      expect(result).toHaveLength(5);
      expect(result.map((s) => s.name)).not.toContain('Component Status');
    });
  });
});
