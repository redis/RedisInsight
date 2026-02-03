export enum ComponentMetricsCollections {
  ProcessorMetrics = 'processor-metrics',
  CollectorMetrics = 'collector-metrics',
}
export interface ComponentMetricsResponse {
  name: ComponentMetricsCollections;
  component: string;
  metrics: object;
}

export interface ProcessorMetricsResponse extends ComponentMetricsResponse {
  name: ComponentMetricsCollections.ProcessorMetrics;
  metrics: {
    processing_performance: {
      total_batches: number;
      batch_size_avg: number;
      read_time_avg: number;
      transform_time_avg: number;
      write_time_avg: number;
      process_time_avg: number;
      ack_time_avg: number;
      total_time_avg: number;
      rec_per_sec_avg: number;
    };
    data_streams: {
      streams: Record<
        string,
        {
          total: number;
          pending: number;
          inserted: number;
          updated: number;
          deleted: number;
          filtered: number;
          rejected: number;
          deduplicated: number;
          last_arrival: string;
        }
      >;
      totals: {
        total: number;
        pending: number;
        inserted: number;
        updated: number;
        deleted: number;
        filtered: number;
        rejected: number;
        deduplicated: number;
      };
    };
    rdi_pipeline_status: {
      rdi_version: string;
      address: string;
      run_status: string;
      sync_mode: string;
    };
    connections: Record<
      string,
      {
        type: string;
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        status: string;
      }
    >;
    clients: Record<
      string,
      {
        id: string;
        addr: string;
        user: string;
        age_sec: string;
        idle_sec: string;
      }
    >;
  };
}

export interface CollectorMetricsResponse extends ComponentMetricsResponse {
  name: ComponentMetricsCollections.CollectorMetrics;
  metrics: object;
}

export type GetMetricsCollectionResponse = (
  | ProcessorMetricsResponse
  | CollectorMetricsResponse
)[];
