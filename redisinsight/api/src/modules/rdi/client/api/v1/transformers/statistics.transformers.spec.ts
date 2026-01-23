import {
  RdiStatisticsBlocksSection,
  RdiStatisticsInfoSection,
  RdiStatisticsTableSection,
  RdiStatisticsViewType,
} from 'src/modules/rdi/models';
import { GetStatisticsResponse } from 'src/modules/rdi/client/api/v1/responses';
import {
  transformProcessingPerformance,
  transformClientStatistics,
  transformDataStreamsStatistics,
  transformGeneralInfo,
  transformConnectionsStatistics,
  transformStatisticsResponse,
} from './statistics.transformers';

describe('statistics.transformers', () => {
  describe('transformProcessingPerformance', () => {
    it('should return RdiStatisticsBlocksSection instance with all blocks when all data is present', () => {
      const data: GetStatisticsResponse['processing_performance'] = {
        total_batches: 100,
        batch_size_avg: 1.5,
        process_time_avg: 50,
        ack_time_avg: 0.5,
        read_time_avg: 10,
        rec_per_sec_avg: 1000,
        total_time_avg: 60,
      };

      const result = transformProcessingPerformance(data);

      expect(result).toBeInstanceOf(RdiStatisticsBlocksSection);
      expect(result.name).toBe('Processing performance information');
      expect(result.view).toBe(RdiStatisticsViewType.Blocks);
      expect(result.data).toHaveLength(7);
      expect(result.data).toEqual([
        { label: 'Total batches', value: 100, units: 'Total' },
        { label: 'Batch size average', value: 1.5, units: 'MB' },
        { label: 'Process time average', value: 50, units: 'ms' },
        { label: 'ACK time average', value: 0.5, units: 'sec' },
        { label: 'Read time average', value: 10, units: 'ms' },
        { label: 'Records per second average', value: 1000, units: 'sec' },
        { label: 'Total time average', value: 60, units: 'ms' },
      ]);
    });

    it('should return empty data array when data is undefined', () => {
      const result = transformProcessingPerformance(undefined);

      expect(result).toBeInstanceOf(RdiStatisticsBlocksSection);
      expect(result.data).toEqual([]);
    });

    it('should include only non-nil values', () => {
      const data: Partial<GetStatisticsResponse['processing_performance']> = {
        total_batches: 100,
        batch_size_avg: undefined,
        process_time_avg: 50,
      };

      const result = transformProcessingPerformance(
        data as GetStatisticsResponse['processing_performance'],
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0].label).toBe('Total batches');
      expect(result.data[1].label).toBe('Process time average');
    });

    it('should include zero values', () => {
      const data: GetStatisticsResponse['processing_performance'] = {
        total_batches: 0,
        batch_size_avg: 0,
        process_time_avg: 0,
        ack_time_avg: 0,
        read_time_avg: 0,
        rec_per_sec_avg: 0,
        total_time_avg: 0,
      };

      const result = transformProcessingPerformance(data);

      expect(result.data).toHaveLength(7);
    });
  });

  describe('transformClientStatistics', () => {
    it('should return RdiStatisticsTableSection instance with clients data', () => {
      const data: GetStatisticsResponse['clients'] = {
        client1: {
          id: '1',
          addr: '127.0.0.1:6379',
          age_sec: '100',
          idle_sec: '10',
          user: 'default',
        },
        client2: {
          id: '2',
          addr: '127.0.0.1:6380',
          age_sec: '200',
          idle_sec: '20',
          user: 'admin',
        },
      };

      const result = transformClientStatistics(data);

      expect(result).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result.name).toBe('Clients');
      expect(result.view).toBe(RdiStatisticsViewType.Table);
      expect(result.data).toHaveLength(2);
      expect(result.columns).toContainEqual({ id: 'id', header: 'ID' });
      expect(result.columns).toContainEqual({ id: 'addr', header: 'ADDR' });
    });

    it('should return empty data array when data is undefined', () => {
      const result = transformClientStatistics(undefined);

      expect(result).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result.data).toEqual([]);
      expect(result.columns).toEqual([]);
    });

    it('should return empty data array when data is empty object', () => {
      const result = transformClientStatistics({});

      expect(result.data).toEqual([]);
      expect(result.columns).toEqual([]);
    });
  });

  describe('transformDataStreamsStatistics', () => {
    it('should return RdiStatisticsTableSection instance with streams data', () => {
      const data: GetStatisticsResponse['data_streams'] = {
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
      };

      const result = transformDataStreamsStatistics(data);

      expect(result).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result.name).toBe('Data Streams');
      expect(result.view).toBe(RdiStatisticsViewType.Table);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('stream1');
      expect(result.footer).toEqual({
        name: 'Total',
        total: 1000,
        pending: 10,
        inserted: 500,
        updated: 300,
        deleted: 100,
        filtered: 50,
        rejected: 30,
        deduplicated: 10,
      });
    });

    it('should return empty data array when data is undefined', () => {
      const result = transformDataStreamsStatistics(undefined);

      expect(result).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result.data).toEqual([]);
      expect(result.columns).toEqual([]);
    });

    it('should return empty data array when streams is empty', () => {
      const data: GetStatisticsResponse['data_streams'] = {
        totals: {
          total: 0,
          pending: 0,
          inserted: 0,
          updated: 0,
          deleted: 0,
          filtered: 0,
          rejected: 0,
          deduplicated: 0,
        },
        streams: {},
      };

      const result = transformDataStreamsStatistics(data);

      expect(result.data).toEqual([]);
      expect(result.columns).toEqual([]);
    });
  });

  describe('transformGeneralInfo', () => {
    it('should return RdiStatisticsInfoSection instance with pipeline status', () => {
      const data: GetStatisticsResponse['rdi_pipeline_status'] = {
        rdi_version: '1.0.0',
        address: 'redis://localhost:6379',
        run_status: 'running',
        sync_mode: 'streaming',
      };

      const result = transformGeneralInfo(data);

      expect(result).toBeInstanceOf(RdiStatisticsInfoSection);
      expect(result.name).toBe('General info');
      expect(result.view).toBe(RdiStatisticsViewType.Info);
      expect(result.data).toEqual([
        { label: 'RDI version', value: '1.0.0' },
        { label: 'RDI database address', value: 'redis://localhost:6379' },
        { label: 'Run status', value: 'running' },
        { label: 'Sync mode', value: 'streaming' },
      ]);
    });

    it('should return empty strings when data is undefined', () => {
      const result = transformGeneralInfo(undefined);

      expect(result).toBeInstanceOf(RdiStatisticsInfoSection);
      expect(result.data).toEqual([
        { label: 'RDI version', value: '' },
        { label: 'RDI database address', value: '' },
        { label: 'Run status', value: '' },
        { label: 'Sync mode', value: '' },
      ]);
    });

    it('should handle partial data', () => {
      const data: Partial<GetStatisticsResponse['rdi_pipeline_status']> = {
        rdi_version: '1.0.0',
        run_status: 'stopped',
      };

      const result = transformGeneralInfo(
        data as GetStatisticsResponse['rdi_pipeline_status'],
      );

      expect(result.data).toEqual([
        { label: 'RDI version', value: '1.0.0' },
        { label: 'RDI database address', value: '' },
        { label: 'Run status', value: 'stopped' },
        { label: 'Sync mode', value: '' },
      ]);
    });
  });

  describe('transformConnectionsStatistics', () => {
    it('should return RdiStatisticsTableSection instance with connections data', () => {
      const data: GetStatisticsResponse['connections'] = {
        target1: {
          type: 'redis',
          host: 'localhost',
          port: 6379,
          database: '0',
          user: 'default',
          password: 'secret',
          status: 'connected',
        },
      };

      const result = transformConnectionsStatistics(data);

      expect(result).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result.name).toBe('Target Connections');
      expect(result.view).toBe(RdiStatisticsViewType.Table);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        status: 'connected',
        name: 'target1',
        type: 'redis',
        host_port: 'localhost:6379',
        database: '0',
        user: 'default',
      });
      expect(result.columns).toContainEqual({
        id: 'status',
        header: 'Status',
        type: 'status',
      });
      expect(result.columns).toContainEqual({
        id: 'host_port',
        header: 'Host:port',
      });
      expect(result.columns).toContainEqual({
        id: 'user',
        header: 'Username',
      });
    });

    it('should return empty data array when data is undefined', () => {
      const result = transformConnectionsStatistics(undefined);

      expect(result).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result.data).toEqual([]);
      expect(result.columns).toEqual([]);
    });

    it('should return empty data array when data is empty object', () => {
      const result = transformConnectionsStatistics({});

      expect(result.data).toEqual([]);
      expect(result.columns).toEqual([]);
    });
  });

  describe('transformStatisticsResponse', () => {
    const mockFullResponse: GetStatisticsResponse = {
      rdi_pipeline_status: {
        rdi_version: '1.0.0',
        address: 'redis://localhost:6379',
        run_status: 'running',
        sync_mode: 'streaming',
      },
      processing_performance: {
        total_batches: 100,
        batch_size_avg: 1.5,
        process_time_avg: 50,
        ack_time_avg: 0.5,
        read_time_avg: 10,
        rec_per_sec_avg: 1000,
        total_time_avg: 60,
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
          age_sec: '100',
          idle_sec: '10',
          user: 'default',
        },
      },
      offsets: {},
      snapshot_status: 'completed',
    };

    it('should return array of 5 sections in correct order', () => {
      const result = transformStatisticsResponse(mockFullResponse);

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
      const result = transformStatisticsResponse(mockFullResponse);

      expect(result[0]).toBeInstanceOf(RdiStatisticsInfoSection);
      expect(result[1]).toBeInstanceOf(RdiStatisticsBlocksSection);
      expect(result[2]).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result[3]).toBeInstanceOf(RdiStatisticsTableSection);
      expect(result[4]).toBeInstanceOf(RdiStatisticsTableSection);
    });
  });
});
