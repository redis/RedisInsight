export interface GetStatusResponse {
  status: string;
  errors: string[];
  components: {
    name: string;
    type: string;
    version: string;
    status: string;
    errors: string[];
    metric_collections: any[];
  }[];
  current: true;
}
