export interface PipelineResponses {
  name: string;
  active: boolean;
  config: any; // todo: define
  status: string; // todo: define enum
  errors: any[]; // todo: define
  components: any[]; // todo: define
  current: true;
}

export type GetPipelinesResponse = PipelineResponses[];
