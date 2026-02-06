export interface GetStatusResponse {
  components: {
    'collector-source': {
      status: string;
      connected: boolean;
      version: string;
    };
    processor: { status: string; version: string };
  };
  pipelines: {
    default: {
      status: string;
      state: string;
      tasks: {
        name: string;
        status: string;
        created_at: string;
      }[];
    };
  };
}
