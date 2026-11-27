export const PipelineManagement = () => 'MockPipelineManagement';
export const RdiPipelines = () => 'MockRdiPipelines';
export const createDirectConfigTranslate = () => ({
  translateDraftToNativeConfig: async () => ({}),
  translateNativeConfigToDraft: async () => ({}),
});
export const createRdiPipelinesNavigationGuard = () => ({
  requestNavigation: (proceed) => proceed(),
});
export const useRdiPipelinesBreadcrumb = () => ({
  pipelineName: undefined,
  exit: () => {},
  showList: () => {},
});
