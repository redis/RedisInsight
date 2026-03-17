export enum SearchTelemetrySource {
  Welcome = 'welcome',
  List = 'list',
  Browser = 'browser',
}

export enum SearchBrowserSource {
  KeyDetails = 'key_details',
  TreeView = 'tree_view',
}

export enum SearchTelemetryCancelStep {
  SampleDataModal = 'sample_data_modal',
  IndexDefinition = 'index_definition',
}

export enum SearchTelemetryDemoDataNextStep {
  IndexDefinition = 'index_definition',
  StartQuerying = 'start_querying',
}

export enum SearchTelemetryFieldEditAction {
  Add = 'add',
  Edit = 'edit',
}

export enum SearchOnboardingAction {
  Next = 'next',
  Back = 'back',
  Skip = 'skip',
}

export enum SearchCommandType {
  Search = 'search',
  Aggregate = 'aggregate',
  Explain = 'explain',
  Profile = 'profile',
  Other = 'other',
}
