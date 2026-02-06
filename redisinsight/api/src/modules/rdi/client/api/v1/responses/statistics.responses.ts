export interface GetStatisticsResponse {
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
  data_streams: {
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
  };
  processing_performance: {
    total_batches: number;
    batch_size_avg: number;
    read_time_avg: number;
    process_time_avg: number;
    ack_time_avg: number;
    total_time_avg: number;
    rec_per_sec_avg: number;
  };
  rdi_pipeline_status: {
    rdi_version: string;
    address: string;
    run_status: string;
    sync_mode: string;
  };
  clients: Record<
    string,
    {
      id: string;
      addr: string;
      age_sec: string;
      idle_sec: string;
      user: string;
    }
  >;
  offsets: Record<string, string>;
  snapshot_status: string;
}
